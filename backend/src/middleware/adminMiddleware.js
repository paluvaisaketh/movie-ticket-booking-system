// backend/src/middleware/adminMiddleware.js
// This middleware assumes authMiddleware has already run and populated req.user

module.exports = function (req, res, next) {
    // Check if user is authenticated and has 'admin' role
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Admin access required' });
    }
    next(); // User is an admin, proceed
};