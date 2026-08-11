const express = require("express");
const router = express.Router();
const productConfigOptionsController = require("../controllers/productConfigOptionsController.js");

router.get("/:productId", productConfigOptionsController.getProductConfigOptions);
router.post("/:productId", productConfigOptionsController.saveProductConfigOptions);
router.put("/:productId", productConfigOptionsController.saveProductConfigOptions);

module.exports = router;
