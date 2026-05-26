import { supabase } from '../../../../lib/supabase.js';
import { getTokenFromRequest, verifyToken } from '../../../../lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const user = verifyToken(token);

    // Get ticket
    const { data: ticketData, error: ticketError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (ticketError || !ticketData) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check access
    if (ticketData.user_id !== user.id && user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.method === 'GET') {
      const { data: messages, error: messagesError } = await supabase
        .from('ticket_messages')
        .select('id, message, is_admin_reply, created_at, users(full_name, email)')
        .eq('ticket_id', id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      const formatted = messages.map(msg => ({
        ...msg,
        full_name: msg.users.full_name,
        email: msg.users.email,
      }));

      res.json({ ticket: ticketData, messages: formatted });
    } else if (req.method === 'POST') {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const { data, error } = await supabase
        .from('ticket_messages')
        .insert([{
          ticket_id: id,
          sender_id: user.id,
          message,
          is_admin_reply: user.role === 'admin',
        }])
        .select();

      if (error) throw error;

      // Update ticket timestamp
      await supabase
        .from('support_tickets')
        .update({ updated_at: new Date() })
        .eq('id', id);

      res.status(201).json(data[0]);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
