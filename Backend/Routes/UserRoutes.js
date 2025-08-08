
const express = require('express');
const connectDB = require('../config/Db');

const { loginCtrl, registerCtrl } = require('../Controller/Authcontroller.js');

const router = express.Router();

// Middleware to ensure database connection for auth routes
const ensureDBConnection = async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ success: false, message: 'Database connection failed' });
    }
};

router.post('/register', ensureDBConnection, registerCtrl);
router.post('/login', ensureDBConnection, loginCtrl);

// Test endpoint (no DB needed)
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Backend is working!' });
});

module.exports = router;