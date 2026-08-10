const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware.js');
const {
    getAllProductServices,
    createProductService,
    updateProductService,
    deleteProductService
} = require('../controllers/productServiceGroupMasterController.js');

router.get('/', verifyToken, getAllProductServices);
router.post('/', verifyToken, createProductService);
router.put('/:id', verifyToken, updateProductService);
router.delete('/:id', verifyToken, deleteProductService);

module.exports = router;
