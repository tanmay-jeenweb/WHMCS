const db = require('../config/db.js');

const createOrderingMasterTables = async () => {
    // 1. General Ordering Configuration Table (WHMCS Order Settings)
    await db.execute(`
        CREATE TABLE IF NOT EXISTS ordering_config (
            id INT PRIMARY KEY DEFAULT 1,
            order_days_grace INT DEFAULT 0,
            default_template VARCHAR(100) DEFAULT 'standard_cart',
            on_demand_renewals ENUM('enabled', 'disabled') DEFAULT 'disabled',
            renewal_days_monthly INT DEFAULT 31,
            renewal_days_quarterly INT DEFAULT 92,
            renewal_days_semiannually INT DEFAULT 184,
            renewal_days_annually INT DEFAULT 366,
            renewal_days_biennially INT DEFAULT 731,
            renewal_days_triennially INT DEFAULT 1096,
            undefined_addons_config VARCHAR(100) DEFAULT 'global',
            sidebar_toggle ENUM('enabled', 'disabled') DEFAULT 'enabled',
            enable_tos ENUM('enabled', 'disabled') DEFAULT 'disabled',
            tos_url VARCHAR(255) DEFAULT '',
            auto_redirect_checkout VARCHAR(100) DEFAULT 'completed',
            allow_notes ENUM('enabled', 'disabled') DEFAULT 'enabled',
            monthly_breakdown ENUM('enabled', 'disabled') DEFAULT 'disabled',
            block_existing_domains ENUM('enabled', 'disabled') DEFAULT 'disabled',
            no_invoice_email ENUM('enabled', 'disabled') DEFAULT 'disabled',
            skip_fraud_existing ENUM('enabled', 'disabled') DEFAULT 'disabled',
            only_autoprovision_existing ENUM('enabled', 'disabled') DEFAULT 'disabled',
            enable_random_usernames ENUM('enabled', 'disabled') DEFAULT 'disabled',
            signup_anniversary_prorata ENUM('enabled', 'disabled') DEFAULT 'disabled',
            enable_cross_selling ENUM('enabled', 'disabled') DEFAULT 'disabled',
            cross_sell_locations TEXT,
            number_of_cross_sells INT DEFAULT 10,
            recommend_existing_services ENUM('enabled', 'disabled') DEFAULT 'disabled',
            cross_sell_style VARCHAR(100) DEFAULT 'standard',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Ensure singleton initial row exists with clean defaults
    const [rows] = await db.execute("SELECT id FROM ordering_config WHERE id = 1");
    if (rows.length === 0) {
        await db.execute(`
            INSERT INTO ordering_config 
            (id, order_days_grace, default_template, on_demand_renewals, renewal_days_monthly, renewal_days_quarterly, renewal_days_semiannually, renewal_days_annually, renewal_days_biennially, renewal_days_triennially, undefined_addons_config, sidebar_toggle, enable_tos, tos_url, auto_redirect_checkout, allow_notes, monthly_breakdown, block_existing_domains, no_invoice_email, skip_fraud_existing, only_autoprovision_existing, enable_random_usernames, signup_anniversary_prorata, enable_cross_selling, cross_sell_locations, number_of_cross_sells, recommend_existing_services, cross_sell_style)
            VALUES (1, 0, 'standard_cart', 'disabled', 31, 92, 184, 366, 731, 1096, 'global', 'enabled', 'disabled', '', 'completed', 'enabled', 'disabled', 'disabled', 'disabled', 'disabled', 'disabled', 'disabled', 'disabled', 'disabled', 'cart_checkout', 10, 'disabled', 'standard')
        `);
    }
    console.log("✅ Ordering Master configuration table initialized successfully.");
};

module.exports = {
    createOrderingMasterTables
};
