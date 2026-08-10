const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware.js');
const {
    getResellerConfig,
    updateResellerConfig,
    getAllResellerAccounts,
    createResellerAccount,
    deleteResellerAccount
} = require('../controllers/resellerMasterController.js');

// Config endpoints
router.get('/config', verifyToken, getResellerConfig);
router.put('/config', verifyToken, updateResellerConfig);

// Reseller accounts endpoints
router.get('/accounts', verifyToken, getAllResellerAccounts);
router.post('/accounts', verifyToken, createResellerAccount);
router.delete('/accounts/:id', verifyToken, deleteResellerAccount);

module.exports = router;
