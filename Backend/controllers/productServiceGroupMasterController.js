const db = require('../config/db.js');
const { createAuditLog } = require('../models/auditLogModel.js');

// GET ALL PRODUCT SERVICES
const getAllProductServices = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM product_services ORDER BY id DESC");
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Get Product Services Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch product and service configurations" });
    }
};

// CREATE PRODUCT SERVICE
const createProductService = async (req, res) => {
    try {
        const { name, url, product_group_headline, product_group_tagline } = req.body;
        if (!name || !url) {
            return res.status(400).json({ success: false, message: "Name and URL are required" });
        }

        const [result] = await db.execute(
            `INSERT INTO product_services (name, url, product_group_headline, product_group_tagline)
             VALUES (?, ?, ?, ?)`,
            [
                name,
                url,
                product_group_headline || '',
                product_group_tagline || ''
            ]
        );

        await createAuditLog(
            req.user ? req.user.id : 1,
            req.user ? req.user.username : 'admin',
            req.headers['x-device-id'] || 'system',
            'product_service_group_master',
            'Created Product/Service Group config',
            null,
            { name, url }
        );

        res.status(201).json({ success: true, message: "Product/Service configuration created successfully!", id: result.insertId });
    } catch (error) {
        console.error("Create Product Service Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to create product/service configuration" });
    }
};

// UPDATE PRODUCT SERVICE
const updateProductService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, url, product_group_headline, product_group_tagline } = req.body;
        if (!name || !url) {
            return res.status(400).json({ success: false, message: "Name and URL are required" });
        }

        const query = `
            UPDATE product_services 
            SET name = ?, url = ?, product_group_headline = ?, product_group_tagline = ?
            WHERE id = ?
        `;

        const [result] = await db.execute(query, [
            name,
            url,
            product_group_headline || '',
            product_group_tagline || '',
            id
        ]);

        await createAuditLog(
            req.user ? req.user.id : 1,
            req.user ? req.user.username : 'admin',
            req.headers['x-device-id'] || 'system',
            'product_service_group_master',
            'Updated Product/Service Group config',
            null,
            { id, name, url }
        );

        res.status(200).json({ success: true, message: "Product/Service configuration updated successfully!" });
    } catch (error) {
        console.error("Update Product Service Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to update product/service configuration" });
    }
};

// DELETE PRODUCT SERVICE
const deleteProductService = async (req, res) => {
    try {
        const { id } = req.params;

        await db.execute("DELETE FROM product_services WHERE id = ?", [id]);

        await createAuditLog(
            req.user ? req.user.id : 1,
            req.user ? req.user.username : 'admin',
            req.headers['x-device-id'] || 'system',
            'product_service_group_master',
            'Deleted Product/Service Group config',
            null,
            { id }
        );

        res.status(200).json({ success: true, message: "Product/Service configuration deleted successfully!" });
    } catch (error) {
        console.error("Delete Product Service Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to delete product/service configuration" });
    }
};

module.exports = {
    getAllProductServices,
    createProductService,
    updateProductService,
    deleteProductService
};
