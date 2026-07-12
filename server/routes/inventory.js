const express = require('express');
const router = express.Router();
const { getInventoryLogs, adjustStock } = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');

router.get('/logs', protect, getInventoryLogs);
router.post('/adjust', protect, adjustStock);

module.exports = router;
