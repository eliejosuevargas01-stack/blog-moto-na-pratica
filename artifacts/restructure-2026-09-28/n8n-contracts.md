# n8n — Contratos de Entrada/Saída (Pipeline Editorial V2)

> **Natureza:** contrato alvo/normativo, não declaração de que todos os campos já estão implementados remotamente. Estado conhecido: `12_N8N_REFOUNDATION_STATE.md`. O enum de `editorial_type` abaixo é o mesmo enum canônico de `05_CONTENT_TAXONOMY_AND_MIGRATION.md`.

**Data:** 2026-09-28
**Princípio:** JSON estruturado em cada fronteira; blobs de texto só onde o Deep Research já trabalha assim (dossiê markdown permanece como campo `dossier_markdown`, nunca como "o contrato inteiro").
**Identificadores:** `topic_id` (determinístico, ver 1.1) · `research_id` (= `id_pesquisa` legado do DR) · `post_id` (retornado pelo CMS).

---

## 1. Identidade e idempotência

### 1.1 Geração de IDs

```text
topic_id    = "tp_" + sha256(normalize(topic_title) + "|" + source_origin).slice(0,16)
research_id = inteiro do Deep Research (id_pesquisa legado, compatibilidade com Data Tables)
post_id     = id/translationGroupId confirmado pelo CMS após publish
```

`normalize()` = lowercase, sem acentos, sem pontuação, espaços colapsados.

### 1.2 Deduplicação e rerun seguro

- Antes de disparar DR: verificar `topic_id` na Data Table `Pesquisa` (`9ltZLFGUXe11LFQk`). Se existir com status `published|running`, encerrar (`duplicate_skip`).
- Antes de publicar: verificar se `research_id` já tem `post_id` registrado. Se sim, não republicar; apenas atualizar metadados se necessário.
- CMS faz upsert por `translationGroupId`+locale — reenvio do mesmo conteúdo é seguro.

---

## 2. Contratos por componente

### 2.1 Radar de Pautas

**Saída `RadarCandidate`** (um item por candidato, dentro de `candidates[]`):

```json
{
  "topic_id": "tp_9f2c1a04b7d3e8f1",
  "topic_title": "Honda CG 160 2026 tem aumento de preço",
  "source_origin": "motorsport_rss | google_news_serpapi | google_trends_serpapi | motogp_internal | portal_feed",
  "source_url": "https://...",
  "detected_at": "2026-09-28T14:03:11-03:00",
  "entities": ["Honda", "CG 160", "2026"],
  "freshness": "breaking | today | this_week | evergreen",
  "initial_reason": "pico de buscas + cobertura de 3 portais",
  "possible_category": "noticias"
}
```

**Não emite:** texto de artigo, decisão de publicação.

### 2.2 Diretor de Crescimento Editorial

**Entrada:** `RadarCandidate[]` + histórico de slugs (tool existente `posts-slug`).

**Saída `DirectorDecision` (structured output):**

```json
{
  "topic_id": "tp_9f2c1a04b7d3e8f1",
  "decision": "PROCEED | SKIP",
  "editorial_type": "NEWS | ANALYSIS | BUYING_GUIDE | COMPARISON | MAINTENANCE_GUIDE | EXPLAINER | MOTORSPORT_REPORT | PERSONAL_EXPERIENCE | DATA_STUDY | REVIEW_VERIFIED",
  "traffic_intent": "SEARCH | DISCOVER | NEWS | EVERGREEN | AUTHORITY",
  "primary_query": "cg 160 2026 preço",
  "secondary_queries": ["cg 160 2026 ficha técnica", "aumento cg 160"],
  "target_audience": "motociclista urbano que usa a moto para trabalhar",
  "urgency": "high | medium | low",
  "shelf_life": "days | weeks | months | years",
  "angle": "impacto direto no bolso do motoboy",
  "authority_value": "high | medium | low",
  "expected_value": "high | medium | low",
  "reason_for_decision": "pico de interesse + gap de cobertura no portal",
  "topic_title": "Honda CG 160 2026 tem aumento de preço",
  "source_url": "https://..."
}
```

Se `decision = SKIP`: registrar linha na Data Table com status `skipped` + `reason_for_decision` e **encerrar** (não dispara DR).

### 2.3 Deep Research (fronteira — mecanismo interno preservado)

**Entrada (inalterada, webhook `deep-research`):** `query.id` int (research_id), `body.tema`, `body.webhook_callback`, header secreto. **Aditivo opcional:** `body.topic_id`, `body.director_decision` (objeto 2.2 completo) — se ausentes, DR opera como hoje.

**Saída (callback para `webhook_callback`) — compatível com hoje + envelope aditivo:**

```json
{
  "id_pesquisa": 12345,
  "relatorio": "{ ...dossiê estruturado atual (JSON string)... }",
  "assunto": "...",
  "dores": "...",
  "topic_id": "tp_9f2c1a04b7d3e8f1",
  "generated_at": "2026-09-28T15:00:00-03:00",
  "director_decision": { "...": "eco do objeto recebido, se houver" }
}
```

Os campos formais de 2.3 do doc 10 (`claims`, `claim_sources`, `conflicts`, `gaps`, `rumors`, etc.) são derivados do dossiê na camada de adaptação do Escritor (fase 1) até o envelope nativo existir no DR (fase 2, com benchmark).

### 2.4 Editor de Pauta (dentro do workflow Escritor, antes da redação)

**Entrada:** callback do DR (2.3) + decisão do Diretor (se presente) + posts publicados (links internos).

**Saída `EditorialBriefing` (structured output):**

```json
{
  "headline_draft": "CG 160 2026 ficou mais cara: o que muda no seu bolso",
  "deck": "Subiu R$ 800 na tabela. Veja o impacto real no consórcio e no dia a dia.",
  "core_question": "vale a pena comprar a CG 160 2026 com o novo preço?",
  "reader_profile": "motociclista urbano, renda apertada, usa a moto todo dia",
  "promise": "entender o aumento e decidir sem enrolação",
  "structure": ["o que mudou", "números oficiais", "impacto no bolso", "alternativas"],
  "target_length": "short(400-700) | medium(800-1200) | long(1500-2000)",
  "must_include": ["preço novo", "preço anterior", "data de vigência"],
  "must_not_claim": ["consumo aferido por nós", "teste de rua próprio"],
  "primary_sources": ["https://honda..."],
  "internal_links": [{"slug": "cg-160-2025-review", "anchor": "nossa análise da CG 160 2025"}],
  "cta": "comparar consórcio",
  "tone": "papo reto, foco no bolso",
  "article_format": "news_curto | guia | comparativo | analise",
  "editorial_type": "NEWS",
  "traffic_intent": "NEWS",
  "personal_experience_verified": false
}
```

**Regra de `target_length`:** NEWS/breaking → `short` por padrão; BUYING_GUIDE/COMPARISON/ANALYSIS → `medium|long` conforme densidade do dossiê. Nunca expandir notícia curta para "bater 1500 palavras".

### 2.5 Escritor

**Entrada:** `EditorialBriefing` + dossiê (markdown) + `personal_experience_verified`.

**Saída `ArticleDraft`:**

```json
{
  "title": "...", "slug": "...", "excerpt": "...",
  "body_blocks": ["<h2>...</h2><p>..."],
  "seo_title": "...", "seo_description": "...", "tags": ["..."],
  "category": "noticias",
  "needs_research": false,
  "research_gap": null
}
```

Se faltar fato essencial: `{"needs_research": true, "research_gap": "preço oficial não consta no dossiê"}` e **não escrever** — retorna à fila de pesquisa.

**Proibições duras (prompt + validação):** sem 1ª pessoa singular salvo `personal_experience_verified=true`; sem "eu pilotei/testamos/aferimos"; sem inventar consumo, preço, km, revisão, oficina; rumor nunca vira fato; análise documental nunca é chamada de "review/teste".

### 2.6 Auditor Editorial (NOVO — webhook `auditor-editorial`)

**Entrada:** `ArticleDraft` + dossiê + `EditorialBriefing`.

**Saída `EditorialAudit` (structured output):**

```json
{
  "verdict": "PASS | REVISE | BLOCK",
  "problems": [
    {
      "severity": "critical | major | minor",
      "claim": "eu pilotei a CG 160 no trânsito",
      "reason": "primeira pessoa sem personal_experience_verified",
      "expected_fix": "reescrever em voz editorial: 'no trânsito urbano, a CG 160...'",
      "source_reference": "regra editorial 10_§6 / dossiê: ausente"
    }
  ],
  "checked_numbers": 14, "checked_dates": 3, "checked_claims": 22,
  "fact_checked_at": "2026-09-28T16:00:00-03:00"
}
```

**Roteamento:** `PASS` → Publisher. `REVISE` → 1 reescrita com a lista de problemas; se recair, vira `BLOCK`. `BLOCK` → registra e **não publica**.

**Camada determinística (Code node) antes do LLM:** regex de 1ª pessoa/experiência quando `personal_experience_verified=false` → força ao menos `REVISE`; números do artigo ausentes no dossiê → flag.

### 2.7 Publisher

**Entrada:** somente `verdict = PASS` + `ArticleDraft` + `EditorialBriefing` + `EditorialAudit`.

**Saída — payload CMS V2** (POST `/api/posts`, `x-api-key` via credencial n8n):

```json
{
  "output": {
    "pt": {
      "id": "post_ou_translationGroupId", "title": "...", "summary": "...",
      "meta-title": "...", "meta-description": "...", "meta-tags": "...",
      "block-1": "...", "img-1": "...",
      "editorialType": "NEWS", "trafficIntent": "NEWS",
      "authorSlug": null,
      "personalExperienceVerified": false,
      "researchId": 12345, "topicId": "tp_9f2c1a04b7d3e8f1",
      "sources": ["https://honda..."],
      "disclosure": "Análise baseada em documentos e fontes oficiais; sem teste próprio.",
      "factCheckedAt": "2026-09-28T16:00:00-03:00",
      "relatedPostCandidates": ["cg-160-2025-review"]
    },
    "es": { "...": "..." }, "en": { "...": "..." }
  },
  "translationGroupId": "tg_...", "mentioned_slugs": ["..."]
}
```

`authorSlug` só deve ser preenchido quando houver autoria explicitamente atribuída; ausência de autor não vira automaticamente “Redação Moto na Prática”.

Campos legados (`block-N`, `img-N`, `meta-*`) permanecem — o CMS atual os consome; os campos V2 são ignorados sem erro até a sprint do site persisti-los (dependência documentada). Canonical/JSON-LD/schema: **responsabilidade do site** — nunca gerados no n8n.

---

## 3. Rastreabilidade mínima por execução (Data Table `Pesquisa`)

Colunas alvo por linha: `topic_id`, `id_pesquisa`(research_id), `post_id`, `assunto`, `editorial_type`, `traffic_intent`, `status` (`radar|decided|researching|editing|writing|auditing|published|skipped|blocked`), `audit_verdict`, `audit_problems`, `modelo_diretor`, `modelo_escritor`, `modelo_auditor`, `run_id_diretor`, `run_id_escritor`, `detected_at`, `fact_checked_at`, `erro`.
