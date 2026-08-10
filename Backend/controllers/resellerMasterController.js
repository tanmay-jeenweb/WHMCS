const db = require('../config/db.js');
const { createAuditLog } = require('../models/auditLogModel.js');

// GET RESELLER CONFIG
const getResellerConfig = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM reseller_config WHERE id = 1");
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Configuration not found" });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Get Reseller Config Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch reseller configuration" });
    }
};

// UPDATE RESELLER CONFIG
const updateResellerConfig = async (req, res) => {
    try {
        const {
            allow_whitelabel_branding,
            allow_subaccount_creation,
            max_subaccounts_per_reseller,
            default_commission_rate,
            allow_custom_nameservers,
            allow_api_access,
            reseller_tier_levels,
            allowed_reseller_actions
        } = req.body;

        const query = `
            UPDATE reseller_config 
            SET allow_whitelabel_branding = ?, allow_subaccount_creation = ?, max_subaccounts_per_reseller = ?, 
                default_commission_rate = ?, allow_custom_nameservers = ?, allow_api_access = ?, 
                reseller_tier_levels = ?, allowed_reseller_actions = ?
            WHERE id = 1
        `;

        await db.execute(query, [
            allow_whitelabel_branding || 'enabled',
            allow_subaccount_creation || 'enabled',
            max_subaccounts_per_reseller || 100,
            default_commission_rate || 15.00,
            allow_custom_nameservers || 'enabled',
            allow_api_access || 'enabled',
            reseller_tier_levels || 'Silver,Gold,Platinum',
            allowed_reseller_actions || ''
        ]);

        await createAuditLog(
            req.user ? req.user.id : 1,
            req.user ? req.user.username : 'admin',
            req.headers['x-device-id'] || 'system',
            'reseller_master',
            'Updated Reseller Master Configuration',
            null,
            { default_commission_rate, allow_whitelabel_branding }
        );

        res.status(200).json({ success: true, message: "Reseller configuration saved successfully!" });
    } catch (error) {
        console.error("Update Reseller Config Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to update reseller configuration" });
    }
};

// CRUD FOR RESELLER ACCOUNTS (DataTable.jsx)
const getAllResellerAccounts = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM reseller_accounts ORDER BY id DESC");
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Get Reseller Accounts Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch reseller accounts" });
    }
};

const createResellerAccount = async (req, res) => {
    try {
        const { reseller_code, reseller_name, email, tier_level, commission_rate, subaccount_count, status } = req.body;
        if (!reseller_code || !reseller_name || !email) {
            return res.status(400).json({ success: false, message: "Reseller Code, Reseller Name, and Email are required" });
        }

        const [result] = await db.execute(
            `INSERT INTO reseller_accounts (reseller_code, reseller_name, email, tier_level, commission_rate, subaccount_count, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                reseller_code,
                reseller_name,
                email,
                tier_level || 'Silver Tier',
                commission_rate || 15.00,
                subaccount_count || 0,
                status || 'active'
            ]
        );

        res.status(201).json({ success: true, message: "Reseller account created successfully!", id: result.insertId });
    } catch (error) {
        console.error("Create Reseller Account Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to create reseller account" });
    }
};

const deleteResellerAccount = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute("DELETE FROM reseller_accounts WHERE id = ?", [id]);
        res.status(200).json({ success: true, message: "Reseller account deleted successfully!" });
    } catch (error) {
        console.error("Delete Reseller Account Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to delete reseller account" });
    }
};

module.exports = {
    getResellerConfig,
    updateResellerConfig,
    getAllResellerAccounts,
    createResellerAccount,
    deleteResellerAccount
};
