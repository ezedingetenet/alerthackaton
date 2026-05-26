import { supabase } from '../lib/supabase.js';
import { getTokenFromRequest, verifyToken } from '../lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const user = verifyToken(token);

    // POST /api/exhibitors/apply
    if (req.url === '/api/exhibitors/apply' && req.method === 'POST') {
      const { company_name, industry_type, contact_person, phone, description, booth_size } = req.body || {};

      if (!company_name || !industry_type || !contact_person) {
        return res.status(400).json({ error: 'company_name, industry_type, and contact_person are required' });
      }

      const { data, error } = await supabase
        .from('exhibitor_applications')
        .insert([{
          user_id: user.id,
          company_name,
          industry_type,
          contact_person,
          phone,
          description,
          booth_size,
        }])
        .select();

      if (error) throw error;

      res.status(201).json(data[0]);
    }
    // GET /api/exhibitors/mine
    else if (req.url === '/api/exhibitors/mine' && req.method === 'GET') {
      const { data, error } = await supabase
        .from('exhibitor_applications')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        return res.status(404).json({ error: 'Exhibitor application not found' });
      }

      res.json(data);
    }
    // GET /api/exhibitors (admin)
    else if (req.url === '/api/exhibitors' && req.method === 'GET') {
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const url = new URL(req.url, 'http://localhost');
      const status = url.searchParams.get('status');

      let query = supabase
        .from('exhibitor_applications')
        .select('id, user_id, company_name, industry_type, contact_person, phone, description, booth_size, status, created_at, users(full_name, email)')
        .order('created_at', { ascending: false });

      if (status) query = query.eq('status', status);

      const { data, error } = await query;

      if (error) throw error;

      const formatted = data.map(app => ({
        ...app,
        full_name: app.users.full_name,
        email: app.users.email,
      }));

      res.json(formatted);
    }
    // PUT /api/exhibitors/:id/status (admin)
    else if (req.url.includes('/api/exhibitors/') && req.url.includes('/status') && req.method === 'PUT') {
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const id = req.url.split('/')[3];
      const { status } = req.body || {};

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const { data, error } = await supabase
        .from('exhibitor_applications')
        .update({ status, updated_at: new Date() })
        .eq('id', id)
        .select();

      if (error) throw error;
      if (data.length === 0) {
        return res.status(404).json({ error: 'Exhibitor application not found' });
      }

      res.json(data[0]);
    }
    else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
