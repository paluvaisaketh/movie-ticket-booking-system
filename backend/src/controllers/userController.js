// backend/src/controllers/userController.js
const User = require('../models/User');

// @route    GET /api/users
// @desc     Get all users (Admin only)
// @access   Private (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password -otp -otp_expiry'); // Exclude sensitive fields
        res.json(users);
    } catch (err) {
        console.error('Error in getAllUsers:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route    GET /api/users/:id
// @desc     Get a single user by ID (Admin only)
// @access   Private (Admin)
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -otp -otp_expiry');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('Error in getUserById:', err.message);
        res.status(500).send('Server Error');
    }
};