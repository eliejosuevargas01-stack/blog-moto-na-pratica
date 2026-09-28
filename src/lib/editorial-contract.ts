export type EditorialType =
  | "NEWS"
  | "BUYING_GUIDE"
  | "COMPARISON"
  | "MAINTENANCE"
  | "EXPLAINER"
  | "MOTORSPORT"
  | "PERSONAL_EXPERIENCE"
  | "DATA_STUDY";

export type TrafficIntent =
  | "SEARCH"
  | "DISCOVER"
  | "NEWS"
  | "EVERGREEN"
  | "AUTHORITY";

export interface AuthorIdentity {
  name: string;
  slug: string;
  type: "PERSON" | "ORGANIZATION";
  role?: string;
  profileUrl?: string;
  avatarUrl?: string;
}

export interface EditorialSource {
  url: string;
  title?: string;
  publisher?: string;
  sourceType?: string;
  primarySource?: boolean;
}

export interface CorrectionInfo {
  description: string;
  correctedAt?: Date | string;
  previousText?: string;
  correctedText?: string;
}

export interface ArticleEditorialMeta {
  editorialType?: EditorialType;
  trafficIntent?: TrafficIntent;
  author?: AuthorIdentity;
  reviewer?: AuthorIdentity;
  researchId?: string;
  personalExperienceVerified?: boolean;
  factCheckedAt?: Date | string;
  disclosure?: string;
  sources?: EditorialSource[];
  correction?: CorrectionInfo;
  publishedAt?: Date | null;
  modifiedAt?: Date | null;
}

export interface ArticleViewModel {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  blocks: any[];
  img: string;
  imgFocalPoint: string;
  tag: string;
  seoKeywords?: string;
  audioUrl?: string;
  likes: number;
  views: number;
  readTime: string;
  lang: string;
  translationGroupId?: number | null;
  meta: ArticleEditorialMeta;
}

/**
 * Normaliza data de publicação.
 * Retorna Date válido somente se o input for uma data real.
 * NUNCA retorna a data atual como fallback.
 */
export function normalizePublishedDate(inputDate?: Date | string | number | null): Date | null {
  if (!inputDate) return null;
  const d = new Date(inputDate);
  if (isNaN(d.getTime())) return null;
  return d;
}

/**
 * Normaliza data de modificação / atualização.
 * Retorna Date válido somente se houver um valor real.
 */
export function normalizeModifiedDate(inputDate?: Date | string | number | null): Date | null {
  if (!inputDate) return null;
  const d = new Date(inputDate);
  if (isNaN(d.getTime())) return null;
  return d;
}

/**
 * Determina se o indicador de "Atualizado em" deve ser exibido na UI.
 * Exibe somente quando ambas as datas existem, modifiedAt > publishedAt,
 * e a diferença for editorialmente significativa (por padrão > 24 horas).
 */
export function shouldShowUpdatedDate(
  publishedAt: Date | null,
  modifiedAt: Date | null,
  thresholdMs: number = 24 * 60 * 60 * 1000
): boolean {
  if (!publishedAt || !modifiedAt) return false;
  const diff = modifiedAt.getTime() - publishedAt.getTime();
  return diff > thresholdMs;
}

/**
 * Normalizador seguro que transforma um objeto de post em um ArticleViewModel.
 *
 * Princípio inviolável:
 * DADO AUSENTE -> INFORMAÇÃO AUSENTE OU ESTADO NEUTRO.
 * NUNCA inferir autoria, tipo editorial, fontes ou experiência pessoal
 * a partir de títulos, slugs, tags, categorias ou conteúdo textual.
 */
export function buildArticleViewModel(post: any): ArticleViewModel {
  if (!post) {
    throw new Error("Cannot build ArticleViewModel from null or undefined post");
  }

  // 1. Datas
  const publishedAt = normalizePublishedDate(post.createdAt ?? post.date ?? post.publishedAt);
  const modifiedAt = normalizeModifiedDate(post.updatedAt ?? post.modifiedAt);

  // 2. Autoria (Somente se explicitamente fornecida nos dados do post)
  let author: AuthorIdentity | undefined = undefined;
  if (post.author && typeof post.author === "object" && post.author.name) {
    author = {
      name: String(post.author.name),
      slug: String(post.author.slug || post.author.name.toLowerCase().replace(/\s+/g, "-")),
      type: post.author.type === "ORGANIZATION" ? "ORGANIZATION" : "PERSON",
      role: post.author.role ? String(post.author.role) : undefined,
      profileUrl: post.author.profileUrl ? String(post.author.profileUrl) : undefined,
      avatarUrl: post.author.avatarUrl ? String(post.author.avatarUrl) : undefined,
    };
  } else if (typeof post.authorName === "string" && post.authorName.trim().length > 0) {
    author = {
      name: post.authorName.trim(),
      slug: post.authorName.trim().toLowerCase().replace(/\s+/g, "-"),
      type: "PERSON",
    };
  }

  // 3. Revisor (Somente se explicitamente fornecido)
  let reviewer: AuthorIdentity | undefined = undefined;
  if (post.reviewer && typeof post.reviewer === "object" && post.reviewer.name) {
    reviewer = {
      name: String(post.reviewer.name),
      slug: String(post.reviewer.slug || post.reviewer.name.toLowerCase().replace(/\s+/g, "-")),
      type: post.reviewer.type === "ORGANIZATION" ? "ORGANIZATION" : "PERSON",
      role: post.reviewer.role ? String(post.reviewer.role) : undefined,
    };
  }

  // 4. Experiência Pessoal Verificada
  // APENAS se o campo booleano personalExperienceVerified for EXPLICITAMENTE true.
  // Proibido inferir por tag, categoria, título ou slug!
  const personalExperienceVerified = post.personalExperienceVerified === true;

  // 5. Fontes (Somente se array estruturado existir nos dados)
  let sources: EditorialSource[] | undefined = undefined;
  if (Array.isArray(post.sources) && post.sources.length > 0) {
    sources = post.sources.map((s: any) => ({
      url: String(s.url || ""),
      title: s.title ? String(s.title) : undefined,
      publisher: s.publisher ? String(s.publisher) : undefined,
      sourceType: s.sourceType ? String(s.sourceType) : undefined,
      primarySource: Boolean(s.primarySource),
    })).filter((s: EditorialSource) => s.url.length > 0);
  }

  // 6. Type e TrafficIntent (Somente se explicitamente fornecido e válido)
  const VALID_TYPES: EditorialType[] = [
    "NEWS",
    "BUYING_GUIDE",
    "COMPARISON",
    "MAINTENANCE",
    "EXPLAINER",
    "MOTORSPORT",
    "PERSONAL_EXPERIENCE",
    "DATA_STUDY",
  ];
  const editorialType = VALID_TYPES.includes(post.editorialType) ? (post.editorialType as EditorialType) : undefined;

  const VALID_INTENTS: TrafficIntent[] = ["SEARCH", "DISCOVER", "NEWS", "EVERGREEN", "AUTHORITY"];
  const trafficIntent = VALID_INTENTS.includes(post.trafficIntent) ? (post.trafficIntent as TrafficIntent) : undefined;

  // 7. Disclosure e Correção (Somente se explicitamente fornecidos)
  const disclosure = typeof post.disclosure === "string" && post.disclosure.trim().length > 0
    ? post.disclosure.trim()
    : undefined;

  let correction: CorrectionInfo | undefined = undefined;
  if (post.correction && typeof post.correction === "object" && post.correction.description) {
    correction = {
      description: String(post.correction.description),
      correctedAt: post.correction.correctedAt ? String(post.correction.correctedAt) : undefined,
      previousText: post.correction.previousText ? String(post.correction.previousText) : undefined,
      correctedText: post.correction.correctedText ? String(post.correction.correctedText) : undefined,
    };
  }

  return {
    id: String(post.id ?? ""),
    slug: String(post.slug ?? ""),
    title: String(post.title ?? ""),
    excerpt: String(post.excerpt ?? ""),
    content: String(post.content ?? ""),
    blocks: Array.isArray(post.blocks) ? post.blocks : typeof post.blocks === "string" ? parseJsonBlocks(post.blocks) : [],
    img: String(post.img ?? ""),
    imgFocalPoint: String(post.imgFocalPoint ?? "center"),
    tag: String(post.tag ?? "Geral"),
    seoKeywords: post.seoKeywords ? String(post.seoKeywords) : undefined,
    audioUrl: post.audioUrl ? String(post.audioUrl) : undefined,
    likes: typeof post.likes === "number" ? post.likes : 0,
    views: typeof post.views === "number" ? post.views : 0,
    readTime: String(post.readTime ?? "3 min"),
    lang: String(post.lang ?? "pt"),
    translationGroupId: typeof post.translationGroupId === "number" ? post.translationGroupId : null,
    meta: {
      publishedAt,
      modifiedAt,
      author,
      reviewer,
      researchId: post.researchId ? String(post.researchId) : undefined,
      personalExperienceVerified,
      factCheckedAt: post.factCheckedAt ? post.factCheckedAt : undefined,
      disclosure,
      sources,
      correction,
      editorialType,
      trafficIntent,
    },
  };
}

function parseJsonBlocks(raw: string): any[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Constrói os dados estruturados (JSON-LD) para o artigo.
 * Somente gera propriedades que realmente existem nos dados do artigo.
 */
export function buildArticleStructuredData(
  viewModel: ArticleViewModel,
  customSiteUrl?: string
) {
  const defaultSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://motonapratica.online";
  const baseUrl = (customSiteUrl || defaultSiteUrl).replace(/\/$/, "");

  const langPrefix =
    viewModel.lang === "en" ? "/en" : viewModel.lang === "es" ? "/es" : "";
  const canonicalUrl = `${baseUrl}${langPrefix}/post/${viewModel.slug}`;

  const cleanTitle = viewModel.title.replace(/<[^>]*>/g, "").trim();
  const cleanExcerpt = viewModel.excerpt ? viewModel.excerpt.replace(/<[^>]*>/g, "").trim() : "";

  // Schema de Artigo (NewsArticle apenas se editorialType for EXPLICITAMENTE NEWS)
  const schemaType = viewModel.meta.editorialType === "NEWS" ? "NewsArticle" : "Article";

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    "headline": cleanTitle,
  };

  if (cleanExcerpt) {
    schema["description"] = cleanExcerpt;
  }

  if (viewModel.img) {
    schema["image"] = [viewModel.img];
  }

  if (viewModel.meta.publishedAt) {
    schema["datePublished"] = viewModel.meta.publishedAt.toISOString();
  }

  if (viewModel.meta.modifiedAt) {
    schema["dateModified"] = viewModel.meta.modifiedAt.toISOString();
  }

  if (viewModel.meta.author) {
    schema["author"] = {
      "@type": viewModel.meta.author.type === "ORGANIZATION" ? "Organization" : "Person",
      "name": viewModel.meta.author.name,
      ...(viewModel.meta.author.profileUrl ? { "url": viewModel.meta.author.profileUrl } : {}),
    };
  }

  schema["publisher"] = {
    "@type": "Organization",
    "name": "Moto na Prática",
    "url": baseUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${baseUrl}/icon-192.png`,
    },
  };

  return schema;
}
