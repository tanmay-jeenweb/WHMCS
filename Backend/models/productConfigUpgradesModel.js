const db = require('../config/db.js');

const createProductConfigUpgradesTables = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS product_config_upgrades (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL UNIQUE,
            upgrade_packages TEXT,
            upgrade_config_options TINYINT(1) DEFAULT 0,
            upgrade_email VARCHAR(255) DEFAULT 'None',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products_master(id) ON DELETE CASCADE
        )
    `);
    console.log("✅ Product Config Upgrades table initialized successfully.");
};

const getUpgradesByProductId = async (productId) => {
    const [rows] = await db.execute(
        "SELECT * FROM product_config_upgrades WHERE product_id = ?",
        [productId]
    );
    return rows[0] || null;
};

const upsertProductConfigUpgrades = async (productId, data) => {
    const [exists] = await db.execute(
        "SELECT id FROM product_config_upgrades WHERE product_id = ?",
        [productId]
    );

    const valPackages = typeof data.upgrade_packages === 'string'
        ? data.upgrade_packages
        : JSON.stringify(data.upgrade_packages || data.upgrades || data || []);

    if (exists.length > 0) {
        await db.execute(
            `UPDATE product_config_upgrades 
             SET upgrade_packages = ?, upgrade_config_options = ?, upgrade_email = ?
             WHERE product_id = ?`,
            [
                valPackages,
                data.upgrade_config_options ? 1 : 0,
                data.upgrade_email || 'None',
                productId
            ]
        );
    } else {
        await db.execute(
            `INSERT INTO product_config_upgrades 
             (product_id, upgrade_packages, upgrade_config_options, upgrade_email)
             VALUES (?, ?, ?, ?)`,
            [
                productId,
                valPackages,
                data.upgrade_config_options ? 1 : 0,
                data.upgrade_email || 'None'
            ]
        );
    }

    return await getUpgradesByProductId(productId);
};

module.exports = {
    createProductConfigUpgradesTables,
    getUpgradesByProductId,
    upsertProductConfigUpgrades
};
