// backend/src/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Needed if you add password logic later, or for mock data hashing
const jwt = require('jsonwebtoken');
require('dotenv').config();

// COMMENT OUT this line to disable Twilio integration
// const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Helper: Generate a 6-digit OTP
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST /api/auth/send-otp
exports.sendOtp = async (req, res) => {
    let { phone } = req.body; // Use 'let' to allow modification

    try {
        if (!phone) {
            return res.status(400).json({ msg: 'Phone number is required' });
        }

        // IMPORTANT: If you reactivate Twilio later, format phone number for Twilio (E.164 format, e.g., +919876543210)
        // const twilioPhoneNumber = `+91${phone}`; // Assuming all users are Indian for this example

        let user = await User.findOne({ phone }); // Find user using the unformatted phone number
        const otp = generateOtp();
        const otp_expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

        if (user) {
            user.otp = otp;
            user.otp_expiry = otp_expiry;
            user.is_verified = false; // Reset verification status
            await user.save();
            console.log(`OTP for existing user ${phone}: ${otp}`); // UNCOMMENTED: Log OTP to console
        } else {
            user = new User({ phone, otp, otp_expiry, role: 'user', is_verified: false });
            await user.save();
            console.log(`OTP for new user ${phone}: ${otp}`); // UNCOMMENTED: Log OTP to console
        }

        // COMMENT OUT this entire block to disable Twilio SMS sending
        /*
        await twilio.messages.create({
            body: `Your MovieApp OTP is: ${otp}. It is valid for 5 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: twilioPhoneNumber // Use the E.164 formatted phone number if Twilio is active
        });
        */

        res.json({ msg: 'OTP sent successfully. Please check your phone.' });
    } catch (err) {
        console.error('Error in sendOtp:', err.message);
        // Twilio-specific error handling is now irrelevant if Twilio is commented out
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: errors.join(', ') });
        }
        res.status(500).send('Server Error');
    }
};

// POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
    const { phone, otp } = req.body;
    try {
        if (!phone || !otp) return res.status(400).json({ msg: 'Phone number and OTP are required' });

        const user = await User.findOne({ phone });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials or user not found' });

        if (user.otp !== otp || new Date() > user.otp_expiry) {
            user.otp = undefined; // Clear OTP on failed attempt
            user.otp_expiry = undefined;
            await user.save();
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
        }

        user.otp = undefined; // Clear OTP on successful verification
        user.otp_expiry = undefined;
        user.is_verified = true;
        await user.save();

        // Generate JWT
        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: { _id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, is_verified: user.is_verified, dob: user.dob }
            });
        });
    } catch (err) {
        console.error('Error in verifyOtp:', err.message);
        res.status(500).send('Server Error');
    }
};

// GET /api/auth/me (Protected)
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -otp -otp_expiry');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error('Error in getMe:', err.message);
        res.status(500).send('Server Error');
    }
};

// PUT /api/auth/profile (Protected)
exports.updateProfile = async (req, res) => {
    const { name, email, dob } = req.body;
    try {
        let user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (name !== undefined) user.name = name;
        if (email !== undefined) {
            const existingUserWithEmail = await User.findOne({ email: new RegExp(`^${email}$`, 'i'), _id: { $ne: user._id } });
            if (existingUserWithEmail) return res.status(400).json({ msg: 'Email already in use by another account' });
            user.email = email;
        }
        if (dob !== undefined) user.dob = dob;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error('Error in updateProfile:', err.message);
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: errors.join(', ') });
        }
        if (err.code === 11000) return res.status(400).json({ msg: 'Email already registered' });
        res.status(500).send('Server Error');
    }
};