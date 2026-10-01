/**
 * CMS/API V2 — Editorial Persistence Module
 *
 * Validação + persistência transacional dos campos editoriais V2.
 * Contrato: campos omitidos preservam (update); null/empty limpa scalars;
 * [] limpa arrays; arrays omitidos preservam.
 * Nunca inventa defaults editoriais (autor, fonte, experiência, disclosure, etc).
 */

import { normalizeEditorialType, sanitizeExternalUrl, CANONICAL_EDITORIAL_TYPES } from "./editorial-contract";

// --- Canonical enums ---
const VALID_EDITORIAL_TYPES = CANONICAL_EDITORIAL_TYPES as readonly string[];
const VALID_TRAFFIC_INTENTS = ["SEARCH", "DISCOVER", "NEWS", "EVERGREEN", "AUTHORITY"] as const;
const VALID_CORRECTION_STATUSES = ["NONE", "PENDING", "CORRECTED"] as const;
const VALID_SOURCE_ROLES = ["PRIMARY", "SUPPORTING", "DATA", "QUOTE", "BACKGROUND"] as const;

// --- Strict date validation (no current-date fallback) ---
function parseStrictDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  if (typeof value !== "string") return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  // Reject strings that JS Date parses but aren't real dates (e.g. single digits)
  if (value.trim().length < 8) return null;
  return d;
}

// --- Types ---
export interface EditorialSourceInput {
  url: string;
  title?: string;
  publisher?: string;
  publishedAt?: string | Date | null;
  role?: string;
}

export interface EditorialCorrectionInput {
  description: string;
  previousText?: string;
  correctedText?: string;
  reason?: string;
  material?: boolean;
}

export interface ValidatedEditorialData {
  editorialType?: string | null;
  trafficIntent?: string | null;
  authorId?: string | null;
  reviewerId?: string | null;
  researchId?: string | null;
  personalExperienceVerified?: boolean;
  factCheckedAt?: Date | null;
  disclosure?: string | null;
  correctionStatus?: string | null;
  firstPublishedAt?: Date | null;
  editorialModifiedAt?: Date | null;
  updatedReason?: string | null;
  sources?: EditorialSourceInput[] | null;
  corrections?: EditorialCorrectionInput[] | null;
}

export type ValidationResult =
  | { error: string; validated?: undefined }
  | { error?: undefined; validated: ValidatedEditorialData };

/**
 * Validates editorial input. Returns validated data or an error.
 * - Rejects invalid types/enums strictly.
 * - personalExperienceVerified must be literal boolean, not coerced.
 * - Sources with invalid/missing URL cause error, not skip.
 * - Corrections without description cause error.
 * - No invented defaults for sourceType, correctionStatus, etc.
 */
export function validateEditorialInput(data: unknown): ValidationResult {
  if (!data || typeof data !== "object") {
    return { validated: {} };
  }

  const input = data as Record<string, unknown>;
  const validated: ValidatedEditorialData = {};

  // 1. personalExperienceVerified — strict boolean, no coercion
  if (input.personalExperienceVerified !== undefined) {
    if (typeof input.personalExperienceVerified !== "boolean") {
      return { error: "personalExperienceVerified must be a boolean (true/false), not a string or number." };
    }
    validated.personalExperienceVerified = input.personalExperienceVerified;
  }

  // 2. editorialType
  if (input.editorialType !== undefined) {
    if (input.editorialType === null || input.editorialType === "") {
      validated.editorialType = null;
    } else {
      if (typeof input.editorialType !== "string") {
        return { error: `editorialType must be a string, got ${typeof input.editorialType}` };
      }
      const upper = input.editorialType.trim().toUpperCase();
      if (upper === "REVIEW_VERIFIED") {
        if (validated.personalExperienceVerified !== true && input.personalExperienceVerified !== true) {
          return { error: "REVIEW_VERIFIED requires personalExperienceVerified to be literal true." };
        }
      }
      const normalized = normalizeEditorialType(
        input.editorialType,
        validated.personalExperienceVerified ?? (input.personalExperienceVerified === true)
      );
      if (!normalized) {
        return { error: `Invalid editorialType: ${input.editorialType}` };
      }
      validated.editorialType = normalized;
    }
  }

  // 3. trafficIntent
  if (input.trafficIntent !== undefined) {
    if (input.trafficIntent === null || input.trafficIntent === "") {
      validated.trafficIntent = null;
    } else {
      if (typeof input.trafficIntent !== "string") {
        return { error: `trafficIntent must be a string, got ${typeof input.trafficIntent}` };
      }
      const upper = input.trafficIntent.trim().toUpperCase();
      if (!(VALID_TRAFFIC_INTENTS as readonly string[]).includes(upper)) {
        return { error: `Invalid trafficIntent: ${input.trafficIntent}` };
      }
      validated.trafficIntent = upper;
    }
  }

  // 4. authorId / reviewerId (string or null to clear)
  for (const field of ["authorId", "reviewerId"] as const) {
    if (input[field] !== undefined) {
      if (input[field] === null || input[field] === "") {
        validated[field] = null;
      } else {
        if (typeof input[field] !== "string") {
          return { error: `${field} must be a string, got ${typeof input[field]}` };
        }
        const trimmed = (input[field] as string).trim();
        if (!trimmed) {
          validated[field] = null;
        } else {
          validated[field] = trimmed;
        }
      }
    }
  }

  // 5. String scalars: researchId, disclosure, updatedReason
  for (const field of ["researchId", "disclosure", "updatedReason"] as const) {
    if (input[field] !== undefined) {
      if (input[field] === null || input[field] === "") {
        validated[field] = null;
      } else {
        if (typeof input[field] !== "string") {
          return { error: `${field} must be a string, got ${typeof input[field]}` };
        }
        validated[field] = (input[field] as string).trim() || null;
      }
    }
  }

  // 6. correctionStatus
  if (input.correctionStatus !== undefined) {
    if (input.correctionStatus === null || input.correctionStatus === "") {
      validated.correctionStatus = null;
    } else {
      if (typeof input.correctionStatus !== "string") {
        return { error: `correctionStatus must be a string, got ${typeof input.correctionStatus}` };
      }
      const upper = input.correctionStatus.trim().toUpperCase();
      if (!(VALID_CORRECTION_STATUSES as readonly string[]).includes(upper)) {
        return { error: `Invalid correctionStatus: ${input.correctionStatus}. Valid: ${VALID_CORRECTION_STATUSES.join(", ")}` };
      }
      validated.correctionStatus = upper;
    }
  }

  // 7. Strict date fields (factCheckedAt, firstPublishedAt, editorialModifiedAt)
  for (const field of ["factCheckedAt", "firstPublishedAt", "editorialModifiedAt"] as const) {
    if (input[field] !== undefined) {
      if (input[field] === null || input[field] === "") {
        validated[field] = null;
      } else {
        const parsed = parseStrictDate(input[field]);
        if (!parsed) {
          return { error: `Invalid date for ${field}: ${input[field]}` };
        }
        validated[field] = parsed;
      }
    }
  }

  // 8. Sources — array or null to clear; omitted preserves
  if (input.sources !== undefined) {
    if (input.sources === null) {
      validated.sources = null;
    } else if (Array.isArray(input.sources)) {
      if (input.sources.length === 0) {
        validated.sources = []; // explicit empty clears
      } else {
        const cleanSources: EditorialSourceInput[] = [];
        for (let i = 0; i < input.sources.length; i++) {
          const s = input.sources[i];
          if (!s || typeof s !== "object") {
            return { error: `Source at index ${i} is not a valid object.` };
          }
          if (!s.url || typeof s.url !== "string") {
            return { error: `Source at index ${i} is missing a valid URL.` };
          }
          const cleanUrl = sanitizeExternalUrl(s.url);
          if (!cleanUrl) {
            return { error: `Source at index ${i} has invalid or unsafe URL: ${s.url}` };
          }
          // Role validation (optional)
          let role: string | undefined;
          if (s.role !== undefined && s.role !== null) {
            if (typeof s.role !== "string") {
              return { error: `Source at index ${i}: role must be a string.` };
            }
            const upperRole = s.role.trim().toUpperCase();
            if (!(VALID_SOURCE_ROLES as readonly string[]).includes(upperRole)) {
              return { error: `Source at index ${i}: invalid role "${s.role}". Valid: ${VALID_SOURCE_ROLES.join(", ")}` };
            }
            role = upperRole;
          }
          // publishedAt validation (optional, strict)
          let publishedAt: Date | null | undefined;
          if (s.publishedAt !== undefined && s.publishedAt !== null) {
            const parsed = parseStrictDate(s.publishedAt);
            if (!parsed) {
              return { error: `Source at index ${i}: invalid publishedAt date: ${s.publishedAt}` };
            }
            publishedAt = parsed;
          }
          cleanSources.push({
            url: cleanUrl,
            title: s.title && typeof s.title === "string" ? s.title.trim() : undefined,
            publisher: s.publisher && typeof s.publisher === "string" ? s.publisher.trim() : undefined,
            publishedAt: publishedAt ?? undefined,
            role,
          });
        }
        validated.sources = cleanSources;
      }
    } else {
      return { error: "sources must be an array or null." };
    }
  }

  // 9. Corrections — array or null to clear; omitted preserves
  if (input.corrections !== undefined) {
    if (input.corrections === null) {
      validated.corrections = null;
    } else if (Array.isArray(input.corrections)) {
      if (input.corrections.length === 0) {
        validated.corrections = [];
      } else {
        const cleanCorrections: EditorialCorrectionInput[] = [];
        for (let i = 0; i < input.corrections.length; i++) {
          const c = input.corrections[i];
          if (!c || typeof c !== "object") {
            return { error: `Correction at index ${i} is not a valid object.` };
          }
          if (!c.description || typeof c.description !== "string" || !c.description.trim()) {
            return { error: `Correction at index ${i}: description is required and must be a non-empty string.` };
          }
          if (c.material !== undefined && typeof c.material !== "boolean") {
            return { error: `Correction at index ${i}: material must be a boolean.` };
          }
          cleanCorrections.push({
            description: c.description.trim(),
            previousText: c.previousText && typeof c.previousText === "string" ? c.previousText : undefined,
            correctedText: c.correctedText && typeof c.correctedText === "string" ? c.correctedText : undefined,
            reason: c.reason && typeof c.reason === "string" ? c.reason.trim() : undefined,
            material: c.material === true,
          });
        }
        validated.corrections = cleanCorrections;
      }
    } else {
      return { error: "corrections must be an array or null." };
    }
  }

  return { validated };
}

/**
 * Applies editorial V2 data transactionally within a Prisma $transaction callback.
 * - Omitted fields preserve existing values on update.
 * - Explicit null/empty clears scalar fields.
 * - Author/reviewer IDs verified to exist.
 * - Sources: findFirst by exact URL, update or create, then PostSource relation.
 * - Corrections: explicit array replaces all. Does NOT auto-set correctionStatus.
 */
export async function applyEditorialPersistenceTransaction(
  prismaTx: any,
  postId: string,
  data: ValidatedEditorialData,
  isUpdate: boolean = true
) {
  const postData: Record<string, any> = {};

  // Scalar fields — only set if provided (omitted = preserve)
  const scalarFields = [
    "editorialType", "trafficIntent", "researchId",
    "personalExperienceVerified", "factCheckedAt", "disclosure",
    "correctionStatus", "firstPublishedAt", "editorialModifiedAt", "updatedReason",
  ] as const;

  for (const field of scalarFields) {
    if (data[field] !== undefined) {
      postData[field] = data[field];
    }
  }

  // Author relation
  if (data.authorId !== undefined) {
    if (data.authorId) {
      const exists = await prismaTx.author.findUnique({ where: { id: data.authorId } });
      if (!exists) {
        throw new Error(`Author with ID "${data.authorId}" does not exist.`);
      }
      postData.author = { connect: { id: data.authorId } };
    } else {
      postData.author = { disconnect: true };
    }
  }

  // Reviewer relation
  if (data.reviewerId !== undefined) {
    if (data.reviewerId) {
      const exists = await prismaTx.author.findUnique({ where: { id: data.reviewerId } });
      if (!exists) {
        throw new Error(`Reviewer with ID "${data.reviewerId}" does not exist.`);
      }
      postData.reviewer = { connect: { id: data.reviewerId } };
    } else {
      postData.reviewer = { disconnect: true };
    }
  }

  // Update post scalars/relations if any changed
  if (Object.keys(postData).length > 0) {
    await prismaTx.post.update({
      where: { id: postId },
      data: postData,
    });
  }

  // Sources persistence (omitted = preserve; null or [] = clear all)
  if (data.sources !== undefined) {
    await prismaTx.postSource.deleteMany({ where: { postId } });

    if (Array.isArray(data.sources) && data.sources.length > 0) {
      for (let i = 0; i < data.sources.length; i++) {
        const s = data.sources[i];

        // Find existing source by exact sanitized URL
        let sourceRecord = await prismaTx.source.findFirst({
          where: { url: s.url },
        });

        if (sourceRecord) {
          // Update only explicitly provided metadata
          const updateData: Record<string, any> = {};
          if (s.title !== undefined) updateData.title = s.title;
          if (s.publisher !== undefined) updateData.publisher = s.publisher;
          if (s.publishedAt !== undefined) updateData.publishedAt = s.publishedAt;
          if (Object.keys(updateData).length > 0) {
            sourceRecord = await prismaTx.source.update({
              where: { id: sourceRecord.id },
              data: updateData,
            });
          }
        } else {
          sourceRecord = await prismaTx.source.create({
            data: {
              url: s.url,
              title: s.title,
              publisher: s.publisher,
              publishedAt: s.publishedAt ?? null,
              primarySource: s.role === "PRIMARY",
            },
          });
        }

        // PostSource relation
        await prismaTx.postSource.create({
          data: {
            postId,
            sourceId: sourceRecord.id,
            role: s.role || "SUPPORTING", // PostSource.role has DB default SUPPORTING
            sortOrder: i,
          },
        });
      }
    }
  }

  // Corrections persistence (omitted = preserve; null or [] = clear all)
  // Does NOT auto-set correctionStatus — caller must set it explicitly if needed.
  if (data.corrections !== undefined) {
    await prismaTx.correction.deleteMany({ where: { postId } });

    if (Array.isArray(data.corrections) && data.corrections.length > 0) {
      for (const c of data.corrections) {
        await prismaTx.correction.create({
          data: {
            postId,
            description: c.description,
            previousText: c.previousText,
            correctedText: c.correctedText,
            reason: c.reason,
            material: c.material ?? false,
          },
        });
      }
    }
  }
}
