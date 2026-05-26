const pool = require('../config/db');

const createTicket = async (req, res) => {
  try {
    const { subject, category, priority } = req.body;

    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    const result = await pool.query(
      'INSERT INTO support_tickets (user_id, subject, category, priority) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, subject, category || 'general', priority || 'medium']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMyTickets = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, subject, category, status, priority, created_at, updated_at FROM support_tickets WHERE user_id = $1 ORDER BY updated_at DESC',
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllTickets = async (req, res) => {
  try {
    const { status, priority } = req.query;

    let query = `
      SELECT t.id, t.user_id, t.subject, t.category, t.status, t.priority, t.created_at, t.updated_at,
             u.full_name, u.email
      FROM support_tickets t
      JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (priority) {
      query += ` AND t.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    query += ' ORDER BY t.updated_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTicketMessages = async (req, res) => {
  try {
    const { id } = req.params;

    const ticketResult = await pool.query('SELECT * FROM support_tickets WHERE id = $1', [id]);

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = ticketResult.rows[0];

    if (ticket.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messagesResult = await pool.query(
      `SELECT m.id, m.message, m.is_admin_reply, m.created_at,
              u.full_name, u.email
       FROM ticket_messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.ticket_id = $1
       ORDER BY m.created_at ASC`,
      [id]
    );

    res.json({ ticket, messages: messagesResult.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const sendTicketMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ticketResult = await pool.query('SELECT * FROM support_tickets WHERE id = $1', [id]);

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = ticketResult.rows[0];

    if (ticket.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      'INSERT INTO ticket_messages (ticket_id, sender_id, message, is_admin_reply) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, req.user.id, message, req.user.role === 'admin']
    );

    await pool.query(
      'UPDATE support_tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const result = await pool.query(
      'UPDATE support_tickets SET status = $1, priority = COALESCE($2, priority), updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [status, priority, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createTicket, getMyTickets, getAllTickets, getTicketMessages, sendTicketMessage, updateTicketStatus };
