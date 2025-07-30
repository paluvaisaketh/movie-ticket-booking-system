// backend/src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Admin-only routes
router.get('/', [auth, admin], paymentController.getAllPayments);
router.get('/:id', [auth, admin], paymentController.getPaymentById);

module.exports = router;