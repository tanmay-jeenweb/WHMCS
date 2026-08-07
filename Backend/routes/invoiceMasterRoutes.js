const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware.js');
const {
    getInvoiceConfig,
    updateInvoiceConfig,
    getAllInvoiceRecords,
    createInvoiceRecord,
    deleteInvoiceRecord
} = require('../controllers/invoiceMasterController.js');

// Config endpoints
router.get('/config', verifyToken, getInvoiceConfig);
router.put('/config', verifyToken, updateInvoiceConfig);

// Invoice records endpoints
router.get('/records', verifyToken, getAllInvoiceRecords);
router.post('/records', verifyToken, createInvoiceRecord);
router.delete('/records/:id', verifyToken, deleteInvoiceRecord);

module.exports = router;
