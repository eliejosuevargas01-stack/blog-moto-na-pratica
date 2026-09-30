# 09 — Rollout, Testes e Backlog Executivo

> **Status:** este arquivo preserva o plano original de sprints de 2026-09-28. A execução real não seguiu a ordem integralmente: frontend trust/Trust Layer foram adiantados e o n8n V2 avançou remotamente antes da persistência editorial do site. Para a ordem vigente, use `13_SEQUENTIAL_EXECUTION_PLAN.md`.

### Situação consolidada
- Sprint 1: **parcial** — trust/frontend institucional concluídos; Author/Source/Correction persistentes pendentes;
- Sprint 2: **parcial** — trust components existem; Home/navigation/taxonomia V2 pendentes;
- Sprint 3: **avançada remotamente**, com integração CMS V2/idempotência final ainda pendentes;
- Sprints 4–7: pendentes/parciais conforme documento 13.

## 1. Estratégia

Executar em sprints independentes, com deploy verificável e rollback.

## Sprint 1 — Fundação de confiança

### Banco/CMS
- Author;
- PostSource;
- Correction;
- campos editoriais;
- migration aditiva;
- backfill somente de valores verificáveis; nenhum autor/tipo/experiência pode ser inventado.

### Site
- remover fallbacks de consumo aferido;
- remover label automática de teste;
- autor real;
- fontes;
- datas.

### Conteúdo institucional
- páginas base.

**Aceite:** nenhum post novo precisa mentir para caber no modelo antigo.

## Sprint 2 — UI/IA pública

- lançar nova paleta clara já preparada;
- novo header;
- novas categorias;
- nova Home;
- páginas de categoria;
- article template V2;
- author pages;
- trust components.

**Aceite:** portal funciona mobile/desktop e identidade nova está coerente.

## Sprint 3 — Pipeline n8n V2

- Diretor de Crescimento;
- contrato Deep Research;
- Editor de Pauta;
- Escritor revisado;
- Auditor;
- Publisher payload V2;
- idempotência.

**Aceite:** criar 3 posts de formatos distintos em staging sem inventar experiência.

## Sprint 4 — Migração do acervo

- export;
- classificação;
- facts review;
- redirects;
- recategorização;
- remoções.

**Aceite:** 100% inventariado e decisões registradas.

## Sprint 5 — SEO técnico

- schema;
- sitemap;
- news sitemap;
- RSS;
- OG;
- canonical;
- Discover images;
- redirects.

**Aceite:** validadores e testes passam.

## Sprint 6 — Analytics/Growth

- ingestão GSC;
- analytics;
- tabela diária;
- dashboard;
- payload de feedback.

**Aceite:** 7 dias consecutivos sem duplicação e métricas coerentes.

## Sprint 7 — Autoridade externa

- perfis oficiais;
- email;
- YouTube;
- ativos próprios;
- estratégia de backlinks.

**Aceite:** identidade consistente e links externos oficiais partem das páginas do site.

## 2. Testes obrigatórios

### Unit
- classificadores;
- metadata helpers;
- sitemap filters;
- schema builders;
- URL normalization.

### Integration
- CMS publish;
- author relation;
- source relation;
- correction;
- n8n payload;
- analytics ingest.

### E2E
- Home;
- category;
- article;
- author;
- institutional page;
- search;
- admin publish;
- mobile nav.

### SEO
- canonical;
- noindex;
- JSON-LD;
- sitemap;
- news sitemap;
- redirects.

### Performance
- Home;
- article;
- category;
- mobile throttled.

### Accessibility
- keyboard;
- focus;
- contrast;
- labels;
- headings;
- alt.

## 3. Dados de teste

Criar fixtures explícitas:
- NEWS com fontes;
- BUYING_GUIDE;
- COMPARISON;
- PERSONAL_EXPERIENCE validada;
- legado sem autor;
- post com correção;
- post em ES/EN para não quebrar i18n.

Nunca usar fixture falsa em produção.

## 4. Rollback

Cada sprint precisa de:
- migration rollback ou forward-fix planejado;
- branch;
- release tag;
- backup;
- feature flag quando necessário;
- checklist pós-deploy.

## 5. Observabilidade pós-launch

Primeiras verificações:
- erros 5xx;
- 404;
- sitemap;
- crawl;
- auth admin;
- imagens;
- Core Web Vitals;
- webhook n8n;
- publicação;
- banco.

## 6. Riscos

### Risco: queda de tráfego por remoção
Mitigação: usar GSC/backlinks antes de remover e redirecionar corretamente.

### Risco: migrations quebrando legado
Mitigação: aditiva + backfill.

### Risco: nova UI piorar LCP
Mitigação: performance budget e imagens otimizadas.

### Risco: n8n publicar claim incorreta
Mitigação: auditor + fontes + estado BLOCK.

### Risco: autoridade parecer fabricada
Mitigação: transparência e zero números/badges falsos.

### Risco: excesso de categorias
Mitigação: hubs principais, subcategorias somente com volume real.

## 7. Definition of Done global

O projeto V2 só é considerado concluído quando:
- conteúdo V2 nasce com autor/tipo/fontes;
- home nova está live;
- paleta clara está live e validada;
- não existem fallbacks editoriais enganosos;
- taxonomia está migrada;
- páginas de confiança estão live;
- schema/sitemaps estão corretos;
- pipeline n8n V2 publica com auditoria;
- analytics alimenta growth;
- acervo foi auditado;
- presença externa está consistente;
- documentação foi atualizada com SHAs/releases reais.

## 8. Próximo passo operacional

A sequência original acima foi parcialmente superada pela execução. Em 2026-09-30:

- frontend trust e páginas institucionais já foram implementados;
- o n8n V2 já possui avanços remotos documentados;
- a persistência editorial do site/CMS continua sendo a dependência central.

A ordem operacional vigente está em `13_SEQUENTIAL_EXECUTION_PLAN.md`. Não iniciar integração final Publisher → CMS V2 antes de concluir Article Trust Contract, persistência e API/CMS V2.
