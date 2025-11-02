const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Pre-flight check for essential environment variables
if (!process.env.MONGO_URI) {
    console.error('\n\n--- FATAL ERROR: MISSING CONFIGURATION ---');
    console.error('The MONGO_URI is not defined in your .env file.');
    console.error('The backend server cannot start without a database connection string.');
    console.error('\nTo fix this:');
    console.error('1. In the "/backend" directory, create a copy of ".env.example" and rename it to ".env"');
    console.error('2. Open the new ".env" file and set the MONGO_URI to your MongoDB connection string.');
    console.error('3. Restart the server with "npm start".\n');
    process.exit(1);
}

if (!process.env.API_KEY || process.env.API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn('\n\n--- WARNING: AI FEATURES DISABLED ---');
    console.warn('The Gemini API_KEY is not configured in your .env file.');
    console.warn('The AI Assistant and other generative features will not work.');
    console.warn('To enable them, add your Google Gemini API key to the .env file.\n');
}


// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Fix: Replaced the previous manual CORS implementation with a more robust and standard one.
// This correctly handles pre-flight OPTIONS requests from the browser, which was the
// root cause of the 404 errors on specific routes like /api/posts.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS'
  );
  // Browsers send an OPTIONS request first to check the server's policy
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});


// Mount routers
app.use('/api', require('./routes/api'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));