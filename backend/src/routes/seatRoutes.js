// src/routes/seatRoutes.js
const express = require('express');
const router = express.Router();
const ShowSeat = require('../models/ShowSeat'); 
const SeatOperation = require('../models/SeatOperation'); 
const admin = require('../middleware/adminMiddleware');
const auth = require('../middleware/authMiddleware');

router.get('/show/:showId', async (req, res) => {
    try {
        const showId = parseInt(req.params.showId, 10);
        if (isNaN(showId)) {
            return res.status(400).json({ msg: 'Invalid showId format. Must be a number.' });
        }
        
        const showSeatData = await ShowSeat.findOne({ show_id: showId });
        
        if (!showSeatData) {
            return res.status(404).json({ msg: 'Seats not found for this show.' });
        }
        
        res.json(showSeatData);
    } catch (err) {
        console.error('Error fetching show seats:', err.message);
        res.status(500).send('Server Error');
    }
});


router.post('/block', [auth, admin], async (req, res) => {
    const { show_id, seat_numbers, reason } = req.body;
    const adminId = req.user.id;

    if (!show_id || !seat_numbers || seat_numbers.length === 0 || !reason) {
        return res.status(400).json({ msg: 'Show ID, seat numbers, and reason are required.' });
    }

    try {
        const showSeatDoc = await ShowSeat.findOne({ show_id: show_id });

        if (!showSeatDoc) {
            return res.status(404).json({ msg: 'ShowSeat document not found.' });
        }

        const seatOperations = [];
        seat_numbers.forEach(seatNum => {
            const seat = showSeatDoc.seats.find(s => s.seat_number === seatNum);
            if (seat && seat.status === 'available') {
                seat.status = 'blocked';
                seat.booking_id = null;
                seatOperations.push({
                    seat_id: seat._id,
                    admin_id: adminId,
                    action: 'block',
                    reason: reason,
                    created_at: new Date(),
                    show_id: show_id // <-- FIX: ADDING SHOW_ID HERE
                });
            }
        });

        if (seatOperations.length > 0) {
            await showSeatDoc.save();
            await SeatOperation.insertMany(seatOperations);
            return res.json({ msg: `Successfully blocked ${seatOperations.length} seat(s).` });
        } else {
            return res.status(400).json({ msg: 'No available seats were selected to block.' });
        }

    } catch (err) {
        console.error('Error blocking seats:', err.message);
        res.status(500).send('Server Error');
    }
});


router.post('/unblock', [auth, admin], async (req, res) => {
    const { show_id, seat_numbers, reason } = req.body;
    const adminId = req.user.id;

    if (!show_id || !seat_numbers || seat_numbers.length === 0) {
        return res.status(400).json({ msg: 'Show ID and seat numbers are required.' });
    }
    
    try {
        const showSeatDoc = await ShowSeat.findOne({ show_id: show_id });

        if (!showSeatDoc) {
            return res.status(404).json({ msg: 'ShowSeat document not found.' });
        }

        const seatOperations = [];
        seat_numbers.forEach(seatNum => {
            const seat = showSeatDoc.seats.find(s => s.seat_number === seatNum);
            if (seat && seat.status === 'blocked') {
                seat.status = 'available';
                seatOperations.push({
                    seat_id: seat._id,
                    admin_id: adminId,
                    action: 'unblock',
                    reason: reason || 'Admin unblocked',
                    created_at: new Date(),
                    show_id: show_id // <-- FIX: ADDING SHOW_ID HERE
                });
            }
        });

        if (seatOperations.length > 0) {
            await showSeatDoc.save();
            await SeatOperation.insertMany(seatOperations);
            return res.json({ msg: `Successfully unblocked ${seatOperations.length} seat(s).` });
        } else {
            return res.status(400).json({ msg: 'No blocked seats were selected to unblock.' });
        }

    } catch (err) {
        console.error('Error unblocking seats:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;