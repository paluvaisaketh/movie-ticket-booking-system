// backend/src/controllers/showController.js
const Show = require('../models/Show'); //
const Movie = require('../models/Movie'); //
const Screen = require('../models/Screen'); //
const SeatTemplate = require('../models/SeatTemplate'); //
const ShowSeat = require('../models/ShowSeat');     //

// Helper to get show details with populated movie and screen (for frontend display)
const getShowDetailsWithRelations = async (showId) => {
 const show = await Show.findById(showId).lean(); // .lean() for plain JS object

  if (!show) return null; //

   // Populate movie_details
     if (show.movie_id) { //
     const movie = await Movie.findById(show.movie_id).lean(); //
     show.movie_details = movie; //
    }

    // Populate screen_details
    if (show.screen_id) { //
     const screen = await Screen.findById(show.screen_id).lean(); //
     show.screen_details = screen; //
}
 return show; //
};

// --- @route    GET /api/shows
// --- @desc     Get all active shows (can add filters later)
// --- @access   Public
exports.getAllShows = async (req, res) => {
    try {
        let filter = { is_active: true }; // Only fetch active shows
        const shows = await Show.find(filter).sort({ show_datetime: 1 }); // Sort by datetime ascending

        const populatedShows = await Promise.all(
            shows.map(show => getShowDetailsWithRelations(show._id))
        ); //

        res.json(populatedShows); //
    } catch (err) {
        console.error('Error in getAllShows:', err.message); //
        res.status(500).send('Server Error'); //
    }
};

// --- @route    GET /api/shows/:id
// --- @desc     Get single show by ID
// --- @access   Public
exports.getShowById = async (req, res) => {
    try {
        const show = await getShowDetailsWithRelations(req.params.id); //
        if (!show) { //
            return res.status(404).json({ msg: 'Show not found' }); //
        }
        res.json(show); //
    } catch (err) {
        console.error('Error in getShowById:', err.message); //
        res.status(500).send('Server Error'); //
    }
};

// --- @route    POST /api/shows
// --- @desc     Create a new show (Admin only)
// --- @access   Private (Admin)
exports.createShow = async (req, res) => {
    const { _id, movie_id, screen_id, show_datetime, normal_price, premium_price, is_active } = req.body; //

    try {
        let show = await Show.findById(_id); //
        if (show) { //
            return res.status(400).json({ msg: `Show with ID ${_id} already exists.` }); //
        }

        const movieExists = await Movie.findById(movie_id); //
        const screenExists = await Screen.findById(screen_id); //
        if (!movieExists || !screenExists) { //
            return res.status(400).json({ msg: 'Invalid Movie or Screen ID provided.' }); //
        }

        // FIX: Generate seating_layout_id before the first save
        const newShowId = _id; // Use the ID sent from frontend
        const showSeatId = `show_seats_${newShowId}`;

        const newShow = new Show({
            _id: newShowId,
            movie_id: movie_id,
            screen_id: screen_id,
            show_datetime: new Date(show_datetime),
            normal_price,
            premium_price,
            seating_layout_id: showSeatId, // <--- Assign it here during creation
            is_active: is_active !== undefined ? is_active : true
        });

        await newShow.save(); // This save will now succeed

        // Generate initial ShowSeat document
        const seatTemplate = await SeatTemplate.findOne({ screen_id: screen_id }); //
        if (seatTemplate) { //
            const initialSeats = seatTemplate.seats.map(seat => ({
                seat_number: seat.seat_number,
                seat_type: seat.seat_type,
                status: 'available',
                booking_id: null
            }));

            const newShowSeat = new ShowSeat({
                _id: showSeatId,
                show_id: newShow._id,
                screen_id: newShow.screen_id,
                seats: initialSeats
            });
            await newShowSeat.save();
            // Note: The second save is now unnecessary as seating_layout_id is set above
            console.log(`Generated ShowSeat document for show ${newShow._id}`);
        } else { //
            console.warn(`No seat template found for screen ${screen_id}. ShowSeat not created for show ${newShow._id}.`); //
        }

        const populatedShow = await getShowDetailsWithRelations(newShow._id); //
        res.status(201).json(populatedShow); //

    } catch (err) {
        console.error('Error in createShow:', err.message); //
        if (err.code === 11000) { //
            return res.status(400).json({ msg: `Show with datetime ${show_datetime} on screen ${screen_id} already exists.` }); //
        }
        if (err.name === 'ValidationError') { //
            const errors = Object.values(err.errors).map(val => val.message); //
            return res.status(400).json({ msg: errors.join(', ') }); //
        }
        res.status(500).send('Server Error'); //
    }
};


// --- @route    PUT /api/shows/:id
// --- @desc     Update a show (Admin only)
// --- @access   Private (Admin)
exports.updateShow = async (req, res) => {
    const { movie_id, screen_id, show_datetime, normal_price, premium_price, is_active } = req.body;
    const { id } = req.params;

    try {
        const show = await Show.findById(id);
        if (!show) {
            return res.status(404).json({ msg: 'Show not found' });
        }

        // Update fields if provided in request body
        if (movie_id !== undefined) show.movie_id = movie_id;
        if (screen_id !== undefined) show.screen_id = screen_id;
        if (show_datetime !== undefined) show.show_datetime = new Date(show_datetime);
        if (normal_price !== undefined) show.normal_price = normal_price;
        if (premium_price !== undefined) show.premium_price = premium_price;
        if (is_active !== undefined) show.is_active = is_active;

        await show.save();

        const populatedShow = await getShowDetailsWithRelations(show._id);
        res.json(populatedShow);

    } catch (err) {
        console.error('Error in updateShow:', err.message);
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: errors.join(', ') });
        }
        if (err.code === 11000) { // Duplicate key error for compound index
            return res.status(400).json({ msg: 'A show with this movie, screen, and datetime already exists.' });
        }
        res.status(500).send('Server Error');
    }
};

// --- @route    DELETE /api/shows/:id
// --- @desc     Delete a show (Admin only)
// --- @access   Private (Admin)
exports.deleteShow = async (req, res) => {
    const { id } = req.params;
    try {
        const show = await Show.findById(id);
        if (!show) {
            return res.status(404).json({ msg: 'Show not found' });
        }

        // IMPORTANT: Handle cascading deletions or updates for related data
        // For example, any existing bookings for this show should be cancelled or marked
        // Also delete the associated ShowSeat document

        // Delete associated ShowSeat document
        await ShowSeat.deleteOne({ show_id: show._id });
        console.log(`Deleted associated ShowSeat document for show ${show._id}`);

        // Update associated Bookings (e.g., set status to cancelled or movie_unavailable)
        // await Booking.updateMany({ show_id: show._id }, { $set: { status: 'cancelled_by_admin' } });
        // console.log(`Updated status of bookings for show ${show._id}`);

        // Delete the show itself
        await Show.deleteOne({ _id: id });

        res.json({ msg: 'Show removed successfully and associated data cleaned up.' });
    } catch (err) {
        console.error('Error in deleteShow:', err.message);
        res.status(500).send('Server Error');
    }
};