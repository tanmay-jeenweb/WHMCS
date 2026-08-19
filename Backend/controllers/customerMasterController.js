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
        const {
            customer_code,
            full_name,
            email,
            password,
            domain_name,
            phone,
            company_name,
            alt_email,
            address,
            city,
            state,
            zip,
            user_count,
            notes,
            customer_group,
            status
        } = req.body;

        if (!customer_code || !full_name || !email) {
            return res.status(400).json({ success: false, message: "Customer Code, Full Name, and Email are required" });
        }

        const bcrypt = require("bcryptjs");
        const passToHash = password || "password123";
        const hashedPassword = await bcrypt.hash(passToHash, 10);

        // 1. Ensure user is created in users table for client login
        try {
            const { createUser, findUserByUsername } = require("../models/userModel.js");
            const existingUser = await findUserByUsername(email.trim().toLowerCase());
            if (!existingUser) {
                await createUser(
                    full_name.trim(),
                    email.trim().toLowerCase(),
                    email.trim().toLowerCase(),
                    hashedPassword,
                    null,
                    phone || null,
                    null,
                    false, // device_verification_required = false
                    true,  // active
                    'user' // client role
                );
            }
        } catch (uErr) {
            console.warn("User sync warning:", uErr.message);
        }

        // 2. Ensure customer_accounts table has new columns
        const columnsToEnsure = [
            { name: "password", spec: "VARCHAR(255) DEFAULT ''" },
            { name: "domain_name", spec: "VARCHAR(255) DEFAULT ''" },
            { name: "phone", spec: "VARCHAR(100) DEFAULT ''" },
            { name: "alt_email", spec: "VARCHAR(255) DEFAULT ''" },
            { name: "address", spec: "VARCHAR(255) DEFAULT ''" },
            { name: "city", spec: "VARCHAR(100) DEFAULT ''" },
            { name: "state", spec: "VARCHAR(100) DEFAULT ''" },
            { name: "zip", spec: "VARCHAR(50) DEFAULT ''" },
            { name: "user_count", spec: "INT DEFAULT 1" },
            { name: "notes", spec: "TEXT" },
            { name: "reseller_email", spec: "VARCHAR(255) DEFAULT ''" }
        ];

        for (const col of columnsToEnsure) {
            try {
                const [existing] = await db.execute(`SHOW COLUMNS FROM customer_accounts LIKE '${col.name}'`);
                if (!existing || existing.length === 0) {
                    await db.execute(`ALTER TABLE customer_accounts ADD COLUMN ${col.name} ${col.spec}`);
                }
            } catch (e) {}
        }

        const effectiveResellerEmail = req.body.reseller_email || (req.user && req.user.role === 'reseller' ? req.user.email : '');

        // 3. Insert or update customer_accounts
        const [result] = await db.execute(
            `INSERT INTO customer_accounts 
             (customer_code, full_name, email, password, domain_name, phone, company_name, alt_email, address, city, state, zip, user_count, notes, customer_group, status, reseller_email)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                full_name = VALUES(full_name),
                domain_name = VALUES(domain_name),
                phone = VALUES(phone),
                company_name = VALUES(company_name),
                reseller_email = IF(VALUES(reseller_email) != '', VALUES(reseller_email), reseller_email)`,
            [
                customer_code,
                full_name,
                email.trim().toLowerCase(),
                passToHash,
                domain_name || '',
                phone || '',
                company_name || '',
                alt_email || '',
                address || '',
                city || '',
                state || '',
                zip || '',
                user_count || 1,
                notes || '',
                customer_group || (effectiveResellerEmail ? 'Reseller Client' : 'Standard Client'),
                status || 'active',
                effectiveResellerEmail
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
