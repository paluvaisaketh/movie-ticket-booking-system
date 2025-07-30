// backend/src/routes/showRoutes.js
const express = require('express');
const router = express.Router();
const showController = require('../controllers/showController'); // Import the show controller
const auth = require('../middleware/authMiddleware'); // Import auth middleware (for protected routes)
const admin = require('../middleware/adminMiddleware'); // Import admin middleware (for admin-only routes)

// Public routes
router.get('/', showController.getAllShows); // GET all active shows
router.get('/:id', showController.getShowById); // GET a single show by ID

// Admin only routes (require both authentication and admin role)
router.post('/', auth, admin, showController.createShow);
router.put('/:id', auth, admin, showController.updateShow);
router.delete('/:id', auth, admin, showController.deleteShow);

module.exports = router;