const productConfigModuleModel = require("../models/productConfigModuleModel.js");

const getProductConfigModule = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required." });
        }

        const config = await productConfigModuleModel.getModuleByProductId(productId);
        if (!config) {
            return res.status(200).json({
                success: true,
                data: {
                    product_id: parseInt(productId),
                    server_group: "None",
                    cpanel_package: "",
                    cpanel_quota: "",
                    cpanel_bandwidth: "",
                    cpanel_max_ftp: "",
                    provision_type: "manual"
                }
            });
        }

        res.status(200).json({ success: true, data: config });
    } catch (error) {
        console.error("Error in getProductConfigModule:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

const saveProductConfigModule = async (req, res) => {
    try {
        const { productId } = req.params;
        const data = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required." });
        }

        const updatedConfig = await productConfigModuleModel.upsertProductConfigModule(productId, data);
        res.status(200).json({
            success: true,
            message: "Product module configurations saved successfully.",
            data: updatedConfig
        });
    } catch (error) {
        console.error("Error in saveProductConfigModule:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

module.exports = {
    getProductConfigModule,
    saveProductConfigModule
};
