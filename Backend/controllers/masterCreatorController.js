const db = require('../config/db.js');
const { createAuditLog } = require('../models/auditLogModel.js');

// GET MASTER CREATOR CONFIG
const getMasterCreatorConfig = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM master_creator_config WHERE id = 1");
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Configuration not found" });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Get Master Creator Config Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch master creator configuration" });
    }
};

// UPDATE MASTER CREATOR CONFIG
const updateMasterCreatorConfig = async (req, res) => {
    try {
        const {
            allow_custom_master_creation,
            auto_generate_crud_routes,
            auto_add_to_navbar,
            default_database_engine,
            allowed_field_types
        } = req.body;

        const query = `
            UPDATE master_creator_config 
            SET allow_custom_master_creation = ?, auto_generate_crud_routes = ?, 
                auto_add_to_navbar = ?, default_database_engine = ?, allowed_field_types = ?
            WHERE id = 1
        `;

        await db.execute(query, [
            allow_custom_master_creation || 'enabled',
            auto_generate_crud_routes || 'enabled',
            auto_add_to_navbar || 'enabled',
            default_database_engine || 'InnoDB',
            allowed_field_types || 'VARCHAR,TEXT,INT,DECIMAL,ENUM,BOOLEAN,DATETIME'
        ]);

        await createAuditLog(
            req.user ? req.user.id : 1,
            req.user ? req.user.username : 'admin',
            req.headers['x-device-id'] || 'system',
            'master_creator',
            'Updated Master Creator Configuration',
            null,
            { allow_custom_master_creation, auto_add_to_navbar }
        );

        res.status(200).json({ success: true, message: "Master Creator configuration saved successfully!" });
    } catch (error) {
        console.error("Update Master Creator Config Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to update master creator configuration" });
    }
};

// CRUD FOR CUSTOM MASTERS REGISTRY (DataTable.jsx)
const getAllCustomMasters = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM custom_masters_registry ORDER BY id DESC");
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Get Custom Masters Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch custom masters" });
    }
};

const createCustomMaster = async (req, res) => {
    try {
        const { master_name, master_key, icon_class, description, table_name, fields_json, status } = req.body;
        if (!master_name || !master_key || !table_name) {
            return res.status(400).json({ success: false, message: "Master Name, Master Key, and Table Name are required" });
        }

        const [result] = await db.execute(
            `INSERT INTO custom_masters_registry (master_name, master_key, icon_class, description, table_name, fields_json, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                master_name,
                master_key,
                icon_class || 'fa-solid fa-cube',
                description || '',
                table_name,
                typeof fields_json === 'object' ? JSON.stringify(fields_json) : (fields_json || '[]'),
                status || 'active'
            ]
        );

        res.status(201).json({ success: true, message: "New Custom Master created successfully!", id: result.insertId });
    } catch (error) {
        console.error("Create Custom Master Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to create custom master" });
    }
};

const deleteCustomMaster = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute("DELETE FROM custom_masters_registry WHERE id = ?", [id]);
        res.status(200).json({ success: true, message: "Custom master deleted successfully!" });
    } catch (error) {
        console.error("Delete Custom Master Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to delete custom master" });
    }
};

module.exports = {
    getMasterCreatorConfig,
    updateMasterCreatorConfig,
    getAllCustomMasters,
    createCustomMaster,
    deleteCustomMaster
};
