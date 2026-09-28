# 10 — Article Trust Contract V1 + Safe Legacy Fallbacks

**Status:** IMPLEMENTADO
**Data:** 2026-09-28
**Repositório:** `eliejosuevargas01-stack/blog-moto-na-pratica`
**Branch:** `trust/article-contract-v1`
**Escopo:** Página de artigo individual, normalização de dados editoriais, remoção de fallbacks estáticos fictícios e componentes de metadados de confiança.

---

## 1. Visão Geral

Esta etapa implementa o **Article Trust Contract V1** para garantir que a aplicação respeite rigorosamente o princípio editorial fundamental do Moto na Prática:

> **Dado ausente → informação ausente ou estado neutro; nunca inventar evidência, autoria, data, experiência, fontes ou atualidade.**

Esta camada atua em nível de aplicação (TypeScript puro e componentes React) sem alterar o esquema do Prisma, migrations ou banco de dados PostgreSQL nesta fase.

---

## 2. O que foi Implementado

### 2.1 Contrato Editorial (`src/lib/editorial-contract.ts`)
- **`EditorialType`**: Representa formatos como `NEWS`, `BUYING_GUIDE`, `COMPARISON`, `MAINTENANCE`, `EXPLAINER`, `MOTORSPORT`, `PERSONAL_EXPERIENCE`, `DATA_STUDY`.
- **`TrafficIntent`**: `SEARCH`, `DISCOVER`, `NEWS`, `EVERGREEN`, `AUTHORITY`.
- **`AuthorIdentity`**: Entidade autoral conceitual (pessoa ou organização, slug, cargo, URL de perfil, avatar).
- **`EditorialSource`**: Modelo de fonte estruturada (URL, título, publisher, tipo, indicador de fonte primária).
- **`CorrectionInfo`**: Registro de correção editorial (descrição, data, texto original e texto corrigido).
- **`ArticleEditorialMeta`** e **`ArticleViewModel`**: Interfaces completas do view model para artigos.

### 2.2 Normalização Segura de Datas e Dados
- **`normalizePublishedDate`**: Converte `createdAt` / `date` / `publishedAt` para `Date` válido. Se ausente/inválido, retorna `null` (nunca `new Date()`).
- **`normalizeModifiedDate`**: Retorna `Date` válido para `updatedAt` / `modifiedAt`, ou `null`.
- **`shouldShowUpdatedDate`**: Retorna `true` apenas se ambas as datas existirem, `modifiedAt > publishedAt` e a diferença for editorialmente relevante (> 24 horas).
- **`buildArticleViewModel`**: Normalizador puro e determinístico que garante:
  - Autoria só aparece se explicitamente informada em `post.author` ou `post.authorName`.
  - Experiência Pessoal Verificada só é `true` se `post.personalExperienceVerified === true`. Proibido inferir por slug, título, tag ou categoria.
  - Fontes só são incluídas se um array de `sources` estruturado for fornecido.
  - Nenhum `NewsArticle` é atribuído automaticamente sem o tipo `NEWS`.

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
- **`CorrectionNotice`**: Exibe nota de correção apenas se houver registro explícito.

### 2.5 Refatoração da Página de Artigo (`src/app/post/[slug]/page.tsx`)
- Utiliza `buildArticleViewModel` para derivar o view model.
- Renderiza componentes de confiança na primeira dobra e no corpo.
- Injeta o script de JSON-LD estruturado e seguro.

---

## 3. Fallbacks Fictícios Removidos

- **`findPostBySlugOrId` (`src/lib/post-helpers.ts`)**: Removido o fallback `staticPost = POSTS.find(...)`. Se o post não for encontrado no banco ou houver erro na query, retorna `null`, acionando `notFound()`.
- **`src/app/post/[slug]/page.tsx`**: Removido o bloco `catch` que recorria ao array `POSTS` estático. Para posts relacionados, utiliza `[]` em caso de erro na consulta, sem inventar matérias.
- **`src/app/posts/page.tsx`**: Removida a atribuição `posts = POSTS` no bloco `catch`. Se o banco falhar, o estado exibido é de lista vazia.

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
