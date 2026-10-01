-- Publisher n8n integration: add topicId for topic_id → research_id → post_id traceability
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "topicId" TEXT;
