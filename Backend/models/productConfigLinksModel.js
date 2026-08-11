const db = require('../config/db.js');

const createProductConfigLinksTables = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS product_config_links (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL UNIQUE,
            custom_checkout_url VARCHAR(500) DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products_master(id) ON DELETE CASCADE
        )
    `);
    console.log("✅ Product Config Links table initialized successfully.");
};

const getLinksByProductId = async (productId) => {
    const [rows] = await db.execute(
        "SELECT * FROM product_config_links WHERE product_id = ?",
        [productId]
    );
    return rows[0] || null;
};

const upsertProductConfigLinks = async (productId, data) => {
    const [exists] = await db.execute(
        "SELECT id FROM product_config_links WHERE product_id = ?",
        [productId]
    );

    const valUrl = data.custom_checkout_url || data.customCheckoutUrl || '';

    if (exists.length > 0) {
        await db.execute(
            `UPDATE product_config_links 
             SET custom_checkout_url = ?
             WHERE product_id = ?`,
            [valUrl, productId]
        );
    } else {
        await db.execute(
            `INSERT INTO product_config_links (product_id, custom_checkout_url)
             VALUES (?, ?)`,
            [productId, valUrl]
        );
    }

    return await getLinksByProductId(productId);
};

module.exports = {
    createProductConfigLinksTables,
    getLinksByProductId,
    upsertProductConfigLinks
};
