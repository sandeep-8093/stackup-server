require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const rateLimit = require('express-rate-limit');

const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Route imports
const usersRouter = require('./src/router/users');
const profileRouter = require('./src/router/profile');
const postsRouter = require('./src/router/post');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Connect to Database ────────────────────────────────────────────────────
connectDB();

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:4200',              // Angular dev server
  'http://localhost:3000',              // fallback React/other local dev
  'https://stackup-server-sx4b.onrender.com', // production (self-reference/backend origin)
  'https://stackup-client.vercel.app'         // frontend Vercel deployment
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS policy: origin '${origin}' is not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── Rate Limiting ──────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // max 20 requests per window per IP
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Request Logging ────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Body Parsing ───────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Passport JWT ───────────────────────────────────────────────────────────
app.use(passport.initialize());
require('./src/config/passport')(passport);

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/users', authLimiter, usersRouter);   // Rate-limited auth routes
app.use('/api/profile', profileRouter);
app.use('/api/posts', postsRouter);

// Health check
app.get('/', (req, res) => res.json({ status: 'ok', message: 'stack-up API is running' }));

// ─── Global Error Handler ────────────────────────────────────────────────────
// Must be registered AFTER all routes
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
