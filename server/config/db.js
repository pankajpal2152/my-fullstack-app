const mysql = require('mysql2');
require('dotenv').config();

// Create the connection pool
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost' || '127.0.0.1' ,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'mathemat_ngo',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed: ' + err.message);
        return;
    }
    console.log(`✅ Connected to local database (${process.env.DB_NAME}) successfully.`);
    connection.release();
});

module.exports = db;