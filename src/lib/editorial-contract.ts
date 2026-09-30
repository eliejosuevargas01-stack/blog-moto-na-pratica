export type EditorialType =
  | "NEWS"
  | "ANALYSIS"
  | "BUYING_GUIDE"
  | "COMPARISON"
  | "MAINTENANCE_GUIDE"
  | "EXPLAINER"
  | "MOTORSPORT_REPORT"
  | "PERSONAL_EXPERIENCE"
  | "DATA_STUDY"
  | "REVIEW_VERIFIED";

export const CANONICAL_EDITORIAL_TYPES: EditorialType[] = [
  "NEWS",
  "ANALYSIS",
  "BUYING_GUIDE",
  "COMPARISON",
  "MAINTENANCE_GUIDE",
  "EXPLAINER",
  "MOTORSPORT_REPORT",
  "PERSONAL_EXPERIENCE",
  "DATA_STUDY",
  "REVIEW_VERIFIED",
];

const LEGACY_EDITORIAL_TYPE_ALIASES: Record<string, EditorialType> = {
  MAINTENANCE: "MAINTENANCE_GUIDE",
  MOTORSPORT: "MOTORSPORT_REPORT",
};

export function normalizeEditorialType(
  rawType: any,
  personalExperienceVerified?: boolean
): EditorialType | undefined {
  if (typeof rawType !== "string" || !rawType.trim()) return undefined;
  const upper = rawType.trim().toUpperCase();

  const mappedType = LEGACY_EDITORIAL_TYPE_ALIASES[upper] || upper;

  if (CANONICAL_EDITORIAL_TYPES.includes(mappedType as EditorialType)) {
    if (mappedType === "REVIEW_VERIFIED" && !personalExperienceVerified) {
      return undefined;
    }
    return mappedType as EditorialType;
  }

  return undefined;
}

export type TrafficIntent =
  | "SEARCH"
  | "DISCOVER"
  | "NEWS"
  | "EVERGREEN"
  | "AUTHORITY";

export interface AuthorIdentity {
  name: string;
  slug?: string;
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
  img?: string;
  imgFocalPoint: string;
  tag?: string;
  seoKeywords?: string;
  audioUrl?: string;
  likes?: number;
  views?: number;
  readTime?: string;
  lang: string;
  translationGroupId?: number | null;
  meta: ArticleEditorialMeta;
}

/**
 * Normaliza e valida URLs externas (deve começar com http:// ou https://).
 * Descarta URLs inseguras ou protocolos maliciosos como javascript:.
 */
export function sanitizeExternalUrl(url?: string | null): string | undefined {
  if (!url || typeof url !== "string") return undefined;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return undefined;
}

/**
 * Normaliza e valida URLs de perfil ou links internos/externos.
 * Permite caminhos internos iniciados por '/' ou URLs http(s)://.
 */
export function sanitizeProfileUrl(url?: string | null): string | undefined {
  if (!url || typeof url !== "string") return undefined;
  const trimmed = url.trim();
  if (/^(https?:\/\/|\/)/i.test(trimmed)) {
    return trimmed;
  }
  return undefined;
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
 * Retorna Date válido somente se houver um valor real em campo editorial dedicado.
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
 * Princípios invioláveis:
 * 1. DADO AUSENTE -> INFORMAÇÃO AUSENTE OU ESTADO NEUTRO.
 * 2. NUNCA inferir autoria, tipo editorial, fontes ou experiência pessoal.
 * 3. NÃO usar o updatedAt técnico do Prisma como data de modificação editorial (views incrementam updatedAt).
 * 4. NÃO fabricar valores arbitrários para tag, readTime ou views.
 */
export function buildArticleViewModel(post: any): ArticleViewModel {
  if (!post) {
    throw new Error("Cannot build ArticleViewModel from null or undefined post");
  }

  // 1. Datas (Semântica: publishedAt ?? date ?? createdAt)
  const publishedAt = normalizePublishedDate(post.publishedAt ?? post.date ?? post.createdAt);

  // IMPORTANTE: Não usar post.updatedAt técnico do Prisma! Apenas campos editoriais explícitos.
  const modifiedAt = normalizeModifiedDate(post.modifiedAt ?? post.editorialUpdatedAt);

  // 2. Autoria (Somente se explicitamente fornecida; slug opcional, sem criar de nome)
  let author: AuthorIdentity | undefined = undefined;
  if (post.author && typeof post.author === "object" && post.author.name) {
    const rawProfileUrl = post.author.profileUrl ? String(post.author.profileUrl) : undefined;
    author = {
      name: String(post.author.name),
      slug: post.author.slug ? String(post.author.slug) : undefined,
      type: post.author.type === "ORGANIZATION" ? "ORGANIZATION" : "PERSON",
      role: post.author.role ? String(post.author.role) : undefined,
      profileUrl: sanitizeProfileUrl(rawProfileUrl),
      avatarUrl: post.author.avatarUrl ? String(post.author.avatarUrl) : undefined,
    };
  } else if (typeof post.authorName === "string" && post.authorName.trim().length > 0) {
    author = {
      name: post.authorName.trim(),
      type: "PERSON",
    };
  }

  // 3. Revisor (Somente se explicitamente fornecido)
  let reviewer: AuthorIdentity | undefined = undefined;
  if (post.reviewer && typeof post.reviewer === "object" && post.reviewer.name) {
    reviewer = {
      name: String(post.reviewer.name),
      slug: post.reviewer.slug ? String(post.reviewer.slug) : undefined,
      type: post.reviewer.type === "ORGANIZATION" ? "ORGANIZATION" : "PERSON",
      role: post.reviewer.role ? String(post.reviewer.role) : undefined,
    };
  }

  // 4. Experiência Pessoal Verificada (APENAS se explicitamente true)
  const personalExperienceVerified = post.personalExperienceVerified === true;

  // 5. Fontes (Sanitiza URLs e descarta URLs inseguras)
  let sources: EditorialSource[] | undefined = undefined;
  if (Array.isArray(post.sources) && post.sources.length > 0) {
    const parsedSources = post.sources
      .map((s: any) => {
        const cleanUrl = sanitizeExternalUrl(s.url);
        if (!cleanUrl) return null;
        return {
          url: cleanUrl,
          title: s.title ? String(s.title) : undefined,
          publisher: s.publisher ? String(s.publisher) : undefined,
          sourceType: s.sourceType ? String(s.sourceType) : undefined,
          primarySource: Boolean(s.primarySource),
        };
      })
      .filter((s: EditorialSource | null): s is EditorialSource => s !== null);

    if (parsedSources.length > 0) {
      sources = parsedSources;
    }
  }

  // 6. Type e TrafficIntent (Somente se explicitamente fornecidos e válidos via adapter)
  const editorialType = normalizeEditorialType(
    post.editorialType,
    personalExperienceVerified
  );

  const VALID_INTENTS: TrafficIntent[] = ["SEARCH", "DISCOVER", "NEWS", "EVERGREEN", "AUTHORITY"];
  const trafficIntent = VALID_INTENTS.includes(post.trafficIntent) ? (post.trafficIntent as TrafficIntent) : undefined;

  // 7. Disclosure e Correção
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

  // 8. Campos opcionais sem defaults arbitrários
  const tag = typeof post.tag === "string" && post.tag.trim().length > 0 ? post.tag.trim() : undefined;
  const readTime = typeof post.readTime === "string" && post.readTime.trim().length > 0 ? post.readTime.trim() : undefined;
  const views = typeof post.views === "number" ? post.views : undefined;
  const likes = typeof post.likes === "number" ? post.likes : undefined;
  const img = typeof post.img === "string" && post.img.trim().length > 0 ? post.img.trim() : undefined;

  return {
    id: String(post.id ?? ""),
    slug: String(post.slug ?? ""),
    title: String(post.title ?? ""),
    excerpt: String(post.excerpt ?? ""),
    content: String(post.content ?? ""),
    blocks: Array.isArray(post.blocks) ? post.blocks : typeof post.blocks === "string" ? parseJsonBlocks(post.blocks) : [],
    img,
    imgFocalPoint: String(post.imgFocalPoint ?? "center"),
    tag,
    seoKeywords: post.seoKeywords ? String(post.seoKeywords) : undefined,
    audioUrl: post.audioUrl ? String(post.audioUrl) : undefined,
    likes,
    views,
    readTime,
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
