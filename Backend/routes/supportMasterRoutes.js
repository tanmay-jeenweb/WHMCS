const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware.js');
const {
    getSupportConfig,
    updateSupportConfig
} = require('../controllers/supportMasterController.js');

// Config endpoints
router.get('/config', verifyToken, getSupportConfig);
router.put('/config', verifyToken, updateSupportConfig);

module.exports = router;
