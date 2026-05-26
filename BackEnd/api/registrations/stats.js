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

    // Total
    const { count: totalCount } = await supabase
      .from('registrations')
      .select('*', { count: 'exact' });
    stats.total = totalCount;

    // By type
    const { data: byType } = await supabase
      .from('registrations')
      .select('registration_type');
    stats.byType = byType.reduce((acc, item) => {
      const existing = acc.find(x => x.registration_type === item.registration_type);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ registration_type: item.registration_type, count: 1 });
      }
      return acc;
    }, []);

    // By participation
    const { data: byParticipation } = await supabase
      .from('registrations')
      .select('participation');
    stats.byParticipation = byParticipation.reduce((acc, item) => {
      const existing = acc.find(x => x.participation === item.participation);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ participation: item.participation, count: 1 });
      }
      return acc;
    }, []);

    // By status
    const { data: byStatus } = await supabase
      .from('registrations')
      .select('status');
    stats.byStatus = byStatus.reduce((acc, item) => {
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
