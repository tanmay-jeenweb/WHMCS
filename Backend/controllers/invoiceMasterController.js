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
            continuous_invoicing,
            invoice_due_days,
            payment_reminder_emails,
            late_fee_type,
            late_fee_amount,
            late_fee_minimum,
            auto_cancellation_days,
            tax_enabled,
            tax_type,
            tax_name,
            tax_rate,
            invoice_starting_number
        } = req.body;

        const query = `
            UPDATE invoice_config 
            SET continuous_invoicing = ?, invoice_due_days = ?, payment_reminder_emails = ?, 
                late_fee_type = ?, late_fee_amount = ?, late_fee_minimum = ?, 
                auto_cancellation_days = ?, tax_enabled = ?, tax_type = ?, 
                tax_name = ?, tax_rate = ?, invoice_starting_number = ?
            WHERE id = 1
        `;

        await db.execute(query, [
            continuous_invoicing || 'disabled',
            invoice_due_days || 14,
            payment_reminder_emails || 'enabled',
            late_fee_type || 'percentage',
            late_fee_amount || 0.00,
            late_fee_minimum || 0.00,
            auto_cancellation_days || 30,
            tax_enabled || 'disabled',
            tax_type || 'exclusive',
            tax_name || 'VAT',
            tax_rate || 0.00,
            invoice_starting_number || 10001
        ]);

        await createAuditLog(
            req.user ? req.user.id : 1,
            req.user ? req.user.username : 'admin',
            req.headers['x-device-id'] || 'system',
            'invoice_master',
            'Updated Invoice Master Configuration',
            null,
            { invoice_due_days, tax_enabled, tax_name }
        );

        res.status(200).json({ success: true, message: "Invoice configuration saved successfully!" });
    } catch (error) {
        console.error("Update Invoice Config Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to update invoice configuration" });
    }
};

// CRUD FOR INVOICE RECORDS (DataTable.jsx)
const getAllInvoiceRecords = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM invoice_records ORDER BY id DESC");
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Get Invoice Records Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch invoice records" });
    }
};

const createInvoiceRecord = async (req, res) => {
    try {
        const { invoice_number, client_name, invoice_date, due_date, total_amount, status } = req.body;
        if (!invoice_number || !client_name) {
            return res.status(400).json({ success: false, message: "Invoice Number and Client Name are required" });
        }

        const [result] = await db.execute(
            `INSERT INTO invoice_records (invoice_number, client_name, invoice_date, due_date, total_amount, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                invoice_number,
                client_name,
                invoice_date || new Date().toISOString().split('T')[0],
                due_date || new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0],
                total_amount || 0.00,
                status || 'unpaid'
            ]
        );

        res.status(201).json({ success: true, message: "Invoice record created successfully!", id: result.insertId });
    } catch (error) {
        console.error("Create Invoice Record Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to create invoice record" });
    }
};

const deleteInvoiceRecord = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute("DELETE FROM invoice_records WHERE id = ?", [id]);
        res.status(200).json({ success: true, message: "Invoice record deleted successfully!" });
    } catch (error) {
        console.error("Delete Invoice Record Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to delete invoice record" });
    }
};

module.exports = {
    getInvoiceConfig,
    updateInvoiceConfig,
    getAllInvoiceRecords,
    createInvoiceRecord,
    deleteInvoiceRecord
};
