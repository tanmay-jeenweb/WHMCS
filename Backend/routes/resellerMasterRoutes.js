const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware.js');
const {
    getResellerConfig,
    updateResellerConfig,
    getAllResellerAccounts,
    createResellerAccount,
    deleteResellerAccount,
    createResellerClient,
    createResellerClientOrder,
    getResellerClients,
    getResellerClientOrders,
    deleteResellerClient,
    getResellerProductPricing,
    setResellerProductPricing
} = require('../controllers/resellerMasterController.js');

// Config endpoints
router.get('/config', verifyToken, getResellerConfig);
router.put('/config', verifyToken, updateResellerConfig);

// Reseller accounts endpoints
router.get('/accounts', verifyToken, getAllResellerAccounts);
router.post('/accounts', verifyToken, createResellerAccount);
router.delete('/accounts/:id', verifyToken, deleteResellerAccount);

// Reseller Custom Product Pricing endpoints
router.get('/pricing/:resellerEmail', verifyToken, getResellerProductPricing);
router.post('/pricing', verifyToken, setResellerProductPricing);

// Reseller Client Management endpoints
router.post('/clients', verifyToken, createResellerClient);
router.delete('/clients/:id', verifyToken, deleteResellerClient);
router.post('/orders/create-for-client', verifyToken, createResellerClientOrder);
router.get('/clients', verifyToken, getResellerClients);
router.get('/clients/:resellerEmail', verifyToken, getResellerClients);
router.get('/orders', verifyToken, getResellerClientOrders);
router.get('/orders/:resellerEmail', verifyToken, getResellerClientOrders);

module.exports = router;
