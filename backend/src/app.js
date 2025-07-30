// backend/src/app.js
const express = require('express');
const cors = require('cors');

// Import your route files
const authRoutes = require('./routes/authRoutes');
const theatreRoutes = require('./routes/theatreRoutes'); // Assuming you have these empty placeholders
const movieRoutes = require('./routes/movieRoutes');
const offerRoutes = require('./routes/offerRoutes');
const showRoutes = require('./routes/showRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const seatRoutes = require('./routes/seatRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes'); // <-- Add this line
const paymentRoutes = require('./routes/paymentRoutes');
// const snackRoutes = require('./routes/snackRoutes');

const app = express();

// Middleware
app.use(express.json()); // To parse JSON request bodies
app.use(cors());         // To allow cross-origin requests from your Angular frontend

// Define API Routes (mount them)
app.use('/api/auth', authRoutes);
app.use('/api/theatres', theatreRoutes); // Mount other routes as you implement them
app.use('/api/movies', movieRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes); // <-- Add this line
app.use('/api/payments', paymentRoutes); // <-- Add this lin
// app.use('/api/snacks', snackRoutes);

// Basic route for testing server (access via http://localhost:5000/)
app.get('/', (req, res) => {
    res.send('Movie Ticket Booking API is running!');
});

module.exports = app;