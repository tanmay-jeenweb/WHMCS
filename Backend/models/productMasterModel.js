const db = require('../config/db.js');

const initProductMasterTables = async () => {
    try {
        // 1. Product Groups Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS product_groups (
                id INT AUTO_INCREMENT PRIMARY KEY,
                group_name VARCHAR(255) NOT NULL,
                group_icon VARCHAR(255) DEFAULT '',
                url_slug VARCHAR(255) DEFAULT '',
                group_headline VARCHAR(255) DEFAULT '',
                group_tagline VARCHAR(255) DEFAULT '',
                order_form_template VARCHAR(100) DEFAULT 'Standard Cart (Default)',
                hidden TINYINT(1) DEFAULT 0,
                order_num INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Products Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                group_id INT NOT NULL,
                product_type VARCHAR(100) DEFAULT 'Shared Hosting',
                name VARCHAR(255) NOT NULL,
                description TEXT,
                url_slug VARCHAR(255) DEFAULT '',
                module VARCHAR(100) DEFAULT 'No Module',
                payment_type VARCHAR(50) DEFAULT 'recurring',
                price DECIMAL(10, 2) DEFAULT 0.00,
                auto_setup VARCHAR(50) DEFAULT 'payment',
                hidden TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (group_id) REFERENCES product_groups(id) ON DELETE CASCADE
            )
        `);

        // 3. Product Addons Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS product_addons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                billing_cycle VARCHAR(50) DEFAULT 'monthly',
                price DECIMAL(10, 2) DEFAULT 0.00,
                show_on_order TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Product Master tables initialized successfully (Matching WHMCS layout).');
    } catch (err) {
        console.error('❌ Error initializing Product Master tables:', err);
    }
};

const getGroupsWithProducts = async () => {
    const [groups] = await db.execute(`SELECT * FROM product_groups ORDER BY order_num ASC, id ASC`);
    const [products] = await db.execute(`
        SELECT p.*, g.group_name 
        FROM products p 
        JOIN product_groups g ON p.group_id = g.id 
        ORDER BY p.id ASC
    `);

    return groups.map(group => ({
        ...group,
        products: products.filter(p => p.group_id === group.id)
    }));
};

const createGroupModel = async (group_name, group_icon, url_slug, group_headline, group_tagline, order_form_template, hidden) => {
    const [result] = await db.execute(
        `INSERT INTO product_groups (group_name, group_icon, url_slug, group_headline, group_tagline, order_form_template, hidden) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [group_name, group_icon || '', url_slug || '', group_headline || '', group_tagline || '', order_form_template || 'Standard Cart (Default)', hidden ? 1 : 0]
    );
    return result.insertId;
};

const createProductModel = async (group_id, product_type, name, description, url_slug, module_type, price, payment_type, auto_setup, hidden) => {
    const [result] = await db.execute(
        `INSERT INTO products (group_id, product_type, name, description, url_slug, module, price, payment_type, auto_setup, hidden) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [group_id, product_type || 'Shared Hosting', name, description || '', url_slug || '', module_type || 'No Module', price || 0, payment_type || 'recurring', auto_setup || 'payment', hidden ? 1 : 0]
    );
    return result.insertId;
};

const duplicateProductModel = async (product_id, new_name, group_id) => {
    const [existing] = await db.execute(`SELECT * FROM products WHERE id = ?`, [product_id]);
    if (!existing || existing.length === 0) {
        throw new Error("Source product not found.");
    }

    const p = existing[0];
    const targetGroupId = group_id || p.group_id;
    const targetName = new_name || `${p.name} (Copy)`;

    const [result] = await db.execute(
        `INSERT INTO products (group_id, product_type, name, description, url_slug, module, payment_type, price, auto_setup, hidden) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [targetGroupId, p.product_type, targetName, p.description, p.url_slug, p.module, p.payment_type, p.price, p.auto_setup, p.hidden]
    );
    return result.insertId;
};

const getAllAddonsModel = async () => {
    const [rows] = await db.execute(`SELECT * FROM product_addons ORDER BY id DESC`);
    return rows;
};

const createAddonModel = async (name, description, billing_cycle, price) => {
    const [result] = await db.execute(
        `INSERT INTO product_addons (name, description, billing_cycle, price) VALUES (?, ?, ?, ?)`,
        [name, description || '', billing_cycle || 'monthly', price || 0]
    );
    return result.insertId;
};

const clearAllProductsDataModel = async () => {
    await db.execute(`SET FOREIGN_KEY_CHECKS = 0`);
    await db.execute(`TRUNCATE TABLE products`);
    await db.execute(`TRUNCATE TABLE product_groups`);
    await db.execute(`TRUNCATE TABLE product_addons`);
    await db.execute(`SET FOREIGN_KEY_CHECKS = 1`);
};

module.exports = {
    initProductMasterTables,
    getGroupsWithProducts,
    createGroupModel,
    createProductModel,
    duplicateProductModel,
    getAllAddonsModel,
    createAddonModel,
    clearAllProductsDataModel
};
