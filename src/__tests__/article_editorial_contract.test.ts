import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

// Mock do prisma para db
vi.mock("../lib/db", () => ({
  prisma: {
    post: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "../lib/db";
import {
  normalizePublishedDate,
  normalizeModifiedDate,
  shouldShowUpdatedDate,
  buildArticleViewModel,
  buildArticleStructuredData,
  sanitizeExternalUrl,
  sanitizeProfileUrl,
  normalizeEditorialType,
  CANONICAL_EDITORIAL_TYPES,
} from "../lib/editorial-contract";
import { findPostBySlugOrId, generatePostMetadata } from "../lib/post-helpers";

describe("Article Editorial Contract V1 - Safety & Integrity Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Datas e Freshness (PARTE 2 e 15 + PR Feedback)", () => {
    it("1. createdAt válido -> published date válida", () => {
      const validDateStr = "2026-05-10T10:00:00.000Z";
      const result = normalizePublishedDate(validDateStr);
      expect(result).toBeInstanceOf(Date);
      expect(result?.toISOString()).toBe(validDateStr);
    });

    it("2. date legado válido -> compatibilidade com publicações antigas", () => {
      const legacyDate = "2025-01-15T12:00:00.000Z";
      const vm = buildArticleViewModel({
        id: "1",
        slug: "post-legado",
        title: "Post Legado",
        date: legacyDate,
      });
      expect(vm.meta.publishedAt).toBeInstanceOf(Date);
      expect(vm.meta.publishedAt?.toISOString()).toBe(legacyDate);
    });

    it("3. nenhuma data -> null, NUNCA data atual (new Date())", () => {
      const result = normalizePublishedDate(null);
      expect(result).toBeNull();

      const vm = buildArticleViewModel({
        id: "2",
        slug: "post-sem-data",
        title: "Post Sem Data",
      });
      expect(vm.meta.publishedAt).toBeNull();
    });

    it("4. updatedAt técnico do Prisma NÃO deve ser usado como modifiedAt editorial", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "post-views-update",
        title: "Post Com Views",
        createdAt: "2026-01-01T10:00:00.000Z",
        updatedAt: "2026-01-05T10:00:00.000Z", // updatedAt técnico do Prisma
      });

      expect(vm.meta.modifiedAt).toBeNull();
      expect(shouldShowUpdatedDate(vm.meta.publishedAt, vm.meta.modifiedAt)).toBe(false);

      const schema = buildArticleStructuredData(vm);
      expect(schema.dateModified).toBeUndefined();
    });

    it("5. updatedAt <= publishedAt -> sem 'Atualizado'", () => {
      const published = new Date("2026-01-02T10:00:00.000Z");
      const modified = new Date("2026-01-02T10:00:00.000Z");
      expect(shouldShowUpdatedDate(published, modified)).toBe(false);

      const modifiedEarlier = new Date("2026-01-01T10:00:00.000Z");
      expect(shouldShowUpdatedDate(published, modifiedEarlier)).toBe(false);
    });

    it("6. modifiedAt editorial significativamente posterior (> 24h) -> atualização visível", () => {
      const published = new Date("2026-01-01T10:00:00.000Z");
      const modified = new Date("2026-01-03T11:00:00.000Z"); // > 24h
      expect(shouldShowUpdatedDate(published, modified)).toBe(true);

      const vm = buildArticleViewModel({
        id: "1",
        slug: "post-editorial-update",
        title: "Post Com Atualização Editorial",
        createdAt: "2026-01-01T10:00:00.000Z",
        modifiedAt: "2026-01-03T11:00:00.000Z",
      });
      expect(vm.meta.modifiedAt).toBeInstanceOf(Date);
      expect(shouldShowUpdatedDate(vm.meta.publishedAt, vm.meta.modifiedAt)).toBe(true);
    });
  });

  describe("2. Autoria (PARTE 5 e 15 + PR Feedback)", () => {
    it("7. autor ausente -> sem nome default (autor é undefined)", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "post-sem-autor",
        title: "Post Sem Autor",
      });
      expect(vm.meta.author).toBeUndefined();
    });

    it("8. autor explícito -> renderiza / disponibiliza o objeto do autor sem sintetizar slug se ausente", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "post-com-autor",
        title: "Post Com Autor",
        author: {
          name: "Maria Silva",
          type: "PERSON",
          role: "Jornalista Especializada",
        },
      });
      expect(vm.meta.author).toBeDefined();
      expect(vm.meta.author?.name).toBe("Maria Silva");
      expect(vm.meta.author?.slug).toBeUndefined();
      expect(vm.meta.author?.role).toBe("Jornalista Especializada");
    });

    it("9. NUNCA inferir Eliezer por slug/tag/title", () => {
      const vm1 = buildArticleViewModel({
        id: "1",
        slug: "fazer-250-review-eliezer",
        title: "Review de Fazer 250 por Eliezer",
        tag: "Review",
      });
      expect(vm1.meta.author).toBeUndefined();
    });

    it("10. NUNCA inferir Redação por ausência", () => {
      const vm = buildArticleViewModel({
        id: "2",
        slug: "noticia-moto-gp",
        title: "Notícia MotoGP",
      });
      expect(vm.meta.author).toBeUndefined();
    });
  });

  describe("3. Experiência Pessoal Verificada e Sem Defaults (PR Feedback)", () => {
    it("11. Review sem flag personalExperienceVerified -> NÃO é experiência verificada", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "review-fz25",
        title: "Review da Yamaha FZ25",
        tag: "Review",
        category: "Review",
      });
      expect(vm.meta.personalExperienceVerified).toBe(false);
    });

    it("12. título contendo 'teste' ou slug 'review' -> NÃO ativa experiência", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "review-capacete-ls2",
        title: "Teste de Rodagem 2000km",
      });
      expect(vm.meta.personalExperienceVerified).toBe(false);
    });

    it("13. personalExperienceVerified = true explícito -> contrato permite indicador", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "teste-real-minha-moto",
        title: "Minha Moto na Prática",
        personalExperienceVerified: true,
      });
      expect(vm.meta.personalExperienceVerified).toBe(true);
    });

    it("14. ausência de tag, readTime e views -> NÃO cria 'Geral', '3 min' ou '0'", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "post-mínimo",
        title: "Post Mínimo",
      });
      expect(vm.tag).toBeUndefined();
      expect(vm.readTime).toBeUndefined();
      expect(vm.views).toBeUndefined();
      expect(vm.likes).toBeUndefined();
    });
  });

  describe("4. Fontes e Sanitização de URLs (PARTE 7 e 15 + PR Feedback)", () => {
    it("15. fontes ausentes -> sources é undefined", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "post-sem-fontes",
        title: "Post Sem Fontes",
      });
      expect(vm.meta.sources).toBeUndefined();
    });

    it("16. fontes explícitas -> array estruturado é preenchido com URLs sanitizadas", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "post-com-fontes",
        title: "Notícia Importante",
        sources: [
          {
            url: "https://yamaha-motor.com.br/comunicado",
            title: "Comunicado Oficial",
            publisher: "Yamaha",
            primarySource: true,
          },
        ],
      });
      expect(vm.meta.sources).toHaveLength(1);
      expect(vm.meta.sources?.[0].publisher).toBe("Yamaha");
      expect(vm.meta.sources?.[0].primarySource).toBe(true);
    });

    it("17. descarte e sanitização de URLs com protocolos perigosos (javascript:, data:)", () => {
      expect(sanitizeExternalUrl("javascript:alert(1)")).toBeUndefined();
      expect(sanitizeExternalUrl("data:text/html,test")).toBeUndefined();
      expect(sanitizeExternalUrl("https://exemplo.com/fonte")).toBe("https://exemplo.com/fonte");

      expect(sanitizeProfileUrl("javascript:alert(1)")).toBeUndefined();
      expect(sanitizeProfileUrl("/autor/eliezer")).toBe("/autor/eliezer");
      expect(sanitizeProfileUrl("https://motonapratica.online/autor/eliezer")).toBe("https://motonapratica.online/autor/eliezer");

      const vm = buildArticleViewModel({
        id: "1",
        slug: "post-url-insegura",
        title: "Post com URL Insegura",
        sources: [{ url: "javascript:alert('xss')" }],
        author: {
          name: "Hacker",
          type: "PERSON",
          profileUrl: "javascript:alert('xss')",
        },
      });

      expect(vm.meta.sources).toBeUndefined();
      expect(vm.meta.author?.profileUrl).toBeUndefined();
    });
  });

  describe("5. Disclosure e Correções (PARTE 8 + PR Feedback)", () => {
    it("18. ausentes -> disclosure e correction são undefined", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "post-padrao",
        title: "Post Padrão",
      });
      expect(vm.meta.disclosure).toBeUndefined();
      expect(vm.meta.correction).toBeUndefined();
    });

    it("19. explícitos com correctedAt inválida -> não quebra aplicação nem renderiza 'Invalid Date'", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "post-correcao-invalida",
        title: "Post Correção Inválida",
        correction: {
          description: "Corrigido detalhe técnico.",
          correctedAt: "data-invalida-qualquer",
        },
      });
      expect(vm.meta.correction?.description).toBe("Corrigido detalhe técnico.");
      expect(vm.meta.correction?.correctedAt).toBe("data-invalida-qualquer");
    });
  });

  describe("6. Metadata do Post e SEO (PR Feedback)", () => {
    it("20. post sem seoKeywords NÃO recebe 'Fazer 250' automaticamente em generatePostMetadata", async () => {
      const mockPost = {
        id: "100",
        slug: "noticia-honda-transalp",
        title: "Honda Transalp 750 Chega ao Brasil",
        excerpt: "Detalhes do lançamento da Honda",
        tag: "Notícias",
      };
      (prisma.post.findUnique as any).mockResolvedValueOnce(mockPost);

      const meta = await generatePostMetadata("noticia-honda-transalp");
      expect(meta.keywords).not.toContain("Fazer 250");
      expect(meta.keywords).toBe("Notícias, Moto");
    });

    it("21. post sem imagem omite og:image/twitter:image em generatePostMetadata", async () => {
      const mockPost = {
        id: "101",
        slug: "post-sem-imagem",
        title: "Post Sem Imagem",
        excerpt: "Resumo sem imagem",
      };
      (prisma.post.findUnique as any).mockResolvedValueOnce(mockPost);

      const meta = await generatePostMetadata("post-sem-imagem");
      expect(meta.openGraph.images).toBeUndefined();
      expect(meta.twitter.images).toBeUndefined();
    });
  });

  describe("7. Auditoria do Runtime Público Sem Fallback POSTS (PR Feedback)", () => {
    it("22. nenhum arquivo de runtime público importa/usa POSTS de data.ts como fallback", () => {
      const rootDir = process.cwd();
      const publicFiles = [
        "src/app/page.tsx",
        "src/app/posts/page.tsx",
        "src/app/tag/[tag]/page.tsx",
        "src/app/components/CategoryView.tsx",
        "src/app/sobre/page.tsx",
        "src/app/post/[slug]/page.tsx",
        "src/lib/post-helpers.ts",
      ];

      for (const relPath of publicFiles) {
        const fullPath = path.resolve(rootDir, relPath);
        const fileContent = fs.readFileSync(fullPath, "utf-8");

        expect(
          fileContent,
          `O arquivo ${relPath} não deve importar POSTS de data.ts`
        ).not.toMatch(/import\s*\{[^}]*\bPOSTS\b[^}]*\}\s*from/);

        expect(
          fileContent,
          `O arquivo ${relPath} não deve usar POSTS como fallback`
        ).not.toMatch(/=\s*POSTS\b/);
      }
    });

    it("23. findPostBySlugOrId retorna null quando banco falha", async () => {
      (prisma.post.findUnique as any).mockRejectedValueOnce(new Error("Database connection error"));
      (prisma.post.findMany as any).mockRejectedValueOnce(new Error("Database connection error"));

      const result = await findPostBySlugOrId("qualquer-slug");
      expect(result).toBeNull();
    });
  });

  describe("8. Enum Canônico de EditorialType e Adaptação de Aliases (PR Feedback Adendo)", () => {
    it("24. aceita todos os tipos canônicos de EditorialType", () => {
      for (const type of CANONICAL_EDITORIAL_TYPES) {
        if (type === "REVIEW_VERIFIED") {
          expect(normalizeEditorialType(type, true)).toBe("REVIEW_VERIFIED");
        } else {
          expect(normalizeEditorialType(type)).toBe(type);
        }
      }
    });

    it("25. mapeia aliases legados para o enum canônico (MAINTENANCE -> MAINTENANCE_GUIDE, MOTORSPORT -> MOTORSPORT_REPORT)", () => {
      expect(normalizeEditorialType("MAINTENANCE")).toBe("MAINTENANCE_GUIDE");
      expect(normalizeEditorialType("MOTORSPORT")).toBe("MOTORSPORT_REPORT");
      expect(normalizeEditorialType("maintenance")).toBe("MAINTENANCE_GUIDE");
      expect(normalizeEditorialType("motorsport")).toBe("MOTORSPORT_REPORT");
    });

    it("26. restringe REVIEW_VERIFIED apenas quando personalExperienceVerified é true", () => {
      expect(normalizeEditorialType("REVIEW_VERIFIED", false)).toBeUndefined();
      expect(normalizeEditorialType("REVIEW_VERIFIED", undefined)).toBeUndefined();
      expect(normalizeEditorialType("REVIEW_VERIFIED", true)).toBe("REVIEW_VERIFIED");
    });

    it("27. descarta tipos editoriais inválidos ou vazios sem lançar exceção", () => {
      expect(normalizeEditorialType("TIPO_INVALIDO")).toBeUndefined();
      expect(normalizeEditorialType("")).toBeUndefined();
      expect(normalizeEditorialType(null)).toBeUndefined();
      expect(normalizeEditorialType(123)).toBeUndefined();
    });
  });

  describe("9. Structured Data do Artigo (PARTE 10 e 15)", () => {
    it("28. sem autor -> não inventar author no schema JSON-LD", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "artigo-sem-autor",
        title: "Artigo Sem Autor",
      });
      const schema = buildArticleStructuredData(vm);
      expect(schema.author).toBeUndefined();
    });

    it("29. sem published date -> não inventar datePublished no schema JSON-LD", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "artigo-sem-data",
        title: "Artigo Sem Data",
      });
      const schema = buildArticleStructuredData(vm);
      expect(schema.datePublished).toBeUndefined();
    });

    it("30. sem modified date -> não inventar dateModified no schema JSON-LD", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "artigo-sem-modificacao",
        title: "Artigo Sem Modificação",
        createdAt: "2026-01-01T10:00:00.000Z",
      });
      const schema = buildArticleStructuredData(vm);
      expect(schema.datePublished).toBeDefined();
      expect(schema.dateModified).toBeUndefined();
    });

    it("31. publisher permanece institucionalmente correto", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "artigo-publisher",
        title: "Artigo Publisher",
      });
      const schema = buildArticleStructuredData(vm);
      expect(schema.publisher).toBeDefined();
      expect(schema.publisher.name).toBe("Moto na Prática");
    });

    it("32. URL baseada em siteUrl centralizado", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "artigo-canonical",
        title: "Artigo Canonical",
        lang: "pt",
      });
      const schema = buildArticleStructuredData(vm, "https://motonapratica.online");
      expect(schema.mainEntityOfPage["@id"]).toBe("https://motonapratica.online/post/artigo-canonical");
    });

    it("33. não inferir NewsArticle de categoria ou tag (apenas quando editorialType === NEWS)", () => {
      const vmGeneric = buildArticleViewModel({
        id: "1",
        slug: "noticia-generica",
        title: "Notícia Lançamento",
        tag: "Notícias",
        category: "Notícias",
      });
      const schemaGeneric = buildArticleStructuredData(vmGeneric);
      expect(schemaGeneric["@type"]).toBe("Article");

      const vmNews = buildArticleViewModel({
        id: "2",
        slug: "noticia-explicita",
        title: "Notícia Explícita",
        editorialType: "NEWS",
      });
      const schemaNews = buildArticleStructuredData(vmNews);
      expect(schemaNews["@type"]).toBe("NewsArticle");
    });
  });
});
