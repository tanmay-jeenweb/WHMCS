const express = require("express");
const router = express.Router();
const productConfigCustomFieldsController = require("../controllers/productConfigCustomFieldsController.js");

router.get("/:productId", productConfigCustomFieldsController.getProductConfigCustomFields);
router.post("/:productId", productConfigCustomFieldsController.saveProductConfigCustomFields);
router.put("/:productId", productConfigCustomFieldsController.saveProductConfigCustomFields);

module.exports = router;
