const db = require('../config/db.js');

const createProductConfigDetailsTables = async () => {
    // Create product_config_details table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS product_config_details (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL UNIQUE,
            product_tagline VARCHAR(255) DEFAULT '',
            short_description TEXT,
            description TEXT,
            product_color VARCHAR(50) DEFAULT '#0056cf',
            welcome_email VARCHAR(255) DEFAULT 'hosting account welcome email',
            require_domain TINYINT(1) DEFAULT 0,
            apply_tax TINYINT(1) DEFAULT 0,
            featured TINYINT(1) DEFAULT 0,
            hidden TINYINT(1) DEFAULT 0,
            enable_stock TINYINT(1) DEFAULT 0,
            stock_qty INT DEFAULT 0,
            retired TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products_master(id) ON DELETE CASCADE
        )
    `);
    console.log("✅ Product Config Details table initialized successfully.");
};

const getConfigByProductId = async (productId) => {
    const [rows] = await db.execute(
        "SELECT * FROM product_config_details WHERE product_id = ?",
        [productId]
    );
    return rows[0] || null;
};

const upsertProductConfigDetails = async (productId, data) => {
    // Check if configuration exists
    const [exists] = await db.execute(
        "SELECT id FROM product_config_details WHERE product_id = ?",
        [productId]
    );

    if (exists.length > 0) {
        // Update existing record
        await db.execute(
            `UPDATE product_config_details 
             SET product_tagline = ?, short_description = ?, description = ?, 
                 product_color = ?, welcome_email = ?, require_domain = ?, 
                 apply_tax = ?, featured = ?, hidden = ?, enable_stock = ?, 
                 stock_qty = ?, retired = ?
             WHERE product_id = ?`,
            [
                data.product_tagline || '',
                data.short_description || '',
                data.description || '',
                data.product_color || '#0056cf',
                data.welcome_email || 'hosting account welcome email',
                data.require_domain ? 1 : 0,
                data.apply_tax ? 1 : 0,
                data.featured ? 1 : 0,
                data.hidden ? 1 : 0,
                data.enable_stock ? 1 : 0,
                data.stock_qty || 0,
                data.retired ? 1 : 0,
                productId
            ]
        );
    } else {
        // Create new record
        await db.execute(
            `INSERT INTO product_config_details 
             (product_id, product_tagline, short_description, description, 
              product_color, welcome_email, require_domain, apply_tax, 
              featured, hidden, enable_stock, stock_qty, retired)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                productId,
                data.product_tagline || '',
                data.short_description || '',
                data.description || '',
                data.product_color || '#0056cf',
                data.welcome_email || 'hosting account welcome email',
                data.require_domain ? 1 : 0,
                data.apply_tax ? 1 : 0,
                data.featured ? 1 : 0,
                data.hidden ? 1 : 0,
                data.enable_stock ? 1 : 0,
                data.stock_qty || 0,
                data.retired ? 1 : 0
            ]
        );
    }

    return await getConfigByProductId(productId);
};

module.exports = {
    createProductConfigDetailsTables,
    getConfigByProductId,
    upsertProductConfigDetails
};
