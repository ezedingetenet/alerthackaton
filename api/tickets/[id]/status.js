import { supabase } from '../../../../lib/supabase.js';
import { getTokenFromRequest, verifyToken } from '../../../../lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { status, priority } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
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

    const updates = {
      status,
      updated_at: new Date(),
    };

    if (priority) updates.priority = priority;

    const { data, error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(data[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
