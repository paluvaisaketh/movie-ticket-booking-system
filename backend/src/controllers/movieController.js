// // backend/src/controllers/movieController.js
// const Movie = require('../models/Movie');
// const MovieGenre = require('../models/MovieGenre');
// const MovieFormat = require('../models/MovieFormat');
// const MovieCategory = require('../models/MovieCategory');

// // --- Helper function to get movie details with genres/formats/categories ---
// // This function fetches a movie and then its related genres, formats, categories
// // It's used by getAllMovies and getMovieById to construct the full movie object for the frontend
// const getMovieDetailsWithRelations = async (movieId) => {
//     const movie = await Movie.findById(movieId);
//     if (!movie) return null;

//     // Fetch related data
//     const genres = await MovieGenre.find({ movie_id: movie._id }).select('genre -_id');
//     const formats = await MovieFormat.find({ movie_id: movie._id }).select('format -_id');
//     const categories = await MovieCategory.find({ movie_id: movie._id }).select('category -_id');

//     return {
//         ...movie.toJSON(), // Convert Mongoose document to plain JavaScript object
//         genre: genres.map(g => g.genre), // Attach genres as an array of strings
//         formats: formats.map(f => f.format), // Attach formats as an array of strings
//         categories: categories.map(c => c.category) // Attach categories as an array of strings
//     };
// };

// // --- @route    GET /api/movies
// // --- @desc     Get all movies (with genres, formats, categories)
// // --- @access   Public
// exports.getAllMovies = async (req, res) => {
//     try {
//         const movies = await Movie.find({}); // Fetch all movie documents
//         // For each movie, fetch its related genres, formats, and categories
//         const moviesWithDetails = await Promise.all(
//             movies.map(movie => getMovieDetailsWithRelations(movie._id))
//         );
//         res.json(moviesWithDetails);
//     } catch (err) {
//         console.error('Error in getAllMovies:', err.message);
//         res.status(500).send('Server Error');
//     }
// };

// // --- @route    GET /api/movies/:id
// // --- @desc     Get single movie by ID (with genres, formats, categories)
// // --- @access   Public
// exports.getMovieById = async (req, res) => {
//     try {
//         const movieDetails = await getMovieDetailsWithRelations(req.params.id);
//         if (!movieDetails) {
//             return res.status(404).json({ msg: 'Movie not found' });
//         }
//         res.json(movieDetails);
//     } catch (err) {
//         console.error('Error in getMovieById:', err.message);
//         res.status(500).send('Server Error');
//     }
// };

// // --- @route    POST /api/movies
// // --- @desc     Create a new movie (Admin only)
// // --- @access   Private (Admin)
// exports.createMovie = async (req, res) => {
//     // Frontend sends id (custom), title, poster, etc., plus genres, formats, categories arrays
//     const { id, title, poster, rating, language, duration, synopsis, genres, formats, categories } = req.body;

//     try {
//         // Check if movie ID (custom _id) already exists
//         let movie = await Movie.findById(id);
//         if (movie) {
//             return res.status(400).json({ msg: 'Movie with this ID already exists' });
//         }

//         // Create main movie document
//         movie = new Movie({ _id: id, title, poster, rating, language, duration, synopsis });
//         await movie.save();

//         // Create MovieGenre entries
//         if (genres && Array.isArray(genres)) {
//             const genreDocs = genres.map(g => ({ movie_id: movie._id, genre: g }));
//             await MovieGenre.insertMany(genreDocs);
//         }
//         // Create MovieFormat entries
//         if (formats && Array.isArray(formats)) {
//             const formatDocs = formats.map(f => ({ movie_id: movie._id, format: f }));
//             await MovieFormat.insertMany(formatDocs);
//         }
//         // Create MovieCategory entries
//         if (categories && Array.isArray(categories)) {
//             const categoryDocs = categories.map(c => ({ movie_id: movie._id, category: c }));
//             await MovieCategory.insertMany(categoryDocs);
//         }

//         // Return the newly created movie with its associated data
//         const movieDetails = await getMovieDetailsWithRelations(movie._id);
//         res.status(201).json(movieDetails);

//     } catch (err) {
//         console.error('Error in createMovie:', err.message);
//         // Handle duplicate key error if custom ID is not unique
//         if (err.code === 11000) {
//             return res.status(400).json({ msg: `Duplicate key error: A movie with ID '${id}' already exists.` });
//         }
//         // Handle validation errors from Mongoose
//         if (err.name === 'ValidationError') {
//             const errors = Object.values(err.errors).map(val => val.message);
//             return res.status(400).json({ msg: errors.join(', ') });
//         }
//         res.status(500).send('Server Error');
//     }
// };

// // --- @route    PUT /api/movies/:id
// // --- @desc     Update a movie (Admin only)
// // --- @access   Private (Admin)
// exports.updateMovie = async (req, res) => {
//     // Frontend sends updated fields, including full arrays for genres/formats/categories
//     const { title, poster, rating, language, duration, synopsis, genres, formats, categories } = req.body;

//     try {
//         const movie = await Movie.findById(req.params.id);
//         if (!movie) {
//             return res.status(404).json({ msg: 'Movie not found' });
//         }

//         // Update main movie fields
//         if (title !== undefined) movie.title = title;
//         if (poster !== undefined) movie.poster = poster;
//         if (rating !== undefined) movie.rating = rating;
//         if (language !== undefined) movie.language = language;
//         if (duration !== undefined) movie.duration = duration;
//         if (synopsis !== undefined) movie.synopsis = synopsis;
//         await movie.save();

//         // Update associated genres, formats, categories
//         // Strategy: Delete all existing entries for this movie and re-create them from the new arrays
//         // This is simpler for small numbers of associated items. For very large arrays, consider diffing.
//         if (genres !== undefined) { // Only update if 'genres' field was present in the request body
//             await MovieGenre.deleteMany({ movie_id: movie._id });
//             if (Array.isArray(genres) && genres.length > 0) {
//                 const genreDocs = genres.map(g => ({ movie_id: movie._id, genre: g }));
//                 await MovieGenre.insertMany(genreDocs);
//             }
//         }
//         if (formats !== undefined) { // Only update if 'formats' field was present in the request body
//             await MovieFormat.deleteMany({ movie_id: movie._id });
//             if (Array.isArray(formats) && formats.length > 0) {
//                 const formatDocs = formats.map(f => ({ movie_id: movie._id, format: f }));
//                 await MovieFormat.insertMany(formatDocs);
//             }
//         }
//         if (categories !== undefined) { // Only update if 'categories' field was present in the request body
//             await MovieCategory.deleteMany({ movie_id: movie._id });
//             if (Array.isArray(categories) && categories.length > 0) {
//                 const categoryDocs = categories.map(c => ({ movie_id: movie._id, category: c }));
//                 await MovieCategory.insertMany(categoryDocs);
//             }
//         }

//         // Return the updated movie with its associated data
//         const movieDetails = await getMovieDetailsWithRelations(movie._id);
//         res.json(movieDetails);

//     } catch (err) {
//         console.error('Error in updateMovie:', err.message);
//         if (err.name === 'ValidationError') {
//             const errors = Object.values(err.errors).map(val => val.message);
//             return res.status(400).json({ msg: errors.join(', ') });
//         }
//         res.status(500).send('Server Error');
//     }
// };

// // --- @route    DELETE /api/movies/:id
// // --- @desc     Delete a movie (Admin only)
// // --- @access   Private (Admin)
// exports.deleteMovie = async (req, res) => {
//     try {
//         const movie = await Movie.findById(req.params.id);
//         if (!movie) {
//             return res.status(404).json({ msg: 'Movie not found' });
//         }

//         // Delete associated genres, formats, categories first
//         await MovieGenre.deleteMany({ movie_id: movie._id });
//         await MovieFormat.deleteMany({ movie_id: movie._id });
//         await MovieCategory.deleteMany({ movie_id: movie._id });

//         // IMPORTANT CONSIDERATION FOR DELETION:
//         // What about related 'Show' documents? 'Booking' documents? 'ShowSeat' documents?
//         // Deleting a movie directly might leave orphaned data.
//         // For a robust system, you'd either:
//         // 1. Implement cascade delete (complex with Mongoose, usually manual in controllers).
//         // 2. Implement soft-delete (add 'is_deleted' flag to models).
//         // 3. Forbid deletion if related shows or bookings exist, or require deleting them first.
//         // For now, we'll just log a warning.

//         // Get all shows associated with this movie
//         const associatedShows = await Show.find({ movie_id: movie._id });

//         // Delete associated ShowSeat documents
//         const showSeatIdsToDelete = associatedShows.map(show => show.seating_layout_id);
//         if (showSeatIdsToDelete.length > 0) {
//             await ShowSeat.deleteMany({ _id: { $in: showSeatIdsToDelete } });
//             console.log(`Deleted ${showSeatIdsToDelete.length} associated ShowSeat documents for movie ${movie._id}`);
//         }

//         // Delete associated Show documents
//         if (associatedShows.length > 0) {
//             await Show.deleteMany({ movie_id: movie._id });
//             console.log(`Deleted ${associatedShows.length} associated Show documents for movie ${movie._id}`);
//         }

//         // Find and update bookings related to this movie (optional, depending on policy)
//         // Bookings typically persist, but you might want to mark them as 'movie_deleted' or similar
//         // For a hard delete, they would point to a non-existent movie_id.
//         // You might need to change related booking statuses or remove them.
//         // await Booking.updateMany({ movie_id: movie._id }, { $set: { status: 'movie_unavailable' } });


//         // Delete the movie itself
//         await Movie.deleteOne({ _id: req.params.id });

//         res.json({ msg: 'Movie removed successfully and associated data cleaned up.' });

//     } catch (err) {
//         console.error('Error in deleteMovie:', err.message);
//         res.status(500).send('Server Error');
//     }
// };


// backend/src/controllers/movieController.js
const Movie = require('../models/Movie');
const MovieGenre = require('../models/MovieGenre');
const MovieFormat = require('../models/MovieFormat');
const MovieCategory = require('../models/MovieCategory');
const Show = require('../models/Show'); // Imported for deleteMovie cascade
const ShowSeat = require('../models/ShowSeat'); // Imported for deleteMovie cascade

// --- Helper function to get movie details with genres/formats/categories ---
const getMovieDetailsWithRelations = async (movieId) => {
    const movie = await Movie.findById(movieId);
    if (!movie) return null;

    // Fetch related data
    const genres = await MovieGenre.find({ movie_id: movie._id }).select('genre -_id');
    const formats = await MovieFormat.find({ movie_id: movie._id }).select('format -_id');
    const categories = await MovieCategory.find({ movie_id: movie._id }).select('category -_id');

    return {
        ...movie.toJSON(), // Convert Mongoose document to plain JavaScript object
        genre: genres.map(g => g.genre), // Attach genres as an array of strings
        formats: formats.map(f => f.format), // Attach formats as an array of strings
        categories: categories.map(c => c.category) // Attach categories as an array of strings
    };
};

// --- @route    GET /api/movies
// --- @desc     Get all movies (with genres, formats, categories)
// --- @access   Public
exports.getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find({});
        const moviesWithDetails = await Promise.all(
            movies.map(movie => getMovieDetailsWithRelations(movie._id))
        );
        res.json(moviesWithDetails);
    } catch (err) {
        console.error('Error in getAllMovies:', err.message);
        res.status(500).send('Server Error');
    }
};

// --- @route    GET /api/movies/:id
// --- @desc     Get single movie by ID (with genres, formats, categories)
// --- @access   Public
exports.getMovieById = async (req, res) => {
    try {
        const movieDetails = await getMovieDetailsWithRelations(req.params.id);
        if (!movieDetails) {
            return res.status(404).json({ msg: 'Movie not found' });
        }
        res.json(movieDetails);
    } catch (err) {
        console.error('Error in getMovieById:', err.message);
        res.status(500).send('Server Error');
    }
};

// --- @route    POST /api/movies
// --- @desc     Create a new movie (Admin only)
// --- @access   Private (Admin)
exports.createMovie = async (req, res) => {
    const { id, title, poster, rating, language, duration, synopsis, genres, formats, categories } = req.body;

    try {
        let movie = await Movie.findById(id);
        if (movie) {
            return res.status(400).json({ msg: 'Movie with this ID already exists' });
        }

        movie = new Movie({ _id: id, title, poster, rating, language, duration, synopsis });
        await movie.save();

        if (genres && Array.isArray(genres)) {
            const genreDocs = genres.map(g => ({ movie_id: movie._id, genre: g }));
            await MovieGenre.insertMany(genreDocs);
        }
        if (formats && Array.isArray(formats)) {
            const formatDocs = formats.map(f => ({ movie_id: movie._id, format: f }));
            await MovieFormat.insertMany(formatDocs);
        }
        if (categories && Array.isArray(categories)) {
            const categoryDocs = categories.map(c => ({ movie_id: movie._id, category: c }));
            await MovieCategory.insertMany(categoryDocs);
        }

        const movieDetails = await getMovieDetailsWithRelations(movie._id);
        res.status(201).json(movieDetails);

    } catch (err) {
        console.error('Error in createMovie:', err.message);
        if (err.code === 11000) {
            return res.status(400).json({ msg: `Duplicate key error: A movie with ID '${id}' already exists.` });
        }
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: errors.join(', ') });
        }
        res.status(500).send('Server Error');
    }
};

// --- @route    PUT /api/movies/:id
// --- @desc     Update a movie (Admin only)
// --- @access   Private (Admin)
exports.updateMovie = async (req, res) => {
    const { title, poster, rating, language, duration, synopsis, genres, formats, categories } = req.body;

    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ msg: 'Movie not found' });
        }

        if (title !== undefined) movie.title = title;
        if (poster !== undefined) movie.poster = poster;
        if (rating !== undefined) movie.rating = rating;
        if (language !== undefined) movie.language = language;
        if (duration !== undefined) movie.duration = duration;
        if (synopsis !== undefined) movie.synopsis = synopsis;
        await movie.save();

        // Update associated genres, formats, categories: Delete all existing and re-create from new arrays
        if (genres !== undefined) {
            await MovieGenre.deleteMany({ movie_id: movie._id });
            if (Array.isArray(genres) && genres.length > 0) {
                const genreDocs = genres.map(g => ({ movie_id: movie._id, genre: g }));
                await MovieGenre.insertMany(genreDocs);
            }
        }
        if (formats !== undefined) {
            await MovieFormat.deleteMany({ movie_id: movie._id });
            if (Array.isArray(formats) && formats.length > 0) {
                const formatDocs = formats.map(f => ({ movie_id: movie._id, format: f }));
                await MovieFormat.insertMany(formatDocs);
            }
        }
        if (categories !== undefined) {
            await MovieCategory.deleteMany({ movie_id: movie._id });
            if (Array.isArray(categories) && categories.length > 0) {
                const categoryDocs = categories.map(c => ({ movie_id: movie._id, category: c }));
                await MovieCategory.insertMany(categoryDocs);
            }
        }

        const movieDetails = await getMovieDetailsWithRelations(movie._id);
        res.json(movieDetails);

    } catch (err) {
        console.error('Error in updateMovie:', err.message);
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: errors.join(', ') });
        }
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Duplicate key error.' });
        }
        res.status(500).send('Server Error');
    }
};

// --- @route    DELETE /api/movies/:id
// --- @desc     Delete a movie (Admin only)
// --- @access   Private (Admin)
exports.deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ msg: 'Movie not found' });
        }

        await MovieGenre.deleteMany({ movie_id: movie._id });
        await MovieFormat.deleteMany({ movie_id: movie._id });
        await MovieCategory.deleteMany({ movie_id: movie._id });

        // Get all shows associated with this movie
        const associatedShows = await Show.find({ movie_id: movie._id });

        // Delete associated ShowSeat documents
        const showSeatIdsToDelete = associatedShows.map(show => show.seating_layout_id);
        if (showSeatIdsToDelete.length > 0) {
            await ShowSeat.deleteMany({ _id: { $in: showSeatIdsToDelete } });
            console.log(`Deleted ${showSeatIdsToDelete.length} associated ShowSeat documents for movie ${movie._id}`);
        }

        // Delete associated Show documents
        if (associatedShows.length > 0) {
            await Show.deleteMany({ movie_id: movie._id });
            console.log(`Deleted ${associatedShows.length} associated Show documents for movie ${movie._id}`);
        }

        await Movie.deleteOne({ _id: req.params.id });

        res.json({ msg: 'Movie removed successfully and associated data cleaned up.' });

    } catch (err) {
        console.error('Error in deleteMovie:', err.message);
        res.status(500).send('Server Error');
    }
};