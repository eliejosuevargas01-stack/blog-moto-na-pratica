# n8n — Mapa do Estado Atual (Inventário)

> **SNAPSHOT HISTÓRICO PRÉ-IMPLEMENTAÇÃO — 2026-09-28.** “Atual” neste título significa o estado no momento da coleta, antes das modificações posteriores do mesmo dia. Não usar este arquivo sozinho para inferir o estado remoto vigente. Consulte `12_N8N_REFOUNDATION_STATE.md` e `n8n-feeds-update.md`.

**Data da coleta:** 2026-09-28
**Instância:** `https://myn8n.dominuslabs.online` (API pública v1, verificada remotamente)
**Método:** `GET /api/v1/workflows` + `GET /api/v1/workflows/{id}` para cada workflow candidato. A coleta original usou backups sanitizados; os exports completos `n8n-backup/*.json` não foram consolidados na `main` por higiene de repositório.
**Escopo:** somente leitura. Nenhuma alteração remota foi feita nesta etapa.

---

## 1. Tabela de workflows do sistema editorial

| ID remoto | Nome | Ativo | Nodes | Gatilho | Papel atual | Papel V2 correspondente |
|---|---|---|---|---|---|---|
| `uaE0rGAbVVxkpD1o` | Moto Na Pratica - Diretores SEO | sim | 24 | schedule ×2 ("noticias", "noticias1") | **Radar + Diretor fundidos**: coleta RSS motorsport.com, SerpApi Google News, SerpApi Google Trends (×2 ramos paralelos), normaliza em Code nodes, gera `id_pesquisa` aleatório e um agente LLM decide a pauta e dispara o Deep Research por tool | **SPLIT**: Radar de Pautas + Diretor de Crescimento Editorial |
| `op3gvAdtkYjO9ydV` | Deep Research - Planner | sim | 26 | webhook `deep-research` (auth via header + schema) | Entrada do Deep Research: valida (`query.id` inteiro, `body.tema`, `body.webhook_callback`, header secreto), gera plano com 4 personas LLM (Fatos Essenciais, Analista Técnico, Mercado/Consumidor, Verificador Cético) + sintetizador, persiste plano em Data Table, avança fase e dispara Scrapper | **KEEP** (Deep Research — peça crítica, preservar mecanismo) |
| `cwLWc2wG6M8IlcqG` | Deep Research - Scrapper | sim | 42 | webhooks `Scrapper` + `google_search_scrapper` | "Garimpeiro": agente pesquisador (gemini-3.5-flash-lite) com tool de busca sanitizada, cache vetorial Supabase (embeddings via Router), leitura de páginas via r.jina.ai, SERP via Apify com fallback Jina+Bing, controle de tentativas (≤3), repescagem, transição de fase para auditoria | **KEEP** (Deep Research) |
| `Vz7KzzYWavLw3meH` | Deep Research - Auditor | sim | 23 | webhook `auditor` | Auditor **interno de passos de pesquisa** (não editorial): audita itens por `passo_id`, até 3 tentativas, força OK após 3, devolve para garimpo ou libera para o Redator | **KEEP** (interno do Deep Research; NÃO é o Auditor Editorial do pipeline V2) |
| `WGxdU1MdmoMpdZa3` | Deep Research - Redator | sim | 12 | webhook `gera-relatorio-final` | Consolida o dossiê final (relatório) via agente `monta relatorio final` (gemini-3.8-flash) com output estruturado `{id_pesquisa, titulo_relatorio, topicos[].subtopicos[].analise_detalhada com (Fonte: url)}`, persiste em Data Table, faz callback para `body.webhook_callback` | **KEEP** + formalizar envelope de saída |
| `GhiEcBPGM0JKP0Qt` | Deep Research - Sweeper (auto-recuperacao) | sim | 8 | schedule 5 min | Recuperação: destrava passos travados (10min–6h) e religa Scrapper/Auditor via webhook | **KEEP** (observabilidade/resiliência do DR) |
| `9O3F3cFp7xZ00LGS` | Deep Research - Limpeza Cache (TTL 30d) | **não** | 2 | schedule diário 3h | Apaga cache expirado (Postgres) | KEEP (avaliar reativação — hoje inativo) |
| `pdPyTCISLpV2aBcK` | Moto Na Pratica - Escritor | sim | 36 | webhooks `posts-slug` + `deep-research-callback` | **Editor de Pauta + Escritor + Publisher + Tradutor + TTS fundidos**: recebe callback do DR (`id_pesquisa`, `relatorio`, `assunto`, `dores`), busca posts publicados (Supabase), gera ângulo (agente), publica decisão de pauta, planeja artigo (agente, 2 partes), escreve blocos (agente), monta payload final e **publica direto** em `motonapratica.online/api/posts` (PT/ES/EN) + gera áudio TTS | **SPLIT/MODIFY**: formalizar Editor de Pauta, adaptar Escritor, inserir Auditor Editorial antes da publicação, Publisher com payload V2 |
| `sgK1oLuR2qMVcvXI` | Moto Na Pratica - Midia Generator | sim | 22 | webhook `motonapratica` | Híbrido: contém **outro agente "Diretor SEO"** (com tools Google Trends / deep-research / posts-slug) + geração de imagens (Vertex AI) + TTS + envio de imagem para `/api/posts` | **SPLIT/REMOVE** (remover a função de Diretor duplicada; manter geração de mídia) |
| `WagAbrHMEF7s0RuH` | Mono na Pratica - Events Scrapper & Results | sim | 13 | schedule | Coleta calendário/resultados MotoGP (api.motogp.pulselive.com via r.jina.ai) e persiste no Supabase | **KEEP** (fonte de dados interna para o Radar) |
| `4AIZQ23Xr9bdkOKt` | pesquisa fatos sobre falta de sites etc | sim | 3 | executeWorkflowTrigger | Subworkflow utilitário: busca SerpApi "google_ai_mode" + normalização | KEEP (ferramenta auxiliar; verificar consumidores) |
| `GEMPoeNvEHUYz2NL` | scrapper | sim | 20 | webhook | **Fora do escopo editorial** (CRM/leads frios Dominus) | — (não mexer) |
| `O72XgnGxjkXIzskO` | Curioso \| Redacción Editorial (AI Agent) | sim | 15 | cron diário | **Fora do escopo** (projeto CuriosoTech, ES, vídeo) | — (não mexer) |

Nenhum outro workflow da instância (59 no total) tem relação com o blog Moto na Prática.

---

## 2. Fluxo de dados atual (verificado nas conexões e parâmetros)

```
[schedule] Diretores SEO (uaE0rGAbVVxkpD1o)
   ├─ RSS motorsport.com/motogp + SerpApi Google News + SerpApi Google Trends
   ├─ parsers (Code) → Merge → "cria um id unico" (id_pesquisa = random 0..999999)
   └─ Agente "Diretor SEO" (gemini-3.8-flash)
        ├─ tool: 'Posts Ja Escritos'  → webhook posts-slug (Escritor lista slugs)
        └─ tool: 'Moto na Pratica'    → POST webhook deep-research (Planner)
                                             body: { tema }, query: { id }, header secreto, webhook_callback
                ↓
        Deep Research: Planner → Scrapper ⇄ Auditor (interno) → Redator
                ↓ callback HTTP para webhook_callback
[webhook deep-research-callback] Escritor (pdPyTCISLpV2aBcK)
   ├─ Prepara Dados (id_pesquisa, relatorio=JSON.parse, assunto, dores)
   ├─ Busca Posts Publicados (Supabase) → IA - Angulo do Post (tool posts-slug)
   ├─ Publica Decisao de Pauta → POST webhook posts-slug (auto-chamada)
   ├─ Atualiza Status Pesquisa (Data Table "Pesquisa" 9ltZLFGUXe11LFQk)
   ├─ Monta Contexto → IA - Planejamento do Artigo (2 partes) → IA - Escritor de Blocos
   └─ Monta Payload Final →
        ├─ Salva Assunto na Tabela (Data Table deep_research_relatorio_final)
        ├─ Publica Post PT  → POST https://motonapratica.online/api/posts  (x-api-key)
        ├─ Traduz ES/EN (Vertex) → Publica Post ES/EN → mesma API
        └─ Monta Texto TTS → Gera Audio (Google TTS synthesizeLongAudio)
```

**Não existe Auditor Editorial** entre a escrita e a publicação. O conteúdo vai do LLM direto para produção.

---

## 3. Estado, identidade e idempotência (hoje)

- **Estado do Deep Research:** n8n Data Tables no projeto `0m3AYoFvtbqWOB3e` (tabelas `9ltZLFGUXe11LFQk` "Pesquisa"/"deep_research_relatorio_final", `arAS2xvz1XBxyA57`, `ckZETOjmwN7qToHV`) — fases: planejar → garimpar → auditar → redatar; locks por passo; sweeper de recuperação.
- **`id_pesquisa`**: inteiro aleatório (`Math.floor(Math.random()*1000000)`) gerado no Diretor — frágil (colisão, sem derivação do tópico, sem unicidade garantida).
- **Deduplicação de pauta:** feita pelo agente Diretor consultando a tool 'Posts Ja Escritos' (lista de slugs) — deduplicação "semântica por LLM", não determinística.
- **Deduplicação de publicação:** o CMS (`POST /api/posts`) faz upsert por `translationGroupId`/`id`/`slug` por idioma — reenvio do mesmo `id` atualiza em vez de duplicar (bom), mas nada impede dois `id_pesquisa` distintos para o mesmo assunto.
- **Observabilidade:** DR registra fases/tentativas em Data Tables; Escritor grava ângulo/gancho na tabela Pesquisa. Não há registro único de run com `topic_id → research_id → post_id`.

## 4. Integração com o CMS (site)

- Endpoint: `POST https://motonapratica.online/api/posts`, auth `x-api-key` (M2M).
- Payload consumido (verificado em `src/app/api/posts/route.ts` na branch de planejamento): `output.{pt,en,es}.{id,title,summary,meta-title,meta-description,meta-tags,tag,category,type,status,slug,block-1..20,img-1..21,focalPoint-N,audio*}`, `translationGroupId`, `mentioned_slugs`.
- **Chaves extras no payload são ignoradas sem erro** — o Publisher V2 pode enviar metadados editoriais novos imediatamente; a persistência deles depende da sprint do site (ver `03_SITE_CODE_AND_DATA_MODEL.md`).

## 5. Achados de segurança (pré-existentes, registrados sem valores)

1. A chave M2M do CMS (`x-api-key`) está **hardcoded** nos nodes HTTP do Escritor e do Midia Generator → migrar para credencial n8n. *(não exposta neste artifact nem nos backups)*
2. O segredo do webhook do Planner está **hardcoded** no Code node de validação → migrar para variável de ambiente/credencial.
3. Escritor chama Vertex AI e Google TTS por URL de projeto direta — verificar onde a credencial GCP vive.

## 6. Sobreposições de responsabilidade (indevidas)

1. **Diretores SEO** acumula Radar (coleta/normalização de fontes) + Diretor (decisão) + disparo de pesquisa.
2. **Midia Generator** contém um **segundo Diretor SEO** duplicado (mesma função de escolher pauta e disparar DR) + geração de mídia + publicação de imagem.
3. **Escritor** acumula Editor de Pauta (ângulo/planejamento) + Redação (blocos) + Publicação (CMS) + Tradução + TTS.
4. Ausência total do **Auditor Editorial** (o "Deep Research - Auditor" audita passos de pesquisa, não o artigo contra o dossiê).

## 7. O que NÃO foi possível determinar

- Conteúdo exato das Data Tables (linhas atuais) — não lido nesta etapa (somente estrutura via parâmetros dos nodes).
- Quem consome o subworkflow `4AIZQ23Xr9bdkOKt` (nenhuma referência direta nos 13 workflows inspecionados; pode ser chamado por nome legado ou estar órfão).
- Frequência exata dos schedules "noticias"/"noticias1" (parâmetros não detalhados aqui).
- Se o webhook `posts-slug` tem algum consumidor externo além do próprio Escritor/Midia/Diretor.
