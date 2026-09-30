# Security Hardening — Handoff

> **CHECKPOINT HISTÓRICO DA PR #3.** Este arquivo registra o estado validado no momento do hardening. A `main` recebeu alterações posteriores (incluindo migração da verificação JWT para Web Crypto/Edge Runtime e o refoundation editorial). Para estado geral atual, use o README raiz e `artifacts/restructure-2026-09-28/13_SEQUENTIAL_EXECUTION_PLAN.md`.

## Checkpoint validado

PR: #3 — `security/hardening-fixes`

Último checkpoint de código validado antes deste documento:

`a33fb6cdd6abe38aa6c60409d6e3052bf1a674fd`

Workflow validado:

- Run: `36377322476`
- Job: `108785717635`
- TypeScript (`tsc --noEmit`): PASS
- Vitest: 251/251 PASS
- Production build (`next build`): PASS

## Hardening concluído nesta PR

- Segregação entre sessão administrativa e sessão de usuário comum.
- Tokens administrativos com claims explícitas de role/tokenType.
- Tokens de usuário comum não satisfazem autorização administrativa.
- Autenticação M2M centralizada via headers.
- Remoção de autenticação por `api_key` em query string.
- Centralização das chamadas n8n em cliente server-side.
- Webhook n8n configurado exclusivamente por `N8N_WEBHOOK_URL`.
- AdminDashboard sem edição/persistência client-side do webhook.
- Remoção de segredos/fallbacks hardcoded identificados na auditoria.
- Proteção de `GET /api/posts` contra exposição pública de drafts.
- Upload protegido, com limites de tamanho, magic bytes, bloqueio de SVG e proteção contra pixel bombs.
- `remotePatterns` restrito aos hosts necessários.
- Remoção de `ignoreBuildErrors` e `ignoreDuringBuilds`.
- Testes de segurança e regressão adicionados ao CI.

## Pendência isolada para próxima sessão

### Upgrade do Next.js

A versão atualmente presente no `package.json` continua sendo:

`next@14.2.23`

Isso é uma constatação do repositório, não uma recomendação de permanecer nessa versão indefinidamente.

O upgrade deve ser tratado separadamente, em branch/PR dedicada, partindo de um checkpoint verde.

A versão alvo deve ser escolhida e verificada no momento da execução; não usar um número de versão histórico deste handoff como recomendação permanente.

Motivo: a atualização precisa alterar `package.json` e `pnpm-lock.yaml` juntos. O lockfile deve ser regenerado por pnpm em ambiente com acesso ao registry; não editar hashes/integrity manualmente e não enfraquecer o CI com `--no-frozen-lockfile`.

Fluxo recomendado:

```bash
git checkout main
git pull origin main
git checkout -b security/next-upgrade

pnpm update next@<TARGET_VERSION>

git add package.json pnpm-lock.yaml
git commit -m "chore(deps): upgrade Next.js with synchronized lockfile"
git push -u origin security/next-upgrade
```

Depois abrir PR dedicada e exigir novamente:

- `tsc --noEmit` PASS
- Vitest PASS
- `next build` PASS
- revisão das mudanças de configuração/API exigidas pela migração

## Regra para continuação

Não misturar o upgrade do framework com novas alterações de hardening já validadas nesta PR. O objetivo da próxima sessão é tratar especificamente a atualização do Next.js e qualquer incompatibilidade resultante dela.
