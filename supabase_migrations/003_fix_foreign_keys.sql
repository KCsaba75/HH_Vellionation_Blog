-- Migration 003: Fix Foreign Key Constraints
-- This migration ensures all required foreign key relationships exist between tables
-- Safe to run multiple times (checks for existing constraints before creating)
-- Includes automatic cleanup of orphaned/inconsistent data
-- Wrapped in transaction to prevent race conditions

-- ============================================================================
-- BEGIN TRANSACTION - Ensures atomic execution
-- ============================================================================
BEGIN;

-- ============================================================================
-- LOCK TABLES (Prevent Concurrent Writes)
-- ============================================================================
-- Lock tables in SHARE ROW EXCLUSIVE mode to prevent concurrent modifications
-- This ensures no new orphaned data can be inserted during migration
LOCK TABLE posts IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE solutions IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE profiles IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE categories IN SHARE ROW EXCLUSIVE MODE;

-- ============================================================================
-- ENSURE NULLABLE COLUMNS (Pre-Cleanup Step)
-- ============================================================================
-- Make sure user_id can be set to NULL before cleanup
-- This prevents migration failures if the column has NOT NULL constraint
ALTER TABLE posts ALTER COLUMN user_id DROP NOT NULL;

-- ============================================================================
-- DATA CLEANUP (Pre-Migration Sanitization)
-- ============================================================================
-- IMPORTANT: Clean up any orphaned or inconsistent data BEFORE creating foreign keys
-- This ensures the migration succeeds even if there's existing bad data
-- Using NOT EXISTS instead of NOT IN to handle NULL values safely
-- Strategy: SET NULL for invalid references (preserves data) instead of DELETE

-- 1. Clean up posts with invalid user_id (orphaned posts without valid authors)
-- SET NULL instead of DELETE to preserve posts (safer - no data loss)
-- Only update rows with non-NULL user_id that don't have a matching profile
UPDATE posts 
SET user_id = NULL 
WHERE user_id IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = posts.user_id
  );

-- 2. Clean up posts with invalid category references
-- Set category_id to NULL if it references a non-existent category
UPDATE posts 
SET category_id = NULL 
WHERE category_id IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM categories WHERE categories.id = posts.category_id
  );

-- 3. Clean up posts with invalid subcategory references
-- Set subcategory_id to NULL if it references a non-existent category
UPDATE posts 
SET subcategory_id = NULL 
WHERE subcategory_id IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM categories WHERE categories.id = posts.subcategory_id
  );

-- 4. Clean up solutions with invalid category references
-- Set category_id to NULL if it references a non-existent category
UPDATE solutions 
SET category_id = NULL 
WHERE category_id IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM categories WHERE categories.id = solutions.category_id
  );

-- 5. Clean up solutions with invalid subcategory references
-- Set subcategory_id to NULL if it references a non-existent category
UPDATE solutions 
SET subcategory_id = NULL 
WHERE subcategory_id IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM categories WHERE categories.id = solutions.subcategory_id
  );

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- 1. posts.user_id -> profiles.id
-- Ensures every post has a valid author from the profiles table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'posts_user_id_fkey'
  ) THEN
    ALTER TABLE posts 
    ADD CONSTRAINT posts_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES profiles(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- 2. posts.category_id -> categories.id
-- Links posts to their main category
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'posts_category_id_fkey'
  ) THEN
    ALTER TABLE posts 
    ADD CONSTRAINT posts_category_id_fkey 
    FOREIGN KEY (category_id) 
    REFERENCES categories(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- 3. posts.subcategory_id -> categories.id
-- Links posts to their subcategory (optional)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'posts_subcategory_id_fkey'
  ) THEN
    ALTER TABLE posts 
    ADD CONSTRAINT posts_subcategory_id_fkey 
    FOREIGN KEY (subcategory_id) 
    REFERENCES categories(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- 4. solutions.category_id -> categories.id
-- Links solutions to their main category
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'solutions_category_id_fkey'
  ) THEN
    ALTER TABLE solutions 
    ADD CONSTRAINT solutions_category_id_fkey 
    FOREIGN KEY (category_id) 
    REFERENCES categories(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- 5. solutions.subcategory_id -> categories.id
-- Links solutions to their subcategory (optional)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'solutions_subcategory_id_fkey'
  ) THEN
    ALTER TABLE solutions 
    ADD CONSTRAINT solutions_subcategory_id_fkey 
    FOREIGN KEY (subcategory_id) 
    REFERENCES categories(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Create indexes on foreign key columns for faster joins and queries
-- PostgreSQL doesn't auto-index foreign keys, so we add them manually

-- Index on posts.user_id for fast author lookups
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);

-- Index on posts.category_id for fast category filtering
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);

-- Index on posts.subcategory_id for fast subcategory filtering
CREATE INDEX IF NOT EXISTS idx_posts_subcategory_id ON posts(subcategory_id);

-- Index on solutions.category_id for fast category filtering
CREATE INDEX IF NOT EXISTS idx_solutions_category_id ON solutions(category_id);

-- Index on solutions.subcategory_id for fast subcategory filtering
CREATE INDEX IF NOT EXISTS idx_solutions_subcategory_id ON solutions(subcategory_id);

-- Composite index for filtering posts by status and category together
CREATE INDEX IF NOT EXISTS idx_posts_status_category ON posts(status, category_id);

-- Composite index for filtering solutions by status and category together
CREATE INDEX IF NOT EXISTS idx_solutions_status_category ON solutions(status, category_id);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- List all foreign key constraints for verification
-- You can run this query after migration to confirm all constraints exist:
-- 
-- SELECT
--   tc.table_name, 
--   tc.constraint_name, 
--   kcu.column_name,
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name 
-- FROM information_schema.table_constraints AS tc 
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY' 
--   AND tc.table_name IN ('posts', 'solutions')
-- ORDER BY tc.table_name, tc.constraint_name;

-- ============================================================================
-- COMMIT TRANSACTION - All or nothing
-- ============================================================================
COMMIT;
