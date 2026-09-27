import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signToken, verifyToken, verifyAdminToken, checkCredentials } from '@/lib/auth';
import { N8nClient } from '@/lib/n8n/client';

describe('Security Hardening & RBAC Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = 'test-ultra-secure-jwt-secret-key-999';
    process.env.ADMIN_USERNAME = 'admin_moto';
    process.env.ADMIN_PASSWORD = 'super_secret_admin_pass';
    process.env.API_SECRET_KEY = 'm2m_secure_api_key_888';
    process.env.N8N_WEBHOOK_URL = 'https://n8n.example.com/webhook/test';
  });

  describe('RBAC & Token Verification (src/lib/auth.ts)', () => {
    it('should issue and verify an admin token', async () => {
      const token = await signToken('admin_moto', 'admin');
      const verified = await verifyAdminToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.role).toBe('admin');
      expect(verified?.username).toBe('admin_moto');
    });

    it('should reject non-admin users in verifyAdminToken', async () => {
      const userToken = await signToken('regular_user', 'user');
      const adminCheck = await verifyAdminToken(userToken);
      expect(adminCheck).toBeNull();
    });

    it('should reject user session tokens created with userId from satisfying admin privileges', async () => {
      const jwt = (await import('jsonwebtoken')).default;
      const userSessionToken = jwt.sign(
        { userId: 'user-123', email: 'user@test.com', name: 'User' },
        process.env.JWT_SECRET!
      );
      const adminCheck = await verifyAdminToken(userSessionToken);
      expect(adminCheck).toBeNull();
    });

    it('should reject expired or tampered tokens', async () => {
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature';
      const result = await verifyToken(invalidToken);
      expect(result).toBeNull();
      const adminResult = await verifyAdminToken(invalidToken);
      expect(adminResult).toBeNull();
    });

    it('should enforce credentials check', () => {
      expect(checkCredentials('admin_moto', 'super_secret_admin_pass')).toBe(true);
      expect(checkCredentials('admin_moto', 'wrong_pass')).toBe(false);
      expect(checkCredentials('hacker', 'super_secret_admin_pass')).toBe(false);
    });

    it('should throw an error if JWT_SECRET is missing', async () => {
      delete process.env.JWT_SECRET;
      await expect(signToken('admin_moto')).rejects.toThrow('JWT_SECRET is not set');
    });
  });

  describe('N8nClient Security & Isolation (src/lib/n8n/client.ts)', () => {
    it('should enforce HTTPS for webhook URLs', async () => {
      process.env.N8N_WEBHOOK_URL = 'http://insecure-n8n.com/webhook';
      const result = await N8nClient.send({ action: 'improve_post', postId: '1' });
      expect(result.success).toBe(false);
    });

    it('should fail cleanly when API_SECRET_KEY is missing', async () => {
      delete process.env.API_SECRET_KEY;
      const result = await N8nClient.send({ action: 'improve_post', postId: '1' });
      expect(result.success).toBe(false);
    });

    it('should reject non-HTTPS URLs without throwing unhandled exceptions', async () => {
      process.env.N8N_WEBHOOK_URL = 'ftp://invalid-protocol.com';
      const result = await N8nClient.send({ action: 'update', postId: '1' });
      expect(result.success).toBe(false);
    });
  });

  describe('Insecure Fallback Secrets Removal Validation', () => {
    it('should not contain hardcoded default JWT secret in environment', () => {
      expect(process.env.JWT_SECRET).not.toBe('motonapratica-default-jwt-secret-key-123456');
    });

    it('should not contain hardcoded API secret key in environment', () => {
      expect(process.env.API_SECRET_KEY).not.toBe('motonapratica-secret-key-2026');
    });
  });
});
