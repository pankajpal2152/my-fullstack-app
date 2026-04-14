const mysql = require('mysql2');
require('dotenv').config();

// The pool will automatically use values from .env if they exist.
// If not, it falls back to the defaults (ideal for local XAMPP).
const db = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'mathemat_ngo',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Recommended for production to prevent connection timeouts
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed: ' + err.message);
    } else {
        console.log(`✅ Connected to database: ${process.env.DB_NAME || 'mathemat_ngo'}`);
        connection.release();
    }
});

module.exports = db;