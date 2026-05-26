import { supabase } from '../../../lib/supabase.js';
import { getTokenFromRequest, verifyToken } from '../../../lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const user = verifyToken(token);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const stats = {};

    // Registration stats
    const { count: regTotal } = await supabase
      .from('registrations')
      .select('*', { count: 'exact' });
    stats.registrations = { total: regTotal };

    const { data: regByType } = await supabase
      .from('registrations')
      .select('registration_type');
    stats.registrations.byType = regByType.reduce((acc, item) => {
      const existing = acc.find(x => x.registration_type === item.registration_type);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ registration_type: item.registration_type, count: 1 });
      }
      return acc;
    }, []);

    const { data: regByStatus } = await supabase
      .from('registrations')
      .select('status');
    stats.registrations.byStatus = regByStatus.reduce((acc, item) => {
      const existing = acc.find(x => x.status === item.status);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ status: item.status, count: 1 });
      }
      return acc;
    }, []);

    // Exhibitor stats
    const { count: exhTotal } = await supabase
      .from('exhibitor_applications')
      .select('*', { count: 'exact' });
    stats.exhibitors = { total: exhTotal };

    const { data: exhByStatus } = await supabase
      .from('exhibitor_applications')
      .select('status');
    stats.exhibitors.byStatus = exhByStatus.reduce((acc, item) => {
      const existing = acc.find(x => x.status === item.status);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ status: item.status, count: 1 });
      }
      return acc;
    }, []);

    // Ticket stats
    const { count: ticketTotal } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact' });
    stats.tickets = { total: ticketTotal };

    const { data: ticketByStatus } = await supabase
      .from('support_tickets')
      .select('status');
    stats.tickets.byStatus = ticketByStatus.reduce((acc, item) => {
      const existing = acc.find(x => x.status === item.status);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ status: item.status, count: 1 });
      }
      return acc;
    }, []);

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
