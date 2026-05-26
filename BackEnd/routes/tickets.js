const express = require('express');
const { createTicket, getMyTickets, getAllTickets, getTicketMessages, sendTicketMessage, updateTicketStatus } = require('../controllers/ticketController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();

router.post('/', auth, createTicket);
router.get('/mine', auth, getMyTickets);
router.get('/:id/messages', auth, getTicketMessages);
router.post('/:id/messages', auth, sendTicketMessage);
router.get('/', auth, adminOnly, getAllTickets);
router.put('/:id/status', auth, adminOnly, updateTicketStatus);

module.exports = router;
