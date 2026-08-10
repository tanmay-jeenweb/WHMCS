const db = require('../config/db.js');
const { createAuditLog } = require('../models/auditLogModel.js');

// GET GENERAL ORDERING CONFIG
const getOrderingConfig = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM ordering_config WHERE id = 1");
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Configuration not found" });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Get Ordering Config Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch ordering configuration" });
    }
};

// UPDATE GENERAL ORDERING CONFIG
const updateOrderingConfig = async (req, res) => {
    try {
        const {
            order_days_grace,
            default_template,
            on_demand_renewals,
            renewal_days_monthly,
            renewal_days_quarterly,
            renewal_days_semiannually,
            renewal_days_annually,
            renewal_days_biennially,
            renewal_days_triennially,
            undefined_addons_config,
            sidebar_toggle,
            enable_tos,
            tos_url,
            auto_redirect_checkout,
            allow_notes,
            monthly_breakdown,
            block_existing_domains,
            no_invoice_email,
            skip_fraud_existing,
            only_autoprovision_existing,
            enable_random_usernames,
            signup_anniversary_prorata,
            enable_cross_selling,
            cross_sell_locations,
            number_of_cross_sells,
            recommend_existing_services,
            cross_sell_style
        } = req.body;

        const query = `
            UPDATE ordering_config 
            SET order_days_grace = ?, default_template = ?, on_demand_renewals = ?, 
                renewal_days_monthly = ?, renewal_days_quarterly = ?, renewal_days_semiannually = ?, 
                renewal_days_annually = ?, renewal_days_biennially = ?, renewal_days_triennially = ?, 
                undefined_addons_config = ?, sidebar_toggle = ?, enable_tos = ?, tos_url = ?, 
                auto_redirect_checkout = ?, allow_notes = ?, monthly_breakdown = ?, 
                block_existing_domains = ?, no_invoice_email = ?, skip_fraud_existing = ?, 
                only_autoprovision_existing = ?, enable_random_usernames = ?, signup_anniversary_prorata = ?, 
                enable_cross_selling = ?, cross_sell_locations = ?, number_of_cross_sells = ?, 
                recommend_existing_services = ?, cross_sell_style = ?
            WHERE id = 1
        `;

        await db.execute(query, [
            order_days_grace || 0,
            default_template || 'standard_cart',
            on_demand_renewals || 'disabled',
            renewal_days_monthly || 31,
            renewal_days_quarterly || 92,
            renewal_days_semiannually || 184,
            renewal_days_annually || 366,
            renewal_days_biennially || 731,
            renewal_days_triennially || 1096,
            undefined_addons_config || 'global',
            sidebar_toggle || 'enabled',
            enable_tos || 'disabled',
            tos_url || '',
            auto_redirect_checkout || 'completed',
            allow_notes || 'enabled',
            monthly_breakdown || 'disabled',
            block_existing_domains || 'disabled',
            no_invoice_email || 'disabled',
            skip_fraud_existing || 'disabled',
            only_autoprovision_existing || 'disabled',
            enable_random_usernames || 'disabled',
            signup_anniversary_prorata || 'disabled',
            enable_cross_selling || 'disabled',
            cross_sell_locations || 'cart_checkout',
            number_of_cross_sells || 10,
            recommend_existing_services || 'disabled',
            cross_sell_style || 'standard'
        ]);

        await createAuditLog(
            req.user ? req.user.id : 1,
            req.user ? req.user.username : 'admin',
            req.headers['x-device-id'] || 'system',
            'ordering_master',
            'Updated Ordering Master Configuration',
            null,
            { default_template, enable_tos, order_days_grace }
        );

        res.status(200).json({ success: true, message: "Ordering configuration saved successfully!" });
    } catch (error) {
        console.error("Update Ordering Config Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to update configuration" });
    }
};
module.exports = {
    getOrderingConfig,
    updateOrderingConfig
};
