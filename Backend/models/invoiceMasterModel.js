const db = require('../config/db.js');

const createInvoiceMasterTables = async () => {
    // Drop legacy structures to re-create with complete field schema
    await db.execute("DROP TABLE IF EXISTS invoice_config");
    await db.execute("DROP TABLE IF EXISTS invoice_records");

    // 1. General Invoice Configuration Table
    await db.execute(`
        CREATE TABLE invoice_config (
            id INT PRIMARY KEY DEFAULT 1,
            continuous_invoice_generation ENUM('enabled', 'disabled') DEFAULT 'disabled',
            enable_metric_usage_invoicing ENUM('enabled', 'disabled') DEFAULT 'disabled',
            enable_pdf_invoices ENUM('enabled', 'disabled') DEFAULT 'disabled',
            pdf_paper_size VARCHAR(50) DEFAULT 'A4',
            pdf_font_family VARCHAR(50) DEFAULT 'Helvetica',
            custom_pdf_font VARCHAR(100) DEFAULT '',
            store_client_data_snapshot ENUM('enabled', 'disabled') DEFAULT 'disabled',
            enable_mass_payment ENUM('enabled', 'disabled') DEFAULT 'disabled',
            clients_choose_gateway ENUM('enabled', 'disabled') DEFAULT 'disabled',
            group_similar_line_items ENUM('enabled', 'disabled') DEFAULT 'disabled',
            cancellation_request_handling ENUM('enabled', 'disabled') DEFAULT 'disabled',
            automatic_subscription_management ENUM('enabled', 'disabled') DEFAULT 'disabled',
            enable_proforma_invoicing ENUM('enabled', 'disabled') DEFAULT 'disabled',
            sequential_paid_invoice_numbering ENUM('enabled', 'disabled') DEFAULT 'disabled',
            sequential_invoice_number_format VARCHAR(255) DEFAULT '{NUMBER}',
            next_paid_invoice_number INT DEFAULT 1,
            late_fee_type ENUM('percentage', 'fixed') DEFAULT 'percentage',
            late_fee_amount DECIMAL(10,2) DEFAULT 10.00,
            late_fee_minimum DECIMAL(10,2) DEFAULT 0.00,
            accepted_credit_card_types TEXT,
            issue_number_start_date ENUM('enabled', 'disabled') DEFAULT 'disabled',
            invoice_incrementation INT DEFAULT 1,
            credit_note_number_incrementation INT DEFAULT 1,
            debit_note_number_incrementation INT DEFAULT 1,
            invoice_starting_number INT DEFAULT 1,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Ensure singleton initial row exists
    const [rows] = await db.execute("SELECT id FROM invoice_config WHERE id = 1");
    if (rows.length === 0) {
        await db.execute(`
            INSERT INTO invoice_config 
            (id, continuous_invoice_generation, enable_metric_usage_invoicing, enable_pdf_invoices, pdf_paper_size, pdf_font_family, custom_pdf_font, store_client_data_snapshot, enable_mass_payment, clients_choose_gateway, group_similar_line_items, cancellation_request_handling, automatic_subscription_management, enable_proforma_invoicing, sequential_paid_invoice_numbering, sequential_invoice_number_format, next_paid_invoice_number, late_fee_type, late_fee_amount, late_fee_minimum, accepted_credit_card_types, issue_number_start_date, invoice_incrementation, credit_note_number_incrementation, debit_note_number_incrementation, invoice_starting_number)
            VALUES (1, 'disabled', 'disabled', 'disabled', 'A4', 'Helvetica', '', 'disabled', 'disabled', 'disabled', 'disabled', 'disabled', 'disabled', 'disabled', 'disabled', '{NUMBER}', 1, 'percentage', 10.00, 0.00, 'Visa,MasterCard,Discover,American Express,JCB', 'disabled', 1, 1, 1, 1)
        `);
    }

    console.log("✅ Invoice Master configuration table initialized and restructured successfully.");
};

module.exports = {
    createInvoiceMasterTables
};
