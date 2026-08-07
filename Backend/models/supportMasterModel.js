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

    // 2. Support Ticket Records Table for DataTable.jsx
    await db.execute(`
        CREATE TABLE IF NOT EXISTS support_records (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ticket_number VARCHAR(100) NOT NULL UNIQUE,
            department VARCHAR(100) DEFAULT 'Technical Support',
            subject VARCHAR(255) NOT NULL,
            client_name VARCHAR(255) NOT NULL,
            priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
            status ENUM('Open', 'Answered', 'Customer-Reply', 'Closed') DEFAULT 'Open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Insert sample support tickets if table is empty
    const [tickets] = await db.execute("SELECT COUNT(*) as count FROM support_records");
    if (tickets[0].count === 0) {
        await db.execute(`
            INSERT INTO support_records (ticket_number, department, subject, client_name, priority, status)
            VALUES 
            ('TCK-88001', 'Technical Support', 'Server SSL Certificate Renewal Issue', 'Acme Corporation', 'High', 'Open'),
            ('TCK-88002', 'Billing Department', 'Invoice Payment Confirmation Inquiry', 'Global Tech Solutions', 'Medium', 'Answered'),
            ('TCK-88003', 'Domain Support', 'DNS Records Delegation Request', 'Apex Cloud Services', 'Low', 'Closed')
        `);
    }

    console.log("✅ Support Master tables initialized successfully.");
};

module.exports = {
    createSupportMasterTables
};
