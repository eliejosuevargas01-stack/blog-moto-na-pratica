import { describe, it, expect, vi, beforeEach } from "vitest";

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
} from "../lib/editorial-contract";
import { findPostBySlugOrId } from "../lib/post-helpers";

describe("Article Editorial Contract V1 - Safety & Integrity Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Datas e Freshness (PARTE 2 e 15)", () => {
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

    it("4. updatedAt ausente -> modifiedAt é null e shouldShowUpdatedDate é false", () => {
      const published = new Date("2026-01-01T10:00:00.000Z");
      const modified = normalizeModifiedDate(undefined);
      expect(modified).toBeNull();
      expect(shouldShowUpdatedDate(published, modified)).toBe(false);
    });

    it("5. updatedAt <= publishedAt -> sem 'Atualizado'", () => {
      const published = new Date("2026-01-02T10:00:00.000Z");
      const modified = new Date("2026-01-02T10:00:00.000Z");
      expect(shouldShowUpdatedDate(published, modified)).toBe(false);

      const modifiedEarlier = new Date("2026-01-01T10:00:00.000Z");
      expect(shouldShowUpdatedDate(published, modifiedEarlier)).toBe(false);
    });

    it("6. updatedAt significativamente posterior (> 24h) -> atualização visível", () => {
      const published = new Date("2026-01-01T10:00:00.000Z");
      const modified = new Date("2026-01-03T11:00:00.000Z"); // > 24h
      expect(shouldShowUpdatedDate(published, modified)).toBe(true);
    });
  });

  describe("2. Autoria (PARTE 5 e 15)", () => {
    it("7. autor ausente -> sem nome default (autor é undefined)", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "post-sem-autor",
        title: "Post Sem Autor",
      });
      expect(vm.meta.author).toBeUndefined();
    });

    it("8. autor explícito -> renderiza / disponibiliza o objeto do autor", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "post-com-autor",
        title: "Post Com Autor",
        author: {
          name: "Maria Silva",
          slug: "maria-silva",
          type: "PERSON",
          role: "Jornalista Especializada",
        },
      });
      expect(vm.meta.author).toBeDefined();
      expect(vm.meta.author?.name).toBe("Maria Silva");
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

  describe("3. Experiência Pessoal Verificada (PARTE 6 e 15)", () => {
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

    it("12. título contendo 'teste' -> NÃO ativa experiência", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "teste-de-rodagem-2000km",
        title: "Teste de Rodagem 2000km",
      });
      expect(vm.meta.personalExperienceVerified).toBe(false);
    });

    it("13. slug contendo 'review' -> NÃO ativa experiência", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "review-capacete-ls2",
        title: "Avaliação do Capacete",
      });
      expect(vm.meta.personalExperienceVerified).toBe(false);
    });

    it("14. personalExperienceVerified = true explícito -> contrato permite indicador", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "teste-real-minha-moto",
        title: "Minha Moto na Prática",
        personalExperienceVerified: true,
      });
      expect(vm.meta.personalExperienceVerified).toBe(true);
    });
  });

  describe("4. Fontes (PARTE 7 e 15)", () => {
    it("15. fontes ausentes -> sources é undefined", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "post-sem-fontes",
        title: "Post Sem Fontes",
      });
      expect(vm.meta.sources).toBeUndefined();
    });

    it("16. fontes explícitas -> array estruturado é preenchido", () => {
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

    it("17. links genéricos no HTML NÃO viram fontes estruturadas automaticamente", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "post-html-links",
        title: "Post com Links no Texto",
        content: "<p>Confira no <a href='https://senatran.gov.br'>Senatran</a> mais detalhes.</p>",
      });
      expect(vm.meta.sources).toBeUndefined();
    });
  });

  describe("5. Disclosure e Correções (PARTE 8 e 15)", () => {
    it("18. ausentes -> disclosure e correction são undefined", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "post-padrao",
        title: "Post Padrão",
      });
      expect(vm.meta.disclosure).toBeUndefined();
      expect(vm.meta.correction).toBeUndefined();
    });

    it("19. explícitos -> disclosure e correction são disponibilizados", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "post-com-nota",
        title: "Post com Nota",
        disclosure: "Unidade cedeu a moto para teste de 3 dias.",
        correction: {
          description: "Corrigido o preço sugerido do modelo.",
          correctedAt: "2026-03-01T10:00:00.000Z",
          previousText: "R$ 20.000",
          correctedText: "R$ 22.000",
        },
      });
      expect(vm.meta.disclosure).toBe("Unidade cedeu a moto para teste de 3 dias.");
      expect(vm.meta.correction?.description).toBe("Corrigido o preço sugerido do modelo.");
      expect(vm.meta.correction?.previousText).toBe("R$ 20.000");
    });
  });

  describe("6. Fallbacks Estáticos e Runtime Público (PARTE 1 e 15)", () => {
    it("20. runtime público não deve usar POSTS demo como fallback editorial", async () => {
      (prisma.post.findUnique as any).mockResolvedValueOnce(null);
      (prisma.post.findMany as any).mockResolvedValueOnce([]);

      const result = await findPostBySlugOrId("slug-inexistente");
      expect(result).toBeNull();
    });

    it("21. falha de DB não pode gerar artigo fictício", async () => {
      (prisma.post.findUnique as any).mockRejectedValueOnce(new Error("Database connection timeout"));
      (prisma.post.findMany as any).mockRejectedValueOnce(new Error("Database connection timeout"));

      const result = await findPostBySlugOrId("qualquer-post");
      expect(result).toBeNull();
    });

    it("22. busca por conteúdo demo não deve retornar post fictício quando banco falha", async () => {
      (prisma.post.findUnique as any).mockResolvedValueOnce(null);
      (prisma.post.findMany as any).mockResolvedValueOnce([]);

      const result = await findPostBySlugOrId("guia-manutencao-fazer-250");
      expect(result).toBeNull();
    });
  });

  describe("7. Structured Data do Artigo (PARTE 10 e 15)", () => {
    it("23. sem autor -> não inventar author no schema JSON-LD", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "artigo-sem-autor",
        title: "Artigo Sem Autor",
      });
      const schema = buildArticleStructuredData(vm);
      expect(schema.author).toBeUndefined();
    });

    it("24. sem published date -> não inventar datePublished no schema JSON-LD", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "artigo-sem-data",
        title: "Artigo Sem Data",
      });
      const schema = buildArticleStructuredData(vm);
      expect(schema.datePublished).toBeUndefined();
    });

    it("25. sem modified date -> não inventar dateModified no schema JSON-LD", () => {
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

    it("26. publisher permanece institucionalmente correto", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "artigo-publisher",
        title: "Artigo Publisher",
      });
      const schema = buildArticleStructuredData(vm);
      expect(schema.publisher).toBeDefined();
      expect(schema.publisher.name).toBe("Moto na Prática");
    });

    it("27. URL baseada em siteUrl centralizado", () => {
      const vm = buildArticleViewModel({
        id: "1",
        slug: "artigo-canonical",
        title: "Artigo Canonical",
        lang: "pt",
      });
      const schema = buildArticleStructuredData(vm, "https://motonapratica.online");
      expect(schema.mainEntityOfPage["@id"]).toBe("https://motonapratica.online/post/artigo-canonical");
    });

    it("28. não inferir NewsArticle de categoria ou tag (apenas quando editorialType === NEWS)", () => {
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
