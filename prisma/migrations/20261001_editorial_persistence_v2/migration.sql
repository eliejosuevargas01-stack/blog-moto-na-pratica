-- ========================================================
-- MIGRATION: 20261001_editorial_persistence_v2
-- Descrição: Persistência Editorial V2 (E-E-A-T & Trust Architecture)
-- Natureza: 100% ADITIVA (compatível com posts e dados existentes)
-- ========================================================

-- 1. AlterTable Post (novas colunas editoriais com fallbacks seguros)
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "editorialType" TEXT;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "trafficIntent" TEXT;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "authorId" TEXT;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "reviewerId" TEXT;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "researchId" TEXT;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "personalExperienceVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "factCheckedAt" TIMESTAMP(3);
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "disclosure" TEXT;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "correctionStatus" TEXT;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "firstPublishedAt" TIMESTAMP(3);
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "editorialModifiedAt" TIMESTAMP(3);
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "updatedReason" TEXT;

-- 2. CreateTable authors
CREATE TABLE IF NOT EXISTS "authors" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PERSON',
    "bio" TEXT,
    "shortBio" TEXT,
    "avatarUrl" TEXT,
    "profileUrl" TEXT,
    "role" TEXT,
    "sameAs" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "authors_pkey" PRIMARY KEY ("id")
);

-- 3. CreateTable sources
CREATE TABLE IF NOT EXISTS "sources" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "domain" TEXT,
    "title" TEXT,
    "publisher" TEXT,
    "sourceType" TEXT,
    "publishedAt" TIMESTAMP(3),
    "accessedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "primarySource" BOOLEAN NOT NULL DEFAULT false,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- 4. CreateTable post_sources
CREATE TABLE IF NOT EXISTS "post_sources" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'SUPPORTING',
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "post_sources_pkey" PRIMARY KEY ("id")
);

-- 5. CreateTable corrections
CREATE TABLE IF NOT EXISTS "corrections" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "previousText" TEXT,
    "correctedText" TEXT,
    "reason" TEXT,
    "material" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corrections_pkey" PRIMARY KEY ("id")
);

-- 6. CreateIndexes
CREATE UNIQUE INDEX IF NOT EXISTS "authors_slug_key" ON "authors"("slug");
CREATE INDEX IF NOT EXISTS "idx_post_source_post" ON "post_sources"("postId");
CREATE INDEX IF NOT EXISTS "idx_post_source_source" ON "post_sources"("sourceId");
CREATE UNIQUE INDEX IF NOT EXISTS "post_sources_postId_sourceId_key" ON "post_sources"("postId", "sourceId");
CREATE INDEX IF NOT EXISTS "idx_correction_post" ON "corrections"("postId");
CREATE INDEX IF NOT EXISTS "idx_post_author" ON "Post"("authorId");
CREATE INDEX IF NOT EXISTS "idx_post_editorial_type" ON "Post"("editorialType");

-- 7. AddForeignKeys
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Post_authorId_fkey') THEN
        ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Post_reviewerId_fkey') THEN
        ALTER TABLE "Post" ADD CONSTRAINT "Post_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'post_sources_postId_fkey') THEN
        ALTER TABLE "post_sources" ADD CONSTRAINT "post_sources_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'post_sources_sourceId_fkey') THEN
        ALTER TABLE "post_sources" ADD CONSTRAINT "post_sources_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'corrections_postId_fkey') THEN
        ALTER TABLE "corrections" ADD CONSTRAINT "corrections_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
