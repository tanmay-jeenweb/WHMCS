const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js');
const {
    getGeneralConfig,
    updateGeneralConfig,
    uploadSystemLogo
} = require('../controllers/systemSettingsController.js');

// General Config routes
router.get('/general', verifyToken, getGeneralConfig);
router.put('/general', verifyToken, updateGeneralConfig);

// Logo Upload route
router.post('/upload-logo', verifyToken, upload.single('logo'), uploadSystemLogo);

module.exports = router;
