const db = require('../config/db.js');
const { createAuditLog } = require('../models/auditLogModel.js');

// GET GENERAL INVOICE CONFIG
const getInvoiceConfig = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM invoice_config WHERE id = 1");
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Configuration not found" });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Get Invoice Config Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch invoice configuration" });
    }
};

// UPDATE GENERAL INVOICE CONFIG
const updateInvoiceConfig = async (req, res) => {
    try {
        const {
            continuous_invoice_generation,
            enable_metric_usage_invoicing,
            enable_pdf_invoices,
            pdf_paper_size,
            pdf_font_family,
            custom_pdf_font,
            store_client_data_snapshot,
            enable_mass_payment,
            clients_choose_gateway,
            group_similar_line_items,
            cancellation_request_handling,
            automatic_subscription_management,
            enable_proforma_invoicing,
            sequential_paid_invoice_numbering,
            sequential_invoice_number_format,
            next_paid_invoice_number,
            late_fee_type,
            late_fee_amount,
            late_fee_minimum,
            accepted_credit_card_types,
            issue_number_start_date,
            invoice_incrementation,
            credit_note_number_incrementation,
            debit_note_number_incrementation,
            invoice_starting_number
        } = req.body;

        const query = `
            UPDATE invoice_config 
            SET continuous_invoice_generation = ?, enable_metric_usage_invoicing = ?, enable_pdf_invoices = ?,
                pdf_paper_size = ?, pdf_font_family = ?, custom_pdf_font = ?,
                store_client_data_snapshot = ?, enable_mass_payment = ?, clients_choose_gateway = ?,
                group_similar_line_items = ?, cancellation_request_handling = ?, automatic_subscription_management = ?,
                enable_proforma_invoicing = ?, sequential_paid_invoice_numbering = ?, sequential_invoice_number_format = ?,
                next_paid_invoice_number = ?, late_fee_type = ?, late_fee_amount = ?,
                late_fee_minimum = ?, accepted_credit_card_types = ?, issue_number_start_date = ?,
                invoice_incrementation = ?, credit_note_number_incrementation = ?, debit_note_number_incrementation = ?,
                invoice_starting_number = ?
            WHERE id = 1
        `;

        await db.execute(query, [
            continuous_invoice_generation || 'disabled',
            enable_metric_usage_invoicing || 'disabled',
            enable_pdf_invoices || 'disabled',
            pdf_paper_size || 'A4',
            pdf_font_family || 'Helvetica',
            custom_pdf_font || '',
            store_client_data_snapshot || 'disabled',
            enable_mass_payment || 'disabled',
            clients_choose_gateway || 'disabled',
            group_similar_line_items || 'disabled',
            cancellation_request_handling || 'disabled',
            automatic_subscription_management || 'disabled',
            enable_proforma_invoicing || 'disabled',
            sequential_paid_invoice_numbering || 'disabled',
            sequential_invoice_number_format || '{NUMBER}',
            next_paid_invoice_number || 1,
            late_fee_type || 'percentage',
            late_fee_amount || 0.00,
            late_fee_minimum || 0.00,
            accepted_credit_card_types || '',
            issue_number_start_date || 'disabled',
            invoice_incrementation || 1,
            credit_note_number_incrementation || 1,
            debit_note_number_incrementation || 1,
            invoice_starting_number || 1
        ]);

        await createAuditLog(
            req.user ? req.user.id : 1,
            req.user ? req.user.username : 'admin',
            req.headers['x-device-id'] || 'system',
            'invoice_master',
            'Updated Invoice Master Configuration',
            null,
            { late_fee_type, late_fee_amount, invoice_starting_number }
        );

        res.status(200).json({ success: true, message: "Invoice configuration saved successfully!" });
    } catch (error) {
        console.error("Update Invoice Config Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to update invoice configuration" });
    }
};

module.exports = {
    getInvoiceConfig,
    updateInvoiceConfig
};
