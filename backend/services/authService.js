const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("./databaseService");

async function registerUser(name, email, password) {
    // Check whether email already exists
    const [existingUsers] = await pool.execute(
        "SELECT id FROM users WHERE email = ?",
        [email]
    );

    if (existingUsers.length > 0) {
        throw new Error("EMAIL_ALREADY_EXISTS");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
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
}

async function loginUser(email, password) {
    // Find user
    const [users] = await pool.execute(
        `SELECT id, name, email, password_hash
         FROM users
         WHERE email = ?`,
        [email]
    );

    if (users.length === 0) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const user = users[0];

    // Compare password with stored hash
    const passwordMatches = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!passwordMatches) {
        throw new Error("INVALID_CREDENTIALS");
    }

    // Create JWT
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
}

module.exports = {
    registerUser,
    loginUser
};