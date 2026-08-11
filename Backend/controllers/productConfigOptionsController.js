const productConfigOptionsModel = require("../models/productConfigOptionsModel.js");

const getProductConfigOptions = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required." });
        }

        const config = await productConfigOptionsModel.getOptionsByProductId(productId);
        if (!config) {
            return res.status(200).json({
                success: true,
                data: {
                    product_id: parseInt(productId),
                    assigned_option_groups: "[]"
                }
            });
        }

        res.status(200).json({ success: true, data: config });
    } catch (error) {
        console.error("Error in getProductConfigOptions:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

const saveProductConfigOptions = async (req, res) => {
    try {
        const { productId } = req.params;
        const data = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required." });
        }

        const updatedConfig = await productConfigOptionsModel.upsertProductConfigOptions(productId, data);
        res.status(200).json({
            success: true,
            message: "Product configurable options saved successfully.",
            data: updatedConfig
        });
    } catch (error) {
        console.error("Error in saveProductConfigOptions:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

module.exports = {
    getProductConfigOptions,
    saveProductConfigOptions
};
