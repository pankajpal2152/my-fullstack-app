// require('dotenv').config();
// const express = require('express');
// const mysql = require('mysql2');
// const cors = require('cors');
// const bcrypt = require('bcrypt');

// const app = express();

// app.use(cors({ origin: '*' }));
// app.use(express.json({ limit: '50mb' }));

// // --- CONNECT TO EXISTING LOCAL DATABASE ---
// const db = mysql.createPool({
//     host: process.env.DB_HOST || '127.0.0.1',
//     user: process.env.DB_USER || 'root',
//     password: process.env.DB_PASSWORD || '',
//     port: process.env.DB_PORT || 3306,
//     database: process.env.DB_NAME || 'mathemat_ngo',
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

// db.getConnection((err, connection) => {
//     if (err) {
//         console.error('❌ Database connection failed: ' + err.message);
//         return;
//     }
//     console.log(`✅ Connected to local database (mathemat_ngo) successfully.`);
//     connection.release();
// });

// const apiRouter = express.Router();

// // ==========================================
// // 1. AUTHENTICATION (userssignup table)
// // ==========================================
// apiRouter.post('/signup', async (req, res) => {
//     const { role, username, email, password } = req.body;
//     try {
//         db.query('SELECT * FROM userssignup WHERE email = ?', [email], async (err, results) => {
//             if (err) return res.status(500).json({ error: 'Database error' });
//             if (results.length > 0) return res.status(400).json({ error: 'Email already exists' });

//             const salt = await bcrypt.genSalt(10);
//             const hashedPassword = await bcrypt.hash(password, salt);

//             const query = `INSERT INTO userssignup (role, username, email, password) VALUES (?, ?, ?, ?)`;
//             db.query(query, [role, username, email, hashedPassword], (err) => {
//                 if (err) return res.status(500).json({ error: 'Failed to register' });
//                 res.status(201).json({ message: 'User registered successfully!' });
//             });
//         });
//     } catch (error) { res.status(500).json({ error: 'Server error' }); }
// });

// apiRouter.post('/login', (req, res) => {
//     const { email, password } = req.body;
//     db.query('SELECT * FROM userssignup WHERE email = ?', [email], async (err, results) => {
//         if (err) return res.status(500).json({ error: 'Database error' });
//         if (results.length === 0) return res.status(400).json({ error: 'User not found' });

//         const user = results[0];
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) return res.status(400).json({ error: 'Incorrect password' });

//         res.status(200).json({ message: 'Login successful', user: { id: user.id, role: user.role, username: user.username, email: user.email } });
//     });
// });

// apiRouter.get('/userinfo', (req, res) => {
//     res.json([
//         { UserInfoId: 1, UserType: 'State Super Administrator' },
//         { UserInfoId: 2, UserType: 'District Administrator' },
//         { UserInfoId: 3, UserType: 'Supervisor' },
//         { UserInfoId: 4, UserType: 'Astha Didi' }
//     ]);
// });

// // ==========================================
// // 2. DYNAMIC DROPDOWNS (state & dist tables)
// // ==========================================
// apiRouter.get('/states', (req, res) => {
//     // Only fetch states where IsActive = 1
//     db.query('SELECT StateId, StateName FROM state WHERE IsActive = 1', (err, results) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json(results);
//     });
// });

// apiRouter.get('/districts/:stateId', (req, res) => {
//     // Only fetch districts matching the stateId where IsActive = 1
//     const stateId = req.params.stateId;
//     db.query('SELECT DistId, DistName FROM dist WHERE StateId = ? AND IsActive = 1', [stateId], (err, results) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json(results);
//     });
// });

// // ==========================================
// // 3. ASTHA DIDI REGISTRATION (asthadidireginfo table)
// // ==========================================
// apiRouter.get('/asthadidi', (req, res) => {
//     db.query('SELECT * FROM asthadidireginfo ORDER BY RegInfoId DESC', (err, results) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json(results);
//     });
// });

// apiRouter.post('/asthadidi', (req, res) => {
//     const data = req.body;
//     const insertQuery = `INSERT INTO asthadidireginfo
//         (ProfileImage, PerName, GuardianName, DOB, GuardianContactNo, StateName, DistName, City, BlockName, PO, PS, GramPanchayet, Village, Pincode, ContactNo, MailId, BankName, BranchName, AcctNo, IFSCode, PanNo, AadharNo, JoiningAmt, WalletBalance, IsActive, AprovedBy, AprovalDate, AsthaDidiRegNo, CreatedBy) 
//         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

//     const values = [
//         data.ProfileImage, data.PerName, data.GuardianName, data.DOB, data.GuardianContactNo, data.StateName, data.DistName, data.City, data.BlockName, data.PO, data.PS, data.GramPanchayet, data.Village, data.Pincode, data.ContactNo, data.MailId, data.BankName, data.BranchName, data.AcctNo, data.IFSCode, data.PanNo, data.AadharNo, data.JoiningAmt, data.WalletBalance, data.IsActive || 1, data.AprovedBy || null, data.AprovalDate || null, data.AsthaDidiRegNo || null, data.CreatedBy
//     ];

//     db.query(insertQuery, values, (err, result) => {
//         if (err) return res.status(500).json({ error: err.message });
//         const newId = result.insertId;

//         // Tag image with ID
//         if (data.ProfileImage && !data.ProfileImage.startsWith('ID:')) {
//             const taggedImage = `ID:${newId}||${data.ProfileImage}`;
//             db.query('UPDATE asthadidireginfo SET ProfileImage=? WHERE RegInfoId=?', [taggedImage, newId], () => { });
//         }
//         res.json({ message: 'Astha Didi added successfully', id: newId });
//     });
// });

// apiRouter.put('/asthadidi/:id', (req, res) => {
//     const { id } = req.params;
//     const data = req.body;

//     if (data.ProfileImage && !data.ProfileImage.startsWith('ID:')) {
//         data.ProfileImage = `ID:${id}||${data.ProfileImage}`;
//     }

//     const updateQuery = `UPDATE asthadidireginfo SET 
//         ProfileImage=?, PerName=?, GuardianName=?, DOB=?, GuardianContactNo=?, StateName=?, DistName=?, City=?, BlockName=?, PO=?, PS=?, GramPanchayet=?, Village=?, Pincode=?, ContactNo=?, MailId=?, BankName=?, BranchName=?, AcctNo=?, IFSCode=?, PanNo=?, AadharNo=?, JoiningAmt=?, WalletBalance=?, IsActive=?, AprovedBy=?, AprovalDate=?, AsthaDidiRegNo=?, CreatedBy=?
//         WHERE RegInfoId=?`;

//     const values = [
//         data.ProfileImage, data.PerName, data.GuardianName, data.DOB, data.GuardianContactNo, data.StateName, data.DistName, data.City, data.BlockName, data.PO, data.PS, data.GramPanchayet, data.Village, data.Pincode, data.ContactNo, data.MailId, data.BankName, data.BranchName, data.AcctNo, data.IFSCode, data.PanNo, data.AadharNo, data.JoiningAmt, data.WalletBalance, data.IsActive, data.AprovedBy, data.AprovalDate, data.AsthaDidiRegNo, data.CreatedBy,
//         id
//     ];

//     db.query(updateQuery, values, (err) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json({ message: 'Record updated successfully' });
//     });
// });

// apiRouter.delete('/asthadidi/:id', (req, res) => {
//     db.query('DELETE FROM asthadidireginfo WHERE RegInfoId = ?', [req.params.id], (err) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json({ message: 'Record deleted successfully' });
//     });
// });

// app.use('/api', apiRouter);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Backend Server running locally on port ${PORT}`);
// });

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import the modular API routes
const apiRoutes = require('./routes/apiRoutes');

const app = express();

// Middlewares
app.use(cors({ origin: '*' }));
// Limit increased to 50mb to comfortably handle Base64 PDF and Image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount API Routes
app.use('/api', apiRoutes);

// ==========================================
// CPANEL DEPLOYMENT / PRODUCTION SETUP
// ==========================================
// When running in production (like on cPanel), the Node server acts as both 
// the API backend AND the file server for the React frontend.
if (process.env.NODE_ENV === 'production') {
    // Point to the Vite 'dist' folder (one level up from backend into frontend)
    const frontendDistPath = path.join(__dirname, '../frontend/dist');

    // Serve the static files from the React build
    app.use(express.static(frontendDistPath));

    // Handle React Router: Send all other requests to index.html so React can take over routing
    // ✅ FIX: Changed the string '*' to a Regular Expression /.*/ to prevent path-to-regexp crashes
    app.get(/.*/, (req, res) => {
        res.sendFile(path.resolve(frontendDistPath, 'index.html'));
    });
} else {
    // Development fallback message if accessing root directly
    app.get('/', (req, res) => {
        res.send('Ngo API is running in Development mode...');
    });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    if (process.env.NODE_ENV === 'production') {
        console.log(`🌍 Running in Production Mode (Ready for cPanel/Internet)`);
    }
});