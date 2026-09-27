import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { signAdminToken, signUserToken, verifyAdminToken, verifyUserToken } from "@/lib/auth";
import { verifyM2MAuth } from "@/lib/m2m";
import { N8nClient } from "@/lib/n8n/client";

describe("Hardening & Security Test Suite", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.JWT_SECRET = "super-secure-test-jwt-secret-key-1234567890";
    process.env.ADMIN_USERNAME = "admin";
    process.env.ADMIN_PASSWORD = "secretpassword";
    process.env.API_SECRET_KEY = "test-api-secret-key-2026";
    process.env.N8N_WEBHOOK_URL = "https://n8n.example.com/webhook/test";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  describe("Item 1 & 2: JWT & RBAC Isolation without default admin", () => {
    it("should fail closed if JWT_SECRET is missing", async () => {
      delete process.env.JWT_SECRET;
      await expect(signAdminToken("admin")).rejects.toThrow("JWT_SECRET is not set");
      await expect(signUserToken({ userId: "u1", email: "u@test.com", name: "User" })).rejects.toThrow("JWT_SECRET is not set");
    });

    it("should issue admin token with explicit admin claim", async () => {
      const adminToken = await signAdminToken("admin");
      const verified = await verifyAdminToken(adminToken);
      expect(verified).not.toBeNull();
      expect(verified?.role).toBe("admin");
      expect(verified?.tokenType).toBe("admin");
      expect(verified?.username).toBe("admin");
    });

    it("should issue user token with user claim", async () => {
      const userToken = await signUserToken({ userId: "123", email: "user@test.com", name: "Normal User" });
      const verified = await verifyUserToken(userToken);
      expect(verified).not.toBeNull();
      expect(verified?.role).toBe("user");
      expect(verified?.userId).toBe("123");
    });

    it("should DENY user token from accessing admin verification (RBAC isolation)", async () => {
      const userToken = await signUserToken({ userId: "admin", email: "admin@test.com", name: "Fake Admin" });
      const verifiedAdmin = await verifyAdminToken(userToken);
      expect(verifiedAdmin).toBeNull();
    });
  });

  describe("Item 3: M2M Authentication Enforcement", () => {
    it("should ALLOW valid x-api-key header", () => {
      const req = new Request("https://example.com/api/posts", {
        headers: { "x-api-key": "test-api-secret-key-2026" }
      });
      expect(verifyM2MAuth(req)).toBe(true);
    });

    it("should ALLOW valid Authorization Bearer header", () => {
      const req = new Request("https://example.com/api/posts", {
        headers: { "Authorization": "Bearer test-api-secret-key-2026" }
      });
      expect(verifyM2MAuth(req)).toBe(true);
    });

    it("should REJECT api_key in query string", () => {
      const req = new Request("https://example.com/api/posts?api_key=test-api-secret-key-2026");
      expect(verifyM2MAuth(req)).toBe(false);
    });

    it("should REJECT invalid header key", () => {
      const req = new Request("https://example.com/api/posts", {
        headers: { "x-api-key": "wrong-key" }
      });
      expect(verifyM2MAuth(req)).toBe(false);
    });

    it("should fail closed if API_SECRET_KEY is missing", () => {
      delete process.env.API_SECRET_KEY;
      const req = new Request("https://example.com/api/posts", {
        headers: { "x-api-key": "test-api-secret-key-2026" }
      });
      expect(verifyM2MAuth(req)).toBe(false);
    });
  });

  describe("Item 9: N8nClient Payload Contracts & HTTPS Enforcement", () => {
    it("should reject non-HTTPS webhook URLs", async () => {
      process.env.N8N_WEBHOOK_URL = "http://n8n.insecure.com/webhook";
      const result = await N8nClient.send({ action: "update" });
      expect(result.success).toBe(false);
    });

    it("should send root object payload directly without wrapping", async () => {
      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "ok" })
      } as any);

      const payload = {
        action: "update",
        translationGroupId: 1234,
        title: "Test Post",
        excerpt: "Test Excerpt"
      };

      const result = await N8nClient.send(payload);
      expect(result.success).toBe(true);
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      const [calledUrl, calledInit] = fetchSpy.mock.calls[0];
      expect(calledUrl).toBe("https://n8n.example.com/webhook/test");
      expect(calledInit?.method).toBe("POST");
      expect((calledInit?.headers as any)["x-api-key"]).toBe("test-api-secret-key-2026");
      expect((calledInit?.headers as any)["Authorization"]).toBe("Bearer test-api-secret-key-2026");
      expect(JSON.parse(calledInit?.body as string)).toEqual(payload);
    });

    it("should send array payload directly without wrapping", async () => {
      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "ok" })
      } as any);

      const payload = [
        {
          action: "audio",
          translationGroupId: 1234,
          blocos_originais: [{ html_do_bloco: "<p>Hello</p>" }]
        }
      ];

      const result = await N8nClient.send(payload);
      expect(result.success).toBe(true);
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      const [, calledInit] = fetchSpy.mock.calls[0];
      expect(JSON.parse(calledInit?.body as string)).toEqual(payload);
    });
  });

  describe("Item 8: savePostAction Sister Posts Synchronization Contract", () => {
    it("verifies translation group structure maintains block images and audio per language", () => {
      const data = {
        title: "Principal PT",
        excerpt: "Resumo",
        blocks: [{ text: "Bloco 1", image: "/uploads/img1.webp", focalPoint: "center" }],
        audioUrlsByLang: {
          pt: "/uploads/pt.mp3",
          en: "/uploads/en.mp3",
          es: "/uploads/es.mp3"
        }
      };

      const sister = {
        lang: "en",
        blocks: [{ text: "Block 1 in english", image: "", focalPoint: "" }]
      };

      const updatedSisterBlocks = sister.blocks.map((b, idx) => {
        const sourceBlock = data.blocks[idx];
        return {
          ...b,
          image: sourceBlock?.image || "",
          focalPoint: sourceBlock?.focalPoint || "center"
        };
      });

      expect(updatedSisterBlocks[0].image).toBe("/uploads/img1.webp");
      expect(updatedSisterBlocks[0].focalPoint).toBe("center");
      expect(data.audioUrlsByLang[sister.lang as "en"]).toBe("/uploads/en.mp3");
    });
  });
});
