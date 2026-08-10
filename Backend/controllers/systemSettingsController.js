const db = require('../config/db.js');
const { createAuditLog } = require('../models/auditLogModel.js');

// GET SYSTEM CONFIGURATION (13 FIELDS)
const getGeneralConfig = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM system_config WHERE id = 1");
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Configuration not found" });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Get General Config Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch configuration" });
    }
};

// UPDATE SYSTEM CONFIGURATION (13 FIELDS)
const updateGeneralConfig = async (req, res) => {
    try {
        const {
            company_name,
            email_address,
            domain_url,
            logo_url,
            pay_to_text,
            system_url,
            system_theme,
            limit_activity_log,
            records_per_page,
            maintenance_mode,
            maintenance_mode_message,
            maintenance_mode_redirect,
            friendly_urls
        } = req.body;

        const query = `
            UPDATE system_config 
            SET company_name = ?, email_address = ?, domain_url = ?, logo_url = ?, pay_to_text = ?, 
                system_url = ?, system_theme = ?, limit_activity_log = ?, records_per_page = ?, 
                maintenance_mode = ?, maintenance_mode_message = ?, maintenance_mode_redirect = ?, friendly_urls = ?
            WHERE id = 1
        `;

        await db.execute(query, [
            company_name || '',
            email_address || '',
            domain_url || '',
            logo_url || '',
            pay_to_text || '',
            system_url || '',
            system_theme || 'Twenty-One',
            limit_activity_log || 10000,
            records_per_page || 50,
            maintenance_mode || 'disabled',
            maintenance_mode_message || '',
            maintenance_mode_redirect || '',
            friendly_urls || 'enabled'
        ]);

        await createAuditLog(
            req.user ? req.user.id : 1,
            req.user ? req.user.username : 'admin',
            req.headers['x-device-id'] || 'system',
            'system_settings',
            'Updated General Settings Configuration',
            null,
            { company_name, email_address, maintenance_mode }
        );

        res.status(200).json({ success: true, message: "General settings updated successfully!" });
    } catch (error) {
        console.error("Update General Config Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to update configuration" });
    }
};

// UPLOAD SYSTEM LOGO FILE
const { getFileUrl } = require('../config/uploadConfig.js');

const uploadSystemLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        const fileUrl = getFileUrl(req.file.filename);
        res.status(200).json({
            success: true,
            message: "Logo uploaded successfully!",
            url: fileUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error("Upload System Logo Error:", error);
        res.status(500).json({ success: false, message: "Failed to upload logo image" });
    }
};

module.exports = {
    getGeneralConfig,
    updateGeneralConfig,
    uploadSystemLogo
};
