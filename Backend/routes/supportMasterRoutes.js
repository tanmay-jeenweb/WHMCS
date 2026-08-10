const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware.js');
const {
    getSupportConfig,
    updateSupportConfig,
    getAllSupportRecords,
    createSupportRecord,
    deleteSupportRecord
} = require('../controllers/supportMasterController.js');

// Config endpoints
router.get('/config', verifyToken, getSupportConfig);
router.put('/config', verifyToken, updateSupportConfig);

// Support records endpoints
router.get('/records', verifyToken, getAllSupportRecords);
router.post('/records', verifyToken, createSupportRecord);
router.delete('/records/:id', verifyToken, deleteSupportRecord);

module.exports = router;
