# 13 — Plano Sequencial de Execução do Refoundation

**Atualizado em:** 2026-09-30  
**Princípio:** executar uma fase por vez, com PR pequena/auditável, testes e merge antes de abrir a próxima dependência.

**Contrato canônico:** usar o enum de `editorial_type` definido em `05_CONTENT_TAXONOMY_AND_MIGRATION.md`: `NEWS | ANALYSIS | BUYING_GUIDE | COMPARISON | MAINTENANCE_GUIDE | EXPLAINER | MOTORSPORT_REPORT | PERSONAL_EXPERIENCE | DATA_STUDY | REVIEW_VERIFIED`.

## Estado já concluído

1. Security hardening — concluído e mergeado.
2. Roadmap 00–09 — concluído e mergeado.
3. Frontend trust: remoção de claims inferidos — concluído e mergeado.
4. Trust Layer V1 institucional — concluído e mergeado.
5. n8n Editorial V2 — implementação remota documentada como avançada:
   - Deep Research preservado;
   - Diretor/feeds adaptados;
   - gate determinístico PROCEED/SKIP documentado;
   - Escritor com experience gate/NEEDS_RESEARCH;
   - Auditor Editorial documentado;
   - QA adversarial registrado.

## Execução sequencial

### Fase 1 — Concluir Article Trust Contract V1

Branch/PR atual: `trust/article-contract-v1-9059764352191146855` / PR #7.

Antes do merge:
- remover `POSTS` demo de todo runtime público;
- impedir `updatedAt` técnico de virar freshness editorial;
- remover defaults editoriais inventados (`3 min`, `Geral`, autor etc.);
- remover keyword genérica `Fazer 250`;
- validar URLs de fontes/autores;
- tratar data inválida em correções;
- ampliar regressions para Home, Tag, CategoryView, Sobre, Posts e Article;
- alinhar o enum do contrato TypeScript ao enum canônico do documento 05;
- atualizar a branch sobre a `main` mais recente;
- rodar suíte, typecheck e build;
- auditar diff final;
- merge somente após CI verde.

### Fase 1B — Baseline antes de migração/rollout amplo

Sem bloquear a correção da PR #7, registrar antes de migração de acervo ou mudança ampla de URLs:
- Search Console 28/90 dias;
- analytics disponível;
- URLs indexadas;
- Core Web Vitals;
- backlinks/referrals conhecidos;
- distribuição atual por categoria/tag.

Persistir snapshot datado. Não usar ausência desse baseline como motivo para adiar correções de confiança/segurança já aprovadas.

### Fase 2 — Persistência Editorial V2

Objetivo: criar fonte persistente para os contratos já preparados no frontend/n8n.

Implementar:
- Author;
- Source;
- PostSource;
- Correction;
- editorialType;
- trafficIntent;
- personalExperienceVerified;
- researchId;
- factCheckedAt;
- disclosure;
- editorialPublishedAt/editorialModifiedAt se necessário;
- reviewer/author linkage quando aplicável.

Entregas:
- migration aditiva;
- compatibilidade com posts legados;
- testes de migration/model;
- nenhuma inferência a partir de category/tag/title/slug.

### Fase 3 — CMS/API Editorial V2

Atualizar CMS/API para:
- receber os novos campos explicitamente;
- validar enums/URLs/datas;
- persistir sources/disclosure/correction;
- selecionar autor real;
- impedir autor/teste/experiência default;
- manter payload legado compatível;
- retornar erros claros para dados inválidos.

### Fase 4 — Conectar Publisher n8n ao CMS V2

Somente depois da Fase 3.

Validar:
- payload do Publisher corresponde ao contrato persistido;
- PASS obrigatório antes de publicação;
- sources persistidas;
- researchId persistido;
- personalExperienceVerified persistido;
- disclosure/factCheckedAt persistidos;
- rerun seguro;
- topic_id → research_id → post_id rastreável.

Executar smoke test controlado sem criar conteúdo falso.

### Fase 5 — Article Trust V2 completo

Com dados persistidos:
- byline real;
- author page;
- fontes reais por artigo;
- correções;
- disclosure;
- datas editoriais;
- JSON-LD Article/NewsArticle com dados explícitos;
- ProfilePage/Person somente para autores reais;
- publisher ≠ author.

### Fase 6 — Taxonomia e Migração do Acervo

Classificar o acervo:
- KEEP;
- UPDATE;
- MERGE;
- REMOVE;
- FACT_CHECK.

Separar:
- tipo editorial;
- categoria editorial;
- intenção de tráfego.

Não usar `Review` como catch-all.

Criar redirects somente quando necessário e mapear slugs antes de remoções.

### Fase 7 — Arquitetura de Informação / Navegação

Após taxonomia:
- Notícias;
- Motos;
- Comprar;
- Comparativos;
- Manutenção;
- MotoGP;
- Busca.

Revisar Home e cards para consumir taxonomia real, sem inferência.

### Fase 8 — SEO Técnico Editorial

Implementar/validar:
- canonical;
- Article/NewsArticle;
- BreadcrumbList;
- Person/ProfilePage;
- Organization;
- sitemap;
- News Sitemap;
- RSS;
- image metadata;
- max-image-preview;
- redirects;
- hreflang PT/ES/EN;
- performance/Core Web Vitals.

### Fase 9 — Analytics e Growth Loop

Integrar:
- Search Console;
- analytics;
- CTR;
- near-win;
- momentum;
- decay;
- branded search;
- authority gaps.

Alimentar o Diretor com sinais agregados, sem autoeditar produção.

### Fase 10 — Autoridade externa

Construir:
- páginas autorais consistentes;
- presença social real;
- perfis institucionais;
- citações/backlinks;
- parcerias legítimas;
- política de contato/imprensa funcional;
- evidência real de experiência quando existir.

## Regra de dependência

Não iniciar Fase 4 antes de Fases 2 e 3.

Não migrar o acervo em massa antes de Article Trust V2 estar pronto.

Não usar Growth Loop para edição automática antes de métricas e regras estarem estabilizadas.

## Higiene de branches

Após merge/encerramento, remover branches remotas que não têm trabalho exclusivo.

Branches atualmente classificadas para descarte:
- `ci/improve-build-test-pipeline`;
- `feat/n8n-editorial-restructure-v2`;
- `jules-6580860042386964120-df302c06`;
- `security/hardening-fixes`;
- `trust/editorial-transparency-v1-14286312563683114504`;
- `trust/frontend-editorial-claims-1163435019021958983`.

A documentação útil do n8n já foi consolidada na `main` pela PR #8; portanto `docs/restructure-roadmap-2026-09-28` e `docs/n8n-refoundation-state` podem ser removidas quando a limpeza remota de branches for executada.

A branch `trust/article-contract-v1-9059764352191146855` permanece ativa até a PR #7 ser corrigida, auditada e mergeada.
