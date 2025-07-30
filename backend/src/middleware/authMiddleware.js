// // backend/src/middleware/authMiddleware.js
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// module.exports = function (req, res, next) {
//     // Get token from header (commonly 'x-auth-token' or 'Authorization: Bearer <token>')
//     const token = req.header('x-auth-token');

//     // Check if no token
//     if (!token) {
//         return res.status(401).json({ msg: 'No token, authorization denied' });
//     }

//     // Verify token
//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded.user; // Attach user info (id, role) from token payload to request
//         next(); // Proceed to the next middleware/route handler
//     } catch (err) {
//         res.status(401).json({ msg: 'Token is not valid' });
//     }
// };



// backend/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
    // Get token from header
    const authHeader = req.header('Authorization'); // Check for Authorization header first
    const xAuthToken = req.header('x-auth-token'); // Also check for x-auth-token

    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
    } else if (xAuthToken) {
        token = xAuthToken; // Use x-auth-token if present
    }

    // console.log('--- BACKEND AUTH MIDDLEWARE DEBUG ---');
    // console.log('Request URL:', req.originalUrl);
    // console.log('Received Authorization Header:', authHeader);
    // console.log('Received x-auth-token Header:', xAuthToken);
    // console.log('Extracted Token for verification:', token ? 'YES (value: ' + token.substring(0, 10) + '...)' : 'NO');

    // Check if no token
    if (!token) {
        console.log('Auth Middleware: No valid token extracted, denying authorization.');
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        console.log('Auth Middleware: Token valid. User ID:', req.user.id, 'Role:', req.user.role);
        next();
    } catch (err) {
        console.error('Auth Middleware: Token verification failed:', err.message);
        // Also log the JWT_SECRET being used by the backend for comparison
        console.error('Backend JWT_SECRET (first 5 chars):', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 5) : 'NOT SET');
        res.status(401).json({ msg: 'Token is not valid' });
    }
};