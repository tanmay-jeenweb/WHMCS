const express = require("express");
const router = express.Router();
const productConfigDetailsController = require("../controllers/productConfigDetailsController.js");

router.get("/:productId", productConfigDetailsController.getProductConfigDetails);
router.post("/:productId", productConfigDetailsController.saveProductConfigDetails);
router.put("/:productId", productConfigDetailsController.saveProductConfigDetails);

module.exports = router;
