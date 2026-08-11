const express = require("express");
const router = express.Router();
const productConfigUpgradesController = require("../controllers/productConfigUpgradesController.js");

router.get("/:productId", productConfigUpgradesController.getProductConfigUpgrades);
router.post("/:productId", productConfigUpgradesController.saveProductConfigUpgrades);
router.put("/:productId", productConfigUpgradesController.saveProductConfigUpgrades);

module.exports = router;
