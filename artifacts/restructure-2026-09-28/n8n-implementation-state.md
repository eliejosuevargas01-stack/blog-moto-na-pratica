# n8n — Estado da Implementação Remota (t4)

**Data:** 2026-09-28
**Instância:** https://myn8n.dominuslabs.online (API pública v1, verificada remotamente)

## Workflows modificados

### 1. Auditor Editorial (CRIADO)
- **ID:** `DYg6J6Y21xkEvxJp`
- **Status:** ativo, webhook `POST /webhook/auditor-editorial-mnp-v2` (auth header `x-internal-token`, credencial `12NzTeLDEIzLLl4S`)
- **Nodes:** Webhook → Verificação Determinística (code) → Auditor Editorial LLM (agent, gemini-3.8-flash via Dominus-LLM-Router `0Fv5Iuv8P60yjpzf`) → Parser → Veredito Final (code) → RespondToWebhook
- **Contrato de entrada:** `{ draft: {block-N...}, dossier_markdown, briefing, editorial_type, personal_experience_verified }`
- **Contrato de saída:** `{ verdict: PASS|REVISE|BLOCK, problems: [{severity, claim, reason, expected_fix, source_reference}], checked_numbers, checked_dates, checked_claims, fact_checked_at, auditor_version }`
- **Gates determinísticos:** primeira pessoa sem `personal_experience_verified` → critical (força BLOCK); números do artigo ausentes no dossiê → major
- **Testes executados:**
  - Adversarial (experiência falsa "Eu pilotei... aferi 52 km/l... paguei R$ 19.990") → **BLOCK** (4 critical + majors) ✅
  - Notícia limpa (fatos do dossiê) → **PASS** (0 problems) ✅
  - Sem token → **403** ✅
- **Bug corrigido:** regex de números incluía pontuação final (`R$ 21.690.` ≠ `R$ 21.690`) → normalização `replace(/[.,]+$/,'')` aplicada e revalidada.

### 2. Escritor (MODIFICADO)
- **ID:** `pdPyTCISLpV2aBcK`
- **Alterações:**
  - `IA - Escritor de Blocos` (systemMessage): regra anti-laziness suavizada (exceção para `target_length="short"`); adicionada regra V2 #0 "RESPECT THE EDITORIAL TYPE"
  - `IA - Planejamento do Artigo` (systemMessage): removido default rígido "EXACTLY 10 blocks / 1,500-2,000 words"; adicionado EXPERIENCE GATE; tamanho por editorial_type
  - `IA - Planejamento do Artigo` (user text): injetado bloco "CONTEXTO EDITORIAL" com `editorial_type`, `traffic_intent`, `target_length`, `personal_experience_verified`, `primary_query`
  - `Parser - Planejamento`: Parte 2 do schema agora inclui `target_length`, `article_format`, `must_include`, `must_not_claim`
  - `Monta Payload Final` (jsCode): agrega `needs_research` (OR entre partes), concatena `lacuna_factual`, marca `editorial_audit_version: v2-2026-09-28`
- **Verificação remota:** re-GET após PUT confirmou todas as 7 alterações presentes ✅

### 3. Diretor de Crescimento Editorial (MODIFICADO)
- **ID:** `uaE0rGAbVVxkpD1o`
- **Alterações:**
  - `Structured Output Parser1`: `decisao` agora `PROCEED | SKIP`; `editorial_type` e `traffic_intent` com enums completos; novos campos `requires_verified_experience` (bool) e `personal_experience_verified` (bool)
  - `Diretor SEO Escolhe a pauta a ser produzida` (systemMessage): adicionado bloco EXPERIENCE GATE + regra SKIP (não chamar Deep Research quando nenhum candidato presta)
- **Verificação remota:** re-GET confirmou schema e prompt ✅

## Não modificado (por regra da missão)
- **Deep Research** (`op3gvAdtkYjO9ydV` e relacionados): preservado integralmente, conforme "NÃO o reconstrua, não o substitua e não o simplifique".

## Pendente
- QA (t6): cenários A/B/C + adversarial de ponta a ponta
- Relatório final (t7) + push dos artifacts ao GitHub
