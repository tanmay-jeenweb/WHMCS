const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware.js');
const {
    getEmailConfig,
    updateEmailConfig
} = require('../controllers/emailMasterController.js');

// Config endpoints
router.get('/config', verifyToken, getEmailConfig);
router.put('/config', verifyToken, updateEmailConfig);

module.exports = router;
