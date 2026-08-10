const db = require('../config/db.js');

const createEmailMasterTables = async () => {
    // 1. General Email Configuration Table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS email_config (
            id INT PRIMARY KEY DEFAULT 1,
            mail_provider VARCHAR(100) DEFAULT 'PHP Mail',
            disable_email_sending ENUM('enabled', 'disabled') DEFAULT 'disabled',
            disable_rfc3834_headers ENUM('enabled', 'disabled') DEFAULT 'disabled',
            global_signature TEXT,
            global_css TEXT,
            client_email_header TEXT,
            client_email_footer TEXT,
            system_from_name VARCHAR(255) DEFAULT '',
            system_from_email VARCHAR(255) DEFAULT '',
            bcc_messages TEXT,
            presales_destination VARCHAR(100) DEFAULT 'department',
            presales_email VARCHAR(255) DEFAULT '',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Ensure singleton initial row exists with clean defaults
    const [rows] = await db.execute("SELECT id FROM email_config WHERE id = 1");
    if (rows.length === 0) {
        await db.execute(`
            INSERT INTO email_config 
            (id, mail_provider, disable_email_sending, disable_rfc3834_headers, global_signature, global_css, client_email_header, client_email_footer, system_from_name, system_from_email, bcc_messages, presales_destination, presales_email)
            VALUES (1, 'PHP Mail', 'disabled', 'disabled', '', '', '', '', '', '', '', 'department', '')
        `);
    }

    // 2. Email Logs / Templates Table for DataTable.jsx
    await db.execute(`
        CREATE TABLE IF NOT EXISTS email_records (
            id INT AUTO_INCREMENT PRIMARY KEY,
            subject VARCHAR(255) NOT NULL,
            recipient_email VARCHAR(255) NOT NULL,
            recipient_name VARCHAR(255) DEFAULT '',
            email_type VARCHAR(100) DEFAULT 'System Notice',
            status ENUM('sent', 'failed', 'queued') DEFAULT 'sent',
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Insert sample email logs if table is empty
    const [records] = await db.execute("SELECT COUNT(*) as count FROM email_records");
    if (records[0].count === 0) {
        await db.execute(`
            INSERT INTO email_records (subject, recipient_email, recipient_name, email_type, status)
            VALUES 
            ('Invoice #10024 Created', 'client@acme-corp.com', 'Acme Corporation', 'Billing Invoice', 'sent'),
            ('Welcome to WHMCS Member Area', 'tech@globaltech.io', 'Global Tech Solutions', 'Account Welcome', 'sent'),
            ('Domain Renewal Notice: jeenweb.com', 'billing@apexcloud.org', 'Apex Cloud Services', 'Domain Reminder', 'queued')
        `);
    }

    console.log("✅ Email Master tables initialized successfully.");
};

module.exports = {
    createEmailMasterTables
};
