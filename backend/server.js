const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/db');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

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

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', // Vite dev server
  'https://hotel-management-system-n5yt-1zoc4fmst-blen-bizuayehus-projects.vercel.app',
  'https://hotel-management-system-n5yt-b67d3fv0b-blen-bizuayehus-projects.vercel.app',
  // Allow all Vercel preview deployments for this project
  /^https:\/\/hotel-management-system-n5yt-.*\.vercel\.app$/,
];


const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like curl or Postman)
    if (!origin) return callback(null, true);
    
    // Check if origin matches any allowed origin (string or regex)
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));


// Body parser (skip for webhook route)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Apply rate limiting to all API routes (except webhook)
app.use('/api', (req, res, next) => {
  if (req.path === '/payments/webhook') {
    return next();
  }
  apiLimiter(req, res, next);
});


// Mount routers
app.use('/api', require('./routes/api'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
