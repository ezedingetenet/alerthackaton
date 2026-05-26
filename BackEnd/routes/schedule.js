const express = require('express');
const { getSchedule, createScheduleItem, updateScheduleItem, deleteScheduleItem } = require('../controllers/scheduleController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();

router.get('/', getSchedule);
router.post('/', auth, adminOnly, createScheduleItem);
router.put('/:id', auth, adminOnly, updateScheduleItem);
router.delete('/:id', auth, adminOnly, deleteScheduleItem);

module.exports = router;
