const db = require('../config/db.js');

const createDomainMasterTables = async () => {
    // 1. General Domain Configuration Table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS domain_config (
            id INT PRIMARY KEY DEFAULT 1,
            allow_register ENUM('enabled', 'disabled') DEFAULT 'enabled',
            allow_transfer ENUM('enabled', 'disabled') DEFAULT 'enabled',
            allow_own_domain ENUM('enabled', 'disabled') DEFAULT 'enabled',
            enable_renewal_orders ENUM('enabled', 'disabled') DEFAULT 'enabled',
            auto_renew_on_payment ENUM('enabled', 'disabled') DEFAULT 'enabled',
            auto_renew_requires_product ENUM('enabled', 'disabled') DEFAULT 'disabled',
            default_auto_renewal ENUM('enabled', 'disabled') DEFAULT 'enabled',
            create_todo_entries ENUM('enabled', 'disabled') DEFAULT 'enabled',
            allow_idn_domains ENUM('enabled', 'disabled') DEFAULT 'disabled',
            grace_redemption_fees ENUM('enabled', 'disabled') DEFAULT 'enabled',
            default_ns1 VARCHAR(255) DEFAULT '',
            default_ns2 VARCHAR(255) DEFAULT '',
            default_ns3 VARCHAR(255) DEFAULT '',
            default_ns4 VARCHAR(255) DEFAULT '',
            default_ns5 VARCHAR(255) DEFAULT '',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Ensure singleton initial row exists with clean defaults
    const [rows] = await db.execute("SELECT id FROM domain_config WHERE id = 1");
    if (rows.length === 0) {
        await db.execute(`
            INSERT INTO domain_config 
            (id, allow_register, allow_transfer, allow_own_domain, enable_renewal_orders, auto_renew_on_payment, auto_renew_requires_product, default_auto_renewal, create_todo_entries, allow_idn_domains, grace_redemption_fees, default_ns1, default_ns2, default_ns3, default_ns4, default_ns5)
            VALUES (1, 'enabled', 'enabled', 'enabled', 'enabled', 'enabled', 'disabled', 'enabled', 'enabled', 'disabled', 'disabled', '', '', '', '', '')
        `);
    }

    console.log("✅ Domain Master configuration table initialized successfully.");
};

module.exports = {
    createDomainMasterTables
};
