const express = require("express");
const router = express.Router();
const productConfigCrossSellsController = require("../controllers/productConfigCrossSellsController.js");

router.get("/:productId", productConfigCrossSellsController.getProductConfigCrossSells);
router.post("/:productId", productConfigCrossSellsController.saveProductConfigCrossSells);
router.put("/:productId", productConfigCrossSellsController.saveProductConfigCrossSells);

module.exports = router;
