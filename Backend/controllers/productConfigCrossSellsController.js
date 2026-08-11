const productConfigCrossSellsModel = require("../models/productConfigCrossSellsModel.js");

const getProductConfigCrossSells = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required." });
        }

        const config = await productConfigCrossSellsModel.getCrossSellsByProductId(productId);
        if (!config) {
            return res.status(200).json({
                success: true,
                data: {
                    product_id: parseInt(productId),
                    cross_sells: "[]"
                }
            });
        }

        res.status(200).json({ success: true, data: config });
    } catch (error) {
        console.error("Error in getProductConfigCrossSells:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

const saveProductConfigCrossSells = async (req, res) => {
    try {
        const { productId } = req.params;
        const data = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required." });
        }

        const updatedConfig = await productConfigCrossSellsModel.upsertProductConfigCrossSells(productId, data);
        res.status(200).json({
            success: true,
            message: "Product cross-sells configuration saved successfully.",
            data: updatedConfig
        });
    } catch (error) {
        console.error("Error in saveProductConfigCrossSells:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

module.exports = {
    getProductConfigCrossSells,
    saveProductConfigCrossSells
};
