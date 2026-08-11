const db = require('../config/db.js');

const createProductConfigCrossSellsTables = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS product_config_cross_sells (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL UNIQUE,
            cross_sells TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products_master(id) ON DELETE CASCADE
        )
    `);
    console.log("✅ Product Config Cross-sells table initialized successfully.");
};

const getCrossSellsByProductId = async (productId) => {
    const [rows] = await db.execute(
        "SELECT * FROM product_config_cross_sells WHERE product_id = ?",
        [productId]
    );
    return rows[0] || null;
};

const upsertProductConfigCrossSells = async (productId, data) => {
    const [exists] = await db.execute(
        "SELECT id FROM product_config_cross_sells WHERE product_id = ?",
        [productId]
    );

    const valCrossSells = typeof data.cross_sells === 'string'
        ? data.cross_sells
        : JSON.stringify(data.cross_sells || data || []);

    if (exists.length > 0) {
        await db.execute(
            `UPDATE product_config_cross_sells 
             SET cross_sells = ?
             WHERE product_id = ?`,
            [valCrossSells, productId]
        );
    } else {
        await db.execute(
            `INSERT INTO product_config_cross_sells (product_id, cross_sells)
             VALUES (?, ?)`,
            [productId, valCrossSells]
        );
    }

    return await getCrossSellsByProductId(productId);
};

module.exports = {
    createProductConfigCrossSellsTables,
    getCrossSellsByProductId,
    upsertProductConfigCrossSells
};
