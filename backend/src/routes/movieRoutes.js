// backend/src/routes/movieRoutes.js
const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController'); // Import the movie controller
const auth = require('../middleware/authMiddleware'); // Import auth middleware
const admin = require('../middleware/adminMiddleware'); // Import admin middleware

// Public routes (anyone can view movies)
router.get('/', movieController.getAllMovies);
router.get('/:id', movieController.getMovieById);

// Admin only routes (require both authentication and admin role)
router.post('/', auth, admin, movieController.createMovie);
router.put('/:id', auth, admin, movieController.updateMovie);
router.delete('/:id', auth, admin, movieController.deleteMovie);

module.exports = router;