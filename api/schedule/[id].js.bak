import { supabase } from '../../../lib/supabase.js';
import { getTokenFromRequest, verifyToken } from '../../../lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const user = verifyToken(token);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (req.method === 'PUT') {
      const { day, start_time, end_time, title, description, order_index } = req.body;

      const updates = {};
      if (day !== undefined) updates.day = day;
      if (start_time !== undefined) updates.start_time = start_time;
      if (end_time !== undefined) updates.end_time = end_time;
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (order_index !== undefined) updates.order_index = order_index;
      updates.updated_at = new Date();

      const { data, error } = await supabase
        .from('schedule_items')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      if (data.length === 0) {
        return res.status(404).json({ error: 'Schedule item not found' });
      }

      res.json(data[0]);
    } else if (req.method === 'DELETE') {
      const { data, error } = await supabase
        .from('schedule_items')
        .delete()
        .eq('id', id)
        .select();

      if (error) throw error;
      if (data.length === 0) {
        return res.status(404).json({ error: 'Schedule item not found' });
      }

      res.json({ message: 'Schedule item deleted' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
