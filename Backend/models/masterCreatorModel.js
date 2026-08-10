const db = require('../config/db.js');

const createMasterCreatorTables = async () => {
    // 1. Master Creator General System Configuration
    await db.execute(`
        CREATE TABLE IF NOT EXISTS master_creator_config (
            id INT PRIMARY KEY DEFAULT 1,
            allow_custom_master_creation ENUM('enabled', 'disabled') DEFAULT 'enabled',
            auto_generate_crud_routes ENUM('enabled', 'disabled') DEFAULT 'enabled',
            auto_add_to_navbar ENUM('enabled', 'disabled') DEFAULT 'enabled',
            default_database_engine VARCHAR(50) DEFAULT 'InnoDB',
            allowed_field_types VARCHAR(255) DEFAULT 'VARCHAR,TEXT,INT,DECIMAL,ENUM,BOOLEAN,DATETIME',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Ensure singleton initial row exists
    const [rows] = await db.execute("SELECT id FROM master_creator_config WHERE id = 1");
    if (rows.length === 0) {
        await db.execute(`
            INSERT INTO master_creator_config (id, allow_custom_master_creation, auto_generate_crud_routes, auto_add_to_navbar, default_database_engine, allowed_field_types)
            VALUES (1, 'enabled', 'enabled', 'enabled', 'InnoDB', 'VARCHAR,TEXT,INT,DECIMAL,ENUM,BOOLEAN,DATETIME')
        `);
    }

    // 2. Custom Master Registry Table for DataTable.jsx
    await db.execute(`
        CREATE TABLE IF NOT EXISTS custom_masters_registry (
            id INT AUTO_INCREMENT PRIMARY KEY,
            master_name VARCHAR(255) NOT NULL UNIQUE,
            master_key VARCHAR(100) NOT NULL UNIQUE,
            icon_class VARCHAR(100) DEFAULT 'fa-solid fa-cube',
            description TEXT,
            table_name VARCHAR(100) NOT NULL,
            fields_json TEXT,
            status ENUM('active', 'draft', 'archived') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Insert sample master creator records if table is empty
    const [records] = await db.execute("SELECT COUNT(*) as count FROM custom_masters_registry");
    if (records[0].count === 0) {
        await db.execute(`
            INSERT INTO custom_masters_registry (master_name, master_key, icon_class, description, table_name, fields_json, status)
            VALUES 
            ('Vendor Master', 'vendor_master', 'fa-solid fa-truck-field', 'Manage hardware & software vendor contacts', 'vendors_table', '[{"name":"vendor_name","type":"VARCHAR"},{"name":"contact_email","type":"VARCHAR"}]', 'active'),
            ('Affiliate Master', 'affiliate_master', 'fa-solid fa-bullhorn', 'Manage affiliate referral partners & commission rules', 'affiliates_table', '[{"name":"partner_code","type":"VARCHAR"},{"name":"rate","type":"DECIMAL"}]', 'active'),
            ('Server Location Master', 'server_location_master', 'fa-solid fa-server', 'Datacenter locations and server node definitions', 'server_locations_table', '[{"name":"datacenter_name","type":"VARCHAR"},{"name":"city","type":"VARCHAR"}]', 'active')
        `);
    }

    console.log("✅ Master Creator tables initialized successfully.");
};

module.exports = {
    createMasterCreatorTables
};
