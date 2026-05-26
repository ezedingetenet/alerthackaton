import { supabase } from '../lib/supabase.js';
import { getTokenFromRequest, verifyToken } from '../lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const token = getTokenFromRequest(req);

    // GET /api/schedule
    if (req.url === '/api/schedule' && req.method === 'GET') {
      const { data, error } = await supabase
        .from('schedule_items')
        .select('id, day, start_time, end_time, title, description')
        .order('day')
        .order('order_index');

      if (error) throw error;
      res.json(data);
    }
    // POST /api/schedule
    else if (req.url === '/api/schedule' && req.method === 'POST') {
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const user = verifyToken(token);
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { day, start_time, end_time, title, description, order_index } = req.body || {};

      if (!day || !start_time || !end_time || !title) {
        return res.status(400).json({ error: 'Day, start_time, end_time, and title are required' });
      }

      const { data, error } = await supabase
        .from('schedule_items')
        .insert([{ day, start_time, end_time, title, description, order_index }])
        .select();

      if (error) throw error;
      res.status(201).json(data[0]);
    }
    // PUT /api/schedule/:id
    else if (req.url.match(/^\/api\/schedule\/[^/]+$/) && req.method === 'PUT') {
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const user = verifyToken(token);
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const id = req.url.split('/')[3];
      const { day, start_time, end_time, title, description, order_index } = req.body || {};

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
    }
    // DELETE /api/schedule/:id
    else if (req.url.match(/^\/api\/schedule\/[^/]+$/) && req.method === 'DELETE') {
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const user = verifyToken(token);
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const id = req.url.split('/')[3];

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
    }
    else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
