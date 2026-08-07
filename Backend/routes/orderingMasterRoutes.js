const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware.js');
const {
    getOrderingConfig,
    updateOrderingConfig,
    getAllOrderRecords,
    createOrderRecord,
    deleteOrderRecord
} = require('../controllers/orderingMasterController.js');

// Config endpoints
router.get('/config', verifyToken, getOrderingConfig);
router.put('/config', verifyToken, updateOrderingConfig);

// Order records endpoints
router.get('/records', verifyToken, getAllOrderRecords);
router.post('/records', verifyToken, createOrderRecord);
router.delete('/records/:id', verifyToken, deleteOrderRecord);

module.exports = router;
