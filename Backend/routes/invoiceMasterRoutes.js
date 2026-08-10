const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware.js');
const {
    getInvoiceConfig,
    updateInvoiceConfig
} = require('../controllers/invoiceMasterController.js');

// Config endpoints
router.get('/config', verifyToken, getInvoiceConfig);
router.put('/config', verifyToken, updateInvoiceConfig);

module.exports = router;
