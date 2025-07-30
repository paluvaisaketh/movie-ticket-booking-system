// backend/src/controllers/theatreController.js
const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const SeatTemplate = require('../models/SeatTemplate'); // To generate default seat templates on new screen creation

// Helper to get theatre details with its screens populated
const getTheatreDetailsWithScreens = async (theatreId) => {
    const theatre = await Theatre.findById(theatreId).lean(); // .lean() for plain JS object

    if (!theatre) return null;

    // Manually populate screens associated with this theatre
    const screens = await Screen.find({ theatre_id: theatre._id }).lean();
    theatre.screens = screens; // Add screens array to the theatre object

    return theatre;
};

// --- @route    GET /api/theatres
// --- @desc     Get all theatres (or just the main one)
// --- @access   Public
exports.getAllTheatres = async (req, res) => {
    try {
        const theatres = await Theatre.find({}); // Fetch all theatres
        
        // Optionally populate screens for all theatres, or handle in getTheatreById
        const populatedTheatres = await Promise.all(
            theatres.map(theatre => getTheatreDetailsWithScreens(theatre._id))
        );

        res.json(populatedTheatres);
    } catch (err) {
        console.error('Error in getAllTheatres:', err.message);
        res.status(500).send('Server Error');
    }
};

// --- @route    GET /api/theatres/:id
// --- @desc     Get single theatre by ID with its screens
// --- @access   Public
exports.getTheatreById = async (req, res) => {
    try {
        const theatre = await getTheatreDetailsWithScreens(req.params.id);
        if (!theatre) {
            return res.status(404).json({ msg: 'Theatre not found' });
        }
        res.json(theatre);
    } catch (err) {
        console.error('Error in getTheatreById:', err.message);
        res.status(500).send('Server Error');
    }
};

// --- @route    POST /api/theatres
// --- @desc     Create a new theatre (Admin only)
// --- @access   Private (Admin)
exports.createTheatre = async (req, res) => {
    const { name, location, contact, is_active } = req.body;
    try {
        let theatre = await Theatre.findOne({ name }); // Check for duplicate names
        if (theatre) {
            return res.status(400).json({ msg: 'Theatre with this name already exists.' });
        }

        const newTheatre = new Theatre({ name, location, contact, is_active });
        await newTheatre.save();

        res.status(201).json(newTheatre);
    } catch (err) {
        console.error('Error in createTheatre:', err.message);
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: errors.join(', ') });
        }
        res.status(500).send('Server Error');
    }
};

// --- @route    PUT /api/theatres/:id
// --- @desc     Update a theatre (Admin only)
// --- @access   Private (Admin)
exports.updateTheatre = async (req, res) => {
    const { name, location, contact, is_active } = req.body;
    try {
        let theatre = await Theatre.findById(req.params.id);
        if (!theatre) {
            return res.status(404).json({ msg: 'Theatre not found.' });
        }

        if (name !== undefined) theatre.name = name;
        if (location !== undefined) theatre.location = location;
        if (contact !== undefined) theatre.contact = contact;
        if (is_active !== undefined) theatre.is_active = is_active;

        await theatre.save();

        res.json(theatre);
    } catch (err) {
        console.error('Error in updateTheatre:', err.message);
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: errors.join(', ') });
        }
        if (err.code === 11000) { // Duplicate name
            return res.status(400).json({ msg: 'Theatre name already exists.' });
        }
        res.status(500).send('Server Error');
    }
};

// --- @route    DELETE /api/theatres/:id
// --- @desc     Delete a theatre (Admin only)
// --- @access   Private (Admin)
exports.deleteTheatre = async (req, res) => {
    try {
        const theatre = await Theatre.findById(req.params.id);
        if (!theatre) {
            return res.status(404).json({ msg: 'Theatre not found.' });
        }

        // IMPORTANT: Also delete associated screens, shows, showSeats etc.
        // For simplicity now, we just delete theatre. In production, handle cascading.
        const screensToDelete = await Screen.find({ theatre_id: theatre._id }).select('_id');
        const screenIds = screensToDelete.map(s => s._id);

        if (screenIds.length > 0) {
            // Delete associated SeatTemplates for these screens
            await SeatTemplate.deleteMany({ screen_id: { $in: screenIds } });
            console.log(`Deleted ${screenIds.length} SeatTemplates for theatre ${theatre._id}`);

            // You'd also need to handle shows, bookings, showSeats related to these screens
            // This would be complex and involves finding shows for these screens, then their showseats, then bookings.
            // For robust production, consider soft deletes or careful cascade.

            // Delete associated screens
            await Screen.deleteMany({ theatre_id: theatre._id });
            console.log(`Deleted ${screenIds.length} screens for theatre ${theatre._id}`);
        }

        await Theatre.deleteOne({ _id: req.params.id });
        res.json({ msg: 'Theatre removed successfully.' });
    } catch (err) {
        console.error('Error in deleteTheatre:', err.message);
        res.status(500).send('Server Error');
    }
};


// --- SCREEN MANAGEMENT (SUB-RESOURCES OF THEATRE) ---

// Helper to generate a default seat layout for a new screen
const generateStandardSeatLayout = () => {
    const seats = [];
    const rows = 'ABCDEFGHIJK'; // A to K (11 rows)
    const seatsPerRow = 18;

    for (let i = 0; i < rows.length; i++) {
        const rowChar = rows[i];
        const seatType = (rowChar === 'K') ? 'premium' : 'normal';
        const priceMultiplier = (rowChar === 'K') ? 1.5 : 1.0;

        for (let j = 1; j <= seatsPerRow; j++) {
            seats.push({
                seat_number: `${rowChar}${j}`,
                seat_type: seatType,
                price_multiplier: priceMultiplier
            });
        }
    }
    return seats;
};


// --- @route    GET /api/theatres/:theatreId/screens
// --- @desc     Get all screens for a specific theatre
// --- @access   Public
exports.getScreensByTheatre = async (req, res) => {
    try {
        const screens = await Screen.find({ theatre_id: req.params.theatreId });
        res.json(screens);
    } catch (err) {
        console.error('Error in getScreensByTheatre:', err.message);
        res.status(500).send('Server Error');
    }
};

// --- @route    POST /api/theatres/:theatreId/screens
// --- @desc     Create a new screen for a theatre (Admin only)
// --- @access   Private (Admin)
exports.createScreen = async (req, res) => {
    const { name } = req.body;
    const { theatreId } = req.params;
    try {
        // Verify theatre exists
        const theatre = await Theatre.findById(theatreId);
        if (!theatre) {
            return res.status(404).json({ msg: 'Theatre not found.' });
        }

        // Check for duplicate screen name within this theatre
        const existingScreen = await Screen.findOne({ theatre_id: theatreId, name });
        if (existingScreen) {
            return res.status(400).json({ msg: `Screen with name '${name}' already exists in this theatre.` });
        }

        const newScreen = new Screen({ theatre_id: theatreId, name });
        await newScreen.save();

        // Automatically create a default SeatTemplate for this new screen
        const seatTemplateId = `template_screen_${newScreen.name.replace(/\s/g, '_').toLowerCase()}_${newScreen._id}`; // Unique ID
        const newSeatTemplate = new SeatTemplate({
            _id: seatTemplateId,
            screen_id: newScreen._id,
            seats: generateStandardSeatLayout() // Use the standard layout
        });
        await newSeatTemplate.save();
        console.log(`Created default SeatTemplate '${seatTemplateId}' for new screen ${newScreen.name}`);


        res.status(201).json(newScreen);
    } catch (err) {
        console.error('Error in createScreen:', err.message);
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: errors.join(', ') });
        }
        res.status(500).send('Server Error');
    }
};

// --- @route    PUT /api/theatres/:theatreId/screens/:screenId
// --- @desc     Update a screen (Admin only)
// --- @access   Private (Admin)
exports.updateScreen = async (req, res) => {
    const { name } = req.body;
    const { theatreId, screenId } = req.params;
    try {
        // Verify theatre exists
        const theatre = await Theatre.findById(theatreId);
        if (!theatre) {
            return res.status(404).json({ msg: 'Theatre not found.' });
        }

        let screen = await Screen.findOne({ _id: screenId, theatre_id: theatreId });
        if (!screen) {
            return res.status(404).json({ msg: 'Screen not found in this theatre.' });
        }

        // Check for duplicate screen name within this theatre if name is changed
        if (name && name !== screen.name) {
            const existingScreen = await Screen.findOne({ theatre_id: theatreId, name });
            if (existingScreen) {
                return res.status(400).json({ msg: `Screen with name '${name}' already exists in this theatre.` });
            }
        }

        if (name !== undefined) screen.name = name;
        await screen.save();

        res.json(screen);
    } catch (err) {
        console.error('Error in updateScreen:', err.message);
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: errors.join(', ') });
        }
        if (err.code === 11000) { // Duplicate name in compound index
            return res.status(400).json({ msg: 'Screen name already exists in this theatre.' });
        }
        res.status(500).send('Server Error');
    }
};

// --- @route    DELETE /api/theatres/:theatreId/screens/:screenId
// --- @desc     Delete a screen (Admin only)
// --- @access   Private (Admin)
exports.deleteScreen = async (req, res) => {
    const { theatreId, screenId } = req.params;
    try {
        // Verify theatre exists
        const theatre = await Theatre.findById(theatreId);
        if (!theatre) {
            return res.status(404).json({ msg: 'Theatre not found.' });
        }

        const screen = await Screen.findOne({ _id: screenId, theatre_id: theatreId });
        if (!screen) {
            return res.status(404).json({ msg: 'Screen not found in this theatre.' });
        }

        // IMPORTANT: Also delete associated SeatTemplate, Shows, ShowSeats, and potentially Bookings!
        await SeatTemplate.deleteOne({ screen_id: screen._id });
        console.log(`Deleted SeatTemplate for screen ${screen._id}`);

        // You'd need a more robust cascade deletion for shows/bookings/showseats related to this screen.
        // For simplicity here, just log a warning.
        console.warn(`Deleting screen ${screen.name}. Associated shows, showseats, and bookings might become orphaned.`);

        await Screen.deleteOne({ _id: screenId });
        res.json({ msg: 'Screen removed successfully.' });
    } catch (err) {
        console.error('Error in deleteScreen:', err.message);
        res.status(500).send('Server Error');
    }
};