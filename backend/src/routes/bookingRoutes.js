// backend/src/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware'); // Import admin middleware

// User routes (protected)
router.get('/my', auth, bookingController.getUserBookings); // Get bookings for logged-in user
router.get('/:id', auth, bookingController.getBookingById); // Get specific booking by ID
router.put('/:id/status', auth, bookingController.cancelBooking); // Full cancellation (update status)
router.put('/:id/cancel-seats', auth, bookingController.partialCancelBooking); // Partial cancellation

// Admin routes (protected by both auth and admin middleware)
router.get('/', auth, admin, bookingController.getAllBookingsAdmin); // Get all bookings (Admin only)
router.post('/', auth, bookingController.createBooking); // Create booking (user role can create)

module.exports = router;