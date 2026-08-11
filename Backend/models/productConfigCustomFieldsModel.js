const db = require('../config/db.js');

const createProductConfigCustomFieldsTables = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS product_custom_fields (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            field_name VARCHAR(255) NOT NULL,
            field_type VARCHAR(50) DEFAULT 'Text Box',
            description TEXT,
            field_order INT DEFAULT 0,
            validation VARCHAR(255) DEFAULT '',
            select_options TEXT,
            admin_only TINYINT(1) DEFAULT 0,
            required_field TINYINT(1) DEFAULT 0,
            show_on_order TINYINT(1) DEFAULT 1,
            show_on_invoice TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products_master(id) ON DELETE CASCADE
        )
    `);
    console.log("✅ Product Custom Fields table initialized successfully.");
};

const getCustomFieldsByProductId = async (productId) => {
    const [rows] = await db.execute(
        "SELECT * FROM product_custom_fields WHERE product_id = ? ORDER BY field_order ASC, id ASC",
        [productId]
    );
    return rows;
};

const upsertProductConfigCustomFields = async (productId, data) => {
    await db.execute("DELETE FROM product_custom_fields WHERE product_id = ?", [productId]);
    
    const fields = Array.isArray(data.custom_fields) ? data.custom_fields : (Array.isArray(data) ? data : []);
    
    for (const field of fields) {
        const fieldName = (field.field_name || field.name || '').trim();
        if (!fieldName) continue;
        await db.execute(
            `INSERT INTO product_custom_fields 
             (product_id, field_name, field_type, description, field_order, validation, select_options, admin_only, required_field, show_on_order, show_on_invoice)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                productId,
                fieldName,
                field.field_type || field.type || 'Text Box',
                field.description || '',
                parseInt(field.field_order ?? field.display_order ?? 0) || 0,
                field.validation || field.regex || '',
                field.select_options || field.options || '',
                field.admin_only ? 1 : 0,
                field.required_field || field.required ? 1 : 0,
                field.show_on_order ?? field.showOnOrder ? 1 : 0,
                field.show_on_invoice ? 1 : 0
            ]
        );
    }

    return await getCustomFieldsByProductId(productId);
};

module.exports = {
    createProductConfigCustomFieldsTables,
    getCustomFieldsByProductId,
    upsertProductConfigCustomFields
};
