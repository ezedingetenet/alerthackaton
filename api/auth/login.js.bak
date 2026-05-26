import bcrypt from 'bcryptjs';
import { supabase } from '../../../lib/supabase.js';
import { createToken } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

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
