// backend/src/controllers/bannerController.js
const Banner = require('../models/Banner');

// @route    GET /api/banners
// @desc     Get all banners
// @access   Public
exports.getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.find({}).sort({ position: 1, start_date: -1 });
        res.json(banners);
    } catch (err) {
        console.error('Error in getAllBanners:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route    POST /api/banners
// @desc     Create a new banner (Admin only)
// @access   Private (Admin)
exports.createBanner = async (req, res) => {
    const { title, target_url, image_url, position, is_active, start_date, end_date } = req.body;
    try {
        const newBanner = new Banner({
            title,
            target_url,
            image_url,
            position,
            is_active,
            start_date,
            end_date,
            created_by: req.user.id // Get admin ID from middleware
        });
        await newBanner.save();
        res.status(201).json(newBanner);
    } catch (err) {
        console.error('Error in createBanner:', err.message);
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: errors.join(', ') });
        }
        res.status(500).send('Server Error');
    }
};

// @route    PUT /api/banners/:id
// @desc     Update a banner (Admin only)
// @access   Private (Admin)
exports.updateBanner = async (req, res) => {
    const { id } = req.params;
    const { title, target_url, image_url, position, is_active, start_date, end_date } = req.body;
    try {
        let banner = await Banner.findById(id);
        if (!banner) {
            return res.status(404).json({ msg: 'Banner not found' });
        }

        if (title !== undefined) banner.title = title;
        if (target_url !== undefined) banner.target_url = target_url;
        if (image_url !== undefined) banner.image_url = image_url;
        if (position !== undefined) banner.position = position;
        if (is_active !== undefined) banner.is_active = is_active;
        if (start_date !== undefined) banner.start_date = start_date;
        if (end_date !== undefined) banner.end_date = end_date;

        await banner.save();
        res.json(banner);
    } catch (err) {
        console.error('Error in updateBanner:', err.message);
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: errors.join(', ') });
        }
        res.status(500).send('Server Error');
    }
};

// @route    DELETE /api/banners/:id
// @desc     Delete a banner (Admin only)
// @access   Private (Admin)
exports.deleteBanner = async (req, res) => {
    const { id } = req.params;
    try {
        const banner = await Banner.findById(id);
        if (!banner) {
            return res.status(404).json({ msg: 'Banner not found' });
        }

        await Banner.deleteOne({ _id: id });
        res.json({ msg: 'Banner removed successfully' });
    } catch (err) {
        console.error('Error in deleteBanner:', err.message);
        res.status(500).send('Server Error');
    }
};