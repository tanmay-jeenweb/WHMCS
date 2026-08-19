const db = require('../config/db.js');

const createCustomerMasterTables = async () => {
    // 1. General Customer Configuration & Permissions Table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS customer_config (
            id INT PRIMARY KEY DEFAULT 1,
            allow_self_registration ENUM('enabled', 'disabled') DEFAULT 'enabled',
            require_email_verification ENUM('enabled', 'disabled') DEFAULT 'enabled',
            allow_profile_edit ENUM('enabled', 'disabled') DEFAULT 'enabled',
            allow_subcontacts ENUM('enabled', 'disabled') DEFAULT 'enabled',
            allow_cancellation_requests ENUM('enabled', 'disabled') DEFAULT 'enabled',
            allow_credit_card_removal ENUM('enabled', 'disabled') DEFAULT 'enabled',
            default_customer_group VARCHAR(100) DEFAULT 'Standard Client',
            allowed_portal_views TEXT,
            allowed_customer_actions TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Ensure singleton initial row exists
    const [rows] = await db.execute("SELECT id FROM customer_config WHERE id = 1");
    if (rows.length === 0) {
        await db.execute(`
            INSERT INTO customer_config 
            (id, allow_self_registration, require_email_verification, allow_profile_edit, allow_subcontacts, allow_cancellation_requests, allow_credit_card_removal, default_customer_group, allowed_portal_views, allowed_customer_actions)
            VALUES (1, 'enabled', 'enabled', 'enabled', 'enabled', 'enabled', 'enabled', 'Standard Client', 'dashboard,invoices,services,domains,tickets', 'order,pay,ticket_open,domain_renew')
        `);
    }

    // 2. Customer Accounts Table for DataTable.jsx
    await db.execute(`
        CREATE TABLE IF NOT EXISTS customer_accounts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            customer_code VARCHAR(100) NOT NULL UNIQUE,
            full_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) DEFAULT '',
            domain_name VARCHAR(255) DEFAULT '',
            phone VARCHAR(100) DEFAULT '',
            company_name VARCHAR(255) DEFAULT '',
            alt_email VARCHAR(255) DEFAULT '',
            address VARCHAR(255) DEFAULT '',
            city VARCHAR(100) DEFAULT '',
            state VARCHAR(100) DEFAULT '',
            zip VARCHAR(50) DEFAULT '',
            user_count INT DEFAULT 1,
            notes TEXT,
            customer_group VARCHAR(100) DEFAULT 'Standard Client',
            status ENUM('active', 'inactive', 'closed') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Ensure columns exist if table was previously created
    const columnsToEnsure = [
        { name: "password", spec: "VARCHAR(255) DEFAULT ''" },
        { name: "domain_name", spec: "VARCHAR(255) DEFAULT ''" },
        { name: "phone", spec: "VARCHAR(100) DEFAULT ''" },
        { name: "alt_email", spec: "VARCHAR(255) DEFAULT ''" },
        { name: "address", spec: "VARCHAR(255) DEFAULT ''" },
        { name: "city", spec: "VARCHAR(100) DEFAULT ''" },
        { name: "state", spec: "VARCHAR(100) DEFAULT ''" },
        { name: "zip", spec: "VARCHAR(50) DEFAULT ''" },
        { name: "user_count", spec: "INT DEFAULT 1" },
        { name: "notes", spec: "TEXT" }
    ];

    for (const col of columnsToEnsure) {
        try {
            const [existing] = await db.execute(`SHOW COLUMNS FROM customer_accounts LIKE '${col.name}'`);
            if (!existing || existing.length === 0) {
                await db.execute(`ALTER TABLE customer_accounts ADD COLUMN ${col.name} ${col.spec}`);
                console.log(`✅ Added column ${col.name} to customer_accounts table.`);
            }
        } catch (e) {
            console.warn(`Column migration check warning for ${col.name}:`, e.message);
        }
    }

    // Insert sample customer records if table is empty
    const [records] = await db.execute("SELECT COUNT(*) as count FROM customer_accounts");
    if (records[0].count === 0) {
        await db.execute(`
            INSERT INTO customer_accounts (customer_code, full_name, email, company_name, customer_group, status)
            VALUES 
            ('CUST-1001', 'John Doe', 'john.doe@acme.com', 'Acme Corporation', 'Enterprise Client', 'active'),
            ('CUST-1002', 'Sarah Smith', 'sarah@globaltech.io', 'Global Tech Solutions', 'Standard Client', 'active'),
            ('CUST-1003', 'Michael Brown', 'michael@apexcloud.org', 'Apex Cloud Services', 'VIP Client', 'active')
        `);
    }

    console.log("✅ Customer Master tables initialized successfully.");
};

module.exports = {
    createCustomerMasterTables
};
