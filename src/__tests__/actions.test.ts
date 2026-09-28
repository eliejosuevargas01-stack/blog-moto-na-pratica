import { describe, it, expect, vi, beforeEach } from 'vitest';

let mockToken: string | null = 'mocked_valid_token';

// Mocks
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn((name) => {
      if ((name === 'admin_token' || name === 'auth_token') && mockToken) {
        return { value: mockToken };
      }
      return null;
    }),
    set: vi.fn(),
    delete: vi.fn()
  }))
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn()
}));

vi.mock('../lib/db', () => ({
  prisma: {
    post: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    page: {
      findUnique: vi.fn()
    }
  }
}));

vi.mock('../lib/auth', () => ({
  signToken: vi.fn(() => 'mocked_token'),
  signAdminToken: vi.fn(async () => 'mocked_admin_token'),
  signUserToken: vi.fn(async () => 'mocked_user_token'),
  checkCredentials: vi.fn((u, p) => u === 'admin' && p === 'password'),
  verifyAdminToken: vi.fn(async (token) => {
    if (token === 'mocked_valid_token') return { username: 'admin', role: 'admin', tokenType: 'admin' };
    return null;
  }),
  verifyUserToken: vi.fn(async (token) => {
    if (token === 'mocked_valid_user_token') return { userId: '1', email: 'user@test.com', name: 'User', role: 'user', tokenType: 'user' };
    return null;
  }),
  verifyToken: vi.fn(async (token) => {
    if (token === 'mocked_valid_token') return { username: 'admin', role: 'admin' };
    return null;
  })
}));

import { loginAction, savePostAction, deletePostAction } from '../app/actions';
import { prisma } from '../lib/db';

describe('Actions Edge Cases (BAC & Lógica)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToken = 'mocked_valid_token';
  });

  describe('loginAction', () => {
    it('should fail with empty credentials', async () => {
      const formData = new FormData();
      const res = await loginAction({}, formData);
      expect(res).toEqual({ error: 'Por favor, preencha todos os campos.' });
    });

    it('should succeed with valid credentials', async () => {
      const formData = new FormData();
      formData.append('username', 'admin');
      formData.append('password', 'password');
      const res = await loginAction({}, formData);
      expect(res).toEqual({ success: true });
    });
  });

  describe('deletePostAction', () => {
    it('should deny access if token is invalid or missing (BAC Protection)', async () => {
      mockToken = null;
      await expect(deletePostAction(1)).rejects.toThrow('Unauthorized');
    });

    it('should delete post if authorized and post exists', async () => {
      (prisma.post.findUnique as any).mockResolvedValue({ id: '1', slug: 'test' });
      const res = await deletePostAction(1);
      expect(res).toEqual({ success: true });
      expect(prisma.post.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
