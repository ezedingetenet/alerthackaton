const pool = require('../config/db');

const getAdminStats = async (req, res) => {
  try {
    const stats = {};

    // Registration stats
    const regTotal = await pool.query('SELECT COUNT(*) as count FROM registrations');
    stats.registrations = {
      total: parseInt(regTotal.rows[0].count),
    };

    const regByType = await pool.query(
      'SELECT registration_type, COUNT(*) as count FROM registrations GROUP BY registration_type'
    );
    stats.registrations.byType = regByType.rows;

    const regByStatus = await pool.query(
      'SELECT status, COUNT(*) as count FROM registrations GROUP BY status'
    );
    stats.registrations.byStatus = regByStatus.rows;

    const soloTeam = await pool.query(
      'SELECT participation, COUNT(*) as count FROM registrations GROUP BY participation'
    );
    stats.registrations.soloVsTeam = soloTeam.rows;

    // Exhibitor stats
    const exhTotal = await pool.query('SELECT COUNT(*) as count FROM exhibitor_applications');
    stats.exhibitors = {
      total: parseInt(exhTotal.rows[0].count),
    };

    const exhByStatus = await pool.query(
      'SELECT status, COUNT(*) as count FROM exhibitor_applications GROUP BY status'
    );
    stats.exhibitors.byStatus = exhByStatus.rows;

    // Ticket stats
    const ticketTotal = await pool.query('SELECT COUNT(*) as count FROM support_tickets');
    stats.tickets = {
      total: parseInt(ticketTotal.rows[0].count),
    };

    const ticketByStatus = await pool.query(
      'SELECT status, COUNT(*) as count FROM support_tickets GROUP BY status'
    );
    stats.tickets.byStatus = ticketByStatus.rows;

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAdminStats };
