import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signToken, verifyToken, checkCredentials } from '../lib/auth';
import jwt from 'jsonwebtoken';

describe('Auth Library Edge Cases', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  describe('signToken & verifyToken', () => {
    it('should sign and verify token successfully', async () => {
      process.env.JWT_SECRET = 'test-secret';
      const token = await signToken('admin');
      const verified = await verifyToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.username).toBe('admin');
    });

    it('should return null for invalid token signature', async () => {
      process.env.JWT_SECRET = 'test-secret';
      const token = await signToken('admin');
      process.env.JWT_SECRET = 'different-secret';
      const verified = await verifyToken(token);
      expect(verified).toBeNull();
    });

    it('should return null for malformed token', async () => {
      process.env.JWT_SECRET = 'test-secret';
      const verified = await verifyToken('malformed.token.here');
      expect(verified).toBeNull();
    });

    it('should support legacy jwt tokens with userId', async () => {
      process.env.JWT_SECRET = 'test-secret';
      const legacyToken = jwt.sign({ userId: 123, email: 'user@example.com' }, 'test-secret');
      const verified = await verifyToken(legacyToken);
      expect(verified).not.toBeNull();
      expect(verified?.username).toBe('user@example.com');
    });

    it('should return null for expired tokens', async () => {
      process.env.JWT_SECRET = 'test-secret';
      const expiredToken = jwt.sign(
        { username: 'admin', role: 'admin', tokenType: 'admin', exp: Math.floor(Date.now() / 1000) - 60 },
        'test-secret'
      );
      const verified = await verifyToken(expiredToken);
      expect(verified).toBeNull();
    });

    it('should verify in environments without Node.js crypto module (Edge Runtime simulation)', async () => {
      process.env.JWT_SECRET = 'test-secret';
      const token = await signToken('admin', 'admin');
      const verified = await verifyToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.role).toBe('admin');
      expect(verified?.username).toBe('admin');
    });
  });

  describe('checkCredentials', () => {
    it('should throw error if env vars are missing', () => {
      delete process.env.ADMIN_USERNAME;
      delete process.env.ADMIN_PASSWORD;
      expect(() => checkCredentials('admin', 'password')).toThrow('ADMIN_USERNAME or ADMIN_PASSWORD is not set');
    });

    it('should validate correct credentials', () => {
      process.env.ADMIN_USERNAME = 'admin';
      process.env.ADMIN_PASSWORD = 'password123';
      expect(checkCredentials('admin', 'password123')).toBe(true);
    });

    it('should invalidate wrong credentials', () => {
      process.env.ADMIN_USERNAME = 'admin';
      process.env.ADMIN_PASSWORD = 'password123';
      expect(checkCredentials('admin', 'wrong')).toBe(false);
    });
  });
});
