const db = require('../config/db.js');
const { createAuditLog } = require('../models/auditLogModel.js');

// GET ALL PRODUCTS
const getAllProducts = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT p.*, pr.monthly_price, pr.annually_price, pr.triennially_price 
            FROM products_master p 
            LEFT JOIN product_config_pricing pr ON p.id = pr.product_id 
            ORDER BY p.id DESC
        `);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Get Products Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch products" });
    }
};

// CREATE PRODUCT
const createProduct = async (req, res) => {
    try {
        const { product_name, product_type, product_group_id, product_group_name, url, module_name } = req.body;

        if (!product_name || !product_name.trim()) {
            return res.status(400).json({ success: false, message: "Product name is required" });
        }
        if (!product_group_name || !product_group_name.trim()) {
            return res.status(400).json({ success: false, message: "Product group is required" });
        }
        if (!url || !url.trim()) {
            return res.status(400).json({ success: false, message: "URL is required" });
        }

        const validTypes = ['Shared hosting', 'Reseller hosting', 'Server/VPS', 'Email', 'Domains', 'Other'];
        const typeValue = validTypes.includes(product_type) ? product_type : 'Shared hosting';

        const validModules = ['No Module', 'cPanel'];
        const moduleValue = validModules.includes(module_name) ? module_name : 'No Module';

        const [result] = await db.execute(
            `INSERT INTO products_master (product_name, product_type, product_group_id, product_group_name, url, module_name)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                product_name.trim(),
                typeValue,
                product_group_id || 0,
                product_group_name.trim(),
                url.trim(),
                moduleValue
            ]
        );

        await createAuditLog(
            req.user ? req.user.id : 1,
            req.user ? req.user.username : 'admin',
            req.headers['x-device-id'] || 'system',
            'product_master',
            'Created Product Master item',
            null,
            { product_name, product_type: typeValue, product_group_name, url, module_name: moduleValue }
        );

        res.status(201).json({
            success: true,
            message: "Product created successfully!",
            id: result.insertId
        });
    } catch (error) {
        console.error("Create Product Error:", error);
        res.status(400).json({
            success: false,
            message: error.sqlMessage || error.message || "Failed to create product"
        });
    }
};

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { product_name, product_type, product_group_id, product_group_name, url, module_name } = req.body;

        if (!product_name || !product_name.trim()) {
            return res.status(400).json({ success: false, message: "Product name is required" });
        }
        if (!product_group_name || !product_group_name.trim()) {
            return res.status(400).json({ success: false, message: "Product group is required" });
        }
        if (!url || !url.trim()) {
            return res.status(400).json({ success: false, message: "URL is required" });
        }

        const validTypes = ['Shared hosting', 'Reseller hosting', 'Server/VPS', 'Email', 'Domains', 'Other'];
        const typeValue = validTypes.includes(product_type) ? product_type : 'Shared hosting';

        const validModules = ['No Module', 'cPanel'];
        const moduleValue = validModules.includes(module_name) ? module_name : 'No Module';

        const query = `
            UPDATE products_master 
            SET product_name = ?, product_type = ?, product_group_id = ?, product_group_name = ?, url = ?, module_name = ?
            WHERE id = ?
        `;

        await db.execute(query, [
            product_name.trim(),
            typeValue,
            product_group_id || 0,
            product_group_name.trim(),
            url.trim(),
            moduleValue,
            id
        ]);

        await createAuditLog(
            req.user ? req.user.id : 1,
            req.user ? req.user.username : 'admin',
            req.headers['x-device-id'] || 'system',
            'product_master',
            'Updated Product Master item',
            null,
            { id, product_name, product_type: typeValue, product_group_name, url, module_name: moduleValue }
        );

        res.status(200).json({ success: true, message: "Product updated successfully!" });
    } catch (error) {
        console.error("Update Product Error:", error);
        res.status(400).json({
            success: false,
            message: error.sqlMessage || error.message || "Failed to update product"
        });
    }
};

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        await db.execute("DELETE FROM products_master WHERE id = ?", [id]);

        await createAuditLog(
            req.user ? req.user.id : 1,
            req.user ? req.user.username : 'admin',
            req.headers['x-device-id'] || 'system',
            'product_master',
            'Deleted Product Master item',
            null,
            { id }
        );

        res.status(200).json({ success: true, message: "Product deleted successfully!" });
    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({ success: false, message: "Failed to delete product" });
    }
};

module.exports = {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct
};
