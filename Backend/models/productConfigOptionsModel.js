const db = require('../config/db.js');

const createProductConfigOptionsTables = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS product_config_options (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL UNIQUE,
            assigned_option_groups TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products_master(id) ON DELETE CASCADE
        )
    `);
    console.log("✅ Product Config Options table initialized successfully.");
};

const getOptionsByProductId = async (productId) => {
    const [rows] = await db.execute(
        "SELECT * FROM product_config_options WHERE product_id = ?",
        [productId]
    );
    return rows[0] || null;
};

const upsertProductConfigOptions = async (productId, data) => {
    const [exists] = await db.execute(
        "SELECT id FROM product_config_options WHERE product_id = ?",
        [productId]
    );

    const val = typeof data.assigned_option_groups === 'string' 
        ? data.assigned_option_groups 
        : JSON.stringify(data.assigned_option_groups || data.configurable_options || data || []);

    if (exists.length > 0) {
        await db.execute(
            `UPDATE product_config_options 
             SET assigned_option_groups = ?
             WHERE product_id = ?`,
            [val, productId]
        );
    } else {
        await db.execute(
            `INSERT INTO product_config_options (product_id, assigned_option_groups)
             VALUES (?, ?)`,
            [productId, val]
        );
    }

    return await getOptionsByProductId(productId);
};

module.exports = {
    createProductConfigOptionsTables,
    getOptionsByProductId,
    upsertProductConfigOptions
};
