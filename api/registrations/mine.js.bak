import { supabase } from '../../../lib/supabase.js';
import { getTokenFromRequest, verifyToken } from '../../../lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
      .from('registrations')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    let teamMembers = [];
    if (data.participation === 'team') {
      const { data: members, error: memberError } = await supabase
        .from('team_members')
        .select('id, full_name, email, member_role')
        .eq('registration_id', data.id);

      if (memberError) throw memberError;
      teamMembers = members || [];
    }

    res.json({ ...data, team_members: teamMembers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
