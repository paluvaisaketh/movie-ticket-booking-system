// backend/src/controllers/offerController.js
const Offer = require('../models/Offer');

// @route    GET /api/offers
// @desc     Get all offers
// @access   Public
exports.getAllOffers = async (req, res) => {
    try {
        const offers = await Offer.find({}).sort({ valid_to: -1 });
        res.json(offers);
    } catch (err) {
        console.error('Error in getAllOffers:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route    POST /api/offers
// @desc     Create a new offer (Admin only)
// @access   Private (Admin)
exports.createOffer = async (req, res) => {
    const { code, title, discount_type, discount_value, min_amount, max_discount, valid_from, valid_to, is_active } = req.body;
    try {
        let offer = await Offer.findOne({ code });
        if (offer) {
            return res.status(400).json({ msg: 'Offer with this code already exists.' });
        }

        const newOffer = new Offer({
            code,
            title,
            discount_type,
            discount_value,
            min_amount,
            max_discount,
            valid_from,
            valid_to,
            is_active
        });
        await newOffer.save();
        res.status(201).json(newOffer);
    } catch (err) {
        console.error('Error in createOffer:', err.message);
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: errors.join(', ') });
        }
        res.status(500).send('Server Error');
    }
};

// @route    PUT /api/offers/:id
// @desc     Update an offer (Admin only)
// @access   Private (Admin)
exports.updateOffer = async (req, res) => {
    const { id } = req.params;
    const { code, title, discount_type, discount_value, min_amount, max_discount, valid_from, valid_to, is_active } = req.body;
    try {
        let offer = await Offer.findById(id);
        if (!offer) {
            return res.status(404).json({ msg: 'Offer not found' });
        }

        if (code !== undefined) offer.code = code;
        if (title !== undefined) offer.title = title;
        if (discount_type !== undefined) offer.discount_type = discount_type;
        if (discount_value !== undefined) offer.discount_value = discount_value;
        if (min_amount !== undefined) offer.min_amount = min_amount;
        if (max_discount !== undefined) offer.max_discount = max_discount;
        if (valid_from !== undefined) offer.valid_from = valid_from;
        if (valid_to !== undefined) offer.valid_to = valid_to;
        if (is_active !== undefined) offer.is_active = is_active;

        await offer.save();
        res.json(offer);
    } catch (err) {
        console.error('Error in updateOffer:', err.message);
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: errors.join(', ') });
        }
        if (err.code === 11000) { // Duplicate key error
            return res.status(400).json({ msg: 'Offer with this code already exists.' });
        }
        res.status(500).send('Server Error');
    }
};

// @route    DELETE /api/offers/:id
// @desc     Delete an offer (Admin only)
// @access   Private (Admin)
exports.deleteOffer = async (req, res) => {
    const { id } = req.params;
    try {
        const offer = await Offer.findById(id);
        if (!offer) {
            return res.status(404).json({ msg: 'Offer not found' });
        }

        await Offer.deleteOne({ _id: id });
        res.json({ msg: 'Offer removed successfully' });
    } catch (err) {
        console.error('Error in deleteOffer:', err.message);
        res.status(500).send('Server Error');
    }
};