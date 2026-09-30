# Moto na Prática

Portal independente de motociclismo construído em Next.js, TypeScript, Prisma e PostgreSQL/Supabase, com CMS próprio e automações editoriais via n8n.

## Estado do projeto

O projeto está em **refoundation editorial/técnico**. A direção atual não é apenas “publicar mais”, mas consolidar:

- confiança e transparência editorial;
- autoria e fontes rastreáveis;
- distinção entre análise documental e experiência real;
- contratos claros entre n8n, CMS e frontend;
- taxonomia consistente;
- SEO técnico sem freshness/autoria inventadas;
- crescimento orientado por dados.

A documentação canônica da reestruturação está em:

`artifacts/restructure-2026-09-28/README.md`

Para retomar o trabalho, leia primeiro:

1. `artifacts/restructure-2026-09-28/README.md`
2. `artifacts/restructure-2026-09-28/13_SEQUENTIAL_EXECUTION_PLAN.md`
3. `artifacts/restructure-2026-09-28/14_DOCUMENTATION_COHERENCE_AUDIT.md`

## Stack verificada no repositório

- Next.js `14.2.23` (App Router);
- React `18.3.1`;
- TypeScript;
- Prisma `6.2.1`;
- PostgreSQL/Supabase;
- Vitest;
- Tailwind CSS;
- Sharp;
- CMS/admin próprio;
- integração server-side com n8n.

Consulte `package.json` como fonte de verdade para versões.

## Segurança

O hardening principal foi consolidado pela PR #3 e inclui, entre outros pontos:

- segregação de sessão admin/usuário;
- autenticação M2M por header;
- cliente n8n server-side;
- proteção de drafts;
- hardening de uploads;
- sanitização/XSS;
- CI com TypeScript, testes e build.

O documento `docs/security-hardening-handoff.md` é um checkpoint histórico e está identificado como tal.

## Variáveis de ambiente

Use `.env.example` como referência. Não copie valores de documentação antiga e não versione `.env`.

Principais grupos:

- banco: `DATABASE_URL`;
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, chaves públicas/server-side conforme `.env.example`;
- autenticação: `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_SECRET`, `API_SECRET_KEY`;
- n8n: `N8N_WEBHOOK_URL`;
- site: `SITE_URL`, `NEXT_PUBLIC_SITE_URL`.

Nunca exponha chaves server-side em variáveis `NEXT_PUBLIC_*`.

## Desenvolvimento local

Instale dependências e gere o Prisma Client:

```bash
pnpm install
pnpm prisma:generate
```

Configure um arquivo `.env` local a partir de `.env.example`.

Depois:

```bash
pnpm dev
```

Validações usadas pelo CI:

```bash
pnpm exec tsc --noEmit
pnpm test
pnpm build
```

### Banco local

O repositório possui scripts:

```bash
pnpm prisma:db:push
pnpm prisma:seed
```

Use-os apenas em ambiente de desenvolvimento/controlado e sabendo qual banco está em `DATABASE_URL`. **Não execute `db push` ou seed contra produção como passo genérico de setup.**

Mudanças de schema do refoundation devem seguir migration aditiva, revisão e plano de compatibilidade descritos nos artifacts.

## CI

O workflow `.github/workflows/ci.yml` executa em PRs para `main`:

1. instalação;
2. Prisma Client generation;
3. TypeScript;
4. Vitest;
5. production build.

Uma PR não deve ser considerada pronta apenas porque compila localmente.

## Deploy

O projeto contém Dockerfile e é operado em ambiente containerizado/Coolify. Configurações específicas de produção devem vir do ambiente de deploy, não de paths locais de uma máquina de desenvolvimento.

Uploads persistentes precisam de storage/volume compatível com a configuração do ambiente.

## Regras editoriais técnicas essenciais

O frontend/CMS não deve:

- inventar autor;
- transformar ausência de data em data atual;
- inferir teste/review de categoria, tag, slug ou título;
- exibir consumo/teste próprio sem evidência;
- usar `Post.updatedAt` técnico como freshness editorial;
- usar posts demo como fallback público de produção.

Veja `14_DOCUMENTATION_COHERENCE_AUDIT.md` para as decisões canônicas.
