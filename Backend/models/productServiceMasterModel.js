const db = require('../config/db.js');

const createProductServiceMasterTables = async () => {
    // Create product_services table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS product_services (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            url VARCHAR(500) NOT NULL,
            product_group_headline VARCHAR(255) DEFAULT '',
            product_group_tagline VARCHAR(255) DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Insert sample records if table is empty
    const [records] = await db.execute("SELECT COUNT(*) as count FROM product_services");
    if (records[0].count === 0) {
        await db.execute(`
            INSERT INTO product_services (name, url, product_group_headline, product_group_tagline)
            VALUES 
            ('Web Hosting', 'https://8eb806de-74b5-4eff-ad59-147bf43e9700.package.webpros.cloud/index.php?rp=/store/web-hosting', 'Shared Web Hosting Packages', 'Affordable, fast, and secure web hosting for your projects.'),
            ('VPS Hosting', 'https://8eb806de-74b5-4eff-ad59-147bf43e9700.package.webpros.cloud/index.php?rp=/store/vps-hosting', 'Virtual Private Servers', 'Root access, high-performance NVMe SSD storage and guaranteed resources.'),
            ('SSL Certificates', 'https://8eb806de-74b5-4eff-ad59-147bf43e9700.package.webpros.cloud/index.php?rp=/store/ssl-certificates', 'Secure Your Website', 'Boost customer trust and search engine rankings with high-encryption SSLs.')
        `);
    }

    console.log("✅ Product/Service Group Master tables initialized successfully.");
};

module.exports = {
    createProductServiceMasterTables
};
