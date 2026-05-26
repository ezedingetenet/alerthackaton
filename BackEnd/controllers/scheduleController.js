const pool = require('../config/db');

const getSchedule = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, day, start_time, end_time, title, description FROM schedule_items ORDER BY day, order_index'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createScheduleItem = async (req, res) => {
  try {
    const { day, start_time, end_time, title, description, order_index } = req.body;

    if (!day || !start_time || !end_time || !title) {
      return res.status(400).json({ error: 'Day, start_time, end_time, and title are required' });
    }

    const result = await pool.query(
      'INSERT INTO schedule_items (day, start_time, end_time, title, description, order_index) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [day, start_time, end_time, title, description, order_index]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateScheduleItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { day, start_time, end_time, title, description, order_index } = req.body;

    const result = await pool.query(
      'UPDATE schedule_items SET day = COALESCE($1, day), start_time = COALESCE($2, start_time), end_time = COALESCE($3, end_time), title = COALESCE($4, title), description = COALESCE($5, description), order_index = COALESCE($6, order_index), updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [day, start_time, end_time, title, description, order_index, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule item not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteScheduleItem = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM schedule_items WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule item not found' });
    }

    res.json({ message: 'Schedule item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getSchedule, createScheduleItem, updateScheduleItem, deleteScheduleItem };
