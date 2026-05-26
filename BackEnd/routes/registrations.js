const express = require('express');
const { createRegistration, getMyRegistration, getAllRegistrations, getRegistrationStats, updateRegistrationStatus } = require('../controllers/registrationController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();

router.post('/', auth, createRegistration);
router.get('/mine', auth, getMyRegistration);
router.get('/stats', auth, adminOnly, getRegistrationStats);
router.get('/', auth, adminOnly, getAllRegistrations);
router.put('/:id/status', auth, adminOnly, updateRegistrationStatus);

module.exports = router;
