import { supabase } from '../../../lib/supabase.js';
import { getTokenFromRequest, verifyToken } from '../../../lib/auth.js';

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

    if (req.method === 'POST') {
      const { registration_type, participation, team_name, team_members } = req.body;

      if (!registration_type || !participation) {
        return res.status(400).json({ error: 'registration_type and participation are required' });
      }

      if (participation === 'team' && !team_name) {
        return res.status(400).json({ error: 'team_name is required for team registrations' });
      }

      const { data, error } = await supabase
        .from('registrations')
        .insert([{
          user_id: user.id,
          registration_type,
          participation,
          team_name,
        }])
        .select();

      if (error) throw error;

      const registration = data[0];

      if (participation === 'team' && team_members && team_members.length > 0) {
        const memberInserts = team_members.map(member => ({
          registration_id: registration.id,
          full_name: member.full_name,
          email: member.email,
          member_role: member.member_role,
        }));

        const { error: memberError } = await supabase
          .from('team_members')
          .insert(memberInserts);

        if (memberError) throw memberError;
      }

      res.status(201).json(registration);
    } else if (req.method === 'GET') {
      if (user.role === 'admin') {
        const { status, participation, registration_type } = req.query;

        let query = supabase
          .from('registrations')
          .select('id, user_id, registration_type, participation, team_name, status, created_at, users(full_name, email, phone)')
          .order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);
        if (participation) query = query.eq('participation', participation);
        if (registration_type) query = query.eq('registration_type', registration_type);

        const { data, error } = await query;

        if (error) throw error;

        const formatted = data.map(reg => ({
          ...reg,
          full_name: reg.users.full_name,
          email: reg.users.email,
          phone: reg.users.phone,
        }));

        res.json(formatted);
      } else {
        return res.status(403).json({ error: 'Admin access required' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
