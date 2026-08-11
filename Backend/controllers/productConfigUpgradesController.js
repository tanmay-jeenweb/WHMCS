const productConfigUpgradesModel = require("../models/productConfigUpgradesModel.js");

const getProductConfigUpgrades = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required." });
        }

        const config = await productConfigUpgradesModel.getUpgradesByProductId(productId);
        if (!config) {
            return res.status(200).json({
                success: true,
                data: {
                    product_id: parseInt(productId),
                    upgrade_packages: "[]",
                    upgrade_config_options: 0,
                    upgrade_email: "None"
                }
            });
        }

        res.status(200).json({ success: true, data: config });
    } catch (error) {
        console.error("Error in getProductConfigUpgrades:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

const saveProductConfigUpgrades = async (req, res) => {
    try {
        const { productId } = req.params;
        const data = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required." });
        }

        const updatedConfig = await productConfigUpgradesModel.upsertProductConfigUpgrades(productId, data);
        res.status(200).json({
            success: true,
            message: "Product upgrades configuration saved successfully.",
            data: updatedConfig
        });
    } catch (error) {
        console.error("Error in saveProductConfigUpgrades:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

module.exports = {
    getProductConfigUpgrades,
    saveProductConfigUpgrades
};
