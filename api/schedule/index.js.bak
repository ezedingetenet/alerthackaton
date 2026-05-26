import { supabase } from '../../../lib/supabase.js';
import { getTokenFromRequest, verifyToken } from '../../../lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('schedule_items')
        .select('id, day, start_time, end_time, title, description')
        .order('day')
        .order('order_index');

      if (error) throw error;

      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'POST') {
    try {
      const token = getTokenFromRequest(req);
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const user = verifyToken(token);
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { day, start_time, end_time, title, description, order_index } = req.body;

      if (!day || !start_time || !end_time || !title) {
        return res.status(400).json({ error: 'Day, start_time, end_time, and title are required' });
      }

      const { data, error } = await supabase
        .from('schedule_items')
        .insert([{ day, start_time, end_time, title, description, order_index }])
        .select();

      if (error) throw error;

      res.status(201).json(data[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
