import { describe, it, expect, vi } from "vitest";
import { validateEditorialInput, applyEditorialPersistenceTransaction } from "../lib/editorial-persistence";

describe("CMS/API V2 Editorial Validation & Persistence", () => {
  // ============================================================
  // 1. VALIDATOR
  // ============================================================
  describe("validateEditorialInput", () => {
    it("empty/null/undefined input returns empty validated", () => {
      expect(validateEditorialInput(null).validated).toEqual({});
      expect(validateEditorialInput(undefined).validated).toEqual({});
      expect(validateEditorialInput({}).validated).toEqual({});
    });

    // --- editorialType ---
    it("rejects invalid editorialType", () => {
      expect(validateEditorialInput({ editorialType: "INVALID" }).error).toBeDefined();
      expect(validateEditorialInput({ editorialType: 123 as any }).error).toBeDefined();
    });

    it("accepts valid canonical editorialType", () => {
      const r = validateEditorialInput({ editorialType: "NEWS" });
      expect(r.error).toBeUndefined();
      expect(r.validated!.editorialType).toBe("NEWS");
    });

    it("clears editorialType with null or empty string", () => {
      expect(validateEditorialInput({ editorialType: null }).validated!.editorialType).toBeNull();
      expect(validateEditorialInput({ editorialType: "" }).validated!.editorialType).toBeNull();
    });

    // --- REVIEW_VERIFIED requires personalExperienceVerified ---
    it("rejects REVIEW_VERIFIED without personalExperienceVerified=true", () => {
      expect(validateEditorialInput({ editorialType: "REVIEW_VERIFIED" }).error).toContain("personalExperienceVerified");
      expect(validateEditorialInput({ editorialType: "REVIEW_VERIFIED", personalExperienceVerified: false }).error).toContain("personalExperienceVerified");
    });

    it("accepts REVIEW_VERIFIED with personalExperienceVerified=true", () => {
      const r = validateEditorialInput({ editorialType: "REVIEW_VERIFIED", personalExperienceVerified: true });
      expect(r.error).toBeUndefined();
      expect(r.validated!.editorialType).toBe("REVIEW_VERIFIED");
      expect(r.validated!.personalExperienceVerified).toBe(true);
    });

    // --- personalExperienceVerified strict boolean ---
    it("rejects non-boolean personalExperienceVerified (string coercion blocked)", () => {
      expect(validateEditorialInput({ personalExperienceVerified: "true" as any }).error).toContain("boolean");
      expect(validateEditorialInput({ personalExperienceVerified: 1 as any }).error).toContain("boolean");
      expect(validateEditorialInput({ personalExperienceVerified: "false" as any }).error).toContain("boolean");
    });

    it("accepts boolean personalExperienceVerified", () => {
      expect(validateEditorialInput({ personalExperienceVerified: true }).validated!.personalExperienceVerified).toBe(true);
      expect(validateEditorialInput({ personalExperienceVerified: false }).validated!.personalExperienceVerified).toBe(false);
    });

    // --- trafficIntent ---
    it("rejects invalid trafficIntent", () => {
      expect(validateEditorialInput({ trafficIntent: "INVALID" }).error).toBeDefined();
    });

    it("accepts valid trafficIntent", () => {
      for (const intent of ["SEARCH", "DISCOVER", "NEWS", "EVERGREEN", "AUTHORITY"]) {
        const r = validateEditorialInput({ trafficIntent: intent });
        expect(r.error).toBeUndefined();
        expect(r.validated!.trafficIntent).toBe(intent);
      }
    });

    // --- correctionStatus ---
    it("rejects invalid correctionStatus", () => {
      expect(validateEditorialInput({ correctionStatus: "INVALID" }).error).toBeDefined();
    });

    it("accepts valid correctionStatus values", () => {
      for (const s of ["NONE", "PENDING", "CORRECTED"]) {
        expect(validateEditorialInput({ correctionStatus: s }).validated!.correctionStatus).toBe(s);
      }
    });

    // --- Date fields ---
    it("rejects invalid dates", () => {
      expect(validateEditorialInput({ factCheckedAt: "not-a-date" }).error).toContain("factCheckedAt");
      expect(validateEditorialInput({ firstPublishedAt: "xyz" }).error).toContain("firstPublishedAt");
      expect(validateEditorialInput({ editorialModifiedAt: "abc" }).error).toContain("editorialModifiedAt");
    });

    it("accepts valid ISO dates", () => {
      const r = validateEditorialInput({ factCheckedAt: "2026-03-30T10:00:00.000Z" });
      expect(r.error).toBeUndefined();
      expect(r.validated!.factCheckedAt).toBeInstanceOf(Date);
    });

    it("clears date fields with null", () => {
      const r = validateEditorialInput({ factCheckedAt: null });
      expect(r.validated!.factCheckedAt).toBeNull();
    });

    // --- Sources ---
    it("rejects source with javascript: URL", () => {
      const r = validateEditorialInput({ sources: [{ url: "javascript:alert(1)" }] });
      expect(r.error).toContain("URL");
    });

    it("rejects source without URL", () => {
      const r = validateEditorialInput({ sources: [{ title: "test" }] });
      expect(r.error).toContain("URL");
    });

    it("rejects source with invalid role", () => {
      const r = validateEditorialInput({ sources: [{ url: "https://example.com", role: "INVALID" }] });
      expect(r.error).toContain("role");
    });

    it("accepts valid source with role", () => {
      const r = validateEditorialInput({ sources: [{ url: "https://example.com", role: "PRIMARY" }] });
      expect(r.error).toBeUndefined();
      expect(r.validated!.sources![0].url).toBe("https://example.com");
      expect(r.validated!.sources![0].role).toBe("PRIMARY");
    });

    it("accepts source without role (no default invented)", () => {
      const r = validateEditorialInput({ sources: [{ url: "https://example.com" }] });
      expect(r.error).toBeUndefined();
      expect(r.validated!.sources![0].role).toBeUndefined();
    });

    it("rejects source with invalid publishedAt", () => {
      const r = validateEditorialInput({ sources: [{ url: "https://example.com", publishedAt: "bad" }] });
      expect(r.error).toContain("publishedAt");
    });

    it("null sources means clear", () => {
      expect(validateEditorialInput({ sources: null }).validated!.sources).toBeNull();
    });

    it("empty array sources means clear", () => {
      expect(validateEditorialInput({ sources: [] }).validated!.sources).toEqual([]);
    });

    it("rejects non-array sources", () => {
      expect(validateEditorialInput({ sources: "not-array" as any }).error).toContain("array");
    });

    // --- Corrections ---
    it("rejects correction without description", () => {
      const r = validateEditorialInput({ corrections: [{ previousText: "old" }] });
      expect(r.error).toContain("description");
    });

    it("rejects correction with non-boolean material", () => {
      const r = validateEditorialInput({ corrections: [{ description: "fix", material: "yes" as any }] });
      expect(r.error).toContain("material");
    });

    it("accepts valid correction", () => {
      const r = validateEditorialInput({ corrections: [{ description: "Fixed typo", material: false }] });
      expect(r.error).toBeUndefined();
      expect(r.validated!.corrections![0].description).toBe("Fixed typo");
      expect(r.validated!.corrections![0].material).toBe(false);
    });

    it("null corrections means clear", () => {
      expect(validateEditorialInput({ corrections: null }).validated!.corrections).toBeNull();
    });

    // --- String scalars ---
    it("authorId/reviewerId reject non-strings", () => {
      expect(validateEditorialInput({ authorId: 123 as any }).error).toContain("string");
      expect(validateEditorialInput({ reviewerId: true as any }).error).toContain("string");
    });

    // --- Omitted preserves (no key = not in validated) ---
    it("omitted fields are not present in validated", () => {
      const r = validateEditorialInput({ editorialType: "NEWS" });
      expect(r.validated).not.toHaveProperty("trafficIntent");
      expect(r.validated).not.toHaveProperty("authorId");
      expect(r.validated).not.toHaveProperty("sources");
      expect(r.validated).not.toHaveProperty("corrections");
    });
  });

  // ============================================================
  // 2. PERSISTENCE TRANSACTION (Prisma boundary mock)
  // ============================================================
  describe("applyEditorialPersistenceTransaction", () => {
    function createMockTx() {
      return {
        author: {
          findUnique: vi.fn().mockImplementation(async ({ where }: any) => {
            if (where.id === "author-1") return { id: "author-1", name: "Eliezer" };
            if (where.id === "reviewer-1") return { id: "reviewer-1", name: "João" };
            return null;
          }),
        },
        post: {
          update: vi.fn().mockResolvedValue({ id: "post-1" }),
        },
        postSource: {
          deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
          create: vi.fn().mockResolvedValue({}),
        },
        source: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: `src-${data.url}`, ...data })),
          update: vi.fn().mockImplementation(async ({ where, data }: any) => ({ id: where.id, ...data })),
        },
        correction: {
          deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
          create: vi.fn().mockResolvedValue({}),
        },
      };
    }

    it("updates post scalars when provided", async () => {
      const tx = createMockTx();
      await applyEditorialPersistenceTransaction(tx, "post-1", {
        editorialType: "NEWS",
        trafficIntent: "SEARCH",
        disclosure: "Artigo patrocinado",
      }, true);

      expect(tx.post.update).toHaveBeenCalledWith({
        where: { id: "post-1" },
        data: expect.objectContaining({
          editorialType: "NEWS",
          trafficIntent: "SEARCH",
          disclosure: "Artigo patrocinado",
        }),
      });
    });

    it("does not update post if no fields provided", async () => {
      const tx = createMockTx();
      await applyEditorialPersistenceTransaction(tx, "post-1", {}, true);
      expect(tx.post.update).not.toHaveBeenCalled();
    });

    it("connects author when authorId exists", async () => {
      const tx = createMockTx();
      await applyEditorialPersistenceTransaction(tx, "post-1", { authorId: "author-1" }, true);
      expect(tx.post.update).toHaveBeenCalledWith({
        where: { id: "post-1" },
        data: expect.objectContaining({
          author: { connect: { id: "author-1" } },
        }),
      });
    });

    it("disconnects author when authorId is null", async () => {
      const tx = createMockTx();
      await applyEditorialPersistenceTransaction(tx, "post-1", { authorId: null }, true);
      expect(tx.post.update).toHaveBeenCalledWith({
        where: { id: "post-1" },
        data: expect.objectContaining({
          author: { disconnect: true },
        }),
      });
    });

    it("throws when authorId doesn't exist", async () => {
      const tx = createMockTx();
      await expect(
        applyEditorialPersistenceTransaction(tx, "post-1", { authorId: "nonexistent" }, true)
      ).rejects.toThrow("does not exist");
    });

    it("throws when reviewerId doesn't exist", async () => {
      const tx = createMockTx();
      await expect(
        applyEditorialPersistenceTransaction(tx, "post-1", { reviewerId: "nonexistent" }, true)
      ).rejects.toThrow("does not exist");
    });

    it("clears sources when sources=null", async () => {
      const tx = createMockTx();
      await applyEditorialPersistenceTransaction(tx, "post-1", { sources: null }, true);
      expect(tx.postSource.deleteMany).toHaveBeenCalledWith({ where: { postId: "post-1" } });
      expect(tx.source.create).not.toHaveBeenCalled();
    });

    it("clears sources when sources=[]", async () => {
      const tx = createMockTx();
      await applyEditorialPersistenceTransaction(tx, "post-1", { sources: [] }, true);
      expect(tx.postSource.deleteMany).toHaveBeenCalledWith({ where: { postId: "post-1" } });
    });

    it("creates sources with PostSource relations", async () => {
      const tx = createMockTx();
      await applyEditorialPersistenceTransaction(tx, "post-1", {
        sources: [
          { url: "https://example.com", role: "PRIMARY" },
          { url: "https://other.com" },
        ],
      }, true);

      expect(tx.postSource.deleteMany).toHaveBeenCalled();
      expect(tx.source.create).toHaveBeenCalledTimes(2);
      expect(tx.postSource.create).toHaveBeenCalledTimes(2);
      expect(tx.postSource.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ role: "PRIMARY", sortOrder: 0 }),
      });
      expect(tx.postSource.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ role: "SUPPORTING", sortOrder: 1 }),
      });
    });

    it("updates existing source by URL instead of creating duplicate", async () => {
      const tx = createMockTx();
      tx.source.findFirst.mockResolvedValueOnce({ id: "existing-src", url: "https://example.com", title: "Old" });

      await applyEditorialPersistenceTransaction(tx, "post-1", {
        sources: [{ url: "https://example.com", title: "Updated Title" }],
      }, true);

      expect(tx.source.create).not.toHaveBeenCalled();
      expect(tx.source.update).toHaveBeenCalledWith({
        where: { id: "existing-src" },
        data: { title: "Updated Title" },
      });
    });

    it("clears corrections when corrections=null", async () => {
      const tx = createMockTx();
      await applyEditorialPersistenceTransaction(tx, "post-1", { corrections: null }, true);
      expect(tx.correction.deleteMany).toHaveBeenCalledWith({ where: { postId: "post-1" } });
      expect(tx.correction.create).not.toHaveBeenCalled();
    });

    it("replaces corrections and does NOT auto-set correctionStatus", async () => {
      const tx = createMockTx();
      await applyEditorialPersistenceTransaction(tx, "post-1", {
        corrections: [{ description: "Fixed date", material: true }],
      }, true);

      expect(tx.correction.deleteMany).toHaveBeenCalled();
      expect(tx.correction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          postId: "post-1",
          description: "Fixed date",
          material: true,
        }),
      });
      // Ensure correctionStatus NOT auto-set
      for (const call of tx.post.update.mock.calls) {
        expect(call[0].data).not.toHaveProperty("correctionStatus");
      }
    });

    it("preserves sources when field is omitted (undefined)", async () => {
      const tx = createMockTx();
      await applyEditorialPersistenceTransaction(tx, "post-1", { editorialType: "NEWS" }, true);
      expect(tx.postSource.deleteMany).not.toHaveBeenCalled();
    });

    it("preserves corrections when field is omitted", async () => {
      const tx = createMockTx();
      await applyEditorialPersistenceTransaction(tx, "post-1", { editorialType: "NEWS" }, true);
      expect(tx.correction.deleteMany).not.toHaveBeenCalled();
    });
  });
});
