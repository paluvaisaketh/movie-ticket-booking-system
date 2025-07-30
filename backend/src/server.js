// backend/src/server.js
const app = require('./app');
const connectDB = require('./config/db');
require('dotenv').config();

// Connect to the MongoDB database
connectDB();

const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});