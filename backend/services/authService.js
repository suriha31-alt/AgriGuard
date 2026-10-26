
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("./databaseService");

/*
|--------------------------------------------------------------------------
| Register User
|--------------------------------------------------------------------------
*/

async function registerUser(name, email, password) {
    try {
        // Validate inputs.
        if (!name || !email || !password) {
            throw new Error("REQUIRED_FIELDS_MISSING");
        }

        if (password.length < 6) {
            throw new Error("PASSWORD_TOO_SHORT");
        }

        // Check whether the email already exists.
        const [existingUsers] = await pool.execute(
            "SELECT id FROM users WHERE email = ? LIMIT 1",
            [email]
        );

        if (existingUsers.length > 0) {
            throw new Error("EMAIL_ALREADY_EXISTS");
        }

        // Hash the password before storing it.
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert the new user.
        const [result] = await pool.execute(
            `INSERT INTO users (name, email, password_hash)
             VALUES (?, ?, ?)`,
            [name, email, passwordHash]
        );

        return {
            id: result.insertId,
            name,
            email
        };
    } catch (error) {
        // Preserve known errors for the controller.
        if (
            [
                "EMAIL_ALREADY_EXISTS",
                "REQUIRED_FIELDS_MISSING",
                "PASSWORD_TOO_SHORT"
            ].includes(error.message)
        ) {
            throw error;
        }

        // MySQL also enforces unique constraints.
        if (error.code === "ER_DUP_ENTRY") {
            throw new Error("EMAIL_ALREADY_EXISTS");
        }

        console.error("registerUser database/service error:", {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage
        });

        throw error;
    }
}

/*
|--------------------------------------------------------------------------
| Login User
|--------------------------------------------------------------------------
*/

async function loginUser(email, password) {
    try {
        if (!email || !password) {
            throw new Error("REQUIRED_FIELDS_MISSING");
        }

        // Find the account by email.
        const [users] = await pool.execute(
            `SELECT id, name, email, password_hash
             FROM users
             WHERE email = ?
             LIMIT 1`,
            [email]
        );

        if (users.length === 0) {
            throw new Error("INVALID_CREDENTIALS");
        }

        const user = users[0];

        // Ensure the stored password hash exists.
        if (
            typeof user.password_hash !== "string" ||
            !user.password_hash
        ) {
            console.error("Login failed: stored password hash is missing.");
            throw new Error("INVALID_CREDENTIALS");
        }

        // Compare the submitted password with the stored hash.
        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            throw new Error("INVALID_CREDENTIALS");
        }

        // Ensure JWT configuration is present.
        if (!process.env.JWT_SECRET) {
            console.error("Login failed: JWT_SECRET is not configured.");
            throw new Error("JWT_SECRET_MISSING");
        }

        // Generate the authentication token.
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        };
    } catch (error) {
        // Preserve expected authentication errors.
        if (
            [
                "INVALID_CREDENTIALS",
                "JWT_SECRET_MISSING",
                "REQUIRED_FIELDS_MISSING"
            ].includes(error.message)
        ) {
            throw error;
        }

        console.error("loginUser database/service error:", {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage
        });

        throw error;
    }
}

/*
|--------------------------------------------------------------------------
| Export Functions
|--------------------------------------------------------------------------
*/

module.exports = {
    registerUser,
    loginUser
};
