const db = require('../config/db.js');

const createSystemSettingsTables = async () => {
    // 1. WHMCS General System Configuration Table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS system_config (
            id INT PRIMARY KEY DEFAULT 1,
            company_name VARCHAR(255) DEFAULT '',
            email_address VARCHAR(255) DEFAULT '',
            domain_url VARCHAR(255) DEFAULT '',
            logo_url VARCHAR(255) DEFAULT '',
            pay_to_text TEXT,
            system_url VARCHAR(255) DEFAULT '',
            system_theme VARCHAR(100) DEFAULT 'Twenty-One',
            limit_activity_log INT DEFAULT 10000,
            records_per_page INT DEFAULT 50,
            maintenance_mode ENUM('enabled', 'disabled') DEFAULT 'disabled',
            maintenance_mode_message TEXT,
            maintenance_mode_redirect VARCHAR(255) DEFAULT '',
            friendly_urls VARCHAR(100) DEFAULT 'enabled',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Alter friendly_urls to VARCHAR(100) if it was previously an ENUM
    try {
        await db.execute(`ALTER TABLE system_config MODIFY COLUMN friendly_urls VARCHAR(100) DEFAULT 'enabled'`);
    } catch (err) {
        // Ignore if already modified
    }

    // Ensure initial row exists with clean empty strings so placeholders show
    const [rows] = await db.execute("SELECT id FROM system_config WHERE id = 1");
    if (rows.length === 0) {
        await db.execute(`
            INSERT INTO system_config 
            (id, company_name, email_address, domain_url, logo_url, pay_to_text, system_url, system_theme, limit_activity_log, records_per_page, maintenance_mode, maintenance_mode_message, maintenance_mode_redirect, friendly_urls)
            VALUES (1, '', '', '', '', '', '', 'Twenty-One', 10000, 50, 'disabled', '', '', 'enabled')
        `);
    }
    console.log("✅ System Configuration table is ready.");
};

module.exports = {
    createSystemSettingsTables
};
