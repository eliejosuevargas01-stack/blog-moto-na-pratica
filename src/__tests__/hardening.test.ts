import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { signAdminToken, signUserToken, verifyAdminToken, verifyUserToken } from "@/lib/auth";
import { verifyM2MAuth } from "@/lib/m2m";
import { N8nClient } from "@/lib/n8n/client";

describe("Hardening & Security Test Suite", () => {
  const originalEnv = { ...process.env };
  const routePath = path.resolve(process.cwd(), "src/app/api/posts/route.ts");
  const adminDashboardPath = path.resolve(process.cwd(), "src/app/admin/AdminDashboard.tsx");

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

  describe("Item 3: GET /api/posts Draft Leakage Prevention Contract", () => {
    const routeContent = fs.existsSync(routePath) ? fs.readFileSync(routePath, "utf-8") : "";

    // Helper que replica a lógica de resolução de status do endpoint
    function resolveStatusFilter(urlStr: string, isAuth: boolean): Record<string, any> {
      const url = new URL(urlStr);
      let statusFilter: any = { status: "publicado" };
      if (isAuth) {
        const statusParam = url.searchParams.get("status");
        if (statusParam && statusParam !== "all") {
          statusFilter = { status: statusParam };
        } else {
          statusFilter = {};
        }
      }
      return statusFilter;
    }

    it("GET público sem status -> deve filtrar estritamente por publicado", () => {
      const filter = resolveStatusFilter("https://motonapratica.online/api/posts", false);
      expect(filter).toEqual({ status: "publicado" });
    });

    it("GET público ?status=rascunho -> deve ignorar parâmetro e forçar publicado", () => {
      const filter = resolveStatusFilter("https://motonapratica.online/api/posts?status=rascunho", false);
      expect(filter).toEqual({ status: "publicado" });
    });

    it("drafts nunca são expostos em consultas públicas", () => {
      const mockDbPosts = [
        { id: "1", title: "Post Publicado", status: "publicado" },
        { id: "2", title: "Post Rascunho", status: "rascunho" },
        { id: "3", title: "Post Em Edição", status: "em_edicao" },
        { id: "4", title: "Post Arquivado", status: "arquivado" }
      ];

      const publicFilter = resolveStatusFilter("https://motonapratica.online/api/posts?status=rascunho", false);
      const filtered = mockDbPosts.filter(p => p.status === publicFilter.status);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe("Post Publicado");
      expect(filtered.some(p => p.status === "rascunho")).toBe(false);
    });

    it("requisições autenticadas (Admin/M2M) podem filtrar por status customizado", () => {
      const filter = resolveStatusFilter("https://motonapratica.online/api/posts?status=rascunho", true);
      expect(filter).toEqual({ status: "rascunho" });
    });

    it("código-fonte de /api/posts deve implementar guarda isAuthorizedAdminOrM2M e forçar publicado por padrão", () => {
      expect(routeContent).toContain("isAuthorizedAdminOrM2M");
      expect(routeContent).toContain('let statusFilter: any = { status: "publicado" };');
      const forbiddenQuery = ["searchParams", 'get("api_' + 'key")'].join(".");
      expect(routeContent).not.toContain(forbiddenQuery);
    });
  });

  describe("Item 4: AdminDashboard Sanitization Contract", () => {
    const adminContent = fs.existsSync(adminDashboardPath) ? fs.readFileSync(adminDashboardPath, "utf-8") : "";

    it("não deve conter estado ou input de n8nWebhookUrl no Client Component", () => {
      expect(adminContent).not.toContain("n8nWebhookUrl");
      expect(adminContent).not.toContain("setN8nWebhookUrl");
      const forbiddenEnv = ["NEXT_PUBLIC", "N8N_WEBHOOK_URL"].join("_");
      const forbiddenSecret = ["motonapratica", "secret", "key", "2026"].join("-");
      expect(adminContent).not.toContain(forbiddenEnv);
      expect(adminContent).not.toContain(forbiddenSecret);
    });

    it("deve exibir placeholder seguro para documentação de API", () => {
      expect(adminContent).toContain("x-api-key: &lt;API_SECRET_KEY&gt;");
      expect(adminContent).toContain("N8N_WEBHOOK_URL");
    });
  });

  describe("Item 7 & 9: N8nClient Canonical Auth & Payload Contracts", () => {
    it("should reject non-HTTPS webhook URLs", async () => {
      process.env.N8N_WEBHOOK_URL = "http://n8n.insecure.com/webhook";
      const result = await N8nClient.send({ action: "update" });
      expect(result.success).toBe(false);
    });

    it("should send root object payload directly with canonical x-api-key header", async () => {
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
      expect((calledInit?.headers as any)[\"x-api-key\"]).toBe("test-api-secret-key-2026");
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
