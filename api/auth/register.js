import bcrypt from 'bcryptjs';
import { supabase } from '../../lib/supabase.js';
import { createToken } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, full_name, phone } = req.body;

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
