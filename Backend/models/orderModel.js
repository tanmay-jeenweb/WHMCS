const db = require('../config/db.js');

const createOrderTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS customer_orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            invoice_number VARCHAR(100) NOT NULL UNIQUE,
            client_name VARCHAR(255) NOT NULL,
            client_email VARCHAR(255) NOT NULL,
            product_name VARCHAR(255) NOT NULL,
            group_name VARCHAR(255) DEFAULT '',
            domain_name VARCHAR(255) DEFAULT '',
            billing_cycle VARCHAR(100) DEFAULT 'Monthly',
            amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            payment_method VARCHAR(100) DEFAULT 'credit_card',
            status ENUM('Paid', 'Pending', 'Cancelled', 'Refunded') DEFAULT 'Paid',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log("✅ customer_orders table initialized successfully.");
};

module.exports = {
    createOrderTable
};
