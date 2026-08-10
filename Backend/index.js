require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./config/db.js");

// Routes
const authRoutes = require("./routes/authRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const userTypeMasterRoutes = require("./routes/userTypeMasterRoutes.js");
const systemSettingsRoutes = require("./routes/systemSettingsRoutes.js");
const orderingMasterRoutes = require("./routes/orderingMasterRoutes.js");
const domainMasterRoutes = require("./routes/domainMasterRoutes.js");
const emailMasterRoutes = require("./routes/emailMasterRoutes.js");
const supportMasterRoutes = require("./routes/supportMasterRoutes.js");
const invoiceMasterRoutes = require("./routes/invoiceMasterRoutes.js");
const securityMasterRoutes = require("./routes/securityMasterRoutes.js");
const customerMasterRoutes = require("./routes/customerMasterRoutes.js");
const resellerMasterRoutes = require("./routes/resellerMasterRoutes.js");
const masterCreatorRoutes = require("./routes/masterCreatorRoutes.js");
const productMasterRoutes = require("./routes/productMasterRoutes.js");

// Model Initializations
const { initUserModel } = require("./models/userModel.js");
const { createUserTypesTable, createUserTypePermissionsTable } = require("./models/userTypeModel.js");
const { createAuditLogsTable } = require("./models/auditLogModel.js");
const { createUserDevicesTable } = require("./models/deviceModel.js");
const { createSystemSettingsTables } = require("./models/systemSettingsModel.js");
const { createOrderingMasterTables } = require("./models/orderingMasterModel.js");
const { createDomainMasterTables } = require("./models/domainMasterModel.js");
const { createEmailMasterTables } = require("./models/emailMasterModel.js");
const { createSupportMasterTables } = require("./models/supportMasterModel.js");
const { createInvoiceMasterTables } = require("./models/invoiceMasterModel.js");
const { createSecurityMasterTables } = require("./models/securityMasterModel.js");
const { createCustomerMasterTables } = require("./models/customerMasterModel.js");
const { createResellerMasterTables } = require("./models/resellerMasterModel.js");
const { createMasterCreatorTables } = require("./models/masterCreatorModel.js");
const { initProductMasterTables } = require("./models/productMasterModel.js");

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-device-id", "device-id", "X-HTTP-Method-Override"]
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve uploaded files statically
const { uploadDir } = require("./config/uploadConfig.js");
console.log(`Serving uploaded files statically from: ${uploadDir}`);
app.use("/uploads", express.static(uploadDir));

// Logging Middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
});

// Method Override Middleware
app.use((req, res, next) => {
    const override = req.headers["x-http-method-override"];
    if (override && typeof override === "string") {
        req.method = override.toUpperCase();
    }
    next();
});

app.use(["/api/auth", "/auth"], authRoutes);
app.use(["/api/admin", "/admin"], adminRoutes);
app.use(["/api/usertypes", "/usertypes"], userTypeMasterRoutes);
app.use(["/api/system-settings", "/system-settings"], systemSettingsRoutes);
app.use(["/api/ordering-master", "/ordering-master"], orderingMasterRoutes);
app.use(["/api/domain-master", "/domain-master"], domainMasterRoutes);
app.use(["/api/email-master", "/email-master"], emailMasterRoutes);
app.use(["/api/support-master", "/support-master"], supportMasterRoutes);
app.use(["/api/invoice-master", "/invoice-master"], invoiceMasterRoutes);
app.use(["/api/security-master", "/security-master"], securityMasterRoutes);
app.use(["/api/customer-master", "/customer-master"], customerMasterRoutes);
app.use(["/api/reseller-master", "/reseller-master"], resellerMasterRoutes);
app.use(["/api/master-creator", "/master-creator"], masterCreatorRoutes);
app.use(["/api/products", "/products"], productMasterRoutes);

// Global 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    res.status(500).json({ success: false, message: "Something went wrong" });
});

const startServer = async () => {
    try {
        await connectDB();

        console.log("Initializing database tables...");
        await initUserModel();
        await createUserTypesTable();
        await createUserTypePermissionsTable();
        await createAuditLogsTable();
        await createUserDevicesTable();
        await createSystemSettingsTables();
        await createOrderingMasterTables();
        await createDomainMasterTables();
        await createEmailMasterTables();
        await createSupportMasterTables();
        await createInvoiceMasterTables();
        await createSecurityMasterTables();
        await createCustomerMasterTables();
        await createResellerMasterTables();
        await createMasterCreatorTables();
        await initProductMasterTables();

        console.log("All database tables are initialized and ready.");

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server Running on Port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start application server:", error);
        process.exit(1);
    }
};

startServer();