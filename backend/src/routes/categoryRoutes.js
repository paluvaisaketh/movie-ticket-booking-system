// backend/src/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Public route to get all movies grouped by category
router.get('/', categoryController.getAllCategories);

// Admin routes to manage categories
router.post('/:categoryName', auth, admin, categoryController.addMoviesToCategory);
router.delete('/:categoryName/movies/:movieId', auth, admin, categoryController.removeMovieFromCategory);

module.exports = router;