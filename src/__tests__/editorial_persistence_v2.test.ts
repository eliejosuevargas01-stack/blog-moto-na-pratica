import { describe, it, expect } from "vitest";
import { buildArticleViewModel, buildArticleStructuredData } from "../lib/editorial-contract";
import type { Prisma } from "@prisma/client";

describe("Persistência Editorial V2 - Modelos e Compatibilidade Aditiva", () => {
  describe("1. Compatibilidade com Posts Legados (sem campos V2)", () => {
    it("deve carregar perfeitamente post legado sem campos editoriais V2", () => {
      const legacyPost = {
        id: "legacy-post-1",
        slug: "post-antigo-2025",
        tag: "Manutenção",
        category: "Manutenção",
        title: "Como Limpar Corrente de Transmissão",
        excerpt: "Passo a passo básico para limpeza de corrente",
        date: new Date("2025-06-15T10:00:00.000Z"),
        readTime: "6 min",
        img: "https://example.com/chain.jpg",
        imgFocalPoint: "center",
        blocks: [],
        views: 120,
        likes: 15,
        lang: "pt",
        published: true,
        createdAt: new Date("2025-06-15T10:00:00.000Z"),
        updatedAt: new Date("2025-08-20T14:30:00.000Z"), // técnico do Prisma
      };

      const vm = buildArticleViewModel(legacyPost);

      expect(vm.id).toBe("legacy-post-1");
      expect(vm.title).toBe("Como Limpar Corrente de Transmissão");
      expect(vm.meta.author).toBeUndefined();
      expect(vm.meta.editorialType).toBeUndefined();
      expect(vm.meta.trafficIntent).toBeUndefined();
      expect(vm.meta.personalExperienceVerified).toBe(false);
      expect(vm.meta.sources).toBeUndefined();
      expect(vm.meta.disclosure).toBeUndefined();
      expect(vm.meta.correction).toBeUndefined();
      // Não deve transformar updatedAt técnico em freshness editorial
      expect(vm.meta.modifiedAt).toBeNull();
    });
  });

  describe("2. Suporte aos Novos Modelos Relacionais do Prisma V2", () => {
    it("deve mapear autor relacional (Author) diretamente para o contrato", () => {
      const postWithAuthor = {
        id: "post-v2-1",
        slug: "analise-tecnica-suspensao",
        title: "Análise Técnica: Suspensão Invertida",
        excerpt: "Comparativo de comportamento dinâmico",
        authorId: "author-uuid-1",
        author: {
          id: "author-uuid-1",
          slug: "eliezer-vargas",
          name: "Eliezer Vargas",
          type: "PERSON",
          role: "Fundador e Piloto de Testes",
          profileUrl: "/equipe",
          avatarUrl: "https://motonapratica.online/avatar.jpg",
        },
        editorialType: "ANALYSIS",
        trafficIntent: "SEARCH",
        personalExperienceVerified: true,
      };

      const vm = buildArticleViewModel(postWithAuthor);

      expect(vm.meta.author).toBeDefined();
      expect(vm.meta.author?.name).toBe("Eliezer Vargas");
      expect(vm.meta.author?.slug).toBe("eliezer-vargas");
      expect(vm.meta.author?.role).toBe("Fundador e Piloto de Testes");
      expect(vm.meta.author?.profileUrl).toBe("/equipe");
      expect(vm.meta.editorialType).toBe("ANALYSIS");
      expect(vm.meta.personalExperienceVerified).toBe(true);
    });

    it("deve mapear fontes relacionais do Prisma (PostSource -> Source)", () => {
      const postWithRelationalSources = {
        id: "post-v2-2",
        slug: "motogp-etapa-sepang",
        title: "MotoGP: Análise da Etapa de Sepang",
        excerpt: "Dados de telemetria da corrida",
        editorialType: "MOTORSPORT_REPORT",
        trafficIntent: "NEWS",
        sources: [
          {
            id: "ps-1",
            role: "PRIMARY",
            source: {
              id: "src-1",
              url: "https://www.motogp.com/results",
              title: "Resultados Oficiais MotoGP",
              publisher: "Dorna Sports",
              sourceType: "OFFICIAL",
              primarySource: true,
            },
          },
          {
            id: "ps-2",
            role: "SUPPORTING",
            source: {
              id: "src-2",
              url: "https://www.yamahamotogp.com/press",
              title: "Yamaha Racing Press Release",
              publisher: "Yamaha Motor Racing",
              sourceType: "MANUFACTURER",
              primarySource: false,
            },
          },
        ],
      };

      const vm = buildArticleViewModel(postWithRelationalSources);

      expect(vm.meta.sources).toBeDefined();
      expect(vm.meta.sources?.length).toBe(2);
      expect(vm.meta.sources?.[0].url).toBe("https://www.motogp.com/results");
      expect(vm.meta.sources?.[0].primarySource).toBe(true);
      expect(vm.meta.sources?.[1].url).toBe("https://www.yamahamotogp.com/press");
      expect(vm.meta.sources?.[1].primarySource).toBe(false);
    });

    it("deve mapear correções relacionais do Prisma (Correction)", () => {
      const postWithCorrection = {
        id: "post-v2-3",
        slug: "yamaha-mt03-ficha",
        title: "Ficha Técnica Yamaha MT-03 2026",
        excerpt: "Especificações e consumo",
        editorialType: "EXPLAINER",
        corrections: [
          {
            id: "corr-1",
            description: "Corrigida a capacidade do tanque de combustível de 14L para 14,2L.",
            createdAt: new Date("2026-03-02T12:00:00.000Z"),
            previousText: "14 litros",
            correctedText: "14,2 litros",
            material: true,
          },
        ],
      };

      const vm = buildArticleViewModel(postWithCorrection);

      expect(vm.meta.correction).toBeDefined();
      expect(vm.meta.correction?.description).toContain("14,2L");
      expect(vm.meta.correction?.previousText).toBe("14 litros");
      expect(vm.meta.correction?.correctedText).toBe("14,2 litros");
    });

    it("deve honrar campos editoriais de rastreabilidade (researchId, factCheckedAt, disclosure)", () => {
      const postWithTracking = {
        id: "post-v2-4",
        slug: "guia-pneus-radial-diagonal",
        title: "Pneu Radial vs Diagonal",
        excerpt: "Diferenças estruturais e comportamento em curva",
        editorialType: "BUYING_GUIDE",
        trafficIntent: "EVERGREEN",
        researchId: "research_deep_topic_98234",
        factCheckedAt: new Date("2026-02-15T08:00:00.000Z"),
        disclosure: "Material elaborado com suporte técnico de engenharia de materiais.",
        editorialModifiedAt: new Date("2026-03-01T10:00:00.000Z"),
      };

      const vm = buildArticleViewModel(postWithTracking);

      expect(vm.meta.researchId).toBe("research_deep_topic_98234");
      expect(vm.meta.disclosure).toContain("suporte técnico");
      expect(vm.meta.modifiedAt).toBeInstanceOf(Date);
      expect(vm.meta.modifiedAt?.toISOString()).toBe("2026-03-01T10:00:00.000Z");
    });
  });

  describe("3. Tipagem Forte do Prisma Client V2", () => {
    it("deve validar que os tipos gerados pelo Prisma incluem os novos models", () => {
      // Teste em tempo de compilação TypeScript para confirmar que os tipos existem
      const authorInput: Prisma.AuthorCreateInput = {
        slug: "teste-autor",
        name: "Autor Teste",
        type: "PERSON",
        active: true,
      };

      const sourceInput: Prisma.SourceCreateInput = {
        url: "https://example.com/source",
        title: "Fonte Oficial",
      };

      expect(authorInput.name).toBe("Autor Teste");
      expect(sourceInput.url).toBe("https://example.com/source");
    });
  });
});
