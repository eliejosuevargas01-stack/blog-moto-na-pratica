# 14 — Auditoria de Coerência Documental

**Data:** 2026-09-30  
**Escopo:** `artifacts/restructure-2026-09-28/`  
**Objetivo:** estabelecer decisões canônicas e impedir que snapshots históricos sejam tratados como estado atual.

## 1. Hierarquia de documentos

Para **ordem de execução atual**:
1. `13_SEQUENTIAL_EXECUTION_PLAN.md`.

Para **estado conhecido do n8n**:
1. `12_N8N_REFOUNDATION_STATE.md`;
2. `n8n-feeds-update.md` quando registrar mudança posterior ao relatório/auditoria inicial.

Para **arquitetura e responsabilidades alvo**:
- `00_MASTER_ROADMAP.md`;
- `01_RESPONSIBILITY_MATRIX.md`;
- `02_N8N_EDITORIAL_SYSTEM.md`;
- `03_SITE_CODE_AND_DATA_MODEL.md`;
- `04_UI_UX_INFORMATION_ARCHITECTURE.md`;
- `05_CONTENT_TAXONOMY_AND_MIGRATION.md`;
- `06_AUTHORITY_TRUST_AND_BRAND.md`;
- `07_TECHNICAL_SEO_NEWS_DISCOVER.md`;
- `08_ANALYTICS_AND_GROWTH_LOOP.md`;
- `09_ROLLOUT_TESTING_AND_BACKLOG.md`;
- `10_N8N_RESPONSIBILITIES_AND_TOOLS.md`;
- `n8n-contracts.md`.

São **evidência histórica**, não estado vigente isolado:
- `n8n-current-state-map.md`;
- `n8n-gap-analysis.md`;
- `n8n-implementation-report.md`;
- `n8n-audit-report.md`;
- `11_SPARK_MCP_IMPLEMENTATION_PROMPT.md`.

## 2. Enum canônico de editorial type

Este é o único enum alvo permitido para novas implementações:

```text
NEWS
ANALYSIS
BUYING_GUIDE
COMPARISON
MAINTENANCE_GUIDE
EXPLAINER
MOTORSPORT_REPORT
PERSONAL_EXPERIENCE
DATA_STUDY
REVIEW_VERIFIED
```

Fonte canônica: `05_CONTENT_TAXONOMY_AND_MIGRATION.md`.

Aliases antigos como `MAINTENANCE` ou `MOTORSPORT` podem existir apenas em compatibilidade/adapters. Não devem ser persistidos como novos valores.

`REVIEW_VERIFIED` exige experiência/teste real comprovado e nunca é inferido por categoria, tag, slug, título ou presença da palavra “review”.

## 3. Traffic intent canônico

```text
SEARCH
DISCOVER
NEWS
EVERGREEN
AUTHORITY
```

## 4. Autoria

- autoria é dado explícito;
- ausência de autor permanece ausência de autor no legado/transição;
- não usar `Eliezer Vargas` como fallback;
- não usar `Redação Moto na Prática` como fallback;
- `Redação Moto na Prática` pode existir como identidade `ORGANIZATION`, mas só deve ser associada a um post explicitamente;
- `publisher = Moto na Prática` não implica `author = Moto na Prática`.

Para novas publicações V2, o CMS pode exigir autor antes de publicar depois que a persistência estiver implantada. Isso não autoriza backfill inventado em posts legados.

## 5. Experiência pessoal e review

`personalExperienceVerified=true` só pode ser persistido quando houver experiência humana verificável.

Nenhum componente pode inferir experiência de:
- category;
- tag;
- slug;
- title;
- texto em primeira pessoa;
- tipo visual antigo.

`REVIEW_VERIFIED` requer experiência/teste comprovado. `ANALYSIS` é a alternativa apropriada quando a avaliação é documental.

## 6. Datas e freshness

Separar timestamps técnicos de timestamps editoriais.

### Técnicos
- `createdAt`;
- `updatedAt` do registro/Prisma.

Podem mudar por operações que não representam edição editorial.

### Editoriais
- `firstPublishedAt` ou equivalente persistido;
- `editorialModifiedAt` ou equivalente persistido;
- `factCheckedAt`.

Regras:
- `Post.updatedAt` técnico nunca gera automaticamente “Atualizado”;
- `Post.updatedAt` técnico nunca gera automaticamente `dateModified`;
- ausência de data editorial não vira `new Date()`;
- n8n `publishedAt` representa um timestamp editorial explícito e o CMS deve mapeá-lo ao campo editorial de publicação;
- correção/atualização material deve registrar motivo quando aplicável.

## 7. Fontes

- fontes por artigo devem ser explícitas/estruturadas;
- links encontrados no HTML não viram automaticamente `Source`;
- URLs externas devem aceitar apenas protocolos seguros;
- fonte ausente não recebe fonte default;
- Deep Research pode produzir dossiê/fonte; o CMS persiste; o site renderiza.

## 8. Nomenclatura entre fronteiras

n8n usa majoritariamente snake_case em contratos internos:
- `editorial_type`;
- `traffic_intent`;
- `personal_experience_verified`;
- `research_id`;
- `topic_id`.

Payload/CMS/TypeScript podem usar camelCase:
- `editorialType`;
- `trafficIntent`;
- `personalExperienceVerified`;
- `researchId`;
- `topicId`.

A conversão deve ocorrer em adapters/fronteiras, não por duplicação semântica de campos persistidos.

## 9. Estado do n8n

O snapshot inicial e o gap analysis registram o estado **antes** das alterações de 2026-09-28.

O estado consolidado documentado inclui:
- Deep Research preservado;
- Escritor com experience gate / NEEDS_RESEARCH;
- Auditor Editorial criado/documentado;
- Diretor adaptado;
- feeds ampliados;
- gate `PROCEED/SKIP` determinístico antes do Deep Research.

Ainda pendem:
- persistência CMS V2;
- integração final Publisher → CMS V2;
- rastreabilidade/idempotência completa `topic_id → research_id → post_id`;
- smoke test end-to-end controlado após o CMS aceitar os campos V2.

## 10. Estado do site/refoundation

Concluído/documentado:
- security hardening;
- remoção dos principais claims falsos de consumo/teste no frontend;
- Trust Layer V1 institucional;
- documentação consolidada do n8n.

Em andamento:
- Article Trust Contract V1 (PR #7 no momento desta auditoria).

Próxima dependência estrutural:
- persistência Author / Source / PostSource / Correction / metadados editoriais;
- CMS/API V2.

## 11. Baseline e rollout

O baseline de GSC/analytics/CWV continua necessário antes de:
- migração ampla do acervo;
- remoção/merge em massa;
- mudanças extensas de URLs;
- rollout que torne comparação de tráfego impossível.

Ele não bloqueia correções de segurança, confiança ou falsos claims.

## 12. Rotas institucionais canônicas atuais

- `/sobre`;
- `/contato`;
- `/politica-editorial`;
- `/como-pesquisamos`;
- `/politica-de-correcoes`;
- `/uso-de-inteligencia-artificial`;
- `/publicidade-e-afiliados`;
- `/politica-de-privacidade`;
- `/termos-de-uso`.

## 13. Regra final

Quando um documento histórico descreve “estado atual”, interpretar a frase no contexto da data daquele documento.

Quando uma especificação alvo divergir de uma implementação existente:
- não declarar a implementação como concluída;
- registrar adapter/pendência;
- manter um único contrato canônico para a direção futura.

Ausência de dado continua sendo um estado legítimo. Nunca preencher lacunas editoriais por conveniência.
