const productConfigPricingModel = require("../models/productConfigPricingModel.js");

const getProductConfigPricing = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required." });
        }

        const config = await productConfigPricingModel.getPricingByProductId(productId);
        if (!config) {
            return res.status(200).json({
                success: true,
                data: {
                    product_id: parseInt(productId),
                    payment_type: "recurring",
                    monthly_price: "",
                    monthly_setup: "",
                    quarterly_price: "",
                    quarterly_setup: "",
                    semiannually_price: "",
                    semiannually_setup: "",
                    annually_price: "",
                    annually_setup: "",
                    biennially_price: "",
                    biennially_setup: "",
                    triennially_price: "",
                    triennially_setup: "",
                    fixed_term: 0,
                    allow_multiple_quantities: "no",
                    recurring_cycles_limit: 0,
                    termination_email: "None",
                    prorata_billing: 0,
                    prorata_date: 0,
                    charge_next_month: 0,
                    ondemand_renewals: "system_default",
                    allow_early_renewals: 0,
                    early_renewal_monthly: 31,
                    early_renewal_quarterly: 92,
                    early_renewal_semiannually: 184,
                    early_renewal_annually: 366,
                    early_renewal_biennially: 731,
                    early_renewal_triennially: 1096
                }
            });
        }

        res.status(200).json({ success: true, data: config });
    } catch (error) {
        console.error("Error in getProductConfigPricing:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

const saveProductConfigPricing = async (req, res) => {
    try {
        const { productId } = req.params;
        const data = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required." });
        }

        const updatedConfig = await productConfigPricingModel.upsertProductConfigPricing(productId, data);
        res.status(200).json({
            success: true,
            message: "Product configuration pricing saved successfully.",
            data: updatedConfig
        });
    } catch (error) {
        console.error("Error in saveProductConfigPricing:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

module.exports = {
    getProductConfigPricing,
    saveProductConfigPricing
};
