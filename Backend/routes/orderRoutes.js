const express = require('express');
const router = express.Router();
const { createOrder, getOrdersByUserEmail, getAllOrders } = require('../controllers/orderController.js');

// Routes
router.post('/', createOrder);
router.get('/user/:email', getOrdersByUserEmail);
router.get('/', getAllOrders);

module.exports = router;
