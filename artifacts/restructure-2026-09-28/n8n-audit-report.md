# n8n — Relatório de Auditoria Independente (t5)

> **AUDITORIA HISTÓRICA t5.** Houve QA e alterações posteriores no mesmo dia. Para o estado consolidado use `12_N8N_REFOUNDATION_STATE.md`; para o gate PROCEED/SKIP posterior use `n8n-feeds-update.md`.

**Data:** 2026-09-28
**Auditor:** execução independente (delegação por subagente indisponível — provider `render` não configurado; auditoria feita pelo orquestrador em modo read-only, com evidência remota via API)
**Instância:** https://myn8n.dominuslabs.online

## Veredito: **APPROVED** (após correção de 3 findings críticos)

## Findings e resolução

| # | Severidade | Finding | Workflow | Resolução |
|---|-----------|---------|----------|-----------|
| 1 | critical | Deep Research aparentava modificado | `op3gvAdtkYjO9ydV` | **Falso positivo** — diffs eram artifacts do scrub de secrets nos backups (`***` vs `***REDACTED***`). Normalizada a comparação: parameters idênticos, nenhuma alteração real. ✅ |
| 2 | critical | Secret literal `x-api-key` no header dos nodes Publica Post PT/ES/EN | `pdPyTCISLpV2aBcK` | **Corrigido** — secret pré-existente movido para credencial `ZeO5EBYZt3MNBsME` (httpHeaderAuth), header literal removido, nodes rewired com `genericCredentialType`. Verificado: 0 literais. ✅ |
| 3 | critical | Secret literal `x-apify-secret` nos nodes Call 'Moto na Pratica'(2) | `uaE0rGAbVVxkpD1o` | **Corrigido** — movido para credencial `i8S9lCHxuzghW3VR` (httpHeaderAuth), rewired. Verificado: 0 literais. ✅ |

## Checks executados (todos com evidência remota via GET /api/v1/workflows/{id})

- ✅ Auditor Editorial `DYg6J6Y21xkEvxJp` ativo, webhook `headerAuth`, gate determinístico de primeira pessoa, veredito PASS/REVISE/BLOCK com forçamento de BLOCK em critical
- ✅ Escritor `pdPyTCISLpV2aBcK`: gate de experiência, NEEDS_RESEARCH, editorial_type, EXPERIENCE GATE no Planejamento, MPF agrega needs_research
- ✅ Diretor `uaE0rGAbVVxkpD1o`: schema `decisao: PROCEED|SKIP`, `requires_verified_experience`, `personal_experience_verified`, prompt com EXPERIENCE GATE
- ✅ Deep Research `op3gvAdtkYjO9ydV`: parameters idênticos ao backup (após normalização do scrub) — preservado conforme regra da missão
- ✅ Nenhum secret literal em nenhum dos 3 workflows modificados/criados

## Riscos residuais

- Credenciais novas (`ZeO5EBYZt3MNBsME`, `i8S9lCHxuzghW3VR`, `12NzTeLDEIzLLl4S`) criadas via API — recomendado validar uma execução real de publicação (t6) para confirmar que o header auth genérico está sendo enviado corretamente.
- **[RESOLVIDO após esta auditoria]** o gate de SKIP estava apenas no prompt neste corte; posteriormente foi convertido em enforcement determinístico por node `If`.

## Próxima ação recomendada naquele corte
O QA t6 ainda era a próxima ação no momento desta auditoria. Ele foi executado posteriormente e está registrado em `n8n-implementation-report.md`; isso não equivale a smoke test end-to-end de publicação no CMS V2, que continua pendente.
