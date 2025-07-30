// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Admin-only routes
router.get('/', [auth, admin], userController.getAllUsers);
router.get('/:id', [auth, admin], userController.getUserById);

module.exports = router;