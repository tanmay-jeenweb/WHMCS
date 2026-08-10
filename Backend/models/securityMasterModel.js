const db = require('../config/db.js');

const createSecurityMasterTables = async () => {
    // 1. General Security Configuration Table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS security_config (
            id INT PRIMARY KEY DEFAULT 1,
            email_verification ENUM('enabled', 'disabled') DEFAULT 'enabled',
            captcha_form_protection VARCHAR(100) DEFAULT 'unauthenticated',
            captcha_type VARCHAR(100) DEFAULT 'default_6char',
            captcha_forms TEXT,
            auto_gen_password_format VARCHAR(100) DEFAULT 'letters_numbers_special',
            min_password_strength INT DEFAULT 50,
            failed_admin_ban_time INT DEFAULT 15,
            whitelisted_ips TEXT,
            whitelisted_ip_login_notices ENUM('enabled', 'disabled') DEFAULT 'disabled',
            disable_admin_password_reset ENUM('enabled', 'disabled') DEFAULT 'disabled',
            delete_credit_card_data ENUM('enabled', 'disabled') DEFAULT 'disabled',
            delete_bank_account_data ENUM('enabled', 'disabled') DEFAULT 'disabled',
            allow_client_paymethod_removal ENUM('enabled', 'disabled') DEFAULT 'enabled',
            disable_session_ip_check ENUM('enabled', 'disabled') DEFAULT 'disabled',
            proxy_ip_header VARCHAR(100) DEFAULT 'X_FORWARDED_FOR',
            trusted_proxies TEXT,
            api_ip_access TEXT,
            log_api_auth ENUM('enabled', 'disabled') DEFAULT 'enabled',
            csrf_tokens_general ENUM('enabled', 'disabled') DEFAULT 'enabled',
            csrf_tokens_domain_checker ENUM('enabled', 'disabled') DEFAULT 'disabled',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Ensure singleton initial row exists
    const [rows] = await db.execute("SELECT id FROM security_config WHERE id = 1");
    if (rows.length === 0) {
        await db.execute(`
            INSERT INTO security_config 
            (id, email_verification, captcha_form_protection, captcha_type, captcha_forms, auto_gen_password_format, min_password_strength, failed_admin_ban_time, whitelisted_ips, whitelisted_ip_login_notices, disable_admin_password_reset, delete_credit_card_data, delete_bank_account_data, allow_client_paymethod_removal, disable_session_ip_check, proxy_ip_header, trusted_proxies, api_ip_access, log_api_auth, csrf_tokens_general, csrf_tokens_domain_checker)
            VALUES (1, 'enabled', 'unauthenticated', 'default_6char', 'checkout,register,login', 'letters_numbers_special', 50, 15, '', 'disabled', 'disabled', 'disabled', 'disabled', 'enabled', 'disabled', 'X_FORWARDED_FOR', '', '', 'enabled', 'enabled', 'disabled')
        `);
    }
    console.log("✅ Security Master configuration table initialized successfully.");
};

module.exports = {
    createSecurityMasterTables
};
