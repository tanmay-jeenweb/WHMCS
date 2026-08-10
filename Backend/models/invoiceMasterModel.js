const db = require('../config/db.js');

const createInvoiceMasterTables = async () => {
    // 1. General Invoice Configuration Table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS invoice_config (
            id INT PRIMARY KEY DEFAULT 1,
            continuous_invoicing ENUM('enabled', 'disabled') DEFAULT 'disabled',
            invoice_due_days INT DEFAULT 14,
            payment_reminder_emails ENUM('enabled', 'disabled') DEFAULT 'enabled',
            late_fee_type ENUM('percentage', 'fixed') DEFAULT 'percentage',
            late_fee_amount DECIMAL(10,2) DEFAULT 0.00,
            late_fee_minimum DECIMAL(10,2) DEFAULT 0.00,
            auto_cancellation_days INT DEFAULT 30,
            tax_enabled ENUM('enabled', 'disabled') DEFAULT 'disabled',
            tax_type ENUM('exclusive', 'inclusive') DEFAULT 'exclusive',
            tax_name VARCHAR(100) DEFAULT 'VAT',
            tax_rate DECIMAL(5,2) DEFAULT 0.00,
            invoice_starting_number INT DEFAULT 10001,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Ensure singleton initial row exists
    const [rows] = await db.execute("SELECT id FROM invoice_config WHERE id = 1");
    if (rows.length === 0) {
        await db.execute(`
            INSERT INTO invoice_config 
            (id, continuous_invoicing, invoice_due_days, payment_reminder_emails, late_fee_type, late_fee_amount, late_fee_minimum, auto_cancellation_days, tax_enabled, tax_type, tax_name, tax_rate, invoice_starting_number)
            VALUES (1, 'disabled', 14, 'enabled', 'percentage', 0.00, 0.00, 30, 'disabled', 'exclusive', 'VAT', 0.00, 10001)
        `);
    }

    // 2. Invoice Records Table for DataTable.jsx
    await db.execute(`
        CREATE TABLE IF NOT EXISTS invoice_records (
            id INT AUTO_INCREMENT PRIMARY KEY,
            invoice_number VARCHAR(100) NOT NULL UNIQUE,
            client_name VARCHAR(255) NOT NULL,
            invoice_date DATE,
            due_date DATE,
            total_amount DECIMAL(10,2) DEFAULT 0.00,
            status ENUM('paid', 'unpaid', 'cancelled', 'refunded') DEFAULT 'unpaid',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Insert sample invoice records if table is empty
    const [records] = await db.execute("SELECT COUNT(*) as count FROM invoice_records");
    if (records[0].count === 0) {
        await db.execute(`
            INSERT INTO invoice_records (invoice_number, client_name, invoice_date, due_date, total_amount, status)
            VALUES 
            ('INV-10001', 'Acme Corporation', '2026-02-01', '2026-02-15', 149.99, 'paid'),
            ('INV-10002', 'Global Tech Solutions', '2026-02-05', '2026-02-19', 299.50, 'unpaid'),
            ('INV-10003', 'Apex Cloud Services', '2026-01-10', '2026-01-24', 89.00, 'paid')
        `);
    }

    console.log("✅ Invoice Master tables initialized successfully.");
};

module.exports = {
    createInvoiceMasterTables
};
