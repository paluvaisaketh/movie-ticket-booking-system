// backend/src/controllers/bookingController.js
const Booking = require('../models/Booking');
const Movie = require('../models/Movie'); // Needed for population
const Show = require('../models/Show');   // Needed for population and time check
const Screen = require('../models/Screen'); // Needed for population
const SeatOperation = require('../models/SeatOperation'); // For logging seat changes
const ShowSeat = require('../models/ShowSeat'); // Needed to update seat status
const mongoose = require('mongoose'); // Mongoose is still needed for other operations

// Helper to get booking details with populated references
const getBookingDetailsWithRelations = async (bookingId) => {
    const booking = await Booking.findById(bookingId)
        .populate('user_id', 'name email phone') // Populate user details
        .populate('show_id') // Populate show details
        .lean(); // Convert to plain JS object for easier manipulation

    if (!booking) return null;

    // Manually populate movie and screen details from the populated show
    const show = booking.show_id;
    if (show) {
        const movie = await Movie.findById(show.movie_id);
        const screen = await Screen.findById(show.screen_id);
        booking.show_id = { // Reconstruct show_id to include populated movie and screen
            ...show,
            movie_details: movie ? movie.toJSON() : null, // Attach full movie object
            screen_details: screen ? screen.toJSON() : null // Attach full screen object
        };
    }

    return booking;
};


// --- @route    GET /api/bookings/my
// --- @desc     Get all bookings for the logged-in user
// --- @access   Private (User)
exports.getUserBookings = async (req, res) => {
    try {
        // req.user.id is from authMiddleware
        const bookings = await Booking.find({ user_id: req.user.id }).sort({ created_at: -1 });

        // Populate details for each booking
        const populatedBookings = await Promise.all(
            bookings.map(booking => getBookingDetailsWithRelations(booking._id))
        );

        res.json(populatedBookings);
    } catch (err) {
        console.error('Error in getUserBookings:', err.message);
        res.status(500).send('Server Error');
    }
};

// --- @route    PUT /api/bookings/:id/status
// --- @desc     Cancel a full booking (update status to 'cancelled')
// --- @access   Private (User/Admin)
exports.cancelBooking = async (req, res) => {
    const { id: bookingId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        // Authorization: Only booking owner or admin can cancel
        if (booking.user_id.toString() !== userId && userRole !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized to cancel this booking' });
        }

        // Check if already cancelled or refunded
        if (booking.status === 'cancelled' || booking.status === 'refunded') {
            return res.status(400).json({ msg: 'Booking is already cancelled or refunded.' });
        }

        // Get associated show details for time check
        const show = await Show.findById(booking.show_id);
        if (!show) {
            return res.status(404).json({ msg: 'Associated show not found.' });
        }

        // 5-hour cancellation window check
        const fiveHoursBeforeShow = new Date(show.show_datetime.getTime() - (5 * 60 * 60 * 1000));
        if (new Date() >= fiveHoursBeforeShow && userRole !== 'admin') { // Admin can bypass time limit
            return res.status(400).json({ msg: 'Cancellation is only allowed up to 5 hours before the showtime.' });
        }

        // Update booking status
        booking.status = 'cancelled';
        await booking.save();

        // Update ShowSeat statuses: Mark all seats from this booking as 'available'
        const showSeatDoc = await ShowSeat.findOne({ show_id: booking.show_id });
        if (showSeatDoc) {
            booking.seats_booked.forEach(bookedSeat => {
                const seatInShowSeat = showSeatDoc.seats.find(s => s.seat_number === bookedSeat.seat_number);
                if (seatInShowSeat) {
                    seatInShowSeat.status = 'available';
                    seatInShowSeat.booking_id = null; // Clear booking reference
                }
            });
            await showSeatDoc.save();
        } else {
            console.warn(`ShowSeat document for show ${booking.show_id} not found during full cancellation.`);
        }

        // Log seat operations for each cancelled seat
        const seatOps = booking.seats_booked.map(seat => ({
            seat_id: seat.seat_number,
            admin_id: userId, // User performing cancellation (could be admin or user)
            action: 'unblock', // From system perspective, it's unblocked
            reason: 'Full booking cancelled by user/admin',
            show_id: booking.show_id
        }));
        await SeatOperation.insertMany(seatOps);

        res.json({ msg: 'Booking cancelled successfully.' });

    } catch (err) {
        console.error('Error in cancelBooking:', err.message);
        res.status(500).send('Server Error');
    }
};

// --- @route    PUT /api/bookings/:id/cancel-seats
// --- @desc     Partial cancellation of seats within a booking
// --- @access   Private (User/Admin)
exports.partialCancelBooking = async (req, res) => {
    const { id: bookingId } = req.params;
    const { seatsToCancel } = req.body; // Array of seat_numbers to cancel (e.g., ["A1", "A2"])
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!seatsToCancel || !Array.isArray(seatsToCancel) || seatsToCancel.length === 0) {
        return res.status(400).json({ msg: 'No seats provided for partial cancellation.' });
    }
    
    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found.' });
        }

        // Authorization: Only booking owner or admin can partially cancel
        if (booking.user_id.toString() !== userId && userRole !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized to modify this booking.' });
        }

        // Eligibility for partial cancellation (if user, must have > 5 tickets initially)
        if (booking.seats_booked.length <= 5 && userRole !== 'admin') {
            return res.status(400).json({ msg: 'Partial cancellation is only allowed for bookings with more than 5 tickets.' });
        }

        // Check if already fully cancelled/refunded
        if (booking.status === 'cancelled' || booking.status === 'refunded') {
            return res.status(400).json({ msg: 'This booking is already fully cancelled.' });
        }

        // Get associated show details for time check
        const show = await Show.findById(booking.show_id);
        if (!show) {
            return res.status(404).json({ msg: 'Associated show not found.' });
        }

        // 5-hour cancellation window check
        const fiveHoursBeforeShow = new Date(show.show_datetime.getTime() - (5 * 60 * 60 * 1000));
        if (new Date() >= fiveHoursBeforeShow && userRole !== 'admin') {
            return res.status(400).json({ msg: 'Cancellation is only allowed up to 5 hours before the showtime.' });
        }

        const newSeatsBooked = [];
        let refundedAmount = 0;
        const cancelledSeatNumbers = new Set(seatsToCancel);

        // Update booking's seats_booked array and calculate refund
        for (const seat of booking.seats_booked) {
            if (cancelledSeatNumbers.has(seat.seat_number)) {
                refundedAmount += seat.price_at_booking;
            } else {
                newSeatsBooked.push(seat);
            }
        }

        // Ensure at least one seat is being cancelled and not all seats are cancelled (use full cancel for that)
        if (refundedAmount === 0) {
            return res.status(400).json({ msg: 'No valid seats selected for cancellation.' });
        }
        if (newSeatsBooked.length === 0) {
            return res.status(400).json({ msg: 'To cancel all tickets, please use the full cancellation option.' });
        }

        // Update ShowSeat statuses
        const showSeatDoc = await ShowSeat.findOne({ show_id: booking.show_id });
        if (showSeatDoc) {
            showSeatDoc.seats.forEach(seatInShowSeat => {
                if (cancelledSeatNumbers.has(seatInShowSeat.seat_number)) {
                    seatInShowSeat.status = 'available';
                    seatInShowSeat.booking_id = null;
                }
            });
            await showSeatDoc.save();
        } else {
            console.warn(`ShowSeat document for show ${booking.show_id} not found during partial cancellation.`);
        }

        // Update Booking document
        booking.seats_booked = newSeatsBooked;
        booking.base_amount -= refundedAmount;
        booking.final_amount = booking.final_amount - refundedAmount; // Simple deduction, complex offers need recalculation
        booking.status = 'partially_cancelled'; // Mark as partially cancelled

        await booking.save();

        // Log seat operations for each cancelled seat
        const seatOps = seatsToCancel.map(seatNumber => ({
            seat_id: seatNumber,
            admin_id: userId,
            action: 'unblock',
            reason: 'Partial booking cancelled by user/admin',
            show_id: booking.show_id
        }));
        await SeatOperation.insertMany(seatOps);

        res.json({ msg: 'Seats cancelled successfully.', booking: await getBookingDetailsWithRelations(booking._id) });

    } catch (err) {
        console.error('Error in partialCancelBooking:', err.message);
        res.status(500).send('Server Error');
    }
};

// --- @route    GET /api/bookings/:id
// --- @desc     Get single booking by ID
// --- @access   Private (User/Admin)
exports.getBookingById = async (req, res) => {
    try {
        const booking = await getBookingDetailsWithRelations(req.params.id);
        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }
        // Ensure user can only view their own bookings unless they are admin
        if (booking.user_id._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized to view this booking' });
        }
        res.json(booking);
    } catch (err) {
        console.error('Error in getBookingById:', err.message);
        res.status(500).send('Server Error');
    }
};

// --- @route    POST /api/bookings
// --- @desc     Create a new booking
// --- @access   Private (User)
exports.createBooking = async (req, res) => {
    try {
        const userId = req.user.id;
        const { show_id, seat_numbers, snacks_items, parking_charges } = req.body;

        // --- 1. Basic Validation ---
        if (!show_id || !seat_numbers || !Array.isArray(seat_numbers) || seat_numbers.length === 0) {
            return res.status(400).json({ msg: 'Show ID and seat numbers are required.' });
        }

        // --- 2. Fetch Show and Seat details ---
        // Fetch show document
        const show = await Show.findById(show_id);
        if (!show) {
            return res.status(404).json({ msg: 'Show not found.' });
        }

        // Check if show is active and not in the past
        if (!show.is_active || new Date(show.show_datetime) < new Date()) {
            return res.status(400).json({ msg: 'Cannot book seats for this show.' });
        }

        // Fetch show seat document
        const showSeatDoc = await ShowSeat.findOne({ show_id });
        if (!showSeatDoc) {
            return res.status(404).json({ msg: 'Seat layout for this show not found.' });
        }

        // --- 3. Check Seat Availability and Calculate Pricing ---
        let baseAmount = 0;
        const seatsToBook = [];
        const unavailableSeats = [];

        for (const seatNumber of seat_numbers) {
            const seatInShowSeat = showSeatDoc.seats.find(s => s.seat_number === seatNumber);

            if (!seatInShowSeat || seatInShowSeat.status !== 'available') {
                unavailableSeats.push(seatNumber);
            } else {
                let seatPrice = show.normal_price;
                if (seatInShowSeat.seat_type === 'premium') {
                    seatPrice = show.premium_price;
                }

                seatsToBook.push({
                    seat_number: seatNumber,
                    seat_type: seatInShowSeat.seat_type,
                    price_at_booking: seatPrice
                });
                baseAmount += seatPrice;
            }
        }

        if (unavailableSeats.length > 0) {
            return res.status(409).json({ msg: `The following seats are no longer available: ${unavailableSeats.join(', ')}` });
        }

        // --- 4. Calculate Final Pricing (Snacks, Fees, etc.) ---
        let snacksItems = [];
        let snacksTotal = 0;
        if (snacks_items && Array.isArray(snacks_items) && snacks_items.length > 0) {
            // In a real app, you would fetch snack prices from a separate 'Snacks' model
            // For now, we'll use hardcoded prices
            const snackPriceMap = {
                'Popcorn': 150,
                'Coke': 80,
                'Nachos': 200,
            };

            for (const snack of snacks_items) {
                const price = snackPriceMap[snack.name];
                if (price) {
                    const totalPrice = price * snack.quantity;
                    snacksItems.push({
                        name: snack.name,
                        quantity: snack.quantity,
                        price_per_item: price,
                        total_price: totalPrice
                    });
                    snacksTotal += totalPrice;
                }
            }
        }

        const convenienceFee = Math.max(30, Math.round(baseAmount * 0.05));
        const finalAmount = baseAmount + convenienceFee + snacksTotal + (parking_charges || 0);

        // --- 5. Create Booking and Update Seats ---
        // Create the main Booking document
        const newBooking = new Booking({
            user_id: userId,
            show_id: show._id,
            seats_booked: seatsToBook,
            base_amount: baseAmount,
            snacks_items: snacksItems,
            parking_charges: parking_charges || 0,
            convenience_fee: convenienceFee,
            final_amount: finalAmount,
            status: 'confirmed' // Mark as confirmed on creation
        });
        await newBooking.save();

        // Update the status of the booked seats in the ShowSeat document
        showSeatDoc.seats.forEach(seatInShowSeat => {
            if (seat_numbers.includes(seatInShowSeat.seat_number)) {
                seatInShowSeat.status = 'booked';
                seatInShowSeat.booking_id = newBooking._id;
            }
        });
        await showSeatDoc.save();

        // --- 6. Respond with populated booking details ---
        const populatedBooking = await getBookingDetailsWithRelations(newBooking._id);
        res.status(201).json(populatedBooking);

    } catch (err) {
        console.error('Error in createBooking:', err.message);
        res.status(500).send('Server Error');
    }
};

// --- @route    GET /api/bookings (Admin only)
// --- @desc     Get all bookings for admin
// --- @access   Private (Admin)
exports.getAllBookingsAdmin = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ created_at: -1 });
        const populatedBookings = await Promise.all(
            bookings.map(booking => getBookingDetailsWithRelations(booking._id))
        );
        res.json(populatedBookings);
    } catch (err) {
        console.error('Error in getAllBookingsAdmin:', err.message);
        res.status(500).send('Server Error');
    }
};