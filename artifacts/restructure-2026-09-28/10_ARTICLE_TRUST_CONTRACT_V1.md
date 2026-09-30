# 10 — Article Trust Contract V1 + Safe Legacy Fallbacks

**Status:** IMPLEMENTADO E AUDITADO
**Data:** 2026-09-28
**Repositório:** `eliejosuevargas01-stack/blog-moto-na-pratica`
**Branch:** `trust/article-contract-v1`
**Escopo:** Página de artigo individual, normalização de dados editoriais, enum canônico `EditorialType`, remoção de fallbacks estáticos fictícios em todo o runtime público e componentes de metadados de confiança.

---

## 1. Visão Geral

Esta etapa implementa o **Article Trust Contract V1** para garantir que a aplicação respeite rigorosamente o princípio editorial fundamental do Moto na Prática:

> **Dado ausente → informação ausente ou estado neutro; nunca inventar evidência, autoria, data, experiência, fontes ou atualidade.**

Esta camada atua em nível de aplicação (TypeScript puro e componentes React) sem alterar o esquema do Prisma, migrations ou banco de dados PostgreSQL nesta fase.

---

## 2. O que foi Implementado

### 2.1 Contrato Editorial Canônico (`src/lib/editorial-contract.ts`)
- **`EditorialType` Canônico**:
  - `NEWS`
  - `ANALYSIS`
  - `BUYING_GUIDE`
  - `COMPARISON`
  - `MAINTENANCE_GUIDE`
  - `EXPLAINER`
  - `MOTORSPORT_REPORT`
  - `PERSONAL_EXPERIENCE`
  - `DATA_STUDY`
  - `REVIEW_VERIFIED` (restrito e permitido apenas quando `personalExperienceVerified === true`).
- **Adapter de Aliases Legados**:
  - `MAINTENANCE` -> Mapeado graciosamente para `MAINTENANCE_GUIDE`.
  - `MOTORSPORT` -> Mapeado graciosamente para `MOTORSPORT_REPORT`.
- **`TrafficIntent`**: `SEARCH`, `DISCOVER`, `NEWS`, `EVERGREEN`, `AUTHORITY`.
- **`AuthorIdentity`**: Entidade autoral conceitual (pessoa ou organização, slug opcional sem sintetizar nome, cargo, URL de perfil sanitizada, avatar).
- **`EditorialSource`**: Modelo de fonte estruturada com sanitização rigorosa de URLs (somente `http://` e `https://`).
- **`CorrectionInfo`**: Registro de correção editorial com validação graciosa de datas.
- **`ArticleEditorialMeta`** e **`ArticleViewModel`**: Interfaces completas do view model para artigos.

### 2.2 Normalização Segura de Datas e Dados (Sem Freshness Falsa)
- **`normalizePublishedDate`**: Converte `publishedAt` / `date` / `createdAt` para `Date` válido. Se ausente/inválido, retorna `null` (nunca `new Date()`).
- **`normalizeModifiedDate`**: Ignora o campo técnico `updatedAt` do Prisma (que é incrementado a cada visualização do artigo no banco). Retorna `Date` válido apenas para campos editoriais explícitos (`modifiedAt` / `editorialUpdatedAt`).
- **`shouldShowUpdatedDate`**: Retorna `true` apenas se ambas as datas existirem, `modifiedAt > publishedAt` e a diferença for editorialmente relevante (> 24 horas).
- **`buildArticleViewModel`**: Normalizador puro e determinístico que garante:
  - Autoria só aparece se explicitamente informada em `post.author` ou `post.authorName`. Não sintetiza slugs de autores se ausentes.
  - Experiência Pessoal Verificada só é `true` se `post.personalExperienceVerified === true`. Proibido inferir por slug, título, tag ou categoria.
  - Fontes só são incluídas se um array de `sources` estruturado for fornecido e sanitizado.
  - Nenhum valor arbitrário por padrão para `tag`, `readTime` ou `views`.

### 2.3 Structured Data JSON-LD (`buildArticleStructuredData`)
- Gera schema `@type: Article` (ou `NewsArticle` se explicitamente marcado como `NEWS`).
- Omite `author`, `datePublished` ou `dateModified` quando esses dados estiverem ausentes.
- Mantém o publisher institucional "Moto na Prática".
- Gera URLs canônicas baseadas na variável de ambiente `siteUrl`.

### 2.4 Componentes UI de Confiança (`src/app/components/`)
- **`AuthorByline`**: Exibe o autor somente quando explicitamente presente.
- **`FreshnessMeta`**: Exibe datas reais de publicação e atualização.
- **`ArticleSources`**: Exibe bloco de fontes estruturadas quando existentes.
- **`ArticleDisclosure`**: Exibe nota de transparência/disclosure apenas se houver string explícita.
- **`CorrectionNotice`**: Exibe nota de correção apenas se houver registro explícito, com tratamento seguro de datas inválidas.

### 2.5 Refatoração da Página de Artigo (`src/app/post/[slug]/page.tsx`)
- Utiliza `buildArticleViewModel` para derivar o view model.
- Renderiza componentes de confiança na primeira dobra e no corpo.
- Injeta o script de JSON-LD estruturado e seguro.

---

## 3. Fallbacks Fictícios Removidos de Todo o Runtime Público

Todos os usos e importações de `POSTS` estáticos foram completamente removidos dos módulos públicos:
- **`findPostBySlugOrId` (`src/lib/post-helpers.ts`)**: Removido o fallback `POSTS.find`. Se o post não for encontrado no banco ou houver erro na query, retorna `null`.
- **`src/app/page.tsx`**: Removida a atribuição `posts = POSTS` e importações de `POSTS`. Se o banco falhar, seções são omitidas/exibem estados graciosos neutros.
- **`src/app/post/[slug]/page.tsx`**: Removido o bloco `catch` com `POSTS`. Para relacionados, utiliza `[]` em caso de falha.
- **`src/app/posts/page.tsx`**: Se o banco falhar, o estado exibido é de lista vazia.
- **`src/app/tag/[tag]/page.tsx`**: Se o banco falhar, o estado é de lista vazia.
- **`src/app/components/CategoryView.tsx`**: Se o banco falhar, o estado é de lista vazia.
- **`src/app/sobre/page.tsx`**: Se o banco falhar, o estado é de lista vazia.

---

## 4. Conexão com Futuras Migrations (Prisma V2)

Esta camada foi desenhada para se conectar diretamente aos futuros modelos do Prisma sem necessidade de reescrever a UI:

1. **Quando o model `Author` for criado no Prisma**:
   A query do Prisma passará a incluir `include: { author: true }`, que se encaixará no campo `post.author` do `buildArticleViewModel`.

2. **Quando os models `Source` e `PostSource` forem criados**:
   As fontes do banco serão mapeadas para `post.sources` e consumidas automaticamente pelo `ArticleSources`.

3. **Quando o model `Correction` for criado**:
   Registros de correções persistidos em banco serão injetados em `post.correction` e renderizados via `CorrectionNotice`.

---

## 5. Próximos Passos

1. Iniciar a fase de persistência no banco / Prisma (Model `Author`, `Source`, `PostSource`, `Correction`, extensão de `Post`).
2. Atualizar a interface do CMS para permitir preenchimento e edição desses campos.
3. Atualizar o payload do n8n para enviar o contrato editorial V2.
