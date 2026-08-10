const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware.js');
const {
    getDomainConfig,
    updateDomainConfig
} = require('../controllers/domainMasterController.js');

// Config endpoints
router.get('/config', verifyToken, getDomainConfig);
router.put('/config', verifyToken, updateDomainConfig);

module.exports = router;
