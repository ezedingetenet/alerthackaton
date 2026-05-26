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

    // POST /api/tickets
    if (req.url === '/api/tickets' && req.method === 'POST') {
      const { subject, category, priority } = req.body || {};

      if (!subject) {
        return res.status(400).json({ error: 'Subject is required' });
      }

      const { data, error } = await supabase
        .from('support_tickets')
        .insert([{
          user_id: user.id,
          subject,
          category: category || 'general',
          priority: priority || 'medium',
        }])
        .select();

      if (error) throw error;

      res.status(201).json(data[0]);
    }
    // GET /api/tickets/mine
    else if (req.url === '/api/tickets/mine' && req.method === 'GET') {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('id, subject, category, status, priority, created_at, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      res.json(data);
    }
    // GET /api/tickets/:id/messages
    else if (req.url.includes('/api/tickets/') && req.url.includes('/messages') && req.method === 'GET') {
      const id = req.url.split('/')[3];

      const { data: ticketData, error: ticketError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', id)
        .single();

      if (ticketError || !ticketData) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      if (ticketData.user_id !== user.id && user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

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
    }
    // POST /api/tickets/:id/messages
    else if (req.url.includes('/api/tickets/') && req.url.includes('/messages') && req.method === 'POST') {
      const id = req.url.split('/')[3];
      const { message } = req.body || {};

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const { data: ticketData, error: ticketError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', id)
        .single();

      if (ticketError || !ticketData) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      if (ticketData.user_id !== user.id && user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
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

      await supabase
        .from('support_tickets')
        .update({ updated_at: new Date() })
        .eq('id', id);

      res.status(201).json(data[0]);
    }
    // GET /api/tickets (admin)
    else if (req.url === '/api/tickets' && req.method === 'GET') {
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const url = new URL(req.url, 'http://localhost');
      const status = url.searchParams.get('status');
      const priority = url.searchParams.get('priority');

      let query = supabase
        .from('support_tickets')
        .select('id, user_id, subject, category, status, priority, created_at, updated_at, users(full_name, email)')
        .order('updated_at', { ascending: false });

      if (status) query = query.eq('status', status);
      if (priority) query = query.eq('priority', priority);

      const { data, error } = await query;

      if (error) throw error;

      const formatted = data.map(ticket => ({
        ...ticket,
        full_name: ticket.users.full_name,
        email: ticket.users.email,
      }));

      res.json(formatted);
    }
    // PUT /api/tickets/:id/status (admin)
    else if (req.url.includes('/api/tickets/') && req.url.includes('/status') && req.method === 'PUT') {
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const id = req.url.split('/')[3];
      const { status, priority } = req.body || {};

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const updates = {
        status,
        updated_at: new Date(),
      };

      if (priority) updates.priority = priority;

      const { data, error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      if (data.length === 0) {
        return res.status(404).json({ error: 'Ticket not found' });
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
