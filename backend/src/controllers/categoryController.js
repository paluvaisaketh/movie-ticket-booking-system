// backend/src/controllers/categoryController.js
const MovieCategory = require('../models/MovieCategory');
const Movie = require('../models/Movie');

// Helper function to get all movies for a given category
const getMoviesInCategory = async (category) => {
    const categoryEntries = await MovieCategory.find({ category: category }).select('movie_id -_id');
    const movieIds = categoryEntries.map(entry => entry.movie_id);
    return movieIds;
};

// @route    GET /api/categories
// @desc     Get all movie categories and their movies
// @access   Public
exports.getAllCategories = async (req, res) => {
    try {
        // Find all unique categories
        const categories = await MovieCategory.distinct('category');
        
        const movieCategories = {};
        for (const category of categories) {
            const moviesInCat = await getMoviesInCategory(category);
            movieCategories[category] = moviesInCat;
        }

        res.json(movieCategories);
    } catch (err) {
        console.error('Error in getAllCategories:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route    POST /api/categories/:categoryName
// @desc     Add movies to a specific category (Admin only)
// @access   Private (Admin)
exports.addMoviesToCategory = async (req, res) => {
    const { categoryName } = req.params;
    const { movieIds } = req.body; // Array of movie IDs to add
    
    if (!movieIds || !Array.isArray(movieIds) || movieIds.length === 0) {
        return res.status(400).json({ msg: 'No movie IDs provided.' });
    }
    
    try {
        // Validate movie IDs
        const existingMovies = await Movie.find({ _id: { $in: movieIds } }).select('_id');
        const existingMovieIds = new Set(existingMovies.map(m => m._id.toString()));
        
        const validMovieIds = movieIds.filter(id => existingMovieIds.has(id));
        if (validMovieIds.length === 0) {
            return res.status(404).json({ msg: 'None of the provided movie IDs were found.' });
        }

        // Prepare documents for insertion
        const categoryEntries = validMovieIds.map(movieId => ({
            movie_id: movieId,
            category: categoryName
        }));

        // Insert documents, ignoring duplicates if they already exist
        // The unique compound index on movie_id and category will prevent errors
        await MovieCategory.insertMany(categoryEntries, { ordered: false, rawResult: true })
            .catch(err => {
                if (err.writeErrors) {
                    console.warn(`Some movies were already in the category. Skipped: ${err.writeErrors.length}`);
                } else {
                    throw err;
                }
            });

        const updatedCategory = await getMoviesInCategory(categoryName);
        res.json(updatedCategory);

    } catch (err) {
        console.error('Error in addMoviesToCategory:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route    DELETE /api/categories/:categoryName/movies/:movieId
// @desc     Remove a movie from a specific category (Admin only)
// @access   Private (Admin)
exports.removeMovieFromCategory = async (req, res) => {
    const { categoryName, movieId } = req.params;
    try {
        const result = await MovieCategory.deleteOne({ movie_id: movieId, category: categoryName });

        if (result.deletedCount === 0) {
            return res.status(404).json({ msg: 'Movie not found in this category' });
        }

        res.json({ msg: 'Movie removed from category successfully' });
    } catch (err) {
        console.error('Error in removeMovieFromCategory:', err.message);
        res.status(500).send('Server Error');
    }
};