// backend/src/routes/bannerRoutes.js
const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Public routes
router.get('/', bannerController.getAllBanners);

// Admin only routes
router.post('/', auth, admin, bannerController.createBanner);
router.put('/:id', auth, admin, bannerController.updateBanner);
router.delete('/:id', auth, admin, bannerController.deleteBanner);

module.exports = router;