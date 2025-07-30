// backend/scripts/migrate-data.js
const mongoose = require('mongoose');
const connectDB = require('../config/db'); // Your DB connection
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Import all your Mongoose models
const User = require('../models/User');
const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const Movie = require('../models/Movie');
const MovieGenre = require('../models/MovieGenre');
const MovieFormat = require('../models/MovieFormat');
const MovieCategory = require('../models/MovieCategory');
const Offer = require('../models/Offer');
const Show = require('../models/Show');
// const Snack = require('../models/Snack'); // Assuming you created this model (commented out as per user's choice)
const Booking = require('../models/Booking');
const BookingOffer = require('../models/BookingOffer');
const Payment = require('../models/Payment');
const SeatOperation = require('../models/SeatOperation');
const Banner = require('../models/Banner');
const SeatTemplate = require('../models/SeatTemplate');
const ShowSeat = require('../models/ShowSeat');

// Load your mock data (assuming it's in a file named 'mock-data.json' in the backend root)
const mockDataPath = path.join(__dirname, '../../mock-data.json'); // Corrected path: go up two levels
let mockData;
try {
    mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf-8'));
    console.log('Mock data loaded successfully.');
} catch (error) {
    console.error('Error loading mock data:', error.message);
    process.exit(1);
}

// Function to generate standard seat layout (A-K, 1-18)
const generateSeatLayout = () => {
    const seats = [];
    const rows = 'ABCDEFGHIJK'; // A to K (11 rows)
    const seatsPerRow = 18;

    for (let i = 0; i < rows.length; i++) {
        const rowChar = rows[i];
        const seatType = (rowChar === 'K') ? 'premium' : 'normal';
        const priceMultiplier = (rowChar === 'K') ? 1.5 : 1.0; // Assuming premium seats are 1.5x normal price

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


const migrateData = async () => {
    await connectDB();
    console.log('Starting data migration...');

    try {
        // --- 0. Clear existing data (optional, but good for fresh runs) ---
        console.log('Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            Theatre.deleteMany({}),
            Screen.deleteMany({}),
            Movie.deleteMany({}),
            MovieGenre.deleteMany({}),
            MovieFormat.deleteMany({}),
            MovieCategory.deleteMany({}),
            Offer.deleteMany({}),
            Show.deleteMany({}),
            // Snack.deleteMany({}), // Removed as per user's choice
            Booking.deleteMany({}),
            BookingOffer.deleteMany({}),
            Payment.deleteMany({}),
            SeatOperation.deleteMany({}),
            Banner.deleteMany({}),
            SeatTemplate.deleteMany({}),
            ShowSeat.deleteMany({}),
        ]);
        console.log('Existing data cleared.');

        // --- Maps to hold old mock IDs to new Mongoose ObjectIds/IDs for relationships ---
        const usersMap = new Map();
        const theatresMap = new Map();
        const screensMap = new Map();
        const moviesMap = new Map(); // mock_id (string) -> mongo_id (string)
        const offersMap = new Map();
        const showsMap = new Map(); // mock_id (number) -> mongo_doc
        const bookingsMap = new Map();

        // --- 1. Migrate Users ---
        const salt = await bcrypt.genSalt(10);
        for (const mockUser of mockData.users) {
            const hashedPassword = mockUser.password ? await bcrypt.hash(mockUser.password, salt) : undefined;
            const newUser = new User({
                _id: new mongoose.Types.ObjectId(),
                name: mockUser.name,
                email: mockUser.email || undefined,
                phone: mockUser.phone,
                password: hashedPassword,
                role: mockUser.role,
                otp: mockUser.otp || undefined,
                otp_expiry: mockUser.otp_expiry ? new Date(mockUser.otp_expiry) : undefined,
                is_verified: mockUser.is_verified,
                created_at: mockUser.created_at ? new Date(mockUser.created_at) : new Date(),
                dob: mockUser.dob ? new Date(mockUser.dob) : undefined 

            });
            await newUser.save();
            usersMap.set(mockUser.id, newUser._id);
            console.log(`Migrated user: ${newUser.phone} (${newUser.email || 'N/A'})`);
        }

        // --- 2. Migrate Theatre and Screens ---
        for (const mockTheatre of mockData.theatres) {
            const newTheatre = new Theatre({
                _id: new mongoose.Types.ObjectId(),
                name: mockTheatre.name,
                location: mockTheatre.location,
                contact: mockTheatre.contact,
                is_active: mockTheatre.is_active,
                created_at: mockTheatre.created_at ? new Date(mockTheatre.created_at) : new Date()
            });
            await newTheatre.save();
            theatresMap.set(mockTheatre.id, newTheatre._id);
            console.log(`Migrated theatre: ${newTheatre.name}`);

            const standardSeatLayout = generateSeatLayout();
            for (const mockScreen of mockData.screens.filter(s => s.theatre_id === mockTheatre.id)) {
                const newScreen = new Screen({
                    _id: new mongoose.Types.ObjectId(),
                    theatre_id: newTheatre._id,
                    name: mockScreen.name
                });
                await newScreen.save();
                screensMap.set(mockScreen.id, newScreen._id);
                console.log(`Migrated screen: ${newScreen.name} for ${newTheatre.name}`);

                const seatTemplateId = `template_screen_${newScreen.name.replace(/\s/g, '_').toLowerCase()}`;
                const newSeatTemplate = new SeatTemplate({
                    _id: seatTemplateId,
                    screen_id: newScreen._id,
                    seats: standardSeatLayout
                });
                await newSeatTemplate.save();
                console.log(`Created default seat template '${seatTemplateId}' for ${newScreen.name}`);
            }
        }

        // --- 3. Migrate Movies ---
        for (const mockMovie of mockData.movies) {
            const newMovie = new Movie({
                _id: mockMovie.id, // Retain custom string ID (e.g., 'M001')
                title: mockMovie.title,
                poster: mockMovie.poster,
                rating: mockMovie.rating,
                language: mockMovie.language,
                duration: mockMovie.duration,
                synopsis: mockMovie.synopsis
            });
            await newMovie.save();
            moviesMap.set(mockMovie.id, newMovie._id); // Store for future reference if needed
            console.log(`Migrated movie: ${newMovie.title}`);
        }

        // --- 3a. Migrate MovieGenres (from top-level movie_genres array) ---
        if (mockData.movie_genres && Array.isArray(mockData.movie_genres)) {
            for (const mockGenre of mockData.movie_genres) {
                if (moviesMap.has(mockGenre.movie_id)) { // Ensure movie exists
                    const newMovieGenre = new MovieGenre({ movie_id: mockGenre.movie_id, genre: mockGenre.genre }); // Use mock ID for movie_id
                    await newMovieGenre.save();
                    console.log(`  -> Added genre: ${mockGenre.genre} for movie ${mockGenre.movie_id}`);
                } else {
                    console.warn(`Movie ID ${mockGenre.movie_id} not found for movie genre ${mockGenre.genre}. Skipping.`);
                }
            }
        } else {
            console.warn(`No movie_genres array found or it's invalid in mock data.`);
        }

        // --- 3b. Migrate MovieFormats (from top-level movie_formats array) ---
        if (mockData.movie_formats && Array.isArray(mockData.movie_formats)) {
            for (const mockFormat of mockData.movie_formats) {
                if (moviesMap.has(mockFormat.movie_id)) { // Ensure movie exists
                    const newMovieFormat = new MovieFormat({ movie_id: mockFormat.movie_id, format: mockFormat.format }); // Use mock ID for movie_id
                    await newMovieFormat.save();
                    console.log(`  -> Added format: ${mockFormat.format} for movie ${mockFormat.movie_id}`);
                } else {
                    console.warn(`Movie ID ${mockFormat.movie_id} not found for movie format ${mockFormat.format}. Skipping.`);
                }
            }
        } else {
            console.warn(`No movie_formats array found or it's invalid in mock data.`);
        }

        // --- 3c. Migrate MovieCategories (from top-level movie_categories array) ---
        if (mockData.movie_categories && Array.isArray(mockData.movie_categories)) {
            for (const mockCategory of mockData.movie_categories) {
                if (moviesMap.has(mockCategory.movie_id)) {
                    const newCategory = new MovieCategory({
                        movie_id: mockCategory.movie_id, // Use actual Movie._id string (which is the mock ID)
                        category: mockCategory.category
                    });
                    await newCategory.save();
                    console.log(`  -> Added category: ${mockCategory.category} for movie ${mockCategory.movie_id}`);
                } else {
                    console.warn(`Movie ID ${mockCategory.movie_id} not found for movie category. Skipping.`);
                }
            }
        } else {
            console.warn(`No movie_categories array found or it's invalid in mock data.`);
        }


        // --- 4. Migrate Offers ---
        for (const mockOffer of mockData.offers) {
            const newOffer = new Offer({
                _id: new mongoose.Types.ObjectId(),
                code: mockOffer.code,
                title: mockOffer.title,
                discount_type: mockOffer.discount_type,
                discount_value: mockOffer.discount_value,
                min_amount: mockOffer.min_amount,
                max_discount: mockOffer.max_discount,
                valid_from: new Date(mockOffer.valid_from),
                valid_to: new Date(mockOffer.valid_to),
                is_active: mockOffer.is_active,
                created_at: mockOffer.created_at ? new Date(mockOffer.created_at) : new Date()
            });
            await newOffer.save();
            offersMap.set(mockOffer.id, newOffer._id);
            console.log(`Migrated offer: ${newOffer.title}`);
        }

        // --- 5. Migrate Snack Items (if you have them) ---
        // You've included snack_items array in your mock data, but your backend/src/models/Snack.js is commented out.
        // If you intend to use a separate Snack master list, uncomment backend/src/models/Snack.js
        // and then uncomment the following block. Otherwise, this mock data will not be migrated.
        if (mockData.snack_items && Array.isArray(mockData.snack_items) && typeof Snack !== 'undefined') { // Check if Snack model is imported
            for (const mockSnack of mockData.snack_items) {
                const newSnack = new Snack({
                    _id: new mongoose.Types.ObjectId(), // Generate ObjectId for Snacks
                    name: mockSnack.name,
                    description: mockSnack.description,
                    price: mockSnack.price,
                    is_active: mockSnack.is_active || true,
                    image_url: mockSnack.image_url || undefined,
                    created_at: mockSnack.created_at ? new Date(mockSnack.created_at) : new Date()
                });
                await newSnack.save();
                console.log(`Migrated snack: ${newSnack.name}`);
            }
        } else if (mockData.snack_items && Array.isArray(mockData.snack_items) && typeof Snack === 'undefined') {
            console.warn("Snack items exist in mock data but Snack model is not imported/defined. Skipping snack items migration.");
        }


        // --- 6. Migrate Shows and Generate Initial ShowSeat Documents ---
        for (const mockShow of mockData.shows) {
            const screenObjectId = screensMap.get(mockShow.screen_id);
            if (!screenObjectId) {
                console.warn(`Screen ID ${mockShow.screen_id} not found for show ${mockShow.id}. Skipping.`);
                continue;
            }

            const showDateTime = new Date(mockShow.show_datetime);
            const showSeatId = `show_seats_${mockShow.id}`; // Use mockShow.id here, since it becomes newShow._id

            const newShow = new Show({
                _id: mockShow.id,
                movie_id: mockShow.movie_id,
                screen_id: screenObjectId,
                show_datetime: showDateTime,
                normal_price: mockShow.normal_price,
                premium_price: mockShow.premium_price,
                seating_layout_id: showSeatId, // Assign it here!
                is_active: mockShow.is_active
            });
            await newShow.save();
            showsMap.set(mockShow.id, newShow);


            const seatTemplate = await SeatTemplate.findOne({ screen_id: screenObjectId });
            if (seatTemplate) {
                const initialSeats = seatTemplate.seats.map(seat => ({
                    seat_number: seat.seat_number,
                    seat_type: seat.seat_type,
                    status: 'available',
                    booking_id: null
                }));

                const newShowSeat = new ShowSeat({
                    _id: showSeatId,
                    show_id: newShow._id,
                    screen_id: screenObjectId,
                    seats: initialSeats
                });
                await newShowSeat.save();
                console.log(`Created ShowSeat layout '${showSeatId}' for show ${newShow._id}`);
            } else {
                console.warn(`No seat template found for screen ${mockShow.screen_id}. ShowSeat not created for show ${newShow._id}.`);
            }
        }

        // --- 7. Migrate Bookings, BookingOffers, Payments ---
        for (const mockBooking of mockData.bookings) {
            const userObjectId = usersMap.get(mockBooking.user_id);
            if (!userObjectId) {
                console.warn(`User ID ${mockBooking.user_id} not found for booking ${mockBooking.id}. Skipping.`);
                continue;
            }
            const showDoc = showsMap.get(mockBooking.show_id);
            if (!showDoc) {
                console.warn(`Show ID ${mockBooking.show_id} not found for booking ${mockBooking.id}. Skipping.`);
                continue;
            }

            let totalSnacksPrice = 0;
            const snacksForBooking = (mockBooking.snacks_items || []).map(snack => {
                const total = snack.quantity * snack.price_per_item;
                totalSnacksPrice += total;
                return {
                    name: snack.name,
                    quantity: snack.quantity,
                    price_per_item: snack.price_per_item,
                    total_price: total
                };
            });

            let calculatedBaseAmount = (mockBooking.seats_booked || []).reduce((sum, seat) => sum + seat.price_at_booking, 0);

            const calculatedFinalAmount = calculatedBaseAmount + totalSnacksPrice + (mockBooking.parking_charges || 0) + (mockBooking.convenience_fee || 0) - (mockBooking.discount_applied || 0);

            const newBooking = new Booking({
                _id: new mongoose.Types.ObjectId(),
                user_id: userObjectId,
                show_id: mockBooking.show_id,
                seats_booked: mockBooking.seats_booked,
                base_amount: calculatedBaseAmount,
                snacks_items: snacksForBooking,
                parking_charges: mockBooking.parking_charges || 0,
                convenience_fee: mockBooking.convenience_fee || 0,
                discount_applied: mockBooking.discount_applied || 0,
                final_amount: calculatedFinalAmount,
                status: mockBooking.status,
                created_at: mockBooking.created_at ? new Date(mockBooking.created_at) : new Date()
            });
            await newBooking.save();
            bookingsMap.set(mockBooking.id, newBooking._id);
            console.log(`Migrated booking: ${newBooking._id}`);

            const showSeatDoc = await ShowSeat.findOne({ show_id: mockBooking.show_id });
            if (showSeatDoc) {
                (mockBooking.seats_booked || []).forEach(bookedSeat => {
                    const showSeatEntry = showSeatDoc.seats.find(s => s.seat_number === bookedSeat.seat_number);
                    if (showSeatEntry) {
                        showSeatEntry.status = 'booked';
                        showSeatEntry.booking_id = newBooking._id;
                    } else {
                        console.warn(`Seat ${bookedSeat.seat_number} not found in ShowSeat document for show ${mockBooking.show_id}.`);
                    }
                });
                await showSeatDoc.save();
            } else {
                console.warn(`ShowSeat document for show ${mockBooking.show_id} not found when updating booked seats.`);
            }
        }

        for (const mockBookingOffer of mockData.booking_offers) {
            const bookingObjectId = bookingsMap.get(mockBookingOffer.booking_id);
            const offerObjectId = offersMap.get(mockBookingOffer.offer_id);
            if (!bookingObjectId || !offerObjectId) {
                console.warn(`Booking ID ${mockBookingOffer.booking_id} or Offer ID ${mockBookingOffer.offer_id} not found for booking offer. Skipping.`);
                continue;
            }
            const newBookingOffer = new BookingOffer({
                _id: new mongoose.Types.ObjectId(),
                booking_id: bookingObjectId,
                offer_id: offerObjectId,
                discount_amount: mockBookingOffer.discount_amount,
                created_at: mockBookingOffer.created_at ? new Date(mockBookingOffer.created_at) : new Date()
            });
            await newBookingOffer.save();
            console.log(`Migrated booking offer for booking: ${newBookingOffer.booking_id}`);
        }

        for (const mockPayment of mockData.payments) {
            const bookingObjectId = bookingsMap.get(mockPayment.booking_id);
            if (!bookingObjectId) {
                console.warn(`Booking ID ${mockPayment.booking_id} not found for payment ${mockPayment.id}. Skipping.`);
                continue;
            }
            const newPayment = new Payment({
                _id: new mongoose.Types.ObjectId(),
                booking_id: bookingObjectId,
                original_amount: mockPayment.original_amount,
                final_amount: mockPayment.final_amount,
                payment_method: mockPayment.payment_method,
                receipt_number: mockPayment.receipt_number || undefined,
                status: mockPayment.status,
                transaction_id: mockPayment.transaction_id || undefined,
                created_at: mockPayment.created_at ? new Date(mockPayment.created_at) : new Date()
            });
            await newPayment.save();
            console.log(`Migrated payment for booking: ${newPayment.booking_id}`);
        }

        // --- 8. Migrate SeatOperations ---
        for (const mockSeatOperation of mockData.seat_operations) {
            const adminObjectId = usersMap.get(mockSeatOperation.admin_id);
            if (!adminObjectId) {
                console.warn(`Admin ID ${mockSeatOperation.admin_id} not found for seat operation. Skipping.`);
                continue;
            }
            const showDoc = showsMap.get(mockSeatOperation.show_id);
            if (!showDoc) {
                console.warn(`Show ID ${mockSeatOperation.show_id} not found for seat operation ${mockSeatOperation.id}. Skipping.`);
                continue;
            }

            const newSeatOperation = new SeatOperation({
                _id: new mongoose.Types.ObjectId(),
                seat_id: mockSeatOperation.seat_id,
                admin_id: adminObjectId,
                action: mockSeatOperation.action,
                reason: mockSeatOperation.reason,
                show_id: showDoc._id,
                created_at: mockSeatOperation.created_at ? new Date(mockSeatOperation.created_at) : new Date()
            });
            await newSeatOperation.save();
            console.log(`Migrated seat operation: ${newSeatOperation._id} for show ${newSeatOperation.show_id}`);

            const showSeatDoc = await ShowSeat.findOne({ show_id: showDoc._id });
            if (showSeatDoc) {
                const targetSeat = showSeatDoc.seats.find(s => s.seat_number === mockSeatOperation.seat_id);
                if (targetSeat) {
                    targetSeat.status = (mockSeatOperation.action === 'block') ? 'blocked' : 'available';
                    targetSeat.booking_id = null;
                } else {
                    console.warn(`Seat ${mockSeatOperation.seat_id} not found in ShowSeat document for show ${showDoc._id} during seat operation update.`);
                }
                await showSeatDoc.save();
            } else {
                console.warn(`ShowSeat document for show ${showDoc._id} not found during seat operation update.`);
            }
        }

        // --- 9. Migrate Banners ---
        for (const mockBanner of mockData.banners) {
            const createdByObjectId = usersMap.get(mockBanner.created_by);
            if (!createdByObjectId) {
                console.warn(`Creator ID ${mockBanner.created_by} not found for banner. Setting 'created_by' to null/undefined.`);
            }
            const newBanner = new Banner({
                _id: new mongoose.Types.ObjectId(),
                title: mockBanner.title,
                target_url: mockBanner.target_url,
                image_url: mockBanner.image_url,
                position: mockBanner.position,
                is_active: mockBanner.is_active,
                start_date: new Date(mockBanner.start_date),
                end_date: new Date(mockBanner.end_date),
                created_by: createdByObjectId,
                created_at: mockBanner.created_at ? new Date(mockBanner.created_at) : new Date()
            });
            await newBanner.save();
            console.log(`Migrated banner: ${newBanner.title}`);
        }

        console.log('Data migration complete! No transaction was committed as it was disabled.');

    } catch (error) {
        console.error('Error during data migration:', error);
        console.error('Data might be partially migrated as transaction was disabled.');
        if (error.code === 11000) {
            console.error('Duplicate key error:', error.message);
            console.error('This often means you have duplicate _id values or unique field values in your mock data for a model.');
        }
        process.exit(1);
    } finally {
        mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
};

migrateData();