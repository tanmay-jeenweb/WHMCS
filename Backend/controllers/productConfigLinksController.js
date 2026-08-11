const productConfigLinksModel = require("../models/productConfigLinksModel.js");

const getProductConfigLinks = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required." });
        }

        const config = await productConfigLinksModel.getLinksByProductId(productId);
        if (!config) {
            return res.status(200).json({
                success: true,
                data: {
                    product_id: parseInt(productId),
                    custom_checkout_url: ""
                }
            });
        }

        res.status(200).json({ success: true, data: config });
    } catch (error) {
        console.error("Error in getProductConfigLinks:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

const saveProductConfigLinks = async (req, res) => {
    try {
        const { productId } = req.params;
        const data = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required." });
        }

        const updatedConfig = await productConfigLinksModel.upsertProductConfigLinks(productId, data);
        res.status(200).json({
            success: true,
            message: "Product links configuration saved successfully.",
            data: updatedConfig
        });
    } catch (error) {
        console.error("Error in saveProductConfigLinks:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

module.exports = {
    getProductConfigLinks,
    saveProductConfigLinks
};
