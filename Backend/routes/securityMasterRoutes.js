const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware.js');
const {
    getSecurityConfig,
    updateSecurityConfig
} = require('../controllers/securityMasterController.js');

// Config endpoints
router.get('/config', verifyToken, getSecurityConfig);
router.put('/config', verifyToken, updateSecurityConfig);

module.exports = router;
