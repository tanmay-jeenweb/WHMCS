const db = require('../config/db.js');
const { createAuditLog } = require('../models/auditLogModel.js');

// GET GENERAL EMAIL CONFIG
const getEmailConfig = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM email_config WHERE id = 1");
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Configuration not found" });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Get Email Config Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch email configuration" });
    }
};

// UPDATE GENERAL EMAIL CONFIG
const updateEmailConfig = async (req, res) => {
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
            presales_email
        } = req.body;

        const query = `
            UPDATE email_config 
            SET mail_provider = ?, disable_email_sending = ?, disable_rfc3834_headers = ?, 
                global_signature = ?, global_css = ?, client_email_header = ?, client_email_footer = ?, 
                system_from_name = ?, system_from_email = ?, bcc_messages = ?, 
                presales_destination = ?, presales_email = ?
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
            presales_email || ''
        ]);

        await createAuditLog(
            req.user ? req.user.id : 1,
            req.user ? req.user.username : 'admin',
            req.headers['x-device-id'] || 'system',
            'email_master',
            'Updated Email Master Configuration',
            null,
            { mail_provider, system_from_email, disable_email_sending }
        );

        res.status(200).json({ success: true, message: "Email configuration saved successfully!" });
    } catch (error) {
        console.error("Update Email Config Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to update email configuration" });
    }
};

// CRUD FOR EMAIL RECORDS (DataTable.jsx)
const getAllEmailRecords = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM email_records ORDER BY id DESC");
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Get Email Records Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch email records" });
    }
};

const createEmailRecord = async (req, res) => {
    try {
        const { subject, recipient_email, recipient_name, email_type, status } = req.body;
        if (!subject || !recipient_email) {
            return res.status(400).json({ success: false, message: "Subject and Recipient Email are required" });
        }

        const [result] = await db.execute(
            `INSERT INTO email_records (subject, recipient_email, recipient_name, email_type, status)
             VALUES (?, ?, ?, ?, ?)`,
            [
                subject,
                recipient_email,
                recipient_name || '',
                email_type || 'System Notice',
                status || 'sent'
            ]
        );

        res.status(201).json({ success: true, message: "Email log record created successfully!", id: result.insertId });
    } catch (error) {
        console.error("Create Email Record Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to create email record" });
    }
};

const deleteEmailRecord = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute("DELETE FROM email_records WHERE id = ?", [id]);
        res.status(200).json({ success: true, message: "Email record deleted successfully!" });
    } catch (error) {
        console.error("Delete Email Record Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to delete email record" });
    }
};

module.exports = {
    getEmailConfig,
    updateEmailConfig,
    getAllEmailRecords,
    createEmailRecord,
    deleteEmailRecord
};
