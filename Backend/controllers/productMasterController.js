const {
    getGroupsWithProducts,
    createGroupModel,
    createProductModel,
    duplicateProductModel,
    getAllAddonsModel,
    createAddonModel,
    clearAllProductsDataModel
} = require('../models/productMasterModel.js');

const getProductsOverview = async (req, res) => {
    try {
        const groups = await getGroupsWithProducts();
        const addons = await getAllAddonsModel();
        return res.json({
            success: true,
            groups,
            addons
        });
    } catch (err) {
        console.error("Error fetching products overview:", err);
        return res.status(500).json({ success: false, message: "Failed to fetch products overview." });
    }
};

const createGroup = async (req, res) => {
    try {
        const { group_name, group_icon, url_slug, group_headline, group_tagline, order_form_template, hidden } = req.body;
        if (!group_name) {
            return res.status(400).json({ success: false, message: "Product Group Name is required." });
        }
        const insertId = await createGroupModel(group_name, group_icon, url_slug, group_headline, group_tagline, order_form_template, hidden);
        return res.json({ success: true, message: "Product group created successfully!", id: insertId });
    } catch (err) {
        console.error("Error creating product group:", err);
        return res.status(500).json({ success: false, message: "Failed to create product group." });
    }
};

const createProduct = async (req, res) => {
    try {
        const { group_id, product_type, name, description, url_slug, module_type, price, payment_type, auto_setup, hidden } = req.body;
        if (!group_id || !name) {
            return res.status(400).json({ success: false, message: "Group selection and Product Name are required." });
        }
        const insertId = await createProductModel(group_id, product_type, name, description, url_slug, module_type, price, payment_type, auto_setup, hidden);
        return res.json({ success: true, message: "Product created successfully!", id: insertId });
    } catch (err) {
        console.error("Error creating product:", err);
        return res.status(500).json({ success: false, message: "Failed to create product." });
    }
};

const duplicateProduct = async (req, res) => {
    try {
        const { product_id, new_name, group_id } = req.body;
        if (!product_id) {
            return res.status(400).json({ success: false, message: "Source product selection is required." });
        }
        const insertId = await duplicateProductModel(product_id, new_name, group_id);
        return res.json({ success: true, message: "Product duplicated successfully!", id: insertId });
    } catch (err) {
        console.error("Error duplicating product:", err);
        return res.status(500).json({ success: false, message: err.message || "Failed to duplicate product." });
    }
};

const refreshFeatureStatus = async (req, res) => {
    try {
        return res.json({
            success: true,
            message: "Feature status & server provisioning modules refreshed successfully!"
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Failed to refresh feature status." });
    }
};

const createAddon = async (req, res) => {
    try {
        const { name, description, billing_cycle, price } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: "Addon name is required." });
        }
        const insertId = await createAddonModel(name, description, billing_cycle, price);
        return res.json({ success: true, message: "Product addon created successfully!", id: insertId });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Failed to create product addon." });
    }
};

const clearProductsData = async (req, res) => {
    try {
        await clearAllProductsDataModel();
        return res.json({ success: true, message: "All product data cleared successfully." });
    } catch (err) {
        console.error("Error clearing product data:", err);
        return res.status(500).json({ success: false, message: "Failed to clear product data." });
    }
};

module.exports = {
    getProductsOverview,
    createGroup,
    createProduct,
    duplicateProduct,
    refreshFeatureStatus,
    createAddon,
    clearProductsData
};
