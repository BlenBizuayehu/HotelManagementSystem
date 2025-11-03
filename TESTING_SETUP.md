# Testing Setup Guide
## Elysian Hotel Management System

This guide provides step-by-step instructions for setting up comprehensive testing infrastructure.

---

## Table of Contents

1. [Backend Testing Setup](#1-backend-testing-setup)
2. [Frontend Testing Setup](#2-frontend-testing-setup)
3. [E2E Testing Setup](#3-e2e-testing-setup)
4. [Test Examples](#4-test-examples)
5. [CI/CD Integration](#5-cicd-integration)

---

## 1. Backend Testing Setup

### 1.1 Install Dependencies

```bash
cd backend
npm install --save-dev jest @types/jest supertest mongodb-memory-server
```

### 1.2 Jest Configuration

**File:** `backend/jest.config.js`

```javascript
module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### 1.3 Test Database Setup

**File:** `backend/tests/setup.js`

```javascript
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
```

### 1.4 Example Unit Test - Auth Controller

**File:** `backend/tests/unit/controllers/authController.test.js`

```javascript
const request = require('supertest');
const app = require('../../../server');
const User = require('../../../models/User');

describe('Auth Controller', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Create test user
      const user = await User.create({
        username: 'testuser',
        password: 'password123',
        role: 'Manager',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.username).toBe('testuser');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should require username and password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
```

### 1.5 Example Unit Test - User Model

**File:** `backend/tests/unit/models/User.test.js`

```javascript
const User = require('../../../models/User');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const user = await User.create({
        username: 'testuser',
        password: 'password123',
        role: 'Manager',
      });

      expect(user.password).not.toBe('password123');
      expect(user.password).toHaveLength(60); // bcrypt hash length
    });

    it('should match password correctly', async () => {
      const user = await User.create({
        username: 'testuser',
        password: 'password123',
        role: 'Manager',
      });

      const isMatch = await user.matchPassword('password123');
      expect(isMatch).toBe(true);

      const isWrong = await user.matchPassword('wrongpassword');
      expect(isWrong).toBe(false);
    });
  });

  describe('Validation', () => {
    it('should require username', async () => {
      const user = new User({
        password: 'password123',
        role: 'Manager',
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should require unique username', async () => {
      await User.create({
        username: 'testuser',
        password: 'password123',
        role: 'Manager',
      });

      const duplicate = new User({
        username: 'testuser',
        password: 'password123',
        role: 'Manager',
      });

      await expect(duplicate.save()).rejects.toThrow();
    });
  });
});
```

### 1.6 Integration Test Example

**File:** `backend/tests/integration/api/bookings.test.js`

```javascript
const request = require('supertest');
const app = require('../../../server');
const User = require('../../../models/User');
const Booking = require('../../../models/Booking');
const Room = require('../../../models/Room');
const { generateToken } = require('../../../utils/jwt');

describe('Bookings API', () => {
  let authToken;
  let testUser;
  let testRoom;

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      username: 'testadmin',
      password: 'password123',
      role: 'Admin',
    });

    authToken = generateToken(testUser._id);

    // Create test room
    testRoom = await Room.create({
      name: 'Deluxe Suite',
      description: 'A beautiful suite',
      pricePerNight: 200,
      capacity: 2,
      imageUrls: ['https://example.com/image.jpg'],
      amenities: ['WiFi', 'TV'],
    });
  });

  describe('GET /api/bookings', () => {
    it('should get all bookings for authenticated user', async () => {
      await Booking.create({
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        guestPhone: '1234567890',
        itemName: 'Deluxe Suite',
        itemType: 'Room',
        checkIn: '2024-01-01',
        checkOut: '2024-01-05',
        status: 'Pending',
      });

      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/bookings')
        .expect(401);
    });
  });

  describe('POST /api/bookings', () => {
    it('should create a new booking', async () => {
      const bookingData = {
        guestName: 'Jane Doe',
        guestEmail: 'jane@example.com',
        guestPhone: '1234567890',
        itemName: 'Deluxe Suite',
        itemType: 'Room',
        checkIn: '2024-02-01',
        checkOut: '2024-02-05',
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.guestName).toBe(bookingData.guestName);
      expect(response.body.data.status).toBe('Pending');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
```

---

## 2. Frontend Testing Setup

### 2.1 Install Dependencies

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### 2.2 Vitest Configuration

**File:** `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.*',
        'dist/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

### 2.3 Test Setup File

**File:** `tests/setup.ts`

```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
```

### 2.4 Example Component Test

**File:** `tests/components/Toast.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Toast from '../../components/Toast';

describe('Toast Component', () => {
  it('should render success message', () => {
    const notification = {
      id: 1,
      message: 'Success message',
      type: 'success' as const,
    };

    const onDismiss = vi.fn();

    render(<Toast notification={notification} onDismiss={onDismiss} />);

    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('should call onDismiss when close button is clicked', async () => {
    const notification = {
      id: 1,
      message: 'Test message',
      type: 'info' as const,
    };

    const onDismiss = vi.fn();

    const { user } = render(
      <Toast notification={notification} onDismiss={onDismiss} />
    );

    const closeButton = screen.getByRole('button');
    await user.click(closeButton);

    expect(onDismiss).toHaveBeenCalledWith(1);
  });
});
```

### 2.5 Example Page Test

**File:** `tests/pages/LoginPage.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import LoginPage from '../../pages/LoginPage';
import { useAppContext } from '../../state/AppContext';

vi.mock('../../state/AppContext');

describe('LoginPage', () => {
  const mockNavigateTo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppContext as any).mockReturnValue({
      navigateTo: mockNavigateTo,
      login: vi.fn(),
    });
  });

  it('should render login form', () => {
    render(<LoginPage navigateTo={mockNavigateTo} />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should submit form with credentials', async () => {
    const mockLogin = vi.fn().mockResolvedValue({ success: true });
    (useAppContext as any).mockReturnValue({
      navigateTo: mockNavigateTo,
      login: mockLogin,
    });

    const user = userEvent.setup();
    render(<LoginPage navigateTo={mockNavigateTo} />);

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });
  });
});
```

---

## 3. E2E Testing Setup

### 3.1 Install Playwright

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### 3.2 Playwright Configuration

**File:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 3.3 E2E Test Example - Booking Flow

**File:** `tests/e2e/booking-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Guest Booking Flow', () => {
  test('should complete booking from landing page', async ({ page }) => {
    // Navigate to landing page
    await page.goto('/');

    // Select dates
    await page.fill('[data-testid="check-in"]', '2024-12-01');
    await page.fill('[data-testid="check-out"]', '2024-12-05');

    // Click on a room
    await page.click('[data-testid="room-card"]:first-child');

    // Verify detail page loaded
    await expect(page).toHaveURL(/\/detail/);
    await expect(page.locator('h1')).toBeVisible();

    // Fill booking form
    await page.fill('[name="guestName"]', 'John Doe');
    await page.fill('[name="guestEmail"]', 'john@example.com');
    await page.fill('[name="guestPhone"]', '1234567890');

    // Submit booking
    await page.click('button[type="submit"]');

    // Verify success message
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
  });
});
```

### 3.4 E2E Test Example - Admin Login

**File:** `tests/e2e/admin-login.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Admin Login', () => {
  test('should login and access dashboard', async ({ page }) => {
    await page.goto('/login');

    // Fill login form
    await page.fill('[name="username"]', 'admin');
    await page.fill('[name="password"]', 'password123');

    // Submit
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify dashboard elements
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('[data-testid="stat-card"]')).toHaveCount(4);
  });

  test('should show access denied for Manager accessing HR', async ({ page }) => {
    // Login as Manager
    await page.goto('/login');
    await page.fill('[name="username"]', 'manager');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Try to access HR page
    await page.goto('/hr');

    // Verify access denied message
    await expect(page.locator('h1')).toContainText('Access Denied');
  });
});
```

---

## 4. Test Examples

### 4.1 API Route Test Template

```javascript
describe('API Route: /api/resource', () => {
  describe('GET /api/resource', () => {
    it('should return resources', async () => {
      // Arrange
      // Act
      // Assert
    });
  });

  describe('POST /api/resource', () => {
    it('should create resource', async () => {
      // Test implementation
    });

    it('should validate input', async () => {
      // Test validation
    });
  });
});
```

### 4.2 Component Test Template

```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Test rendering
  });

  it('should handle user interaction', async () => {
    // Test interactions
  });

  it('should handle edge cases', () => {
    // Test edge cases
  });
});
```

---

## 5. CI/CD Integration

### 5.1 GitHub Actions Workflow

**File:** `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      - name: Run tests
        run: |
          cd backend
          npm test
      - name: Generate coverage
        run: |
          cd backend
          npm test -- --coverage

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Generate coverage
        run: npm test -- --coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run E2E tests
        run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 6. Package.json Scripts

### Backend

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

### Frontend

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 7. Test Coverage Goals

- **Unit Tests:** >80% coverage for critical modules
- **Integration Tests:** Cover all API endpoints
- **E2E Tests:** Cover critical user flows

### Critical Modules for High Coverage:
- Authentication (authController, User model)
- Booking (bookingController, Booking model)
- Payment (paymentController) - when implemented
- Authorization middleware

---

## 8. Running Tests

### Backend
```bash
cd backend
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage # With coverage
```

### Frontend
```bash
npm test              # Run unit tests
npm test:ui           # Visual test UI
npm test:e2e          # Run E2E tests
npm test:e2e:ui       # Visual E2E UI
```

---

## 9. Best Practices

1. **Write tests before fixing bugs** - Create failing test, then fix
2. **Keep tests independent** - Tests should not depend on each other
3. **Use descriptive test names** - "should login with valid credentials"
4. **Mock external dependencies** - Don't hit real APIs in tests
5. **Test edge cases** - Invalid input, empty data, errors
6. **Maintain test data** - Use factories/fixtures for test data
7. **Keep tests fast** - Use in-memory database for backend tests
8. **Review test coverage** - Aim for >80% on critical paths

---

## 10. Troubleshooting

### Common Issues

**Jest timeout errors:**
```javascript
jest.setTimeout(10000); // Increase timeout
```

**MongoDB connection errors in tests:**
- Ensure MongoMemoryServer is properly set up
- Check that cleanup happens after each test

**Playwright browser not found:**
```bash
npx playwright install
```

---

**Next Steps:**
1. Set up test infrastructure using this guide
2. Write tests for existing functionality
3. Add tests as you implement new features
4. Integrate with CI/CD pipeline
