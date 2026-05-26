const pool = require('../config/db');

const applyAsExhibitor = async (req, res) => {
  try {
    const { company_name, industry_type, contact_person, phone, description, booth_size } = req.body;

    if (!company_name || !industry_type || !contact_person) {
      return res.status(400).json({ error: 'company_name, industry_type, and contact_person are required' });
    }

    const result = await pool.query(
      'INSERT INTO exhibitor_applications (user_id, company_name, industry_type, contact_person, phone, description, booth_size) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.user.id, company_name, industry_type, contact_person, phone, description, booth_size]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMyExhibitorApplication = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM exhibitor_applications WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exhibitor application not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllExhibitorApplications = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT e.id, e.user_id, e.company_name, e.industry_type, e.contact_person, e.phone, e.description, e.booth_size, e.status, e.created_at,
             u.full_name, u.email
      FROM exhibitor_applications e
      JOIN users u ON e.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND e.status = $1`;
      params.push(status);
    }

    query += ' ORDER BY e.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateExhibitorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const result = await pool.query(
      'UPDATE exhibitor_applications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exhibitor application not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { applyAsExhibitor, getMyExhibitorApplication, getAllExhibitorApplications, updateExhibitorStatus };
