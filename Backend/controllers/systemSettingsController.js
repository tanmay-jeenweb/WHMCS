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
            'Updated System Settings Configuration',
            null,
            { company_name, email_address, maintenance_mode }
        );

        res.status(200).json({ success: true, message: "System configuration updated successfully!" });
    } catch (error) {
        console.error("Update General Config Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to update configuration" });
    }
};

// BATCH CRUD OPERATIONS FOR DATATABLE
const getAllBatches = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM system_settings_batches ORDER BY id DESC");
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Get All Batches Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch migration batches" });
    }
};

const createBatch = async (req, res) => {
    try {
        const { batch_name, migration_path, migration_endpoint, user_count, status } = req.body;
        if (!batch_name || !migration_path) {
            return res.status(400).json({ success: false, message: "Batch Name and Migration Path are required" });
        }

        const [result] = await db.execute(
            `INSERT INTO system_settings_batches (batch_name, migration_path, migration_endpoint, user_count, status)
             VALUES (?, ?, ?, ?, ?)`,
            [batch_name, migration_path, migration_endpoint || '', user_count || 0, status || 'scheduled']
        );

        res.status(201).json({ success: true, message: "Migration batch created successfully!", id: result.insertId });
    } catch (error) {
        console.error("Create Batch Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to create batch" });
    }
};

const deleteBatch = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute("DELETE FROM system_settings_batches WHERE id = ?", [id]);
        res.status(200).json({ success: true, message: "Migration batch deleted successfully!" });
    } catch (error) {
        console.error("Delete Batch Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to delete batch" });
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
    getAllBatches,
    createBatch,
    deleteBatch,
    uploadSystemLogo
};
