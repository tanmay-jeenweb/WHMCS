const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js');
const {
    getGeneralConfig,
    updateGeneralConfig,
    getAllBatches,
    createBatch,
    deleteBatch,
    uploadSystemLogo
} = require('../controllers/systemSettingsController.js');

// General Config routes
router.get('/general', verifyToken, getGeneralConfig);
router.put('/general', verifyToken, updateGeneralConfig);

// Logo Upload route
router.post('/upload-logo', verifyToken, upload.single('logo'), uploadSystemLogo);

// Migration Batches routes for DataTable
router.get('/batches', verifyToken, getAllBatches);
router.post('/batches', verifyToken, createBatch);
router.delete('/batches/:id', verifyToken, deleteBatch);

module.exports = router;
