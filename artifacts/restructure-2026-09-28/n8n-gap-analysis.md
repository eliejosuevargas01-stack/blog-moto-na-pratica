# n8n — Gap Analysis (Estado Atual × 10_N8N_RESPONSIBILITIES_AND_TOOLS.md)

**Data:** 2026-09-28
**Base de comparação:** `10_N8N_RESPONSIBILITIES_AND_TOOLS.md` (pipeline V2) × `n8n-current-state-map.md` (inventário verificado remotamente).
**Classificação:** `KEEP` · `MODIFY` · `SPLIT` · `REMOVE` · `ADD`

---

## 1. Classificação por componente do pipeline V2

### 1.1 Radar de Pautas — **SPLIT (de `uaE0rGAbVVxkpD1o`) + MODIFY**

| Aspecto | Estado atual | Alvo (10_) | Gap |
|---|---|---|---|
| Existência | Embutido no workflow "Diretores SEO" (RSS motorsport.com + SerpApi Google News + Google Trends, ×2 ramos paralelos) | Etapa/componente que só descobre e normaliza candidatos | Radar não existe como saída formal; coleta está fundida com a decisão |
| Saída mínima | Campos soltos: `manchetes_google_news`, `noticias_motogp`, `tendencias_brasil` (arrays) + `id_pesquisa` aleatório | `topic_id`, `topic_title`, `source_origin`, `source_url`, `detected_at`, `entities`, `freshness`, `initial_reason`, `possible_category` | **Nenhum dos 9 campos obrigatórios existe como contrato** |
| Deduplicação | Indireta (LLM do Diretor olha slugs) | Determinística, evitar DR duplicado | Ausente |
| Não-deve | Dispara DR via tool do agente (Radar+Diretor disparam juntos) | Radar não decide nem dispara sozinho | Violação estrutural leve (decisão acoplada) |

**Ação:** separar logicamente a coleta (nodes de fontes + normalização) da decisão; criar contrato `RadarCandidate` na normalização; `topic_id` determinístico (hash de título normalizado + fonte) em vez de `Math.random()`.

### 1.2 Diretor de Crescimento Editorial — **MODIFY** (`uaE0rGAbVVxkpD1o`)

| Aspecto | Estado atual | Alvo (10_) | Gap |
|---|---|---|---|
| Decisão | Agente "Diretor SEO" (gemini-3.8-flash) já menciona `decisao: PROCEED`, `editorial_type`, `traffic_intent` no prompt | PROCEED/SKIP + 12 campos de decisão | Contrato incompleto: faltam `secondary_queries`, `target_audience`, `urgency`, `shelf_life`, `authority_value`, `expected_value`, `reason_for_decision`; SKIP não tem caminho formal (o que acontece quando SKIP?) |
| Ferramentas | Tools: posts-slug (histórico) + disparo DR | + Search Console/analytics/performance (quando disponíveis) | Growth Loop ausente (sem ingestão de métricas) — registrar como pendência, não bloqueante |
| Não-deve | Não escreve artigo (OK) | — | Conforme |
| Duplicata | **Existe um segundo "Diretor SEO" dentro do Midia Generator** (`sgK1oLuR2qMVcvXI`) | Um único Diretor | **REMOVE** a duplicata |

**Ação:** atualizar prompt + structured output do agente para o contrato completo de 12 campos; tratar SKIP explicitamente (registrar e encerrar); remover o Diretor duplicado do Midia Generator.

### 1.3 Deep Research — **KEEP** (formalização de fronteira, sem reconstrução)

Workflows: `op3gvAdtkYjO9ydV` (Planner), `cwLWc2wG6M8IlcqG` (Scrapper), `Vz7KzzYWavLw3meH` (Auditor interno), `WGxdU1MdmoMpdZa3` (Redator), `GhiEcBPGM0JKP0Qt` (Sweeper), `9O3F3cFp7xZ00LGS` (Limpeza, inativo).

| Aspecto | Estado atual | Alvo (10_) | Gap |
|---|---|---|---|
| Mecanismo iterativo | Planner (4 personas) → garimpo iterativo (≤3 tentativas, repescagem) → auditoria interna por passo → dossiê | Pesquisa iterativa/adaptativa completa | **Conforme — não reconstruir** |
| Saída formal | `{id_pesquisa, titulo_relatorio, topicos[].subtopicos[].analise_detalhada}` markdown com `(Fonte: url)` inline | Envelope com `research_id`, `topic_id`, `generated_at`, `main_question`, `facts`, `claims`, `claim_sources`, `source_*`, `conflicts`, `gaps`, `exact_numbers`, `primary_sources`, `secondary_sources`, `rumors`, `unsupported_claims`, `forbidden_assertions` | Dossiê é rico mas não expõe envelope formal de 17 campos |
| Callback | POST para `webhook_callback` com `{id_pesquisa, relatorio, assunto, dores}` | idem + metadados | `topic_id` não é propagado (só `id_pesquisa`) |

**Decisão (justificativa objetiva):** NÃO alterar a mecânica interna do DR. A formalização da saída será feita **na fronteira** (camada de adaptação no callback/Escritor), porque: (a) o dossiê markdown já carrega fatos com fontes inline; (b) extrair os 17 campos exigiria re-projetar o parser do Redator, com risco de regressão na peça mais madura do sistema; (c) o contrato V2 pode ser satisfeito derivando o envelope no consumidor sem perda de informação factual. O envelope formal fica como pendência documentada (Fase posterior, com benchmark).

### 1.4 Editor de Pauta — **MODIFY** (formalizar dentro de `pdPyTCISLpV2aBcK`)

| Aspecto | Estado atual | Alvo (10_) | Gap |
|---|---|---|---|
| Existência | Nodes "IA - Angulo do Post" + "IA - Planejamento do Artigo" fazem o papel | Componente com saída formal | Existe de fato, mas sem contrato |
| Saída | `angulo_escolhido`, `justificativa`, `gancho`, planejamento em 2 partes (para 2 redatores) | `headline_draft`, `deck`, `core_question`, `reader_profile`, `promise`, `structure`, `target_length`, `must_include`, `must_not_claim`, `primary_sources`, `internal_links`, `CTA`, `tone`, `article_format` | Faltam campos explícitos: `target_length` variável (hoje 1.500–2.000 fixo no prompt), `must_not_claim`, `article_format`, `tone` |
| Re-pesquisa | Não re-pesquisa (OK) | Não re-pesquisar | Conforme |
| Tamanho | Planejamento força 1.500–2.000 palavras sempre | Notícia curta não deve ser expandida | **Violação**: `target_length` deve derivar do `editorial_type` |

### 1.5 Escritor — **MODIFY** (`pdPyTCISLpV2aBcK`)

| Aspecto | Estado atual | Alvo (10_) | Gap |
|---|---|---|---|
| Tom | "papo reto", "tradução para o asfalto" (bom) | idem + sem dramatização constante | Parcial |
| Primeira pessoa | Prompt não veda; keywords achadas (`eu`, `mecânico`, `piloto` no prompt de planejamento/blocos) | 1ª pessoa SÓ se `personal_experience_verified=true` | **Sem gate formal** — campo não existe |
| Não-inventar | Sem regra explícita anti-invenção de consumo/preço/teste | Lista explícita de proibições | Ausente |
| NEEDS_RESEARCH | Inexistente — escritor sempre escreve | Retornar `NEEDS_RESEARCH` + lacuna | **Ausente** |
| Experiência fictícia | Nada impede | Proibido | Ausente |

### 1.6 Auditor Editorial — **ADD** (não existe)

O "Deep Research - Auditor" (`Vz7KzzYWavLw3meH`) audita **passos de pesquisa**, não o artigo. Nenhum componente compara o texto final contra o dossiê claim a claim antes de publicar.

**Ação:** novo workflow (webhook `auditor-editorial`) entre Escritor e Publisher: LLM auditor com schema `{verdict: PASS|REVISE|BLOCK, problems:[{severity, claim, reason, expected_fix, source_reference}]}`, verificação determinística auxiliar em Code node (regex de 1ª pessoa sem flag, preços/datas fora do dossiê). `BLOCK` nunca chega ao Publisher; `REVISE` retorna 1× ao Escritor com a lista de problemas; 2º REVISE vira BLOCK.

### 1.7 Publisher — **MODIFY** (dentro de `pdPyTCISLpV2aBcK`)

| Aspecto | Estado atual | Alvo (10_) | Gap |
|---|---|---|---|
| Publicação | `Publica Post PT/ES/EN` → `POST /api/posts` imediato | Só recebe PASS | Publica sem auditoria |
| Payload | `{output:{pt,es,en:{title,summary,meta-*,block-N,img-N,id}}, translationGroupId, mentioned_slugs}` | + `editorialType`, `trafficIntent`, `authorSlug`, `personalExperienceVerified`, `researchId`, `sources`, `disclosure`, `factCheckedAt`, `relatedPostCandidates` | Metadados V2 ausentes. CMS atual **ignora chaves extras sem erro** (verificado em `route.ts`) → envio imediato é seguro; persistência depende da sprint do site (documentar) |
| Dupla publicação | Upsert por id/slug no CMS (OK parcial) | Não publicar 2× a mesma pauta | Falta idempotência por `topic_id`/`research_id` |
| Credencial | `x-api-key` hardcoded no node | credencial n8n | **Migrar para credencial** (segurança) |

### 1.8 Identidade e estado — **MODIFY**

- `id_pesquisa` aleatório → `topic_id` determinístico + `research_id` = `id_pesquisa` legado (compatibilidade com Data Tables do DR) mapeado 1:1.
- `post_id` = `id` retornado/confirmado pelo CMS; registrar trinca `topic_id → research_id → post_id` na Data Table existente (nova coluna) — Postgres/Supabase segue canônico; Redis não disponível na instância (não há nodes Redis) → deduplicação rápida via Data Table.

### 1.9 Observabilidade — **MODIFY** (incremento)

DR já grava fases/tentativas. Faltam: `topic_id`, modelo usado por etapa, resultado da auditoria editorial e `post_id` na mesma linha de rastreio. **Ação:** ampliar o upsert na Data Table "Pesquisa" com essas colunas.

### 1.10 Growth Loop — **ADD (pendência documentada, fora do corte desta execução)**

Não há ingestão de Search Console/analytics. Registrar como Fase posterior (já previsto no roadmap).

---

## 2. Componentes fora do pipeline editorial

| Workflow | Decisão | Motivo |
|---|---|---|
| `GEMPoeNvEHUYz2NL` scrapper (CRM/leads) | KEEP intacto | Fora do escopo editorial |
| `O72XgnGxjkXIzskO` Curioso Redacción | KEEP intacto | Outro projeto (CuriosoTech) |
| `WagAbrHMEF7s0RuH` Events Scrapper MotoGP | KEEP | Fonte interna; futura entrada do Radar (documentar) |
| `4AIZQ23Xr9bdkOKt` serpApi google_ai_mode | KEEP | Utilitário; consumidores não identificados — investigar antes de qualquer remoção futura |
| `9O3F3cFp7xZ00LGS` Limpeza Cache (inativo) | KEEP | Avaliar reativação em sprint de manutenção |

## 3. Resumo executivo das ações

| # | Ação | Tipo | Workflow alvo | Risco |
|---|---|---|---|---|
| 1 | Backup completo sanitizado (feito em `./n8n-backup/`) | — | todos os 13 | — |
| 2 | Contrato `RadarCandidate` + `topic_id` determinístico na normalização | MODIFY | `uaE0rGAbVVxkpD1o` | baixo |
| 3 | Diretor: prompt + structured output com 12 campos + SKIP formal | MODIFY | `uaE0rGAbVVxkpD1o` | médio |
| 4 | Remover Diretor duplicado do Midia Generator | REMOVE (parcial) | `sgK1oLuR2qMVcvXI` | médio (verificar consumidores do webhook `motonapratica`) |
| 5 | Editor de Pauta: contrato de saída + `target_length` por tipo | MODIFY | `pdPyTCISLpV2aBcK` | baixo |
| 6 | Escritor: regras anti-invenção, gate de 1ª pessoa, NEEDS_RESEARCH | MODIFY | `pdPyTCISLpV2aBcK` | baixo |
| 7 | **Auditor Editorial novo** (webhook `auditor-editorial`) | ADD | novo workflow | médio |
| 8 | Publisher: gate PASS + payload V2 + credencial n8n | MODIFY | `pdPyTCISLpV2aBcK` | médio |
| 9 | Rastreio `topic_id→research_id→post_id` + auditoria na Data Table | MODIFY | `pdPyTCISLpV2aBcK` | baixo |
| 10 | Envelope formal de 17 campos do dossiê | ADD (fase 2, c/ benchmark) | fronteira DR | alto se interno — por isso fica na fronteira |
| 11 | Growth Loop (GSC/analytics) | ADD (fase posterior) | novo | — |

**Deep Research: nenhuma alteração interna nesta execução.** Justificativa registrada em 1.3.
