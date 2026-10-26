
const {
    registerUser,
    loginUser
} = require("../services/authService");

// Email validation
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Register new user
async function register(req, res) {
    try {
        const { name, email, password } = req.body || {};

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required."
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (!isValidEmail(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters."
            });
        }

        const user = await registerUser(
            cleanName,
            cleanEmail,
            password
        );

        return res.status(201).json({
            success: true,
            message: "Registration successful.",
            user
        });

    } catch (error) {
        console.error("Registration Error:", {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage
        });

        if (
            error.message === "EMAIL_ALREADY_EXISTS" ||
            error.code === "ER_DUP_ENTRY"
        ) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered. Please log in."
            });
        }

        if (
            error.code === "ECONNREFUSED" ||
            error.code === "ER_ACCESS_DENIED_ERROR" ||
            error.code === "ER_BAD_DB_ERROR"
        ) {
            return res.status(500).json({
                success: false,
                message: "Database connection failed. Check the backend configuration."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Registration failed. Check the backend terminal."
        });
    }
}

// Login existing user
async function login(req, res) {
    try {
        const { email, password } = req.body || {};

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        if (!isValidEmail(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        const result = await loginUser(
            cleanEmail,
            password
        );

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            ...result
        });

    } catch (error) {
        console.error("Login Error:", {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage
        });

        if (error.message === "INVALID_CREDENTIALS") {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        if (error.message === "JWT_SECRET_MISSING") {
            return res.status(500).json({
                success: false,
                message: "Authentication configuration error. Check JWT_SECRET in backend/.env."
            });
        }

        if (
            error.code === "ECONNREFUSED" ||
            error.code === "ER_ACCESS_DENIED_ERROR" ||
            error.code === "ER_BAD_DB_ERROR"
        ) {
            return res.status(500).json({
                success: false,
                message: "Database connection failed. Check the backend configuration."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Login failed. Check the backend terminal."
        });
    }
}

module.exports = {
    register,
    login
};
