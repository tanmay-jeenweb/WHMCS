const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware.js');
const {
    getCustomerConfig,
    updateCustomerConfig,
    getAllCustomerAccounts,
    createCustomerAccount,
    deleteCustomerAccount
} = require('../controllers/customerMasterController.js');

// Config endpoints
router.get('/config', verifyToken, getCustomerConfig);
router.put('/config', verifyToken, updateCustomerConfig);

// Customer accounts endpoints
router.get('/accounts', verifyToken, getAllCustomerAccounts);
router.post('/accounts', verifyToken, createCustomerAccount);
router.delete('/accounts/:id', verifyToken, deleteCustomerAccount);

module.exports = router;
