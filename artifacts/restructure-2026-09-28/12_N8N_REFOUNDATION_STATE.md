# 12 — Estado consolidado do refoundation n8n

**Data do estado documentado:** 2026-09-28  
**Data da consolidação no repositório:** 2026-09-30  
**Origem:** artifacts e verificações remotas persistidos anteriormente na branch `docs/restructure-roadmap-2026-09-28`.

## Propósito

Este documento consolida o estado mais recente documentado do pipeline editorial n8n sem incorporar os exports completos dos workflows ao histórico principal do repositório.

Os arquivos `n8n-backup/*.json` permanecem fora da main intencionalmente. Eles eram snapshots sanitizados de diagnóstico e incluem workflows de outros projetos além do Moto na Prática.

## Estado consolidado

### Deep Research
- preservado como núcleo factual;
- mecanismo interno não foi reconstruído nem simplificado;
- Planner, Scrapper, Auditor interno, Redator e mecanismos de recuperação permanecem como base de pesquisa.

### Diretor / Radar
O workflow do Diretor foi ampliado com novas fontes RSS e teve a topologia corrigida para consolidar os feeds antes da normalização.

A decisão `PROCEED | SKIP` passou a ter enforcement determinístico via node `If` antes do disparo do Deep Research. Portanto, a limitação antiga registrada no `n8n-implementation-report.md` — SKIP depender somente do prompt — foi corrigida por commits posteriores documentados em `n8n-feeds-update.md`.

### Escritor
O estado documentado registra:
- gate de experiência pessoal;
- `personal_experience_verified`;
- `NEEDS_RESEARCH`;
- tamanho/estrutura dependentes do tipo editorial;
- `must_include` / `must_not_claim`;
- remoção do default rígido de 1.500–2.000 palavras.

### Auditor Editorial
Foi documentado como criado e ativo, com saída:
- `PASS`;
- `REVISE`;
- `BLOCK`.

Os testes registrados incluem cenários NEWS, BUYING_GUIDE, COMPARISON e casos adversariais de experiência fictícia.

### Segurança
O estado documentado registra migração de segredos literais de publicação/dispatch para credenciais n8n referenciadas, sem persistir os valores dos segredos nestes artifacts.

## Pendências relevantes para o refoundation

O gargalo principal deixou de ser a criação inicial do pipeline editorial e passou a ser a integração site/CMS:

1. concluir Article Trust Contract V1;
2. criar persistência para Author / Source / Correction / editorial metadata;
3. conectar o payload editorial V2 do Publisher ao modelo persistente;
4. validar um fluxo end-to-end controlado depois que o CMS aceitar os novos campos;
5. consolidar idempotência `topic_id → research_id → post_id`;
6. avançar para taxonomia/acervo;
7. implementar News Sitemap/RSS e SEO técnico restante;
8. implementar Growth Loop com Search Console/analytics.

## Limitação de verificação

Este documento consolida evidências remotas registradas em 2026-09-28. A instância n8n não foi reconsultada durante esta consolidação em 2026-09-30; portanto, ele não afirma que nenhum workflow tenha mudado depois da última verificação registrada.

## Fonte de verdade

Leia em conjunto:
- `10_N8N_RESPONSIBILITIES_AND_TOOLS.md`;
- `n8n-current-state-map.md`;
- `n8n-gap-analysis.md`;
- `n8n-contracts.md`;
- `n8n-implementation-report.md`;
- `n8n-audit-report.md`;
- `n8n-feeds-update.md`.

Quando houver conflito cronológico, o documento com timestamp/alteração posterior prevalece.
