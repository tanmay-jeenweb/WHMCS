const db = require('../config/db.js');
const { createAuditLog } = require('../models/auditLogModel.js');

// GET GENERAL SECURITY CONFIG
const getSecurityConfig = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM security_config WHERE id = 1");
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Configuration not found" });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Get Security Config Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch security configuration" });
    }
};

// UPDATE GENERAL SECURITY CONFIG
const updateSecurityConfig = async (req, res) => {
    try {
        const {
            email_verification,
            captcha_form_protection,
            captcha_type,
            captcha_forms,
            auto_gen_password_format,
            min_password_strength,
            failed_admin_ban_time,
            whitelisted_ips,
            whitelisted_ip_login_notices,
            disable_admin_password_reset,
            delete_credit_card_data,
            delete_bank_account_data,
            allow_client_paymethod_removal,
            disable_session_ip_check,
            proxy_ip_header,
            trusted_proxies,
            api_ip_access,
            log_api_auth,
            csrf_tokens_general,
            csrf_tokens_domain_checker
        } = req.body;

        const query = `
            UPDATE security_config 
            SET email_verification = ?, captcha_form_protection = ?, captcha_type = ?, 
                captcha_forms = ?, auto_gen_password_format = ?, min_password_strength = ?, 
                failed_admin_ban_time = ?, whitelisted_ips = ?, whitelisted_ip_login_notices = ?, 
                disable_admin_password_reset = ?, delete_credit_card_data = ?, delete_bank_account_data = ?, 
                allow_client_paymethod_removal = ?, disable_session_ip_check = ?, proxy_ip_header = ?, 
                trusted_proxies = ?, api_ip_access = ?, log_api_auth = ?, 
                csrf_tokens_general = ?, csrf_tokens_domain_checker = ?
            WHERE id = 1
        `;

        await db.execute(query, [
            email_verification || 'enabled',
            captcha_form_protection || 'unauthenticated',
            captcha_type || 'default_6char',
            captcha_forms || '',
            auto_gen_password_format || 'letters_numbers_special',
            min_password_strength || 50,
            failed_admin_ban_time || 15,
            whitelisted_ips || '',
            whitelisted_ip_login_notices || 'disabled',
            disable_admin_password_reset || 'disabled',
            delete_credit_card_data || 'disabled',
            delete_bank_account_data || 'disabled',
            allow_client_paymethod_removal || 'enabled',
            disable_session_ip_check || 'disabled',
            proxy_ip_header || 'X_FORWARDED_FOR',
            trusted_proxies || '',
            api_ip_access || '',
            log_api_auth || 'enabled',
            csrf_tokens_general || 'enabled',
            csrf_tokens_domain_checker || 'disabled'
        ]);

        await createAuditLog(
            req.user ? req.user.id : 1,
            req.user ? req.user.username : 'admin',
            req.headers['x-device-id'] || 'system',
            'security_master',
            'Updated Security Master Configuration',
            null,
            { captcha_form_protection, min_password_strength, failed_admin_ban_time }
        );

        res.status(200).json({ success: true, message: "Security configuration saved successfully!" });
    } catch (error) {
        console.error("Update Security Config Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to update security configuration" });
    }
};

// CRUD FOR SECURITY RECORDS (DataTable.jsx)
const getAllSecurityRecords = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM security_records ORDER BY id DESC");
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Get Security Records Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch security records" });
    }
};

const createSecurityRecord = async (req, res) => {
    try {
        const { ip_address, event_type, reason, status } = req.body;
        if (!ip_address || !event_type) {
            return res.status(400).json({ success: false, message: "IP Address and Event Type are required" });
        }

        const [result] = await db.execute(
            `INSERT INTO security_records (ip_address, event_type, reason, status)
             VALUES (?, ?, ?, ?)`,
            [
                ip_address,
                event_type,
                reason || '',
                status || 'banned'
            ]
        );

        res.status(201).json({ success: true, message: "Security record created successfully!", id: result.insertId });
    } catch (error) {
        console.error("Create Security Record Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to create security record" });
    }
};

const deleteSecurityRecord = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute("DELETE FROM security_records WHERE id = ?", [id]);
        res.status(200).json({ success: true, message: "Security record deleted successfully!" });
    } catch (error) {
        console.error("Delete Security Record Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to delete security record" });
    }
};

module.exports = {
    getSecurityConfig,
    updateSecurityConfig,
    getAllSecurityRecords,
    createSecurityRecord,
    deleteSecurityRecord
};
