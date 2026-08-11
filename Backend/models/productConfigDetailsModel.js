const db = require('../config/db.js');

const createProductConfigDetailsTables = async () => {
    // Create product_config_details table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS product_config_details (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL UNIQUE,
            product_tagline VARCHAR(255) DEFAULT '',
            short_description TEXT,
            description TEXT,
            product_color VARCHAR(50) DEFAULT '#0056cf',
            welcome_email VARCHAR(255) DEFAULT 'hosting account welcome email',
            require_domain TINYINT(1) DEFAULT 0,
            apply_tax TINYINT(1) DEFAULT 0,
            featured TINYINT(1) DEFAULT 0,
            hidden TINYINT(1) DEFAULT 0,
            enable_stock TINYINT(1) DEFAULT 0,
            stock_qty INT DEFAULT 0,
            retired TINYINT(1) DEFAULT 0,

            payment_type VARCHAR(50) DEFAULT 'recurring',
            monthly_price VARCHAR(50) DEFAULT '',
            monthly_setup VARCHAR(50) DEFAULT '',
            quarterly_price VARCHAR(50) DEFAULT '',
            quarterly_setup VARCHAR(50) DEFAULT '',
            semiannually_price VARCHAR(50) DEFAULT '',
            semiannually_setup VARCHAR(50) DEFAULT '',
            annually_price VARCHAR(50) DEFAULT '',
            annually_setup VARCHAR(50) DEFAULT '',
            biennially_price VARCHAR(50) DEFAULT '',
            biennially_setup VARCHAR(50) DEFAULT '',
            triennially_price VARCHAR(50) DEFAULT '',
            triennially_setup VARCHAR(50) DEFAULT '',

            allow_multiple_quantities VARCHAR(50) DEFAULT 'no',
            recurring_cycles_limit INT DEFAULT 0,
            auto_terminate_fixed_term INT DEFAULT 0,
            termination_email VARCHAR(255) DEFAULT 'None',
            prorata_billing TINYINT(1) DEFAULT 0,
            prorata_date INT DEFAULT 0,
            charge_next_month INT DEFAULT 0,
            ondemand_renewals VARCHAR(50) DEFAULT 'system_default',
            allow_early_renewals TINYINT(1) DEFAULT 0,
            early_renewal_monthly INT DEFAULT 31,
            early_renewal_quarterly INT DEFAULT 92,
            early_renewal_semiannually INT DEFAULT 184,
            early_renewal_annually INT DEFAULT 366,
            early_renewal_biennially INT DEFAULT 731,
            early_renewal_triennially INT DEFAULT 1096,

            server_group VARCHAR(255) DEFAULT 'None',
            cpanel_package VARCHAR(255) DEFAULT '',
            cpanel_quota VARCHAR(50) DEFAULT '',
            cpanel_bandwidth VARCHAR(50) DEFAULT '',
            cpanel_bandwidth VARCHAR(50) DEFAULT '',
            cpanel_max_ftp VARCHAR(50) DEFAULT '',
            provision_type VARCHAR(50) DEFAULT 'manual',
            assigned_option_groups TEXT,
            upgrade_packages TEXT,
            upgrade_config_options TINYINT(1) DEFAULT 0,
            upgrade_email VARCHAR(255) DEFAULT 'None',
            cross_sells TEXT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products_master(id) ON DELETE CASCADE
        )
    `);

    // Migrations for existing database table
    const columnsToEnsure = [
        { name: "payment_type", spec: "VARCHAR(50) DEFAULT 'recurring'" },
        { name: "monthly_price", spec: "VARCHAR(50) DEFAULT ''" },
        { name: "monthly_setup", spec: "VARCHAR(50) DEFAULT ''" },
        { name: "quarterly_price", spec: "VARCHAR(50) DEFAULT ''" },
        { name: "quarterly_setup", spec: "VARCHAR(50) DEFAULT ''" },
        { name: "semiannually_price", spec: "VARCHAR(50) DEFAULT ''" },
        { name: "semiannually_setup", spec: "VARCHAR(50) DEFAULT ''" },
        { name: "annually_price", spec: "VARCHAR(50) DEFAULT ''" },
        { name: "annually_setup", spec: "VARCHAR(50) DEFAULT ''" },
        { name: "biennially_price", spec: "VARCHAR(50) DEFAULT ''" },
        { name: "biennially_setup", spec: "VARCHAR(50) DEFAULT ''" },
        { name: "triennially_price", spec: "VARCHAR(50) DEFAULT ''" },
        { name: "triennially_setup", spec: "VARCHAR(50) DEFAULT ''" },
        { name: "allow_multiple_quantities", spec: "VARCHAR(50) DEFAULT 'no'" },
        { name: "recurring_cycles_limit", spec: "INT DEFAULT 0" },
        { name: "auto_terminate_fixed_term", spec: "INT DEFAULT 0" },
        { name: "termination_email", spec: "VARCHAR(255) DEFAULT 'None'" },
        { name: "prorata_billing", spec: "TINYINT(1) DEFAULT 0" },
        { name: "prorata_date", spec: "INT DEFAULT 0" },
        { name: "charge_next_month", spec: "INT DEFAULT 0" },
        { name: "ondemand_renewals", spec: "VARCHAR(50) DEFAULT 'system_default'" },
        { name: "allow_early_renewals", spec: "TINYINT(1) DEFAULT 0" },
        { name: "early_renewal_monthly", spec: "INT DEFAULT 31" },
        { name: "early_renewal_quarterly", spec: "INT DEFAULT 92" },
        { name: "early_renewal_semiannually", spec: "INT DEFAULT 184" },
        { name: "early_renewal_annually", spec: "INT DEFAULT 366" },
        { name: "early_renewal_biennially", spec: "INT DEFAULT 731" },
        { name: "early_renewal_triennially", spec: "INT DEFAULT 1096" },
        { name: "server_group", spec: "VARCHAR(255) DEFAULT 'None'" },
        { name: "cpanel_package", spec: "VARCHAR(255) DEFAULT ''" },
        { name: "cpanel_quota", spec: "VARCHAR(50) DEFAULT ''" },
        { name: "cpanel_bandwidth", spec: "VARCHAR(50) DEFAULT ''" },
        { name: "cpanel_max_ftp", spec: "VARCHAR(50) DEFAULT ''" },
        { name: "provision_type", spec: "VARCHAR(50) DEFAULT 'manual'" },
        { name: "assigned_option_groups", spec: "TEXT" },
        { name: "upgrade_packages", spec: "TEXT" },
        { name: "upgrade_config_options", spec: "TINYINT(1) DEFAULT 0" },
        { name: "upgrade_email", spec: "VARCHAR(255) DEFAULT 'None'" },
        { name: "cross_sells", spec: "TEXT" }
    ];

    for (const col of columnsToEnsure) {
        try {
            await db.execute(`ALTER TABLE product_config_details ADD COLUMN ${col.name} ${col.spec}`);
        } catch (err) {
            // Ignored if column already exists
        }
    }

    console.log("✅ Product Config Details table initialized successfully.");

    // Create product_custom_fields table
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

const getConfigByProductId = async (productId) => {
    const [rows] = await db.execute(
        "SELECT * FROM product_config_details WHERE product_id = ?",
        [productId]
    );
    const config = rows[0] || null;

    const [fields] = await db.execute(
        "SELECT * FROM product_custom_fields WHERE product_id = ? ORDER BY field_order ASC, id ASC",
        [productId]
    );

    if (config) {
        config.custom_fields = fields || [];
        return config;
    } else {
        return {
            product_id: parseInt(productId),
            custom_fields: fields || []
        };
    }
};

const upsertProductConfigDetails = async (productId, data) => {
    // If module_name is provided, update products_master as well
    if (data.module_name) {
        try {
            await db.execute("UPDATE products_master SET module_name = ? WHERE id = ?", [data.module_name, productId]);
        } catch (e) {
            console.error("Failed to update products_master module_name:", e);
        }
    }

    // Check if configuration exists
    const [exists] = await db.execute(
        "SELECT id FROM product_config_details WHERE product_id = ?",
        [productId]
    );

    if (exists.length > 0) {
        // Update existing record
        await db.execute(
            `UPDATE product_config_details 
             SET product_tagline = ?, short_description = ?, description = ?, 
                 product_color = ?, welcome_email = ?, require_domain = ?, 
                 apply_tax = ?, featured = ?, hidden = ?, enable_stock = ?, 
                 stock_qty = ?, retired = ?,
                 payment_type = ?, monthly_price = ?, monthly_setup = ?,
                 quarterly_price = ?, quarterly_setup = ?, semiannually_price = ?,
                 semiannually_setup = ?, annually_price = ?, annually_setup = ?,
                 biennially_price = ?, biennially_setup = ?, triennially_price = ?,
                 triennially_setup = ?, allow_multiple_quantities = ?,
                 recurring_cycles_limit = ?, auto_terminate_fixed_term = ?,
                 termination_email = ?, prorata_billing = ?, prorata_date = ?,
                 charge_next_month = ?, ondemand_renewals = ?, allow_early_renewals = ?,
                 early_renewal_monthly = ?, early_renewal_quarterly = ?,
                 early_renewal_semiannually = ?, early_renewal_annually = ?,
                 early_renewal_biennially = ?, early_renewal_triennially = ?,
                 server_group = ?, cpanel_package = ?, cpanel_quota = ?,
                 cpanel_bandwidth = ?, cpanel_max_ftp = ?, provision_type = ?,
                 assigned_option_groups = ?, upgrade_packages = ?, upgrade_config_options = ?, upgrade_email = ?,
                 cross_sells = ?
             WHERE product_id = ?`,
            [
                data.product_tagline || '',
                data.short_description || '',
                data.description || '',
                data.product_color || '#0056cf',
                data.welcome_email || 'hosting account welcome email',
                data.require_domain ? 1 : 0,
                data.apply_tax ? 1 : 0,
                data.featured ? 1 : 0,
                data.hidden ? 1 : 0,
                data.enable_stock ? 1 : 0,
                data.stock_qty || 0,
                data.retired ? 1 : 0,

                data.payment_type || 'recurring',
                data.monthly_price || '',
                data.monthly_setup || '',
                data.quarterly_price || '',
                data.quarterly_setup || '',
                data.semiannually_price || '',
                data.semiannually_setup || '',
                data.annually_price || '',
                data.annually_setup || '',
                data.biennially_price || '',
                data.biennially_setup || '',
                data.triennially_price || '',
                data.triennially_setup || '',
                data.allow_multiple_quantities || 'no',
                data.recurring_cycles_limit || 0,
                data.auto_terminate_fixed_term || 0,
                data.termination_email || 'None',
                data.prorata_billing ? 1 : 0,
                data.prorata_date || 0,
                data.charge_next_month || 0,
                data.ondemand_renewals || 'system_default',
                data.allow_early_renewals ? 1 : 0,
                data.early_renewal_monthly ?? 31,
                data.early_renewal_quarterly ?? 92,
                data.early_renewal_semiannually ?? 184,
                data.early_renewal_annually ?? 366,
                data.early_renewal_biennially ?? 731,
                data.early_renewal_triennially ?? 1096,

                data.server_group || 'None',
                data.cpanel_package || '',
                data.cpanel_quota || '',
                data.cpanel_bandwidth || '',
                data.cpanel_max_ftp || '',
                data.provision_type || 'manual',
                data.assigned_option_groups || '',
                typeof data.upgrade_packages === 'string' ? data.upgrade_packages : JSON.stringify(data.upgrade_packages || []),
                data.upgrade_config_options ? 1 : 0,
                data.upgrade_email || 'None',
                typeof data.cross_sells === 'string' ? data.cross_sells : JSON.stringify(data.cross_sells || []),

                productId
            ]
        );
    } else {
        // Create new record
        await db.execute(
            `INSERT INTO product_config_details 
             (product_id, product_tagline, short_description, description, 
              product_color, welcome_email, require_domain, apply_tax, 
              featured, hidden, enable_stock, stock_qty, retired,
              payment_type, monthly_price, monthly_setup, quarterly_price, quarterly_setup,
              semiannually_price, semiannually_setup, annually_price, annually_setup,
              biennially_price, biennially_setup, triennially_price, triennially_setup,
              allow_multiple_quantities, recurring_cycles_limit, auto_terminate_fixed_term,
              termination_email, prorata_billing, prorata_date, charge_next_month,
              ondemand_renewals, allow_early_renewals, early_renewal_monthly,
              early_renewal_quarterly, early_renewal_semiannually, early_renewal_annually,
              early_renewal_biennially, early_renewal_triennially,
              server_group, cpanel_package, cpanel_quota, cpanel_bandwidth, cpanel_max_ftp, provision_type, assigned_option_groups,
              upgrade_packages, upgrade_config_options, upgrade_email, cross_sells)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                productId,
                data.product_tagline || '',
                data.short_description || '',
                data.description || '',
                data.product_color || '#0056cf',
                data.welcome_email || 'hosting account welcome email',
                data.require_domain ? 1 : 0,
                data.apply_tax ? 1 : 0,
                data.featured ? 1 : 0,
                data.hidden ? 1 : 0,
                data.enable_stock ? 1 : 0,
                data.stock_qty || 0,
                data.retired ? 1 : 0,

                data.payment_type || 'recurring',
                data.monthly_price || '',
                data.monthly_setup || '',
                data.quarterly_price || '',
                data.quarterly_setup || '',
                data.semiannually_price || '',
                data.semiannually_setup || '',
                data.annually_price || '',
                data.annually_setup || '',
                data.biennially_price || '',
                data.biennially_setup || '',
                data.triennially_price || '',
                data.triennially_setup || '',
                data.allow_multiple_quantities || 'no',
                data.recurring_cycles_limit || 0,
                data.auto_terminate_fixed_term || 0,
                data.termination_email || 'None',
                data.prorata_billing ? 1 : 0,
                data.prorata_date || 0,
                data.charge_next_month || 0,
                data.ondemand_renewals || 'system_default',
                data.allow_early_renewals ? 1 : 0,
                data.early_renewal_monthly ?? 31,
                data.early_renewal_quarterly ?? 92,
                data.early_renewal_semiannually ?? 184,
                data.early_renewal_annually ?? 366,
                data.early_renewal_biennially ?? 731,
                data.early_renewal_triennially ?? 1096,

                data.server_group || 'None',
                data.cpanel_package || '',
                data.cpanel_quota || '',
                data.cpanel_bandwidth || '',
                data.cpanel_max_ftp || '',
                data.provision_type || 'manual',
                data.assigned_option_groups || '',
                typeof data.upgrade_packages === 'string' ? data.upgrade_packages : JSON.stringify(data.upgrade_packages || []),
                data.upgrade_config_options ? 1 : 0,
                data.upgrade_email || 'None',
                typeof data.cross_sells === 'string' ? data.cross_sells : JSON.stringify(data.cross_sells || [])
            ]
        );
    }

    // Save custom fields if array is present
    if (Array.isArray(data.custom_fields)) {
        await db.execute("DELETE FROM product_custom_fields WHERE product_id = ?", [productId]);
        for (const field of data.custom_fields) {
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
    }

    return await getConfigByProductId(productId);
};

module.exports = {
    createProductConfigDetailsTables,
    getConfigByProductId,
    upsertProductConfigDetails
};

