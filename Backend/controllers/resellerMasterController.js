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
        const { reseller_code, reseller_name, email, password, tier_level, commission_rate, subaccount_count, status } = req.body;
        if (!reseller_name || !email || !password) {
            return res.status(400).json({ success: false, message: "Reseller Name, Email Address, and Password are required." });
        }

        const resCode = (reseller_code && reseller_code.trim()) ? reseller_code.trim() : `RES-${Math.floor(10000 + Math.random() * 90000)}`;
        const cleanEmail = email.trim().toLowerCase();
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        // 1. Insert or update user record in users table with role = 'reseller'
        try {
            const { createUser } = require("../models/userModel.js");
            await createUser(
                reseller_name.trim(),
                cleanEmail,
                cleanEmail,
                hashedPassword,
                null,
                null,
                null,
                false,
                true,
                'reseller'
            );
        } catch (uErr) {
            console.warn("Reseller user creation fallback:", uErr.message);
        }

        // 2. Insert into reseller_accounts table
        const [result] = await db.execute(
            `INSERT INTO reseller_accounts (reseller_code, reseller_name, email, password, tier_level, commission_rate, subaccount_count, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                reseller_name = VALUES(reseller_name),
                password = VALUES(password),
                tier_level = VALUES(tier_level),
                commission_rate = VALUES(commission_rate),
                status = VALUES(status)`,
            [
                resCode,
                reseller_name.trim(),
                cleanEmail,
                password,
                tier_level || 'Silver Tier',
                commission_rate || 15.00,
                subaccount_count || 0,
                status || 'active'
            ]
        );

        res.status(201).json({ success: true, message: "Reseller account created successfully! Reseller can now log in with credentials.", id: result.insertId, reseller_code: resCode });
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

// RESELLER CLIENT MANAGEMENT (No Website Login for Reseller Clients)
const createResellerClient = async (req, res) => {
    try {
        const { full_name, email, domain_name, phone, company_name, reseller_email, notes } = req.body;
        
        if (!full_name || !email || !domain_name) {
            return res.status(400).json({
                success: false,
                message: "Full Name, Email Address, and Target Domain Name are required."
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        const custCode = `RES-CUST-${Math.floor(10000 + Math.random() * 90000)}`;

        // Save purely inside customer_accounts tagged under reseller (No user login creation)
        const [result] = await db.execute(
            `INSERT INTO customer_accounts 
             (customer_code, full_name, email, domain_name, phone, company_name, customer_group, status, reseller_email, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                full_name = VALUES(full_name),
                domain_name = VALUES(domain_name),
                phone = VALUES(phone),
                company_name = VALUES(company_name),
                reseller_email = VALUES(reseller_email)`,
            [
                custCode,
                full_name.trim(),
                cleanEmail,
                domain_name.trim(),
                phone || '',
                company_name || '',
                'Reseller Client',
                'active',
                reseller_email || (req.user ? req.user.email : ''),
                notes || ''
            ]
        );

        // Increment subaccount_count on reseller account
        if (reseller_email) {
            await db.execute(
                `UPDATE reseller_accounts SET subaccount_count = subaccount_count + 1 WHERE LOWER(email) = ?`,
                [reseller_email.trim().toLowerCase()]
            );
        }

        res.status(201).json({
            success: true,
            message: "Client added to Reseller Dashboard successfully!",
            clientId: result.insertId,
            customerCode: custCode
        });

    } catch (error) {
        console.error("Create Reseller Client Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to add client" });
    }
};

// CREATE ORDER FOR RESELLER CLIENT WITH PURCHASE & EXPIRY DATES
const createResellerClientOrder = async (req, res) => {
    try {
        const { client_email, client_name, product_name, group_name, domain_name, billing_cycle, amount, reseller_email } = req.body;

        if (!client_email || !product_name || !domain_name) {
            return res.status(400).json({ success: false, message: "Client Email, Product Name, and Domain Name are required." });
        }

        const activeResellerEmail = (reseller_email || (req.user ? req.user.email : '')).trim().toLowerCase();

        // Ensure client account exists in customer_accounts under this reseller
        const [existingClient] = await db.execute("SELECT id FROM customer_accounts WHERE LOWER(email) = ? AND LOWER(reseller_email) = ?", [client_email.trim().toLowerCase(), activeResellerEmail]);
        if (existingClient.length === 0) {
            const custCode = `RES-CUST-${Math.floor(1000 + Math.random() * 90000)}`;
            await db.execute(
                `INSERT INTO customer_accounts 
                 (customer_code, full_name, email, company_name, domain_name, customer_group, status, reseller_email)
                 VALUES (?, ?, ?, ?, ?, 'Reseller Client', 'active', ?)`,
                [custCode, client_name || client_email.split('@')[0], client_email.trim().toLowerCase(), '', domain_name.trim(), activeResellerEmail]
            );
        }

        const invoiceNum = `INV-RES-${Math.floor(100000 + Math.random() * 900000)}`;
        const now = new Date();
        const purchaseDateStr = now.toISOString().slice(0, 10);

        // Calculate Expiry Date based on Billing Cycle
        const months = parseInt(billing_cycle) || (billing_cycle && billing_cycle.includes('12') ? 12 : billing_cycle && billing_cycle.includes('36') ? 36 : 1);
        const expiryDate = new Date(now);
        expiryDate.setMonth(expiryDate.getMonth() + months);
        const expiryDateStr = expiryDate.toISOString().slice(0, 10);

        const [result] = await db.execute(
            `INSERT INTO customer_orders 
             (invoice_number, client_name, client_email, product_name, group_name, domain_name, billing_cycle, amount, payment_method, reseller_email, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                invoiceNum,
                client_name || 'Reseller Client',
                client_email.trim().toLowerCase(),
                product_name,
                group_name || 'Business Email',
                domain_name.trim(),
                `${months} Month(s)`,
                amount || 0.00,
                'Reseller Portal',
                activeResellerEmail,
                'Paid'
            ]
        );

        res.status(201).json({
            success: true,
            message: "Order placed for client successfully!",
            invoiceNumber: invoiceNum,
            purchaseDate: purchaseDateStr,
            expiryDate: expiryDateStr
        });

    } catch (error) {
        console.error("Create Reseller Client Order Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to create order for client" });
    }
};

const getResellerClients = async (req, res) => {
    try {
        let paramEmail = (req.params.resellerEmail || '').trim().toLowerCase();
        let userEmail = (req.user ? (req.user.email || req.user.username || '') : '').trim().toLowerCase();
        
        let targetEmail = (paramEmail && paramEmail !== 'undefined' && paramEmail !== 'null')
            ? paramEmail
            : userEmail;

        if (targetEmail === 'admin') {
            const [rows] = await db.execute("SELECT * FROM customer_accounts WHERE customer_group = 'Reseller Client' OR (reseller_email IS NOT NULL AND reseller_email != '') ORDER BY id DESC");
            return res.status(200).json({ success: true, data: rows });
        }

        let resellerEmail = targetEmail;
        if (targetEmail) {
            const [rAcc] = await db.execute("SELECT email FROM reseller_accounts WHERE LOWER(reseller_code) = ? OR LOWER(email) = ?", [targetEmail, targetEmail]);
            if (rAcc.length > 0) {
                resellerEmail = rAcc[0].email.trim().toLowerCase();
            }
        }

        if (!resellerEmail && !targetEmail) {
            return res.status(200).json({ success: true, data: [] });
        }

        const query = `
            SELECT * FROM customer_accounts 
            WHERE LOWER(reseller_email) = ? 
               OR LOWER(reseller_email) = ?
            ORDER BY id DESC
        `;
        const params = [resellerEmail, targetEmail];

        const [rows] = await db.execute(query, params);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Get Reseller Clients Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch reseller clients" });
    }
};

const getResellerClientOrders = async (req, res) => {
    try {
        let paramEmail = (req.params.resellerEmail || '').trim().toLowerCase();
        let userEmail = (req.user ? (req.user.email || req.user.username || '') : '').trim().toLowerCase();
        
        let targetEmail = (paramEmail && paramEmail !== 'undefined' && paramEmail !== 'null')
            ? paramEmail
            : userEmail;

        if (targetEmail === 'admin') {
            const [rows] = await db.execute("SELECT * FROM customer_orders ORDER BY id DESC");
            return res.status(200).json({ success: true, data: rows });
        }

        let resellerEmail = targetEmail;
        if (targetEmail) {
            const [rAcc] = await db.execute("SELECT email FROM reseller_accounts WHERE LOWER(reseller_code) = ? OR LOWER(email) = ?", [targetEmail, targetEmail]);
            if (rAcc.length > 0) {
                resellerEmail = rAcc[0].email.trim().toLowerCase();
            }
        }

        if (!resellerEmail && !targetEmail) {
            return res.status(200).json({ success: true, data: [] });
        }

        const query = `
            SELECT DISTINCT co.* 
            FROM customer_orders co
            LEFT JOIN customer_accounts ca ON LOWER(co.client_email) = LOWER(ca.email)
            WHERE LOWER(co.reseller_email) = ? 
               OR LOWER(co.reseller_email) = ? 
               OR (co.reseller_email IS NULL AND (LOWER(ca.reseller_email) = ? OR LOWER(ca.reseller_email) = ?))
            ORDER BY co.id DESC
        `;
        const params = [resellerEmail, targetEmail, resellerEmail, targetEmail];

        const [rows] = await db.execute(query, params);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Get Reseller Client Orders Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch reseller client orders" });
    }
};

const getResellerProductPricing = async (req, res) => {
    try {
        let paramEmail = (req.params.resellerEmail || '').trim().toLowerCase();
        let userEmail = (req.user ? (req.user.email || req.user.username || '') : '').trim().toLowerCase();
        
        let resellerEmail = (paramEmail && paramEmail !== 'undefined' && paramEmail !== 'null' && paramEmail !== 'admin')
            ? paramEmail
            : userEmail;

        if (resellerEmail && resellerEmail !== 'admin') {
            const [rAcc] = await db.execute("SELECT email FROM reseller_accounts WHERE LOWER(reseller_code) = ? OR LOWER(email) = ?", [resellerEmail, resellerEmail]);
            if (rAcc.length > 0) {
                resellerEmail = rAcc[0].email.trim().toLowerCase();
            }
        }

        const [rows] = await db.execute("SELECT * FROM reseller_product_pricing WHERE LOWER(reseller_email) = ?", [resellerEmail]);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Get Reseller Product Pricing Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch reseller product pricing" });
    }
};

const deleteResellerClient = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.execute("DELETE FROM customer_accounts WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Client account not found" });
        }
        res.status(200).json({ success: true, message: "Client account deleted successfully" });
    } catch (error) {
        console.error("Delete Reseller Client Error:", error);
        res.status(500).json({ success: false, message: "Failed to delete client account" });
    }
};



const setResellerProductPricing = async (req, res) => {
    try {
        const { reseller_email, product_id, product_name, monthly_price, annually_price, triennially_price } = req.body;

        if (!reseller_email || !product_id) {
            return res.status(400).json({ success: false, message: "Reseller email and Product ID are required." });
        }

        const query = `
            INSERT INTO reseller_product_pricing (reseller_email, product_id, product_name, monthly_price, annually_price, triennially_price)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                monthly_price = VALUES(monthly_price),
                annually_price = VALUES(annually_price),
                triennially_price = VALUES(triennially_price),
                updated_at = CURRENT_TIMESTAMP
        `;

        await db.execute(query, [
            reseller_email.trim().toLowerCase(),
            product_id,
            product_name || 'Product',
            monthly_price ? monthly_price.toString() : '',
            annually_price ? annually_price.toString() : '',
            triennially_price ? triennially_price.toString() : ''
        ]);

        res.status(200).json({ success: true, message: "Custom reseller product pricing saved successfully" });
    } catch (error) {
        console.error("Set Reseller Product Pricing Error:", error);
        res.status(500).json({ success: false, message: "Failed to save custom reseller product pricing" });
    }
};

module.exports = {
    getResellerConfig,
    updateResellerConfig,
    getAllResellerAccounts,
    createResellerAccount,
    deleteResellerAccount,
    createResellerClient,
    createResellerClientOrder,
    getResellerClients,
    getResellerClientOrders,
    deleteResellerClient,
    getResellerProductPricing,
    setResellerProductPricing
};
