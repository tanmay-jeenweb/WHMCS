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
            SET mail_provider = ?, disable_email_sending = ?, 
                global_signature = ?, global_css = ?, client_email_header = ?, client_email_footer = ?, 
                system_from_name = ?, system_from_email = ?, bcc_messages = ?, 
                presales_destination = ?, presales_email = ?
            WHERE id = 1
        `;

        await db.execute(query, [
            mail_provider || 'PHP Mail',
            disable_email_sending || 'disabled',
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

module.exports = {
    getEmailConfig,
    updateEmailConfig
};
