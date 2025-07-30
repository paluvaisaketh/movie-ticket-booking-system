// backend/src/routes/offerRoutes.js
const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Public routes
router.get('/', offerController.getAllOffers);

// Admin only routes
router.post('/', auth, admin, offerController.createOffer);
router.put('/:id', auth, admin, offerController.updateOffer);
router.delete('/:id', auth, admin, offerController.deleteOffer);

module.exports = router;