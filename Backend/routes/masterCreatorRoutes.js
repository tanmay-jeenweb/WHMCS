const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware.js');
const {
    getMasterCreatorConfig,
    updateMasterCreatorConfig,
    getAllCustomMasters,
    createCustomMaster,
    deleteCustomMaster
} = require('../controllers/masterCreatorController.js');

// Config routes
router.get('/config', verifyToken, getMasterCreatorConfig);
router.put('/config', verifyToken, updateMasterCreatorConfig);

// Custom Master Registry routes
router.get('/masters', verifyToken, getAllCustomMasters);
router.post('/masters', verifyToken, createCustomMaster);
router.delete('/masters/:id', verifyToken, deleteCustomMaster);

module.exports = router;
