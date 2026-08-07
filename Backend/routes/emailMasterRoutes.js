const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware.js');
const {
    getEmailConfig,
    updateEmailConfig,
    getAllEmailRecords,
    createEmailRecord,
    deleteEmailRecord
} = require('../controllers/emailMasterController.js');

// Config endpoints
router.get('/config', verifyToken, getEmailConfig);
router.put('/config', verifyToken, updateEmailConfig);

// Email records endpoints
router.get('/records', verifyToken, getAllEmailRecords);
router.post('/records', verifyToken, createEmailRecord);
router.delete('/records/:id', verifyToken, deleteEmailRecord);

module.exports = router;
