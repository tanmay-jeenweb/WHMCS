const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware.js');
const {
    getDomainConfig,
    updateDomainConfig,
    getAllDomainRecords,
    createDomainRecord,
    deleteDomainRecord
} = require('../controllers/domainMasterController.js');

// Config endpoints
router.get('/config', verifyToken, getDomainConfig);
router.put('/config', verifyToken, updateDomainConfig);

// Domain records endpoints
router.get('/records', verifyToken, getAllDomainRecords);
router.post('/records', verifyToken, createDomainRecord);
router.delete('/records/:id', verifyToken, deleteDomainRecord);

module.exports = router;
