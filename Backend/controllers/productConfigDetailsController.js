const productConfigDetailsModel = require("../models/productConfigDetailsModel.js");

const getProductConfigDetails = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required." });
        }

        const config = await productConfigDetailsModel.getConfigByProductId(productId);
        // If config doesn't exist, return empty default structure instead of failing
        if (!config) {
            return res.status(200).json({
                success: true,
                data: {
                    product_id: parseInt(productId),
                    product_tagline: "",
                    short_description: "",
                    description: "",
                    product_color: "#0056cf",
                    welcome_email: "hosting account welcome email",
                    require_domain: 0,
                    apply_tax: 0,
                    featured: 0,
                    hidden: 0,
                    enable_stock: 0,
                    stock_qty: 0,
                    retired: 0
                }
            });
        }

        res.status(200).json({ success: true, data: config });
    } catch (error) {
        console.error("Error in getProductConfigDetails:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

const saveProductConfigDetails = async (req, res) => {
    try {
        const { productId } = req.params;
        const data = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required." });
        }

        const updatedConfig = await productConfigDetailsModel.upsertProductConfigDetails(productId, data);
        res.status(200).json({
            success: true,
            message: "Product configuration details saved successfully.",
            data: updatedConfig
        });
    } catch (error) {
        console.error("Error in saveProductConfigDetails:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

module.exports = {
    getProductConfigDetails,
    saveProductConfigDetails
};
