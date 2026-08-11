const db = require('../config/db.js');

const safeInt = (val, defaultVal = 0) => {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? defaultVal : parsed;
};

const createProductConfigPricingTables = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS product_config_pricing (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL UNIQUE,
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
            fixed_term INT DEFAULT 0,
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

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products_master(id) ON DELETE CASCADE
        )
    `);

    // Migration logic for existing tables
    const columnsToEnsure = [
        { name: "allow_multiple_quantities", spec: "VARCHAR(50) DEFAULT 'no'" },
        { name: "recurring_cycles_limit", spec: "INT DEFAULT 0" },
        { name: "fixed_term", spec: "INT DEFAULT 0" },
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
        { name: "early_renewal_triennially", spec: "INT DEFAULT 1096" }
    ];

    for (const col of columnsToEnsure) {
        try {
            await db.execute(`ALTER TABLE product_config_pricing ADD COLUMN ${col.name} ${col.spec}`);
        } catch (err) {
            // Ignored if column already exists
        }
    }

    console.log("✅ Product Config Pricing table initialized successfully.");
};

const getPricingByProductId = async (productId) => {
    const [rows] = await db.execute(
        "SELECT * FROM product_config_pricing WHERE product_id = ?",
        [productId]
    );
    return rows[0] || null;
};

const upsertProductConfigPricing = async (productId, data) => {
    const [exists] = await db.execute(
        "SELECT id FROM product_config_pricing WHERE product_id = ?",
        [productId]
    );

    if (exists.length > 0) {
        await db.execute(
            `UPDATE product_config_pricing 
             SET payment_type = ?, monthly_price = ?, monthly_setup = ?, 
                 quarterly_price = ?, quarterly_setup = ?, semiannually_price = ?, 
                 semiannually_setup = ?, annually_price = ?, annually_setup = ?, 
                 biennially_price = ?, biennially_setup = ?, triennially_price = ?, 
                 triennially_setup = ?, fixed_term = ?,
                 allow_multiple_quantities = ?, recurring_cycles_limit = ?,
                 termination_email = ?, prorata_billing = ?, prorata_date = ?,
                 charge_next_month = ?, ondemand_renewals = ?, allow_early_renewals = ?,
                 early_renewal_monthly = ?, early_renewal_quarterly = ?,
                 early_renewal_semiannually = ?, early_renewal_annually = ?,
                 early_renewal_biennially = ?, early_renewal_triennially = ?
             WHERE product_id = ?`,
            [
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
                safeInt(data.fixed_term || data.auto_terminate_fixed_term, 0),
                
                data.allow_multiple_quantities || 'no',
                safeInt(data.recurring_cycles_limit, 0),
                data.termination_email || 'None',
                data.prorata_billing ? 1 : 0,
                safeInt(data.prorata_date, 0),
                safeInt(data.charge_next_month, 0),
                data.ondemand_renewals || 'system_default',
                data.allow_early_renewals ? 1 : 0,
                safeInt(data.early_renewal_monthly, 31),
                safeInt(data.early_renewal_quarterly, 92),
                safeInt(data.early_renewal_semiannually, 184),
                safeInt(data.early_renewal_annually, 366),
                safeInt(data.early_renewal_biennially, 731),
                safeInt(data.early_renewal_triennially, 1096),
                productId
            ]
        );
    } else {
        await db.execute(
            `INSERT INTO product_config_pricing 
             (product_id, payment_type, monthly_price, monthly_setup, 
              quarterly_price, quarterly_setup, semiannually_price, semiannually_setup, 
              annually_price, annually_setup, biennially_price, biennially_setup, 
              triennially_price, triennially_setup, fixed_term,
              allow_multiple_quantities, recurring_cycles_limit,
              termination_email, prorata_billing, prorata_date, charge_next_month,
              ondemand_renewals, allow_early_renewals, early_renewal_monthly,
              early_renewal_quarterly, early_renewal_semiannually, early_renewal_annually,
              early_renewal_biennially, early_renewal_triennially)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                productId,
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
                safeInt(data.fixed_term || data.auto_terminate_fixed_term, 0),

                data.allow_multiple_quantities || 'no',
                safeInt(data.recurring_cycles_limit, 0),
                data.termination_email || 'None',
                data.prorata_billing ? 1 : 0,
                safeInt(data.prorata_date, 0),
                safeInt(data.charge_next_month, 0),
                data.ondemand_renewals || 'system_default',
                data.allow_early_renewals ? 1 : 0,
                safeInt(data.early_renewal_monthly, 31),
                safeInt(data.early_renewal_quarterly, 92),
                safeInt(data.early_renewal_semiannually, 184),
                safeInt(data.early_renewal_annually, 366),
                safeInt(data.early_renewal_biennially, 731),
                safeInt(data.early_renewal_triennially, 1096)
            ]
        );
    }

    return await getPricingByProductId(productId);
};

module.exports = {
    createProductConfigPricingTables,
    getPricingByProductId,
    upsertProductConfigPricing
};
