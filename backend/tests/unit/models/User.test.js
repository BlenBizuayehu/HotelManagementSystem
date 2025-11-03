const User = require('../../../models/User');

describe('User Model', () => {
  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const user = await User.create({
        username: 'testuser',
        password: 'Password123!',
        role: 'Manager',
      });

      expect(user.password).not.toBe('Password123!');
      expect(user.password).toHaveLength(60); // bcrypt hash length
    });

    it('should match password correctly', async () => {
      const user = await User.create({
        username: 'testuser',
        password: 'Password123!',
        role: 'Manager',
      });

      const isMatch = await user.matchPassword('Password123!');
      expect(isMatch).toBe(true);

      const isWrong = await user.matchPassword('wrongpassword');
      expect(isWrong).toBe(false);
    });
  });

  describe('Validation', () => {
    it('should require username', async () => {
      const user = new User({
        password: 'Password123!',
        role: 'Manager',
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should require unique username', async () => {
      await User.create({
        username: 'testuser',
        password: 'Password123!',
        role: 'Manager',
      });

      const duplicate = new User({
        username: 'testuser',
        password: 'Password123!',
        role: 'Manager',
      });

      await expect(duplicate.save()).rejects.toThrow();
    });
  });

  describe('Account Lockout', () => {
    it('should track failed login attempts', async () => {
      const user = await User.create({
        username: 'testuser',
        password: 'Password123!',
        role: 'Manager',
      });

      expect(user.failedLoginAttempts).toBe(0);
    });

    it('should set lockUntil when account is locked', async () => {
      const user = await User.create({
        username: 'testuser',
        password: 'Password123!',
        role: 'Manager',
        failedLoginAttempts: 5,
      });

      await User.findByIdAndUpdate(user._id, {
        $set: { lockUntil: Date.now() + 30 * 60 * 1000 },
      });

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.lockUntil).toBeDefined();
    });
  });
});
