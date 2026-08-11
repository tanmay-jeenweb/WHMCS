const express = require("express");
const router = express.Router();
const productConfigLinksController = require("../controllers/productConfigLinksController.js");

router.get("/:productId", productConfigLinksController.getProductConfigLinks);
router.post("/:productId", productConfigLinksController.saveProductConfigLinks);
router.put("/:productId", productConfigLinksController.saveProductConfigLinks);

module.exports = router;
