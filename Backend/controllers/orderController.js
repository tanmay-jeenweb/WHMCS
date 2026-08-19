const db = require('../config/db.js');
const bcrypt = require('bcryptjs');

// CREATE NEW ORDER IN MYSQL
const createOrder = async (req, res) => {
    try {
        const {
            invoice_number,
            client_name,
            client_email,
            password,
            product_name,
            group_name,
            domain_name,
            billing_cycle,
            amount,
            payment_method,
            status,
            reseller_email
        } = req.body;

        if (!invoice_number || !client_email || !product_name) {
            return res.status(400).json({
                success: false,
                message: "Invoice number, client email, and product name are required."
            });
        }

        const cleanAmount = parseFloat(amount.toString().replace(/[^0-9.]/g, '') || "0");
        const targetClientEmail = client_email.trim().toLowerCase();
        const effectiveResellerEmail = (reseller_email || '').trim().toLowerCase();
        const effectivePaymentMethod = (payment_method || (effectiveResellerEmail ? 'Reseller Portal' : 'credit_card'));

        const [result] = await db.execute(
            `INSERT INTO customer_orders 
             (invoice_number, client_name, client_email, product_name, group_name, domain_name, billing_cycle, amount, payment_method, reseller_email, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                invoice_number,
                client_name || 'Client User',
                targetClientEmail,
                product_name,
                group_name || '',
                domain_name || '',
                billing_cycle || 'Monthly',
                cleanAmount,
                effectivePaymentMethod,
                effectiveResellerEmail || null,
                status || 'Paid'
            ]
        );

        // Auto-create user login account if password was provided during checkout
        if (password && password.trim().length > 0) {
            const [uRows] = await db.execute(
                "SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?",
                [targetClientEmail, targetClientEmail]
            );

            if (uRows.length === 0) {
                const hashedPassword = await bcrypt.hash(password.trim(), 10);
                await db.execute(
                    `INSERT INTO users (name, username, email, password, role, active)
                     VALUES (?, ?, ?, ?, 'user', 1)`,
                    [client_name || targetClientEmail.split('@')[0], targetClientEmail, targetClientEmail, hashedPassword]
                );
            }
        }

        // Ensure customer_accounts record ALWAYS exists in database for every order
        let custQuery = "SELECT * FROM customer_accounts WHERE LOWER(email) = ?";
        let custParams = [targetClientEmail];
        if (effectiveResellerEmail) {
            custQuery = "SELECT * FROM customer_accounts WHERE LOWER(email) = ? AND LOWER(reseller_email) = ?";
            custParams = [targetClientEmail, effectiveResellerEmail];
        }

        const [custCheck] = await db.execute(custQuery, custParams);

        if (custCheck.length === 0) {
            const customerCode = effectiveResellerEmail ? `RES-CUST-${Math.floor(10000 + Math.random() * 90000)}` : `CUST-${Math.floor(10000 + Math.random() * 90000)}`;
            const custGroup = effectiveResellerEmail ? 'Reseller Client' : 'Direct Customer';
            await db.execute(
                `INSERT INTO customer_accounts 
                 (customer_code, full_name, email, domain_name, customer_group, reseller_email, status)
                 VALUES (?, ?, ?, ?, ?, ?, 'active')`,
                [
                    customerCode,
                    client_name || 'Client User',
                    targetClientEmail,
                    domain_name || '',
                    custGroup,
                    effectiveResellerEmail || null
                ]
            );
        }

        res.status(201).json({
            success: true,
            message: "Order placed and stored successfully in MySQL database!",
            orderId: result.insertId,
            invoiceNumber: invoice_number
        });
    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(400).json({
            success: false,
            message: error.sqlMessage || error.message || "Failed to store order in database."
        });
    }
};

// GET ORDERS BY USER EMAIL
const getOrdersByUserEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const [rows] = await db.execute(
            "SELECT * FROM customer_orders WHERE LOWER(client_email) = ? ORDER BY id DESC",
            [email.trim().toLowerCase()]
        );
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Get User Orders Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch user orders." });
    }
};

// GET ALL ORDERS (ADMIN)
const getAllOrders = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM customer_orders ORDER BY id DESC");
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Get All Orders Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch orders." });
    }
};

module.exports = {
    createOrder,
    getOrdersByUserEmail,
    getAllOrders
};
