/**
 * Teste de integração do contrato n8n Publisher → CMS V2
 * Valida que o payload exato produzido pelo Publisher do n8n (§2.7 do n8n-contracts.md)
 * é aceito, validado e normalizado corretamente.
 */
import { describe, it, expect } from "vitest";
import { validateEditorialInput } from "../lib/editorial-persistence";

describe("n8n Publisher → CMS V2 Payload Contract", () => {
  // Payload realístico extraído da spec n8n-contracts.md §2.7
  const publisherPtPayload = {
    title: "Honda CG 160 2026 tem aumento de preço: veja o que muda",
    summary: "Subiu R$ 800 na tabela. Veja o impacto real no bolso.",
    "meta-title": "Honda CG 160 2026: Preço, Mudanças e Vale a Pena?",
    "meta-description": "Confira o novo preço da Honda CG 160 2026 e o impacto no bolso.",
    "meta-tags": "Honda, CG 160, preço, moto 2026",
    "block-1": "<h2>O que mudou na linha 2026</h2><p>A Honda anunciou reajuste...</p>",
    "img-1": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200",
    editorialType: "NEWS",
    trafficIntent: "NEWS",
    authorId: null,
    personalExperienceVerified: false,
    researchId: 12345, // inteiro do DR legado
    topicId: "tp_9f2c1a04b7d3e8f1",
    sources: [
      "https://www.honda.com.br/motos/cg-160-titan",
      "https://fenabrave.org.br/relatorios/2026",
    ],
    disclosure: "Análise baseada em documentos e fontes oficiais; sem teste próprio.",
    factCheckedAt: "2026-09-28T16:00:00.000Z",
  };

  it("validates full n8n Publisher pt payload", () => {
    // Extrai campos V2 como a rota faz
    const editorialFields = [
      "editorialType", "trafficIntent", "authorId", "reviewerId",
      "researchId", "topicId", "personalExperienceVerified", "factCheckedAt",
      "disclosure", "correctionStatus", "firstPublishedAt",
      "editorialModifiedAt", "updatedReason", "sources", "corrections",
    ];

    const rawEditorial: Record<string, any> = {};
    for (const f of editorialFields) {
      if ((publisherPtPayload as any)[f] !== undefined) {
        rawEditorial[f] = (publisherPtPayload as any)[f];
      }
    }

    const result = validateEditorialInput(rawEditorial);
    expect(result.error).toBeUndefined();
    expect(result.validated).toBeDefined();

    const v = result.validated!;
    expect(v.editorialType).toBe("NEWS");
    expect(v.trafficIntent).toBe("NEWS");
    expect(v.authorId).toBeNull();
    expect(v.personalExperienceVerified).toBe(false);
    expect(v.researchId).toBe("12345");
    expect(v.topicId).toBe("tp_9f2c1a04b7d3e8f1");
    expect(v.disclosure).toBe("Análise baseada em documentos e fontes oficiais; sem teste próprio.");
    expect(v.factCheckedAt).toEqual(new Date("2026-09-28T16:00:00.000Z"));

    // Sources: strings normalizadas para {url, role: "PRIMARY"}
    expect(v.sources).toHaveLength(2);
    expect(v.sources![0]).toEqual({
      url: "https://www.honda.com.br/motos/cg-160-titan",
      role: "PRIMARY",
    });
    expect(v.sources![1]).toEqual({
      url: "https://fenabrave.org.br/relatorios/2026",
      role: "PRIMARY",
    });
  });

  it("extracts V2 fields with fallback chain (langData → output → body)", () => {
    // Simula a lógica de extração da route.ts
    const body = {
      output: {
        translationGroupId: "tg_12345",
        pt: publisherPtPayload,
        es: {
          title: "Honda CG 160 2026 sube de precio",
          summary: "Subió R$ 800 en tabla.",
          // Herda campos editoriais do pt se não especificados
        },
      },
    };

    const editorialFieldNames = [
      "editorialType", "trafficIntent", "authorId", "reviewerId",
      "researchId", "topicId", "personalExperienceVerified", "factCheckedAt",
      "disclosure", "correctionStatus", "firstPublishedAt",
      "editorialModifiedAt", "updatedReason", "sources", "corrections",
    ];

    const rawEditorial: Record<string, any> = {};
    let hasEditorialV2 = false;

    // 1. Root level
    for (const f of editorialFieldNames) {
      const val = (body as any)[f] ?? (body.output as any)[f];
      if (val !== undefined) {
        rawEditorial[f] = val;
        hasEditorialV2 = true;
      }
    }

    // 2. Lang level (Publisher puts them in output.pt)
    for (const checkLang of ["pt", "en", "es"]) {
      const ld = (body.output as any)[checkLang];
      if (!ld || typeof ld !== "object") continue;
      for (const f of editorialFieldNames) {
        if (ld[f] !== undefined && rawEditorial[f] === undefined) {
          rawEditorial[f] = ld[f];
          hasEditorialV2 = true;
        }
      }
    }

    expect(hasEditorialV2).toBe(true);
    const result = validateEditorialInput(rawEditorial);
    expect(result.error).toBeUndefined();
    expect(result.validated!.editorialType).toBe("NEWS");
    expect(result.validated!.researchId).toBe("12345");
    expect(result.validated!.topicId).toBe("tp_9f2c1a04b7d3e8f1");
    expect(result.validated!.sources).toHaveLength(2);
  });

  it("rejects adversarial claim: personal experience without verification", () => {
    const maliciousPayload = {
      ...publisherPtPayload,
      editorialType: "REVIEW_VERIFIED",
      personalExperienceVerified: false, // Incompatível
    };

    const result = validateEditorialInput(maliciousPayload);
    expect(result.error).toContain("REVIEW_VERIFIED requires personalExperienceVerified");
  });

  it("rejects invalid sources URL", () => {
    const badSourcesPayload = {
      ...publisherPtPayload,
      sources: ["ftp://invalid-protocol.com"],
    };

    const result = validateEditorialInput(badSourcesPayload);
    expect(result.error).toContain("invalid or unsafe URL");
  });
});
