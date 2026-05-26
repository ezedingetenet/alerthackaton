import { supabase } from '../../lib/supabase.js';
import { getTokenFromRequest, verifyToken } from '../../lib/auth.js';

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

    if (req.method === 'GET') {
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { status } = req.query;

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
    } else if (req.method === 'POST') {
      const { company_name, industry_type, contact_person, phone, description, booth_size } = req.body;

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
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
