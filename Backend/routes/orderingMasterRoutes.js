const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware.js');
const {
    getOrderingConfig,
    updateOrderingConfig
} = require('../controllers/orderingMasterController.js');

// Config endpoints
router.get('/config', verifyToken, getOrderingConfig);
router.put('/config', verifyToken, updateOrderingConfig);

module.exports = router;
