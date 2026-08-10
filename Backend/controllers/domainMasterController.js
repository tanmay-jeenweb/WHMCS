const db = require('../config/db.js');
const { createAuditLog } = require('../models/auditLogModel.js');

// GET GENERAL DOMAIN CONFIG
const getDomainConfig = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM domain_config WHERE id = 1");
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Configuration not found" });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Get Domain Config Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch domain configuration" });
    }
};

// UPDATE GENERAL DOMAIN CONFIG
const updateDomainConfig = async (req, res) => {
    try {
        const {
            allow_register,
            allow_transfer,
            allow_own_domain,
            enable_renewal_orders,
            auto_renew_on_payment,
            auto_renew_requires_product,
            default_auto_renewal,
            create_todo_entries,
            allow_idn_domains,
            grace_redemption_fees,
            default_ns1,
            default_ns2,
            default_ns3,
            default_ns4,
            default_ns5
        } = req.body;

        const query = `
            UPDATE domain_config 
            SET allow_register = ?, allow_transfer = ?, allow_own_domain = ?, 
                enable_renewal_orders = ?, auto_renew_on_payment = ?, auto_renew_requires_product = ?, 
                default_auto_renewal = ?, create_todo_entries = ?, allow_idn_domains = ?, 
                grace_redemption_fees = ?, default_ns1 = ?, default_ns2 = ?, default_ns3 = ?, 
                default_ns4 = ?, default_ns5 = ?
            WHERE id = 1
        `;

        await db.execute(query, [
            allow_register || 'enabled',
            allow_transfer || 'enabled',
            allow_own_domain || 'enabled',
            enable_renewal_orders || 'enabled',
            auto_renew_on_payment || 'enabled',
            auto_renew_requires_product || 'disabled',
            default_auto_renewal || 'enabled',
            create_todo_entries || 'enabled',
            allow_idn_domains || 'disabled',
            grace_redemption_fees || 'disabled',
            default_ns1 || '',
            default_ns2 || '',
            default_ns3 || '',
            default_ns4 || '',
            default_ns5 || ''
        ]);

        await createAuditLog(
            req.user ? req.user.id : 1,
            req.user ? req.user.username : 'admin',
            req.headers['x-device-id'] || 'system',
            'domain_master',
            'Updated Domain Master Configuration',
            null,
            { default_ns1, default_ns2, allow_register }
        );

        res.status(200).json({ success: true, message: "Domain configuration saved successfully!" });
    } catch (error) {
        console.error("Update Domain Config Error:", error);
        res.status(400).json({ success: false, message: error.sqlMessage || error.message || "Failed to update domain configuration" });
    }
};

module.exports = {
    getDomainConfig,
    updateDomainConfig
};
