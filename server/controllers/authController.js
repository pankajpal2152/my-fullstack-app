const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.signup = async (req, res) => {
    const { role, username, email, password } = req.body;
    try {
        db.query('SELECT * FROM userssignup WHERE email = ?', [email], async (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (results.length > 0) return res.status(400).json({ error: 'Email already exists' });

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const query = `INSERT INTO userssignup (role, username, email, password) VALUES (?, ?, ?, ?)`;
            db.query(query, [role, username, email, hashedPassword], (err) => {
                if (err) return res.status(500).json({ error: 'Failed to register' });
                res.status(201).json({ message: 'User registered successfully!' });
            });
        });
    } catch (error) { 
        res.status(500).json({ error: 'Server error' }); 
    }
};

exports.login = (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM userssignup WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(400).json({ error: 'User not found' });
        
        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Incorrect password' });
        
        res.status(200).json({ 
            message: 'Login successful', 
            user: { id: user.id, role: user.role, username: user.username, email: user.email } 
        });
    });
};

exports.getUserInfo = (req, res) => {
    res.json([
        { UserInfoId: 1, UserType: 'State Super Administrator' },
        { UserInfoId: 2, UserType: 'District Administrator' },
        { UserInfoId: 3, UserType: 'Supervisor' },
        { UserInfoId: 4, UserType: 'Astha Didi' }
    ]);
};