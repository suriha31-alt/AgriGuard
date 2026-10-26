
const mysql = require("mysql2/promise");

/*
|--------------------------------------------------------------------------
| Database Configuration
|--------------------------------------------------------------------------
*/

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "agriguard",
    port: Number(process.env.DB_PORT) || 3306,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/*
|--------------------------------------------------------------------------
| Test Database Connection
|--------------------------------------------------------------------------
*/

async function testDatabaseConnection() {
    try {
        const connection = await pool.getConnection();

        console.log("MySQL database connected successfully.");

        connection.release();
        return true;
    } catch (error) {
        console.error("MySQL Connection Error:", {
            message: error.message,
            code: error.code
        });

        return false;
    }
}

/*
|--------------------------------------------------------------------------
| Export Database Pool
|--------------------------------------------------------------------------
*/

module.exports = {
    pool,
    testDatabaseConnection
};
