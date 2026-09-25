const {
    registerUser,
    loginUser
} = require("../services/authService");

async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        // Basic password validation
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const user = await registerUser(
            name.trim(),
            email.trim().toLowerCase(),
            password
        );

        res.status(201).json({
            success: true,
            message: "Registration successful",
            user
        });

    } catch (error) {

        if (error.message === "EMAIL_ALREADY_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        console.error("Registration Error:", error);

        res.status(500).json({
            success: false,
            message: "Registration failed"
        });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const result = await loginUser(
            email.trim().toLowerCase(),
            password
        );

        res.json({
            success: true,
            message: "Login successful",
            ...result
        });

    } catch (error) {

        if (error.message === "INVALID_CREDENTIALS") {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        console.error("Login Error:", error);

        res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
}

module.exports = {
    register,
    login
};