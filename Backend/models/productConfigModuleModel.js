const db = require('../config/db.js');

const createProductConfigModuleTables = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS product_config_module (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL UNIQUE,
            server_group VARCHAR(255) DEFAULT 'None',
            cpanel_package VARCHAR(255) DEFAULT '',
            cpanel_quota VARCHAR(50) DEFAULT '',
            cpanel_bandwidth VARCHAR(50) DEFAULT '',
            cpanel_max_ftp VARCHAR(50) DEFAULT '',
            provision_type VARCHAR(50) DEFAULT 'manual',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products_master(id) ON DELETE CASCADE
        )
    `);
    console.log("✅ Product Config Module table initialized successfully.");
};

const getModuleByProductId = async (productId) => {
    const [rows] = await db.execute(
        "SELECT * FROM product_config_module WHERE product_id = ?",
        [productId]
    );
    return rows[0] || null;
};

const upsertProductConfigModule = async (productId, data) => {
    if (data.module_name) {
        try {
            await db.execute("UPDATE products_master SET module_name = ? WHERE id = ?", [data.module_name, productId]);
        } catch (e) {
            console.error("Failed to update products_master module_name:", e);
        }
    }

    const [exists] = await db.execute(
        "SELECT id FROM product_config_module WHERE product_id = ?",
        [productId]
    );

    if (exists.length > 0) {
        await db.execute(
            `UPDATE product_config_module 
             SET server_group = ?, cpanel_package = ?, cpanel_quota = ?, 
                 cpanel_bandwidth = ?, cpanel_max_ftp = ?, provision_type = ?
             WHERE product_id = ?`,
            [
                data.server_group || 'None',
                data.cpanel_package || '',
                data.cpanel_quota || '',
                data.cpanel_bandwidth || '',
                data.cpanel_max_ftp || '',
                data.provision_type || 'manual',
                productId
            ]
        );
    } else {
        await db.execute(
            `INSERT INTO product_config_module 
             (product_id, server_group, cpanel_package, cpanel_quota, 
              cpanel_bandwidth, cpanel_max_ftp, provision_type)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                productId,
                data.server_group || 'None',
                data.cpanel_package || '',
                data.cpanel_quota || '',
                data.cpanel_bandwidth || '',
                data.cpanel_max_ftp || '',
                data.provision_type || 'manual'
            ]
        );
    }

    return await getModuleByProductId(productId);
};

module.exports = {
    createProductConfigModuleTables,
    getModuleByProductId,
    upsertProductConfigModule
};
