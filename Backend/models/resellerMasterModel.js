const db = require('../config/db.js');

const createResellerMasterTables = async () => {
    // 1. General Reseller Configuration & Permissions Table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS reseller_config (
            id INT PRIMARY KEY DEFAULT 1,
            allow_whitelabel_branding ENUM('enabled', 'disabled') DEFAULT 'enabled',
            allow_subaccount_creation ENUM('enabled', 'disabled') DEFAULT 'enabled',
            max_subaccounts_per_reseller INT DEFAULT 100,
            default_commission_rate DECIMAL(5,2) DEFAULT 15.00,
            allow_custom_nameservers ENUM('enabled', 'disabled') DEFAULT 'enabled',
            allow_api_access ENUM('enabled', 'disabled') DEFAULT 'enabled',
            reseller_tier_levels VARCHAR(255) DEFAULT 'Silver,Gold,Platinum',
            allowed_reseller_actions TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Ensure singleton initial row exists
    const [rows] = await db.execute("SELECT id FROM reseller_config WHERE id = 1");
    if (rows.length === 0) {
        await db.execute(`
            INSERT INTO reseller_config 
            (id, allow_whitelabel_branding, allow_subaccount_creation, max_subaccounts_per_reseller, default_commission_rate, allow_custom_nameservers, allow_api_access, reseller_tier_levels, allowed_reseller_actions)
            VALUES (1, 'enabled', 'enabled', 100, 15.00, 'enabled', 'enabled', 'Silver,Gold,Platinum', 'create_subaccount,manage_pricing,custom_dns,payout_request')
        `);
    }

    // 2. Reseller Accounts Table for DataTable.jsx
    await db.execute(`
        CREATE TABLE IF NOT EXISTS reseller_accounts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            reseller_code VARCHAR(100) NOT NULL UNIQUE,
            reseller_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            tier_level VARCHAR(100) DEFAULT 'Silver Tier',
            commission_rate DECIMAL(5,2) DEFAULT 15.00,
            subaccount_count INT DEFAULT 0,
            status ENUM('active', 'suspended', 'pending') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Insert sample reseller records if table is empty
    const [records] = await db.execute("SELECT COUNT(*) as count FROM reseller_accounts");
    if (records[0].count === 0) {
        await db.execute(`
            INSERT INTO reseller_accounts (reseller_code, reseller_name, email, tier_level, commission_rate, subaccount_count, status)
            VALUES 
            ('RSL-5001', 'Vortex Host Network', 'reseller@vortexhost.com', 'Gold Tier', 20.00, 18, 'active'),
            ('RSL-5002', 'CloudNet Solutions', 'admin@cloudnetreseller.com', 'Platinum Tier', 25.00, 42, 'active'),
            ('RSL-5003', 'PrimeWeb Agency', 'info@primeweb.io', 'Silver Tier', 15.00, 5, 'active')
        `);
    }

    console.log("✅ Reseller Master tables initialized successfully.");
};

module.exports = {
    createResellerMasterTables
};
