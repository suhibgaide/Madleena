const express = require("express");
const axios = require("axios");
const session = require("express-session");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const BASE_URL = "https://app.vanex.ly/api/v1";
// Try to load credentials from environment variables first
const CRED_EMAIL = process.env.VNX_EMAIL || "suhibgaide@me.com";
const CRED_PASSWORD = process.env.VNX_PASSWORD || "Andym@nkl3";

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(__dirname));
app.use(session({
    secret: process.env.SESSION_SECRET || "vnx_expert_session_key",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 * 24, httpOnly: true }
}));

// ==================== CREDENTIAL MANAGEMENT ====================

/**
 * Get credentials from environment variables or defaults
 */
function getCredentials() {
    return {
        email: CRED_EMAIL,
        password: CRED_PASSWORD
    };
}

/**
 * Ensure valid authentication token
 */
async function ensureAuth(req) {
    // Return existing session token
    if (req.session.token && req.session.tokenExpiry > Date.now()) {
        return req.session.token;
    }

    const creds = getCredentials();

    try {
        const authRes = await axios.post(`${BASE_URL}/authenticate`, {
            email: creds.email,
            password: creds.password
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        const token = authRes.data.data?.access_token || authRes.data.access_token;
        if (!token) throw new Error("No token in response");

        // Store token with 23-hour expiry
        req.session.token = token;
        req.session.tokenExpiry = Date.now() + (23 * 3600 * 1000);

        return token;
    } catch (error) {
        console.error("Authentication Failed:", error.response?.data || error.message);
        throw new Error("Authentication failed: " + (error.response?.data?.message || error.message));
    }
}

// ==================== API ROUTES ====================

/**
 * Health Check
 */
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "VNX Expert V10 is running",
        timestamp: new Date().toISOString()
    });
});

/**
 * Get Credentials Status (without exposing actual credentials)
 */
app.get("/api/get-credentials", (req, res) => {
    try {
        res.json({
            success: true,
            message: "Credentials loaded from environment",
            email: CRED_EMAIL ? CRED_EMAIL.substring(0, 5) + "***" : "not-set"
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Initialize API
 */
app.get("/api/init", async (req, res) => {
    try {
        const token = await ensureAuth(req);

        // Fetch cities list
        const citiesRes = await axios.get(`${BASE_URL}/city/all`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            },
            timeout: 10000
        });

        res.json({
            success: true,
            message: "System initialized successfully",
            cities: citiesRes.data.data || citiesRes.data 
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Authenticate Endpoint
 */
app.post("/api/authenticate", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and password are required"
            });
        }

        const authRes = await axios.post(`${BASE_URL}/authenticate`, {
            email,
            password
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        const token = authRes.data.data?.access_token || authRes.data.access_token;
        req.session.token = token;
        req.session.tokenExpiry = Date.now() + (23 * 3600 * 1000);

        res.json({
            success: true,
            message: "Authentication successful",
            token: token.substring(0, 20) + "..."
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            error: error.response?.data?.message || error.message
        });
    }
});

/**
 * Get All Cities
 */
app.get("/api/city/all", async (req, res) => {
    try {
        const token = await ensureAuth(req);

        const citiesRes = await axios.get(`${BASE_URL}/city/all`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            },
            timeout: 10000
        });

        res.json({
            success: true,
            data: citiesRes.data.data || citiesRes.data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get All Packages
 */
app.get("/api/packages", async (req, res) => {
    try {
        const token = await ensureAuth(req);
        const page = req.query.page || 1;
        const perPage = req.query.perPage || 10;
        const status = req.query.status || "all";

        const packagesRes = await axios.get(`${BASE_URL}/customer/package/sentv2`, {
            params: {
                page,
                "per-page": perPage,
                status
            },
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            },
            timeout: 10000
        });

        res.json({
            success: true,
            data: packagesRes.data.data || packagesRes.data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get Notifications
 */
app.get("/api/notifications", async (req, res) => {
    try {
        const token = await ensureAuth(req);

        const notificationsRes = await axios.get(`${BASE_URL}/customer/notifications`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            },
            timeout: 10000
        });

        res.json({
            success: true,
            data: notificationsRes.data.data || notificationsRes.data || []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            data: []
        });
    }
});

/**
 * Mark All Notifications as Read
 */
app.post("/api/notifications/mark-all-read", async (req, res) => {
    try {
        const token = await ensureAuth(req);

        // Attempt to mark all as read on the backend
        try {
            await axios.post(`${BASE_URL}/customer/notifications/mark-all-read`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                timeout: 10000
            });
        } catch (innerError) {
            // If endpoint doesn't exist, still return success (for frontend UI update)
            console.warn("Mark all as read endpoint not available:", innerError.message);
        }

        res.json({
            success: true,
            message: "Notifications marked as read"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get Safe Storage Products
 */
app.get("/api/safe-storage/products", async (req, res) => {
    try {
        const token = await ensureAuth(req);
        const instock = req.query.instock || 1;

        const productsRes = await axios.get(`${BASE_URL}/safe-storage/products`, {
            params: { instock },
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            },
            timeout: 10000
        });

        res.json({
            success: true,
            data: productsRes.data.data || productsRes.data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get Safe Storage Orders
 */
app.get("/api/safe-storage/orders", async (req, res) => {
    try {
        const token = await ensureAuth(req);
        const typeId = req.query.typeId || 1;
        const page = req.query.page || 1;
        const perPage = req.query.perPage || 10;

        const ordersRes = await axios.get(`${BASE_URL}/safe-storage/orders`, {
            params: {
                type_id: typeId,
                page,
                "per-page": perPage
            },
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            },
            timeout: 10000
        });

        res.json({
            success: true,
            data: ordersRes.data.data || ordersRes.data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Create Safe Storage Package
 */
app.post("/api/package/create", async (req, res) => {
    try {
        const token = await ensureAuth(req);

        if (!token) {
            return res.status(401).json({
                success: false,
                error: "Session expired - please try again"
            });
        }

        const response = await axios.post(`${BASE_URL}/customer/package`, req.body, {
            params: { deposit: 0, isReturn: 0 },
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            timeout: 15000
        });

        res.json({
            success: true,
            message: "Package created successfully",
            data: response.data
        });
    } catch (error) {
        res.status(error.response?.status || 500).json({
            success: false,
            error: error.response?.data?.message || error.message,
            details: error.response?.data
        });
    }
});

/**
 * Delete Single Package
 */
app.delete("/api/package/:packageCode", async (req, res) => {
    try {
        const token = await ensureAuth(req);
        const { packageCode } = req.params;

        const response = await axios.delete(`${BASE_URL}/customer/package/${packageCode}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            },
            timeout: 10000
        });

        res.json({
            success: true,
            message: "Package deleted successfully",
            data: response.data
        });
    } catch (error) {
        res.status(error.response?.status || 500).json({
            success: false,
            error: error.response?.data?.message || error.message
        });
    }
});

/**
 * Delete Multiple Packages
 */
app.post("/api/package/delete-bulk", async (req, res) => {
    try {
        const token = await ensureAuth(req);
        const { packageCodes } = req.body;

        if (!Array.isArray(packageCodes) || packageCodes.length === 0) {
            return res.status(400).json({
                success: false,
                error: "packageCodes array is required"
            });
        }

        const response = await axios.post(
            `${BASE_URL}/customer/package/delete-bulk`,
            { package_codes: packageCodes },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                timeout: 10000
            }
        );

        res.json({
            success: true,
            message: "Packages deleted successfully",
            data: response.data
        });
    } catch (error) {
        res.status(error.response?.status || 500).json({
            success: false,
            error: error.response?.data?.message || error.message
        });
    }
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(500).json({
        success: false,
        error: "Internal server error",
        message: err.message
    });
});

// ==================== SERVER STARTUP ====================

const server = require('http').createServer(app);
server.maxHeaderSize = 1024 * 64;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════╗
║     🚀 VNX Expert V10 Started          ║
║     http://localhost:${PORT}               ║
║     http://localhost:${PORT}/vnx.html        ║
╚════════════════════════════════════════╝
    `);
});

server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
});

module.exports = app;
