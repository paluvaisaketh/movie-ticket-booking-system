// backend/src/controllers/paymentController.js
const Payment = require('../models/Payment');

// @route    GET /api/payments
// @desc     Get all payments (Admin only)
// @access   Private (Admin)
exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find({}).sort({ created_at: -1 });
        res.json(payments);
    } catch (err) {
        console.error('Error in getAllPayments:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route    GET /api/payments/:id
// @desc     Get a single payment by ID (Admin only)
// @access   Private (Admin)
exports.getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ msg: 'Payment not found' });
        }
        res.json(payment);
    } catch (err) {
        console.error('Error in getPaymentById:', err.message);
        res.status(500).send('Server Error');
    }
};