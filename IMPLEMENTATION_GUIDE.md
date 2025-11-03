# Elysian Hotel Management System - Implementation Guide

**Quick Start Implementation Plan for Commercial Readiness**

---

## Immediate Priority Actions (Week 1-2)

### 1. Security Hardening

#### 1.1 JWT Authentication Implementation

**Current State:** Session-based authentication without tokens  
**Action Required:** Implement JWT tokens with refresh mechanism

**Steps:**
1. Install JWT library: `npm install jsonwebtoken --save` (backend)
2. Create middleware for JWT verification
3. Update auth controller to issue JWT tokens
4. Implement refresh token rotation
5. Add token expiration handling

**Files to Modify:**
- `backend/controllers/authController.js` - Add JWT token generation
- `backend/middleware/authMiddleware.js` - Create new middleware file
- `backend/routes/api.js` - Protect routes with auth middleware
- `state/AppContext.tsx` - Store tokens in localStorage
- Frontend API calls - Add Authorization headers

#### 1.2 Rate Limiting

**Action Required:** Protect API endpoints from abuse

**Steps:**
1. Install express-rate-limit: `npm install express-rate-limit --save`
2. Create rate limit middleware
3. Apply to authentication endpoints (stricter limits)
4. Apply to all API endpoints (general limits)

**Implementation:**
```javascript
// backend/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later'
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100 // 100 requests per window
});
```

#### 1.3 Account Lockout

**Action Required:** Prevent brute-force attacks

**Steps:**
1. Track failed login attempts in User model
2. Lock account after 5 failed attempts
3. Require admin unlock or time-based unlock (30 minutes)

**Implementation:**
- Add `failedLoginAttempts` and `lockUntil` fields to User model
- Update login controller to track attempts
- Add unlock mechanism

#### 1.4 Password Reset Flow

**Action Required:** Allow users to reset forgotten passwords

**Steps:**
1. Add password reset token field to User model
2. Create reset token generation endpoint
3. Create password reset endpoint
4. Build email template (requires email service)
5. Add frontend reset password pages

---

### 2. Testing Infrastructure Setup

#### 2.1 Unit Testing Setup

**Action Required:** Set up Jest/Vitest for unit tests

**Backend (Jest):**
```bash
cd backend
npm install --save-dev jest @types/jest supertest
```

**Frontend (Vitest):**
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

**Configuration Files:**
- `backend/jest.config.js`
- `vitest.config.ts` (frontend)

**Example Test Structure:**
```
/backend
  /tests
    /unit
      /controllers
        authController.test.js
        bookingController.test.js
      /models
        User.test.js
        Booking.test.js
    /integration
      /api
        auth.test.js
        bookings.test.js
```

#### 2.2 E2E Testing Setup

**Action Required:** Set up Playwright or Cypress

**Recommended: Playwright**
```bash
npm install --save-dev @playwright/test
npx playwright install
```

**Critical Test Scenarios:**
1. Guest booking flow (landing ? detail ? booking form)
2. Admin login ? dashboard ? manage booking
3. Manager login ? restricted access verification
4. AI Assistant interaction
5. Payment flow (once implemented)

---

### 3. Payment Integration Setup

#### 3.1 Stripe Integration

**Action Required:** Integrate Stripe payment gateway

**Steps:**
1. Install Stripe SDK: `npm install stripe --save` (backend)
2. Create Stripe account and get API keys
3. Create payment controller
4. Implement payment intents
5. Add webhook handling for payment events
6. Create frontend payment form component

**Files to Create:**
- `backend/controllers/paymentController.js`
- `backend/routes/payment.js`
- `components/PaymentForm.tsx`
- `pages/CheckoutPage.tsx`

**Security Considerations:**
- Never store raw card data
- Use Stripe Elements for secure card input
- Implement idempotency keys for payment requests
- Validate webhook signatures

#### 3.2 Booking Payment Flow

**Current State:** Bookings created with "Pending" status  
**Enhanced Flow:**
1. Guest submits booking request
2. Admin reviews and confirms
3. Guest receives payment link/request
4. Guest completes payment
5. Booking status changes to "Confirmed"
6. Payment receipt generated

---

### 4. CI/CD Pipeline Setup

#### 4.1 GitHub Actions Workflow

**Action Required:** Create automated CI/CD pipeline

**Create:** `.github/workflows/ci.yml`

**Pipeline Stages:**
1. **Lint:** Run ESLint on code
2. **Type Check:** Run TypeScript compiler
3. **Unit Tests:** Run backend and frontend unit tests
4. **Security Scan:** Run SAST tools (npm audit, Snyk)
5. **Build:** Build frontend and backend
6. **E2E Tests:** Run Playwright tests (optional in CI)
7. **Deploy:** Deploy to staging/production

**Example Workflow:**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

---

### 5. Monitoring & Logging Setup

#### 5.1 Structured Logging

**Action Required:** Implement structured JSON logging

**Install:** `npm install winston --save` (backend)

**Configuration:**
```javascript
// backend/config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

#### 5.2 Error Tracking

**Action Required:** Set up Sentry for error tracking

**Install:**
```bash
npm install @sentry/node @sentry/react --save
```

**Configuration:**
- Backend: Initialize Sentry in `server.js`
- Frontend: Initialize Sentry in `index.tsx`
- Configure error boundaries in React

#### 5.3 Basic Metrics

**Action Required:** Add Prometheus metrics endpoint

**Install:** `npm install prom-client --save`

**Implementation:**
- Create metrics middleware
- Track request counts, durations, errors
- Expose `/metrics` endpoint

---

### 6. Database Optimization

#### 6.1 Indexing Strategy

**Action Required:** Add indexes to frequently queried fields

**Critical Indexes:**
```javascript
// Booking model
bookingSchema.index({ checkIn: 1, checkOut: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ guestEmail: 1 });

// Room model
roomSchema.index({ name: 1 });

// User model
userSchema.index({ username: 1 }); // Already unique
```

#### 6.2 Query Optimization

**Action Required:** Review and optimize slow queries

**Tools:**
- MongoDB Compass query profiler
- Add `.explain()` to identify slow queries
- Use `.lean()` for read-only queries
- Implement pagination for large datasets

---

### 7. Frontend Performance

#### 7.1 Image Optimization

**Action Required:** Optimize images and implement lazy loading

**Steps:**
1. Convert images to WebP format
2. Implement responsive images (`srcset`)
3. Add lazy loading to images below fold
4. Use CDN for image delivery (future)

**Implementation:**
```tsx
// components/OptimizedImage.tsx
<img
  src={imageUrl}
  loading="lazy"
  alt={alt}
  srcSet={`${imageUrl}?w=400 400w, ${imageUrl}?w=800 800w`}
/>
```

#### 7.2 Code Splitting

**Action Required:** Implement route-based code splitting

**Implementation:**
```tsx
// Use React.lazy for route components
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const BookingsPage = React.lazy(() => import('./pages/BookingsPage'));

// Wrap with Suspense
<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

---

### 8. Documentation Setup

#### 8.1 API Documentation

**Action Required:** Generate OpenAPI/Swagger documentation

**Install:** `npm install swagger-jsdoc swagger-ui-express --save`

**Implementation:**
- Add JSDoc comments to API routes
- Generate Swagger spec
- Serve Swagger UI at `/api-docs`

#### 8.2 README Enhancement

**Action Required:** Add comprehensive setup and deployment guides

**Sections to Add:**
- Environment variables reference
- Database setup and migration
- Testing instructions
- Deployment guide
- Troubleshooting section

---

## Quick Wins (Can Be Done Immediately)

1. **Add ESLint Configuration**
   ```bash
   npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
   ```

2. **Add Prettier Configuration**
   ```bash
   npm install --save-dev prettier
   ```

3. **Add .env.example Files**
   - Document all required environment variables
   - Include example values

4. **Add Error Boundaries**
   - React error boundaries for frontend
   - Global error handler for backend

5. **Add Request Validation**
   - Use express-validator for input validation
   - Validate all user inputs

6. **Add API Response Standardization**
   - Consistent response format
   - Error response structure

---

## Testing Checklist

Before considering any feature "complete":

- [ ] Unit tests written and passing
- [ ] Integration tests cover API endpoints
- [ ] Manual testing completed
- [ ] Security review (for sensitive features)
- [ ] Performance tested (if applicable)
- [ ] Documentation updated
- [ ] Code reviewed

---

## Deployment Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] Security scan completed
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Error tracking setup
- [ ] SSL certificate installed
- [ ] Rate limiting enabled
- [ ] Documentation updated

---

## Next Steps

1. **Review this guide** with the team
2. **Prioritize** based on business needs
3. **Create tickets** for each implementation task
4. **Set up project board** (GitHub Projects, Jira, etc.)
5. **Begin with Security Hardening** (Week 1-2)
6. **Follow with Testing Infrastructure** (Week 3-4)
7. **Implement Payment Integration** (Week 5-6)

---

**Note:** This guide focuses on immediate improvements. Refer to `GAP_ANALYSIS.md` for comprehensive long-term roadmap.
