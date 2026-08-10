const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware.js');
const {
    getSecurityConfig,
    updateSecurityConfig,
    getAllSecurityRecords,
    createSecurityRecord,
    deleteSecurityRecord
} = require('../controllers/securityMasterController.js');

// Config endpoints
router.get('/config', verifyToken, getSecurityConfig);
router.put('/config', verifyToken, updateSecurityConfig);

// Security records endpoints
router.get('/records', verifyToken, getAllSecurityRecords);
router.post('/records', verifyToken, createSecurityRecord);
router.delete('/records/:id', verifyToken, deleteSecurityRecord);

module.exports = router;
