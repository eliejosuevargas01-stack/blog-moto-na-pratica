# n8n — Expansão de Fontes do Diretor SEO (Radar de Pautas)

**Data:** 2026-09-28
**Workflow:** Diretor SEO `uaE0rGAbVVxkpD1o` (ativo)
**Motivação:** o Diretor coletava apenas 3 fontes (scraping Motosport + Google News via SerpApi + Google Trends); o plano (`10_N8N_RESPONSIBILITIES_AND_TOOLS.md`, "Radar de Pautas") exige RSS/Atom, feeds de portais e fontes de MotoGP.

## Fontes adicionadas (testadas e vivas em 2026-09-28)

| Fonte | URL | Teste |
|-------|-----|-------|
| Moto Adventure (BR) | `https://www.motoadventure.com.br/feed/` | HTTP 200, RSS válido |
| Moto Point (BR) | `https://motopoint.com.br/feed/` | HTTP 200, RSS válido |
| Crash.net MotoGP | `https://www.crash.net/rss/motogp` | HTTP 200, RSS válido |
| Autosport MotoGP | `https://www.autosport.com/rss/feed/motogp` | HTTP 200, RSS válido |
| Google News RSS — lançamentos motos BR | `news.google.com/rss/search?q=motos+lancamento+honda+yamaha...` | HTTP 200, RSS válido |
| Google News RSS — MotoGP | `news.google.com/rss/search?q=motogp...` | HTTP 200, RSS válido |

Feeds testados e **rejeitados** (mortos/timeout): Motonline (404), Duas Rodas (timeout), Motor1 (404), Moto.com.br (404), Yamaha Brasil (404), Honda Imprensa (DNS).

## Mudanças no workflow (12 nodes novos)

**Pipeline 1 (geral):**
- 6 nodes `rssFeedRead` (RSS Moto Adventure, RSS Moto Point, RSS Crash MotoGP, RSS Autosport MotoGP, RSS GNews Lancamentos, RSS GNews MotoGP)
- 1 node Code `Normaliza Feeds RSS`: dedupe por link, filtro ≤30 dias, origem por domínio (`moto_adventure`, `moto_point`, `crash_net_motogp`, `autosport_motogp`, `google_news_rss`), top 25 → `manchetes_feeds_rss`
- Merge: `numberInputs` 3→4 (normalizador na entrada 3)
- Set `cria um id unico`: nova assignment `manchetes_feeds_rss`
- Agente Diretor: text passa a incluir `Feeds RSS (...) {{ JSON.stringify($json.manchetes_feeds_rss) }}`

**Pipeline 2 (MotoGP):**
- 3 nodes `rssFeedRead` (RSS Crash MotoGP 2, RSS Autosport MotoGP 2, RSS GNews MotoGP 2)
- 1 node Code `Normaliza Feeds RSS MotoGP` (mesmo contrato)
- 1 node Merge `Merge MotoGP` (combineByPosition, 2 entradas: parser motosport1 + normalizador)
- Set `cria um id unico2`: nova assignment `manchetes_feeds_rss`
- Agente Diretor2: text passa a incluir os feeds RSS

## Validação do normalizador (antes do deploy)

Parse local com dados reais: 60 itens brutos (Crash.net + Moto Adventure), 60 após dedupe (sem colisões), origens mapeadas corretamente (`crash_net_motogp`, `moto_adventure`).

## Verificação remota pós-deploy (re-GET da API)

- 9 nodes rssFeedRead presentes no workflow remoto
- Merge `numberInputs` = 4
- Ambos agentes mencionam `manchetes_feeds_rss` no text
- Ambos Sets com assignment `manchetes_feeds_rss`
- Conexões: trigger `noticias` → 6 RSS; `Normaliza Feeds RSS` → Merge idx 3; `parser motosport1` → `Merge MotoGP` → `cria um id unico2`
- Workflow reativado (ativo: true)

## Correção de topologia (2026-09-28 15:48 UTC)

**Problema apontado pelo usuário:** na primeira versão, os 6 RSS nodes apontavam direto para o Code `Normaliza Feeds RSS`. No n8n, um node downstream de N branches executa **N vezes** (1 por branch) — o normalizador rodaria 6× e empurraria 6 execuções parciais para o Merge final/Diretor.

**Correção aplicada (verificada remotamente):**

```
RSS (6x) → [Merge Feeds RSS (append, 6 inputs)] → [Normaliza Feeds RSS] (1 execução, todos os itens) → [Merge] idx3 → ...
RSS (3x) → [Merge Feeds RSS MotoGP (append, 3 inputs)] → [Normaliza Feeds RSS MotoGP] (1 execução) → [Merge MotoGP] idx1 → ...
```

- 2 nodes novos: `Merge Feeds RSS` e `Merge Feeds RSS MotoGP` (mode=`append`)
- Cada RSS alimenta um input dedicado do append-merge (índices 0-5 / 0-2)
- Normalizador agora roda **exatamente 1 vez** sobre o array combinado — dedupe global entre feeds funciona
- Re-GET confirmou: modes `append`, índices corretos, workflow ativo

## Resultado

- Pipeline 1: **3 → 9 fontes** (Motosport, Google News SerpApi, Google Trends + 6 feeds RSS)
- Pipeline 2: **1 → 4 fontes** (Motosport + 3 feeds RSS MotoGP)
- Diretor é chamado **uma única vez** por ciclo (após o Merge final), com todas as manchetes consolidadas
- Próxima execução real: 06:10 (schedule diário) — não foi disparada execução manual para não gerar ciclo de pesquisa fora de hora.
