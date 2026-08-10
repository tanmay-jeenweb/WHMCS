const express = require('express');
const router = express.Router();
const {
    getProductsOverview,
    createGroup,
    createProduct,
    duplicateProduct,
    refreshFeatureStatus,
    createAddon,
    clearProductsData
} = require('../controllers/productMasterController.js');

router.get('/overview', getProductsOverview);
router.post('/groups', createGroup);
router.post('/products', createProduct);
router.post('/products/duplicate', duplicateProduct);
router.post('/refresh-status', refreshFeatureStatus);
router.post('/addons', createAddon);
router.post('/clear', clearProductsData);

module.exports = router;
