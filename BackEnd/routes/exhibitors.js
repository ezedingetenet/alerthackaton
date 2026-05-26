const express = require('express');
const { applyAsExhibitor, getMyExhibitorApplication, getAllExhibitorApplications, updateExhibitorStatus } = require('../controllers/exhibitorController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();

router.post('/apply', auth, applyAsExhibitor);
router.get('/mine', auth, getMyExhibitorApplication);
router.get('/', auth, adminOnly, getAllExhibitorApplications);
router.put('/:id/status', auth, adminOnly, updateExhibitorStatus);

module.exports = router;
