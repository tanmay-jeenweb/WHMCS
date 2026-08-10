const db = require('../config/db.js');

const createProductMasterTables = async () => {
    // Create products_master table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS products_master (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_name VARCHAR(255) NOT NULL,
            product_type ENUM('Shared hosting', 'Reseller hosting', 'Server/VPS', 'Email', 'Domains', 'Other') NOT NULL DEFAULT 'Shared hosting',
            product_group_id INT NOT NULL,
            product_group_name VARCHAR(255) NOT NULL,
            url VARCHAR(500) NOT NULL,
            module_name ENUM('No Module', 'cPanel') DEFAULT 'No Module',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Seed sample records if table is empty
    const [records] = await db.execute("SELECT COUNT(*) as count FROM products_master");
    if (records[0].count === 0) {
        await db.execute(`
            INSERT INTO products_master (product_name, product_type, product_group_id, product_group_name, url, module_name)
            VALUES 
            (
                'Starter Shared Plan',
                'Shared hosting',
                1,
                'Web Hosting',
                'https://8eb806de-74b5-4eff-ad59-147bf43e9700.package.webpros.cloud/index.php?rp=/store/web-hosting/starter-shared-plan',
                'cPanel'
            ),
            (
                'Pro Reseller Hosting',
                'Reseller hosting',
                1,
                'Web Hosting',
                'https://8eb806de-74b5-4eff-ad59-147bf43e9700.package.webpros.cloud/index.php?rp=/store/web-hosting/pro-reseller-hosting',
                'cPanel'
            ),
            (
                'High Performance VPS',
                'Server/VPS',
                2,
                'VPS Hosting',
                'https://8eb806de-74b5-4eff-ad59-147bf43e9700.package.webpros.cloud/index.php?rp=/store/vps-hosting/high-performance-vps',
                'No Module'
            )
        `);
    }

    console.log("✅ Product Master table initialized successfully.");
};

module.exports = {
    createProductMasterTables
};
