const db = require('../config/db.js');
const { createAuditLog } = require('../models/auditLogModel.js');

// GET GENERAL SUPPORT CONFIG
const getSupportConfig = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM support_config WHERE id = 1");
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Configuration not found" });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Get Support Config Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch support configuration" });
    }
};

// UPDATE GENERAL SUPPORT CONFIG
const updateSupportConfig = async (req, res) => {
    try {
        const {
            mail_provider,
            disable_email_sending,
            disable_rfc3834_headers,
            global_signature,
            global_css,
            client_email_header,
            client_email_footer,
            system_from_name,
            system_from_email,
            bcc_messages,
            presales_destination,
            presales_email,
            ticket_reply_order,
            show_client_gravatar,
            allowed_attachment_types
        } = req.body;

        const query = `
            UPDATE support_config 
            SET mail_provider = ?, disable_email_sending = ?, disable_rfc3834_headers = ?, 
                global_signature = ?, global_css = ?, client_email_header = ?, client_email_footer = ?, 
                system_from_name = ?, system_from_email = ?, bcc_messages = ?, 
                presales_destination = ?, presales_email = ?, ticket_reply_order = ?, 
                show_client_gravatar = ?, allowed_attachment_types = ?
            WHERE id = 1
        `;

        await db.execute(query, [
            mail_provider || 'PHP Mail',
            disable_email_sending || 'disabled',
            disable_rfc3834_headers || 'disabled',
            global_signature || '',
            global_css || '',
            client_email_header || '',
            client_email_footer || '',
            system_from_name || '',
            system_from_email || '',
            bcc_messages || '',
            presales_destination || 'department',
            presales_email || '',
            ticket_reply_order || 'asc',
            show_client_gravatar || 'enabled',
            allowed_attachment_types || '.jpg,.jpeg,.png,.pdf,.zip,.txt'
        ]);

        await createAuditLog(
            req.user ? req.user.id : 1,
            req.user ? req.user.username : 'admin',
            req.headers['x-device-id'] || 'system',
            'support_master',
            'Updated Support Master Configuration',
            null,
            { mail_provider, system_from_email, ticket_reply_order }
        );

        res.status(200).json({ success: true, message: "Support configuration saved successfully!" });
    } catch (error) {
        console.error("Update Support Config Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to update support configuration" });
    }
};

// CRUD FOR SUPPORT TICKET RECORDS (DataTable.jsx)
const getAllSupportRecords = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM support_records ORDER BY id DESC");
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Get Support Records Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch support records" });
    }
};

const createSupportRecord = async (req, res) => {
    try {
        const { ticket_number, department, subject, client_name, priority, status } = req.body;
        if (!ticket_number || !subject || !client_name) {
            return res.status(400).json({ success: false, message: "Ticket Number, Subject, and Client Name are required" });
        }

        const [result] = await db.execute(
            `INSERT INTO support_records (ticket_number, department, subject, client_name, priority, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                ticket_number,
                department || 'Technical Support',
                subject,
                client_name,
                priority || 'Medium',
                status || 'Open'
            ]
        );

        res.status(201).json({ success: true, message: "Support ticket record created successfully!", id: result.insertId });
    } catch (error) {
        console.error("Create Support Record Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to create support record" });
    }
};

const deleteSupportRecord = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute("DELETE FROM support_records WHERE id = ?", [id]);
        res.status(200).json({ success: true, message: "Support ticket record deleted successfully!" });
    } catch (error) {
        console.error("Delete Support Record Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to delete support record" });
    }
};

module.exports = {
    getSupportConfig,
    updateSupportConfig,
    getAllSupportRecords,
    createSupportRecord,
    deleteSupportRecord
};
