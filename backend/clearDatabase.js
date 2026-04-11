// clearDatabase.js
require('dotenv').config();
const mysql = require('mysql2');

// Connect using the exact same credentials as your server.js
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('❌ Failed to connect to database:', err.message);
        process.exit(1);
    }

    console.log(`✅ Connected to database: ${process.env.DB_NAME}`);
    console.log(`🧹 Starting database cleanup...\n`);

    // We use TRUNCATE instead of DELETE. 
    // TRUNCATE empties the table AND resets the auto-increment IDs back to 1.
    db.query('TRUNCATE TABLE users', (err) => {
        if (err) console.error("Error clearing users:", err.message);
        else console.log("✔️  Successfully cleared 'users' table.");

        db.query('TRUNCATE TABLE reginfo', (err) => {
            if (err) console.error("Error clearing reginfo:", err.message);
            else console.log("✔️  Successfully cleared 'reginfo' table.");

            db.query('TRUNCATE TABLE userinfo', (err) => {
                if (err) console.error("Error clearing userinfo:", err.message);
                else console.log("✔️  Successfully cleared 'userinfo' table.");

                console.log("\n🎉 All tables cleared successfully! You can now restart your server.");
                db.end(); // Close the connection
            });
        });
    });
});