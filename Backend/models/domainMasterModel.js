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
            grace_redemption_fees ENUM('enabled', 'disabled') DEFAULT 'disabled',
            default_ns1 VARCHAR(255) DEFAULT '',
            default_ns2 VARCHAR(255) DEFAULT '',
            default_ns3 VARCHAR(255) DEFAULT '',
            default_ns4 VARCHAR(255) DEFAULT '',
            default_ns5 VARCHAR(255) DEFAULT '',
            use_client_details ENUM('enabled', 'disabled') DEFAULT 'enabled',
            contact_first_name VARCHAR(100) DEFAULT '',
            contact_last_name VARCHAR(100) DEFAULT '',
            contact_company_name VARCHAR(255) DEFAULT '',
            contact_email VARCHAR(255) DEFAULT '',
            contact_address1 VARCHAR(255) DEFAULT '',
            contact_address2 VARCHAR(255) DEFAULT '',
            contact_city VARCHAR(100) DEFAULT '',
            contact_state VARCHAR(100) DEFAULT '',
            contact_postcode VARCHAR(50) DEFAULT '',
            contact_country VARCHAR(100) DEFAULT 'United States',
            contact_phone VARCHAR(50) DEFAULT '',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Ensure singleton initial row exists with clean defaults
    const [rows] = await db.execute("SELECT id FROM domain_config WHERE id = 1");
    if (rows.length === 0) {
        await db.execute(`
            INSERT INTO domain_config 
            (id, allow_register, allow_transfer, allow_own_domain, enable_renewal_orders, auto_renew_on_payment, auto_renew_requires_product, default_auto_renewal, create_todo_entries, allow_idn_domains, grace_redemption_fees, default_ns1, default_ns2, default_ns3, default_ns4, default_ns5, use_client_details, contact_first_name, contact_last_name, contact_company_name, contact_email, contact_address1, contact_address2, contact_city, contact_state, contact_postcode, contact_country, contact_phone)
            VALUES (1, 'enabled', 'enabled', 'enabled', 'enabled', 'enabled', 'disabled', 'enabled', 'enabled', 'disabled', 'disabled', '', '', '', '', '', 'enabled', '', '', '', '', '', '', '', '', '', 'United States', '')
        `);
    }

    // 2. Domain Records Table for DataTable.jsx
    await db.execute(`
        CREATE TABLE IF NOT EXISTS domain_records (
            id INT AUTO_INCREMENT PRIMARY KEY,
            domain_name VARCHAR(255) NOT NULL UNIQUE,
            registrar VARCHAR(100) DEFAULT 'eNom',
            registration_date DATE,
            expiry_date DATE,
            auto_renew ENUM('enabled', 'disabled') DEFAULT 'enabled',
            status ENUM('active', 'pending', 'expired', 'transferred') DEFAULT 'active',
            client_name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Insert sample domains if table is empty
    const [domains] = await db.execute("SELECT COUNT(*) as count FROM domain_records");
    if (domains[0].count === 0) {
        await db.execute(`
            INSERT INTO domain_records (domain_name, registrar, registration_date, expiry_date, auto_renew, status, client_name)
            VALUES 
            ('jeenweb.com', 'eNom Registrar', '2024-01-15', '2027-01-15', 'enabled', 'active', 'Acme Corporation'),
            ('cloudservice.net', 'ResellerClub', '2023-06-10', '2026-06-10', 'enabled', 'active', 'Global Tech Solutions'),
            ('mycompany-portal.org', 'Namecheap', '2025-02-01', '2026-02-01', 'disabled', 'pending', 'Apex Cloud Services')
        `);
    }

    console.log("✅ Domain Master tables initialized successfully.");
};

module.exports = {
    createDomainMasterTables
};
