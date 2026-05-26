const express = require('express');
const { getAdminStats } = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();

router.get('/stats', auth, adminOnly, getAdminStats);

module.exports = router;
