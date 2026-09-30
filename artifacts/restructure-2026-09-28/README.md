# Moto na Prática — Reestruturação Editorial, Produto e Autoridade

**Status:** APROVADO PARA EXECUÇÃO  
**Data-base:** 2026-09-28  
**Repositório:** `eliejosuevargas01-stack/blog-moto-na-pratica`  
**Branch de planejamento:** `docs/restructure-roadmap-2026-09-28`  
**Objetivo:** transformar o Moto na Prática de um blog automatizado com baixa autoridade externa em uma publicação independente de motociclismo, reconhecível, confiável, útil, popular e orientada por tráfego real.

## Princípios imutáveis

1. O Deep Research existente permanece como núcleo de pesquisa factual. Não reconstruir nem substituir sem evidência de falha.
2. IA pode auxiliar pesquisa, organização e redação, mas não pode inventar vivência pessoal, teste de longa duração, oficina, quilometragem, consumo aferido ou experiência de pilotagem.
3. O site deve diferenciar explicitamente conteúdo de redação, conteúdo autoral e experiência pessoal.
4. A nova paleta clara e de maior contraste já desenvolvida é o baseline visual. Não redesenhar a paleta antes do lançamento; apenas validar legibilidade, acessibilidade e consistência.
5. O foco editorial passa a ser popularidade + utilidade + atualidade + autoridade temática, sem abandonar profundidade.
6. SEO não decide a verdade editorial. O sistema editorial produz conteúdo útil; SEO melhora descoberta e distribuição.
7. Crescimento será medido por Search Console, analytics, autoridade externa, retorno de usuários e desempenho por cluster, não por quantidade de artigos publicados.
8. Mudanças críticas devem ser reversíveis e lançadas por fases.

## Artefatos deste pacote

- `00_MASTER_ROADMAP.md`: visão executiva, fases, dependências e ordem de execução.
- `01_RESPONSIBILITY_MATRIX.md`: divisão exata entre n8n, site, banco/CMS, operações, analytics e tarefas humanas.
- `02_N8N_EDITORIAL_SYSTEM.md`: alterações no pipeline editorial e contratos dos agentes.
- `03_SITE_CODE_AND_DATA_MODEL.md`: alterações necessárias no código, Prisma/Supabase, CMS e APIs.
- `04_UI_UX_INFORMATION_ARCHITECTURE.md`: home, artigo, navegação, confiança e experiência mobile.
- `05_CONTENT_TAXONOMY_AND_MIGRATION.md`: categorias, tipos editoriais e tratamento do acervo existente.
- `06_AUTHORITY_TRUST_AND_BRAND.md`: plano para autoridade, transparência, autoria, presença externa e reputação.
- `07_TECHNICAL_SEO_NEWS_DISCOVER.md`: schema, sitemaps, Google News/Discover, canonicals, imagens e performance.
- `08_ANALYTICS_AND_GROWTH_LOOP.md`: telemetria e feedback do público de volta ao n8n.
- `09_ROLLOUT_TESTING_AND_BACKLOG.md`: sequência de execução, critérios de aceite, testes, riscos e Definition of Done.
- `10_N8N_RESPONSIBILITIES_AND_TOOLS.md`: responsabilidades e fronteiras operacionais do pipeline n8n.
- `11_SPARK_MCP_IMPLEMENTATION_PROMPT.md`: prompt histórico de execução remota da adaptação n8n.
- `12_N8N_REFOUNDATION_STATE.md`: estado consolidado do refoundation n8n e pendências de integração com site/CMS.
- `13_SEQUENTIAL_EXECUTION_PLAN.md`: ordem de execução e dependências para concluir o refoundation.
- `n8n-current-state-map.md`, `n8n-gap-analysis.md`, `n8n-contracts.md`, `n8n-implementation-report.md`, `n8n-audit-report.md` e `n8n-feeds-update.md`: evidências e histórico técnico da implementação remota registrada em 2026-09-28.

## Regra de retomada

Qualquer agente que retomar este projeto deve ler primeiro este README, depois `00_MASTER_ROADMAP.md` e `01_RESPONSIBILITY_MATRIX.md`. Nenhuma implementação deve começar apenas com base em um prompt isolado. As decisões registradas aqui substituem ideias anteriores conflitantes, salvo decisão posterior documentada no repositório.
