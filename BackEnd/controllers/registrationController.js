const pool = require('../config/db');

const createRegistration = async (req, res) => {
  try {
    const { registration_type, participation, team_name, team_members } = req.body;

    if (!registration_type || !participation) {
      return res.status(400).json({ error: 'registration_type and participation are required' });
    }

    if (participation === 'team' && !team_name) {
      return res.status(400).json({ error: 'team_name is required for team registrations' });
    }

    const registrationResult = await pool.query(
      'INSERT INTO registrations (user_id, registration_type, participation, team_name) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, registration_type, participation, team_name]
    );

    const registration = registrationResult.rows[0];

    if (participation === 'team' && team_members && team_members.length > 0) {
      for (const member of team_members) {
        await pool.query(
          'INSERT INTO team_members (registration_id, full_name, email, member_role) VALUES ($1, $2, $3, $4)',
          [registration.id, member.full_name, member.email, member.member_role]
        );
      }
    }

    res.status(201).json(registration);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMyRegistration = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM registrations WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const registration = result.rows[0];

    let teamMembers = [];
    if (registration.participation === 'team') {
      const teamResult = await pool.query(
        'SELECT id, full_name, email, member_role FROM team_members WHERE registration_id = $1',
        [registration.id]
      );
      teamMembers = teamResult.rows;
    }

    res.json({ ...registration, team_members: teamMembers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllRegistrations = async (req, res) => {
  try {
    const { status, participation, registration_type } = req.query;

    let query = `
      SELECT r.id, r.user_id, r.registration_type, r.participation, r.team_name, r.status, r.created_at,
             u.full_name, u.email, u.phone
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND r.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (participation) {
      query += ` AND r.participation = $${paramIndex}`;
      params.push(participation);
      paramIndex++;
    }
    if (registration_type) {
      query += ` AND r.registration_type = $${paramIndex}`;
      params.push(registration_type);
      paramIndex++;
    }

    query += ' ORDER BY r.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRegistrationStats = async (req, res) => {
  try {
    const stats = {};

    const totalResult = await pool.query('SELECT COUNT(*) FROM registrations');
    stats.total = parseInt(totalResult.rows[0].count);

    const byTypeResult = await pool.query(
      'SELECT registration_type, COUNT(*) as count FROM registrations GROUP BY registration_type'
    );
    stats.byType = byTypeResult.rows;

    const byParticipationResult = await pool.query(
      'SELECT participation, COUNT(*) as count FROM registrations GROUP BY participation'
    );
    stats.byParticipation = byParticipationResult.rows;

    const byStatusResult = await pool.query(
      'SELECT status, COUNT(*) as count FROM registrations GROUP BY status'
    );
    stats.byStatus = byStatusResult.rows;

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const result = await pool.query(
      'UPDATE registrations SET status = $1, notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [status, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createRegistration, getMyRegistration, getAllRegistrations, getRegistrationStats, updateRegistrationStatus };
