const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db.js");

const {
    findUserByUsername,
    updateUserProfile
} = require("../models/userModel.js");

const { createAuditLog } = require("../models/auditLogModel.js");

const {
    getApprovedDevice,
    getPendingDevice,
    createPendingDevice
} = require("../models/deviceModel.js");

// ================= LOGIN =================

const login = async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            deviceId
        } = req.body;

        const userIdentifier = (username || email || "").trim().toLowerCase();
        const activeDeviceId = deviceId || 'web-browser';

        // Validate Input
        if (!userIdentifier || !password) {
            return res.status(400).json({
                success: false,
                message: "Email/Username and password are required"
            });
        }

        // Find User by username or email
        const [userRows] = await db.execute(
            "SELECT * FROM users WHERE username = ? OR email = ?",
            [userIdentifier, userIdentifier]
        );
        let user = userRows[0];

        // Check if account is in reseller_accounts
        const [resellerCheck] = await db.execute(
            "SELECT * FROM reseller_accounts WHERE LOWER(email) = ? OR LOWER(reseller_code) = ?",
            [userIdentifier, userIdentifier]
        );

        if (resellerCheck.length > 0) {
            const rAcc = resellerCheck[0];
            if (!user) {
                user = {
                    id: rAcc.id,
                    name: rAcc.reseller_name,
                    username: rAcc.reseller_code,
                    email: rAcc.email,
                    password: rAcc.password,
                    role: 'reseller',
                    active: rAcc.status === 'active' ? 1 : 0
                };
            } else {
                user.role = 'reseller';
            }
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.active === 0 || user.active === false) {
            return res.status(403).json({
                success: false,
                message: "Your account is deactivated. Please contact an administrator."
            });
        }

        // Compare Password (bcrypt + reseller_accounts + customer_accounts fallback)
        let isPasswordCorrect = false;
        if (user.password) {
            isPasswordCorrect = await bcrypt.compare(password, user.password).catch(() => false);
            if (!isPasswordCorrect && password === user.password) {
                isPasswordCorrect = true;
            }
        }

        if (!isPasswordCorrect && resellerCheck.length > 0) {
            const rAcc = resellerCheck[0];
            if (rAcc.password) {
                const rMatch = await bcrypt.compare(password, rAcc.password).catch(() => false);
                if (rMatch || password === rAcc.password) {
                    isPasswordCorrect = true;
                    // Auto-sync hashed password to users table
                    try {
                        const newHash = await bcrypt.hash(password, 10);
                        await db.execute("UPDATE users SET password = ?, role = 'reseller' WHERE id = ?", [newHash, user.id]);
                    } catch (sErr) {}
                }
            }
        }

        if (!isPasswordCorrect) {
            try {
                const [custRows] = await db.execute(
                    "SELECT password FROM customer_accounts WHERE LOWER(email) = ?",
                    [userIdentifier]
                );
                if (custRows.length > 0 && custRows[0].password) {
                    const cMatch = await bcrypt.compare(password, custRows[0].password).catch(() => false);
                    if (cMatch || custRows[0].password === password) {
                        isPasswordCorrect = true;
                    }
                }
            } catch (cErr) {}
        }

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // ================= ADMIN LOGIN =================
        const userEmail = user.email || user.username || "";
        if (user.role === "admin" && (user.device_verification_required === 0 || user.device_verification_required === false)) {
            const token = jwt.sign(
                { id: user.id, role: user.role, name: user.name, username: user.username, email: userEmail, mob_no: user.mob_no },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            return res.status(200).json({
                success: true,
                message: "Admin login successful",
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    email: userEmail,
                    role: user.role,
                    mob_no: user.mob_no,
                    modules: user.modules || []
                }
            });
        }

        // ================= CLIENT, RESELLER OR UNRESTRICTED LOGIN =================
        if (user.role === "user" || user.role === "reseller" || user.device_verification_required === 0 || user.device_verification_required === false) {
            const token = jwt.sign(
                { id: user.id, role: user.role, name: user.name, username: user.username, email: userEmail, mob_no: user.mob_no },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            return res.status(200).json({
                success: true,
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    email: userEmail,
                    role: user.role,
                    mob_no: user.mob_no,
                    modules: user.modules || []
                }
            });
        }

        const approvedDevice = await getApprovedDevice(user.id);

        if (approvedDevice) {
            if (approvedDevice.device_id === deviceId) {
                // Device matches, login successful
                const token = jwt.sign(
                    { id: user.id, role: user.role, name: user.name, username: user.username, mob_no: user.mob_no },
                    process.env.JWT_SECRET,
                    { expiresIn: "1d" }
                );

                return res.status(200).json({
                    success: true,
                    message: "Login successful",
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        mob_no: user.mob_no,
                        modules: user.modules || []
                    }
                });
            } else {
                // Device mismatch, check if they have a pending device for this deviceId
                const pendingDevice = await getPendingDevice(user.id);
                if (pendingDevice && pendingDevice.device_id === deviceId) {
                    return res.status(200).json({
                        success: false,
                        status: "PENDING_APPROVAL"
                    });
                }
                return res.status(200).json({
                    success: false,
                    status: "DEVICE_REGISTRATION_REQUIRED",
                    message: "New device detected. Registration required."
                });
            }
        }

        // No approved device found
        const pendingDevice = await getPendingDevice(user.id);
        if (pendingDevice) {
            return res.status(200).json({
                success: false,
                status: "PENDING_APPROVAL"
            });
        }

        // No pending or approved device, needs registration
        return res.status(200).json({
            success: false,
            status: "DEVICE_REGISTRATION_REQUIRED"
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// ================= REQUEST DEVICE REGISTRATION =================

const requestDeviceRegistration = async (req, res) => {
    try {
        const { username, password, deviceId } = req.body;

        if (!username || !password || !deviceId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const [userRows] = await db.execute(
            "SELECT * FROM users WHERE username = ? OR email = ?",
            [username.trim().toLowerCase(), username.trim().toLowerCase()]
        );
        const user = userRows[0];
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.active === 0 || user.active === false) {
            return res.status(403).json({
                success: false,
                message: "Your account is deactivated. Please contact an administrator."
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Create pending device
        await createPendingDevice(user.id, deviceId);

        await createAuditLog(
            user.id,
            user.name || user.username || 'Unknown',
            deviceId,
            'Device Management',
            'registration_requested',
            null,
            {
                user_id: user.id,
                username: user.username,
                device_id: deviceId,
                status: 'pending'
            }
        );

        return res.status(200).json({
            success: true,
            status: "PENDING_APPROVAL"
        });

    } catch (error) {
        console.error("Device Registration Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// ================= LOGOUT =================

const logout = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// ================= UPDATE PROFILE =================

const updateProfileController = async (req, res) => {
    try {
        const {name, email, mob_no} = req.body;
        const userId = req.user.id;

        if (!name || !email || !mob_no) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and mobile number are required"
            });
        }

        await updateUserProfile(userId, name, email, mob_no);

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: userId,
                name,
                email,
                mob_no,
                role: req.user.role
            }
        });
        
    } catch (error) {
        console.error("Update Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// ================= GET MY PERMISSIONS =================
const getMyPermissions = async (req, res) => {
    try {
        const userId = req.user.id;

        // Admin has unrestricted access — return a wildcard flag or full permissions
        if (req.user.role === 'admin') {
            return res.status(200).json({
                success: true,
                isAdmin: true,
                permissions: {}
            });
        }

        // Get the user's user_type_id
        const [userRows] = await db.execute(
            'SELECT user_type_id FROM users WHERE id = ?',
            [userId]
        );

        if (!userRows.length || !userRows[0].user_type_id) {
            return res.status(200).json({
                success: true,
                isAdmin: false,
                permissions: {}
            });
        }

        const userTypeId = userRows[0].user_type_id;

        // Fetch all permission rows for this user type
        const [rows] = await db.execute(
            `SELECT master_name, can_read, can_write, can_update, can_delete
             FROM user_type_permissions
             WHERE user_type_id = ?`,
            [userTypeId]
        );

        // Build a keyed map: { location_type: { read, write, update, delete }, ... }
        const permissions = {};
        for (const row of rows) {
            permissions[row.master_name] = {
                read:   !!row.can_read,
                write:  !!row.can_write,
                update: !!row.can_update,
                delete: !!row.can_delete,
            };
        }

        return res.status(200).json({
            success: true,
            isAdmin: false,
            permissions
        });

    } catch (error) {
        console.error('getMyPermissions Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getActiveUsersController = async (req, res) => {
    try {
        const { getAllUsers } = require("../models/userModel.js");
        const users = await getAllUsers(false);
        const mapped = users.map(u => ({
            id: u.id,
            name: u.name,
            username: u.username,
            email: u.email
        }));
        return res.status(200).json({
            success: true,
            data: mapped
        });
    } catch (error) {
        console.error("Get Active Users Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// ================= REGISTER CLIENT USER =================
const registerClientUser = async (req, res) => {
    try {
        const { name, email, password, mobNo } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required"
            });
        }

        const username = email.trim().toLowerCase();

        // Check if user already exists in MySQL
        const existingUser = await findUserByUsername(username);
        if (existingUser) {
            const isMatch = await bcrypt.compare(password, existingUser.password);
            if (!isMatch) {
                const newHash = await bcrypt.hash(password, 10);
                await db.execute("UPDATE users SET password = ? WHERE id = ?", [newHash, existingUser.id]);
            }

            const token = jwt.sign(
                { id: existingUser.id, role: existingUser.role, name: existingUser.name, username: existingUser.username, mob_no: existingUser.mob_no },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            return res.status(200).json({
                success: true,
                message: "User account ready",
                token,
                user: {
                    id: existingUser.id,
                    name: existingUser.name,
                    username: existingUser.username,
                    email: existingUser.email,
                    role: existingUser.role,
                    mob_no: existingUser.mob_no
                }
            });
        }

        // Hash password and create new client user
        const hashedPassword = await bcrypt.hash(password, 10);
        const { createUser } = require("../models/userModel.js");
        const result = await createUser(
            name.trim(),
            username,
            email.trim().toLowerCase(),
            hashedPassword,
            null,
            mobNo || null,
            null,
            false, // deviceVerificationRequired = false so client login works instantly
            true,  // active
            'user' // client role
        );

        const newUserId = result.insertId;

        // Insert into customer_accounts table for Customer Master
        try {
            const custCode = `CUST-${1000 + newUserId}`;
            await db.execute(
                `INSERT INTO customer_accounts (customer_code, full_name, email, company_name, customer_group, status)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE full_name = VALUES(full_name)`,
                [custCode, name.trim(), email.trim().toLowerCase(), '', 'Standard Client', 'active']
            );
        } catch (e) {
            console.warn("Could not sync customer_accounts:", e.message);
        }

        // Log audit event for Activity Report
        try {
            await createAuditLog(
                newUserId,
                name.trim(),
                'Client Checkout',
                'Customer Master',
                'Created client account & placed order',
                null,
                { client_email: email, client_name: name }
            );
        } catch (e) {
            // Ignore audit error
        }

        const token = jwt.sign(
            { id: newUserId, role: 'user', name: name.trim(), username, mob_no: mobNo },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(201).json({
            success: true,
            message: "Client account created successfully",
            token,
            user: {
                id: newUserId,
                name: name.trim(),
                username,
                email: email.trim().toLowerCase(),
                role: 'user',
                mob_no: mobNo
            }
        });
    } catch (error) {
        console.error("Register Client User Error:", error);
        return res.status(500).json({
            success: false,
            message: error.sqlMessage || error.message || "Failed to register user"
        });
    }
};

module.exports = {
    login,
    logout,
    updateProfileController,
    requestDeviceRegistration,
    getMyPermissions,
    getActiveUsersController,
    registerClientUser
};