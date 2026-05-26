import { supabase } from '../../../lib/supabase.js';
import { getTokenFromRequest, verifyToken } from '../../../lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const user = verifyToken(token);

    if (req.method === 'POST') {
      const { subject, category, priority } = req.body;

      if (!subject) {
        return res.status(400).json({ error: 'Subject is required' });
      }

      const { data, error } = await supabase
        .from('support_tickets')
        .insert([{
          user_id: user.id,
          subject,
          category: category || 'general',
          priority: priority || 'medium',
        }])
        .select();

      if (error) throw error;

      res.status(201).json(data[0]);
    } else if (req.method === 'GET') {
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { status, priority } = req.query;

      let query = supabase
        .from('support_tickets')
        .select('id, user_id, subject, category, status, priority, created_at, updated_at, users(full_name, email)')
        .order('updated_at', { ascending: false });

      if (status) query = query.eq('status', status);
      if (priority) query = query.eq('priority', priority);

      const { data, error } = await query;

      if (error) throw error;

      const formatted = data.map(ticket => ({
        ...ticket,
        full_name: ticket.users.full_name,
        email: ticket.users.email,
      }));

      res.json(formatted);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
