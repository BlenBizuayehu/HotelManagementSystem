# Security Implementation Guide
## Elysian Hotel Management System

This document provides step-by-step instructions and code examples for implementing critical security features.

---

## Table of Contents

1. [JWT Authentication](#1-jwt-authentication)
2. [Rate Limiting](#2-rate-limiting)
3. [Account Lockout](#3-account-lockout)
4. [Password Reset](#4-password-reset)
5. [Input Validation](#5-input-validation)
6. [CORS Configuration](#6-cors-configuration)
7. [Security Headers](#7-security-headers)
8. [Password Security](#8-password-security)

---

## 1. JWT Authentication

### 1.1 Install Dependencies

```bash
cd backend
npm install jsonwebtoken --save
npm install dotenv --save
```

### 1.2 Create JWT Utility

**File:** `backend/utils/jwt.js`

```javascript
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE,
  });
};

// Verify Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
};
```

### 1.3 Update User Model

**File:** `backend/models/User.js`

Add refresh token field:

```javascript
const UserSchema = new mongoose.Schema({
  // ... existing fields
  refreshToken: {
    type: String,
    select: false,
  },
  refreshTokenExpiry: {
    type: Date,
    select: false,
  },
});
```

### 1.4 Create Auth Middleware

**File:** `backend/middleware/authMiddleware.js`

```javascript
const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
```

### 1.5 Update Auth Controller

**File:** `backend/controllers/authController.js`

```javascript
const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../utils/jwt');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a username and password',
    });
  }

  try {
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        success: false,
        message: 'Account is locked. Please try again later.',
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      // Increment failed login attempts
      const updates = {
        $inc: { failedLoginAttempts: 1 },
      };

      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts + 1 >= 5) {
        updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 }; // 30 minutes
      }

      await User.findByIdAndUpdate(user._id, updates);

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Reset failed login attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await User.findByIdAndUpdate(user._id, {
        $set: { failedLoginAttempts: 0, lockUntil: null },
      });
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token required',
    });
  }

  try {
    const decoded = verifyToken(refreshToken);
    const user = await User.findById(decoded.id).select('+refreshToken +refreshTokenExpiry');

    if (!user || user.refreshToken !== refreshToken || user.refreshTokenExpiry < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.refreshToken = undefined;
    user.refreshTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
    });
  }
};
```

### 1.6 Update Routes

**File:** `backend/routes/api.js`

```javascript
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.route('/auth/login').post(login);
router.route('/auth/refresh').post(refreshToken);

// Protected routes
router.route('/bookings').get(protect, getBookings).post(protect, createBooking);

// Admin only routes
router.route('/employees').get(protect, authorize('Admin'), getEmployees);
router.route('/inventory').get(protect, authorize('Admin'), getInventory);
```

### 1.7 Update Frontend Context

**File:** `state/AppContext.tsx`

```typescript
// Store tokens
const login = async (username: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    setCurrentUser(data.user);
    setIsAuthenticated(true);
  }
};

// Add token to API requests
const apiCall = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};
```

---

## 2. Rate Limiting

### 2.1 Install Dependencies

```bash
npm install express-rate-limit --save
```

### 2.2 Create Rate Limiters

**File:** `backend/middleware/rateLimiter.js`

```javascript
const rateLimit = require('express-rate-limit');

// Strict limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for sensitive operations
const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
  sensitiveLimiter,
};
```

### 2.3 Apply Rate Limiters

**File:** `backend/server.js`

```javascript
const { authLimiter, apiLimiter } = require('./middleware/rateLimiter');

// Apply general limiter to all API routes
app.use('/api', apiLimiter);

// Apply auth limiter to login route
app.use('/api/auth/login', authLimiter);
```

---

## 3. Account Lockout

### 3.1 Update User Model

**File:** `backend/models/User.js`

```javascript
const UserSchema = new mongoose.Schema({
  // ... existing fields
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
  },
});

// Virtual to check if account is locked
UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});
```

See updated `authController.js` in section 1.5 for implementation.

---

## 4. Password Reset

### 4.1 Update User Model

**File:** `backend/models/User.js`

```javascript
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  // ... existing fields
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// Generate reset token
UserSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};
```

### 4.2 Create Password Reset Controller

**File:** `backend/controllers/authController.js`

```javascript
const crypto = require('crypto');

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      return res.status(200).json({
        success: true,
        message: 'If email exists, password reset link has been sent',
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Send email with reset token
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    // For now, log the URL (remove in production)
    console.log('Reset URL:', resetUrl);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500).json({
      success: false,
      message: 'Email could not be sent',
    });
  }
};

exports.resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token',
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
```

---

## 5. Input Validation

### 5.1 Install Dependencies

```bash
npm install express-validator --save
```

### 5.2 Create Validation Middleware

**File:** `backend/middleware/validator.js`

```javascript
const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors,
];

const validateBooking = [
  body('guestName')
    .trim()
    .notEmpty()
    .withMessage('Guest name is required')
    .isLength({ max: 100 })
    .withMessage('Guest name must be less than 100 characters'),
  body('guestEmail')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('guestPhone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone number format'),
  handleValidationErrors,
];

module.exports = {
  validateLogin,
  validateBooking,
  handleValidationErrors,
};
```

### 5.3 Apply Validation

**File:** `backend/routes/api.js`

```javascript
const { validateLogin, validateBooking } = require('../middleware/validator');

router.route('/auth/login').post(validateLogin, login);
router.route('/bookings').post(protect, validateBooking, createBooking);
```

---

## 6. CORS Configuration

### 6.1 Secure CORS Setup

**File:** `backend/server.js`

```javascript
const cors = require('cors');

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
```

---

## 7. Security Headers

### 7.1 Install Helmet

```bash
npm install helmet --save
```

### 7.2 Configure Security Headers

**File:** `backend/server.js`

```javascript
const helmet = require('helmet');

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
```

---

## 8. Password Security

### 8.1 Enhanced Password Requirements

**File:** `backend/models/User.js`

```javascript
// Add password strength validation
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  // Password strength requirements
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
  if (!passwordRegex.test(this.password)) {
    const error = new Error('Password must be at least 8 characters and contain uppercase, lowercase, number, and special character');
    return next(error);
  }

  const salt = await bcrypt.genSalt(12); // Increased salt rounds
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

---

## Environment Variables

Add to `.env`:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
NODE_ENV=production
```

---

## Testing Security Features

### Test JWT Authentication

```javascript
// Test invalid token
const response = await request(app)
  .get('/api/bookings')
  .set('Authorization', 'Bearer invalid-token')
  .expect(401);
```

### Test Rate Limiting

```javascript
// Make 6 requests to login endpoint
for (let i = 0; i < 6; i++) {
  await request(app).post('/api/auth/login').send({ username, password });
}
// 6th request should be rate limited
```

---

## Security Checklist

- [ ] JWT authentication implemented
- [ ] Refresh token rotation working
- [ ] Rate limiting on all endpoints
- [ ] Account lockout after failed attempts
- [ ] Password reset flow functional
- [ ] Input validation on all endpoints
- [ ] CORS properly configured
- [ ] Security headers set (Helmet)
- [ ] Password strength requirements enforced
- [ ] Secrets stored in environment variables
- [ ] HTTPS enforced in production
- [ ] Regular security audits scheduled

---

**Note:** This is a foundational security implementation. Additional security measures (MFA, WAF, DDoS protection) should be implemented based on production requirements.
