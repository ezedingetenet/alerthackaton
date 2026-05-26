import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from './lib/supabase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function createToken(userId, email, role) {
  return jwt.sign(
    { id: userId, email, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
}

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new Error('Invalid authorization header');
  }

  return parts[1];
}

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url;

  try {
    // AUTH ENDPOINTS
    if (url === '/api/auth/register' && req.method === 'POST') {
      const { email, password, full_name, phone } = req.body || {};

      if (!email || !password || !full_name) {
        return res.status(400).json({ error: 'Email, password, and full name are required' });
      }

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
    }
    else if (url === '/api/auth/login' && req.method === 'POST') {
      const { email, password } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

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
    }
    else if (url === '/api/auth/me' && req.method === 'GET') {
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
    }
    // SCHEDULE ENDPOINTS
    else if (url === '/api/schedule' && req.method === 'GET') {
      const { data, error } = await supabase
        .from('schedule_items')
        .select('id, day, start_time, end_time, title, description')
        .order('day')
        .order('order_index');

      if (error) throw error;
      res.json(data);
    }
    else if (url === '/api/schedule' && req.method === 'POST') {
      const token = getTokenFromRequest(req);
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const user = verifyToken(token);
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { day, start_time, end_time, title, description, order_index } = req.body || {};

      if (!day || !start_time || !end_time || !title) {
        return res.status(400).json({ error: 'Day, start_time, end_time, and title are required' });
      }

      const { data, error } = await supabase
        .from('schedule_items')
        .insert([{ day, start_time, end_time, title, description, order_index }])
        .select();

      if (error) throw error;
      res.status(201).json(data[0]);
    }
    else if (url.match(/^\/api\/schedule\/[^/]+$/) && req.method === 'PUT') {
      const token = getTokenFromRequest(req);
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const user = verifyToken(token);
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const id = url.split('/')[3];
      const { day, start_time, end_time, title, description, order_index } = req.body || {};

      const updates = {};
      if (day !== undefined) updates.day = day;
      if (start_time !== undefined) updates.start_time = start_time;
      if (end_time !== undefined) updates.end_time = end_time;
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (order_index !== undefined) updates.order_index = order_index;
      updates.updated_at = new Date();

      const { data, error } = await supabase
        .from('schedule_items')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      if (data.length === 0) {
        return res.status(404).json({ error: 'Schedule item not found' });
      }

      res.json(data[0]);
    }
    else if (url.match(/^\/api\/schedule\/[^/]+$/) && req.method === 'DELETE') {
      const token = getTokenFromRequest(req);
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const user = verifyToken(token);
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const id = url.split('/')[3];

      const { error } = await supabase
        .from('schedule_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ message: 'Schedule item deleted' });
    }
    // REGISTRATIONS ENDPOINTS
    else if (url === '/api/registrations' && req.method === 'POST') {
      const token = getTokenFromRequest(req);
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const user = verifyToken(token);
      const { registration_type, participation, team_name, team_members } = req.body || {};

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
    }
    else if (url === '/api/registrations/mine' && req.method === 'GET') {
      const token = getTokenFromRequest(req);
      if (!token) return res.status(401).json({ error: 'No token provided' });

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
    }
    else if (url === '/api/registrations' && req.method === 'GET') {
      const token = getTokenFromRequest(req);
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const user = verifyToken(token);
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const urlObj = new URL(req.url, 'http://localhost');
      const status = urlObj.searchParams.get('status');
      const participation = urlObj.searchParams.get('participation');
      const registration_type = urlObj.searchParams.get('registration_type');

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
    }
    else if (url.match(/^\/api\/registrations\/[^/]+\/status$/) && req.method === 'PUT') {
      const token = getTokenFromRequest(req);
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const user = verifyToken(token);
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const id = url.split('/')[3];
      const { status, notes } = req.body || {};

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const { data, error } = await supabase
        .from('registrations')
        .update({ status, notes: notes || null, updated_at: new Date() })
        .eq('id', id)
        .select();

      if (error) throw error;
      if (data.length === 0) {
        return res.status(404).json({ error: 'Registration not found' });
      }

      res.json(data[0]);
    }
    // EXHIBITORS ENDPOINTS
    else if (url === '/api/exhibitors/apply' && req.method === 'POST') {
      const token = getTokenFromRequest(req);
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const user = verifyToken(token);
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
    else if (url === '/api/exhibitors/mine' && req.method === 'GET') {
      const token = getTokenFromRequest(req);
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const user = verifyToken(token);

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
    else if (url === '/api/exhibitors' && req.method === 'GET') {
      const token = getTokenFromRequest(req);
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const user = verifyToken(token);
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const urlObj = new URL(req.url, 'http://localhost');
      const status = urlObj.searchParams.get('status');

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
    else if (url.match(/^\/api\/exhibitors\/[^/]+\/status$/) && req.method === 'PUT') {
      const token = getTokenFromRequest(req);
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const user = verifyToken(token);
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const id = url.split('/')[3];
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
    // TICKETS ENDPOINTS
    else if (url === '/api/tickets' && req.method === 'POST') {
      const token = getTokenFromRequest(req);
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const user = verifyToken(token);
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
    else if (url === '/api/tickets/mine' && req.method === 'GET') {
      const token = getTokenFromRequest(req);
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const user = verifyToken(token);

      const { data, error } = await supabase
        .from('support_tickets')
        .select('id, subject, category, status, priority, created_at, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      res.json(data);
    }
    else if (url.match(/^\/api\/tickets\/[^/]+\/messages$/) && req.method === 'GET') {
      const token = getTokenFromRequest(req);
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const user = verifyToken(token);
      const id = url.split('/')[3];

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
    else if (url.match(/^\/api\/tickets\/[^/]+\/messages$/) && req.method === 'POST') {
      const token = getTokenFromRequest(req);
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const user = verifyToken(token);
      const id = url.split('/')[3];
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
    else if (url === '/api/tickets' && req.method === 'GET') {
      const token = getTokenFromRequest(req);
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const user = verifyToken(token);
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const urlObj = new URL(req.url, 'http://localhost');
      const status = urlObj.searchParams.get('status');
      const priority = urlObj.searchParams.get('priority');

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
    else if (url.match(/^\/api\/tickets\/[^/]+\/status$/) && req.method === 'PUT') {
      const token = getTokenFromRequest(req);
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const user = verifyToken(token);
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const id = url.split('/')[3];
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
    // ADMIN ENDPOINTS
    else if (url === '/api/admin/stats' && req.method === 'GET') {
      const token = getTokenFromRequest(req);
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const user = verifyToken(token);
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const stats = {};

      // Registration stats
      const { count: regTotal } = await supabase
        .from('registrations')
        .select('*', { count: 'exact' });
      stats.registrations = { total: regTotal };

      const { data: regByType } = await supabase
        .from('registrations')
        .select('registration_type');
      stats.registrations.byType = regByType.reduce((acc, item) => {
        const existing = acc.find(x => x.registration_type === item.registration_type);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ registration_type: item.registration_type, count: 1 });
        }
        return acc;
      }, []);

      const { data: regByStatus } = await supabase
        .from('registrations')
        .select('status');
      stats.registrations.byStatus = regByStatus.reduce((acc, item) => {
        const existing = acc.find(x => x.status === item.status);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ status: item.status, count: 1 });
        }
        return acc;
      }, []);

      // Exhibitor stats
      const { count: exhTotal } = await supabase
        .from('exhibitor_applications')
        .select('*', { count: 'exact' });
      stats.exhibitors = { total: exhTotal };

      const { data: exhByStatus } = await supabase
        .from('exhibitor_applications')
        .select('status');
      stats.exhibitors.byStatus = exhByStatus.reduce((acc, item) => {
        const existing = acc.find(x => x.status === item.status);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ status: item.status, count: 1 });
        }
        return acc;
      }, []);

      // Ticket stats
      const { count: ticketTotal } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact' });
      stats.tickets = { total: ticketTotal };

      const { data: ticketByStatus } = await supabase
        .from('support_tickets')
        .select('status');
      stats.tickets.byStatus = ticketByStatus.reduce((acc, item) => {
        const existing = acc.find(x => x.status === item.status);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ status: item.status, count: 1 });
        }
        return acc;
      }, []);

      res.json(stats);
    }
    else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export default handler;
