const request = require('supertest');
const express = require('express');
const User = require('../../../models/User');
const { login, refreshToken, logout } = require('../../../controllers/authController');
const { protect } = require('../../../middleware/authMiddleware');

const app = express();
app.use(express.json());
app.post('/api/auth/login', login);
app.post('/api/auth/refresh', refreshToken);
app.post('/api/auth/logout', protect, logout);

describe('Auth Controller', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Create test user
      const user = await User.create({
        username: 'testuser',
        password: 'Password123!',
        role: 'Manager',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.user.username).toBe('testuser');
    });

    it('should reject invalid credentials', async () => {
      const user = await User.create({
        username: 'testuser',
        password: 'Password123!',
        role: 'Manager',
      });

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

    it('should lock account after 5 failed attempts', async () => {
      const user = await User.create({
        username: 'testuser',
        password: 'Password123!',
        role: 'Manager',
      });

      // Make 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            username: 'testuser',
            password: 'wrongpassword',
          });
      }

      // 6th attempt should be locked
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'Password123!',
        })
        .expect(423);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('locked');
    });
  });
});
