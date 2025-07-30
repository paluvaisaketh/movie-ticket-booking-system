// backend/src/routes/theatreRoutes.js
const express = require('express');
const router = express.Router();
const theatreController = require('../controllers/theatreController'); // Import theatre controller
const auth = require('../middleware/authMiddleware'); // Import auth middleware
const admin = require('../middleware/adminMiddleware'); // Import admin middleware

// --- THEATRE ROUTES ---

// Public routes
router.get('/', theatreController.getAllTheatres); // Get all theatres (or the main one)
router.get('/:id', theatreController.getTheatreById); // Get a single theatre by ID

// Admin only routes
router.post('/', auth, admin, theatreController.createTheatre);
router.put('/:id', auth, admin, theatreController.updateTheatre);
router.delete('/:id', auth, admin, theatreController.deleteTheatre);

// --- SCREEN ROUTES (Nested under Theatre) ---

// Public routes for screens
router.get('/:theatreId/screens', theatreController.getScreensByTheatre); // Get all screens for a specific theatre

// Admin only routes for screens
router.post('/:theatreId/screens', auth, admin, theatreController.createScreen);
router.put('/:theatreId/screens/:screenId', auth, admin, theatreController.updateScreen);
router.delete('/:theatreId/screens/:screenId', auth, admin, theatreController.deleteScreen);

module.exports = router;