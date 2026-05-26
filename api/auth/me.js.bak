import { supabase } from '../../../lib/supabase.js';
import { getTokenFromRequest, verifyToken } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
