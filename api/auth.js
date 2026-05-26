import bcrypt from 'bcryptjs';
import { supabase } from '../lib/supabase.js';
import { createToken, verifyToken, getTokenFromRequest } from '../lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST /api/auth/register
  if (req.url === '/api/auth/register' && req.method === 'POST') {
    const { email, password, full_name, phone } = req.body || {};

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const { data, error } = await supabase
        .from('users')
        .insert([{ email, password_hash: hashedPassword, full_name, phone }])
        .select('id, email, full_name, role');

      if (error) {
        if (error.code === '23505') {
          return res.status(400).json({ error: 'Email already registered' });
        }
        throw error;
      }

      const user = data[0];
      const token = createToken(user.id, user.email, user.role);

      res.status(201).json({ user, token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
  // POST /api/auth/login
  else if (req.url === '/api/auth/login' && req.method === 'POST') {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, data.password_hash);

      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = createToken(data.id, data.email, data.role);

      res.json({
        user: {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          role: data.role,
        },
        token,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
  // GET /api/auth/me
  else if (req.url === '/api/auth/me' && req.method === 'GET') {
    try {
      const token = getTokenFromRequest(req);
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const user = verifyToken(token);

      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, phone, role, created_at')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(401).json({ error: err.message });
    }
  }
  else {
    res.status(404).json({ error: 'Not found' });
  }
}
