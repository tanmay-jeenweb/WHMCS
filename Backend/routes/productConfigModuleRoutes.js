const express = require("express");
const router = express.Router();
const productConfigModuleController = require("../controllers/productConfigModuleController.js");

router.get("/:productId", productConfigModuleController.getProductConfigModule);
router.post("/:productId", productConfigModuleController.saveProductConfigModule);
router.put("/:productId", productConfigModuleController.saveProductConfigModule);

module.exports = router;
