const productConfigCustomFieldsModel = require("../models/productConfigCustomFieldsModel.js");

const getProductConfigCustomFields = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required." });
        }

        const fields = await productConfigCustomFieldsModel.getCustomFieldsByProductId(productId);
        res.status(200).json({ success: true, data: fields || [] });
    } catch (error) {
        console.error("Error in getProductConfigCustomFields:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

const saveProductConfigCustomFields = async (req, res) => {
    try {
        const { productId } = req.params;
        const data = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required." });
        }

        const updatedFields = await productConfigCustomFieldsModel.upsertProductConfigCustomFields(productId, data);
        res.status(200).json({
            success: true,
            message: "Product custom fields saved successfully.",
            data: updatedFields
        });
    } catch (error) {
        console.error("Error in saveProductConfigCustomFields:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

module.exports = {
    getProductConfigCustomFields,
    saveProductConfigCustomFields
};
