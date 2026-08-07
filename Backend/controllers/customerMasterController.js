const db = require('../config/db.js');
const { createAuditLog } = require('../models/auditLogModel.js');

// GET CUSTOMER CONFIG
const getCustomerConfig = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM customer_config WHERE id = 1");
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Configuration not found" });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Get Customer Config Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch customer configuration" });
    }
};

// UPDATE CUSTOMER CONFIG
const updateCustomerConfig = async (req, res) => {
    try {
        const {
            allow_self_registration,
            require_email_verification,
            allow_profile_edit,
            allow_subcontacts,
            allow_cancellation_requests,
            allow_credit_card_removal,
            default_customer_group,
            allowed_portal_views,
            allowed_customer_actions
        } = req.body;

        const query = `
            UPDATE customer_config 
            SET allow_self_registration = ?, require_email_verification = ?, allow_profile_edit = ?, 
                allow_subcontacts = ?, allow_cancellation_requests = ?, allow_credit_card_removal = ?, 
                default_customer_group = ?, allowed_portal_views = ?, allowed_customer_actions = ?
            WHERE id = 1
        `;

        await db.execute(query, [
            allow_self_registration || 'enabled',
            require_email_verification || 'enabled',
            allow_profile_edit || 'enabled',
            allow_subcontacts || 'enabled',
            allow_cancellation_requests || 'enabled',
            allow_credit_card_removal || 'enabled',
            default_customer_group || 'Standard Client',
            allowed_portal_views || '',
            allowed_customer_actions || ''
        ]);

        await createAuditLog(
            req.user ? req.user.id : 1,
            req.user ? req.user.username : 'admin',
            req.headers['x-device-id'] || 'system',
            'customer_master',
            'Updated Customer Master Configuration',
            null,
            { default_customer_group, allow_self_registration }
        );

        res.status(200).json({ success: true, message: "Customer configuration saved successfully!" });
    } catch (error) {
        console.error("Update Customer Config Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to update customer configuration" });
    }
};

// CRUD FOR CUSTOMER ACCOUNTS (DataTable.jsx)
const getAllCustomerAccounts = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM customer_accounts ORDER BY id DESC");
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Get Customer Accounts Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch customer accounts" });
    }
};

const createCustomerAccount = async (req, res) => {
    try {
        const { customer_code, full_name, email, company_name, customer_group, status } = req.body;
        if (!customer_code || !full_name || !email) {
            return res.status(400).json({ success: false, message: "Customer Code, Full Name, and Email are required" });
        }

        const [result] = await db.execute(
            `INSERT INTO customer_accounts (customer_code, full_name, email, company_name, customer_group, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                customer_code,
                full_name,
                email,
                company_name || '',
                customer_group || 'Standard Client',
                status || 'active'
            ]
        );

        res.status(201).json({ success: true, message: "Customer account created successfully!", id: result.insertId });
    } catch (error) {
        console.error("Create Customer Account Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to create customer account" });
    }
};

const deleteCustomerAccount = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute("DELETE FROM customer_accounts WHERE id = ?", [id]);
        res.status(200).json({ success: true, message: "Customer account deleted successfully!" });
    } catch (error) {
        console.error("Delete Customer Account Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to delete customer account" });
    }
};

module.exports = {
    getCustomerConfig,
    updateCustomerConfig,
    getAllCustomerAccounts,
    createCustomerAccount,
    deleteCustomerAccount
};
