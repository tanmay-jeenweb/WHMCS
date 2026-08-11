const express = require("express");
const router = express.Router();
const productConfigPricingController = require("../controllers/productConfigPricingController.js");

router.get("/:productId", productConfigPricingController.getProductConfigPricing);
router.post("/:productId", productConfigPricingController.saveProductConfigPricing);
router.put("/:productId", productConfigPricingController.saveProductConfigPricing);

module.exports = router;
