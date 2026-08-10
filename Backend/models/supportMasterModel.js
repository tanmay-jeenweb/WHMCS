const db = require('../config/db.js');

const createSupportMasterTables = async () => {
    // 1. General Support Configuration Table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS support_config (
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
            ticket_reply_order ENUM('asc', 'desc') DEFAULT 'asc',
            show_client_gravatar ENUM('enabled', 'disabled') DEFAULT 'enabled',
            allowed_attachment_types VARCHAR(255) DEFAULT '.jpg,.jpeg,.png,.pdf,.zip,.txt',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Ensure singleton initial row exists with clean defaults
    const [rows] = await db.execute("SELECT id FROM support_config WHERE id = 1");
    if (rows.length === 0) {
        await db.execute(`
            INSERT INTO support_config 
            (id, mail_provider, disable_email_sending, disable_rfc3834_headers, global_signature, global_css, client_email_header, client_email_footer, system_from_name, system_from_email, bcc_messages, presales_destination, presales_email, ticket_reply_order, show_client_gravatar, allowed_attachment_types)
            VALUES (1, 'PHP Mail', 'disabled', 'disabled', '', '', '', '', '', '', '', 'department', '', 'asc', 'enabled', '.jpg,.jpeg,.png,.pdf,.zip,.txt')
        `);
    }
    console.log("✅ Support Master configuration table initialized successfully.");
};

module.exports = {
    createSupportMasterTables
};
