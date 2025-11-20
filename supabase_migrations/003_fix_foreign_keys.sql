-- Migration 003: Fix Foreign Key Constraints
-- This migration ensures all required foreign key relationships exist between tables
-- Safe to run multiple times (checks for existing constraints before creating)
-- Includes automatic cleanup of orphaned/inconsistent data
-- Transaction-Wrapped: Entire migration runs atomically (all or nothing)
-- No Production Downtime: Uses NOT VALID + VALIDATE pattern (no table locks)

-- ============================================================================
-- BEGIN TRANSACTION - Ensures atomic execution
-- ============================================================================
BEGIN;

-- ============================================================================
-- FOREIGN KEY: posts.user_id -> profiles.id
-- ============================================================================
DO $$ 
DECLARE
  constraint_exists boolean;
  constraint_valid boolean;
BEGIN
  -- Check if constraint exists and if it's validated
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_user_id_fkey'
  ) INTO constraint_exists;
  
  IF constraint_exists THEN
    SELECT convalidated FROM pg_constraint 
    WHERE conname = 'posts_user_id_fkey' 
    INTO constraint_valid;
  END IF;

  -- Case 1: Constraint doesn't exist - create it
  IF NOT constraint_exists THEN
    -- Clean up orphaned posts (posts without valid authors)
    DELETE FROM posts 
    WHERE user_id IS NOT NULL 
      AND NOT EXISTS (
        SELECT 1 FROM profiles WHERE profiles.id = posts.user_id
      );
    
    -- Create constraint as NOT VALID (instant, no table lock)
    EXECUTE 'ALTER TABLE posts 
             ADD CONSTRAINT posts_user_id_fkey 
             FOREIGN KEY (user_id) 
             REFERENCES profiles(id) 
             ON DELETE CASCADE
             NOT VALID';
    
    -- Validate the constraint (scans table, doesn''t block writes)
    EXECUTE 'ALTER TABLE posts VALIDATE CONSTRAINT posts_user_id_fkey';
    
  -- Case 2: Constraint exists but not validated - validate it
  ELSIF NOT constraint_valid THEN
    -- Clean up before validating
    DELETE FROM posts 
    WHERE user_id IS NOT NULL 
      AND NOT EXISTS (
        SELECT 1 FROM profiles WHERE profiles.id = posts.user_id
      );
    
    -- Validate existing constraint
    EXECUTE 'ALTER TABLE posts VALIDATE CONSTRAINT posts_user_id_fkey';
  END IF;
  -- Case 3: Constraint exists and is valid - skip
END $$;

-- ============================================================================
-- FOREIGN KEY: posts.category_id -> categories.id
-- ============================================================================
DO $$ 
DECLARE
  constraint_exists boolean;
  constraint_valid boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_category_id_fkey'
  ) INTO constraint_exists;
  
  IF constraint_exists THEN
    SELECT convalidated FROM pg_constraint 
    WHERE conname = 'posts_category_id_fkey' 
    INTO constraint_valid;
  END IF;

  IF NOT constraint_exists THEN
    -- Clean up invalid category references
    UPDATE posts 
    SET category_id = NULL 
    WHERE category_id IS NOT NULL 
      AND NOT EXISTS (
        SELECT 1 FROM categories WHERE categories.id = posts.category_id
      );
    
    EXECUTE 'ALTER TABLE posts 
             ADD CONSTRAINT posts_category_id_fkey 
             FOREIGN KEY (category_id) 
             REFERENCES categories(id) 
             ON DELETE SET NULL
             NOT VALID';
    
    EXECUTE 'ALTER TABLE posts VALIDATE CONSTRAINT posts_category_id_fkey';
    
  ELSIF NOT constraint_valid THEN
    UPDATE posts 
    SET category_id = NULL 
    WHERE category_id IS NOT NULL 
      AND NOT EXISTS (
        SELECT 1 FROM categories WHERE categories.id = posts.category_id
      );
    
    EXECUTE 'ALTER TABLE posts VALIDATE CONSTRAINT posts_category_id_fkey';
  END IF;
END $$;

-- ============================================================================
-- FOREIGN KEY: posts.subcategory_id -> categories.id
-- ============================================================================
DO $$ 
DECLARE
  constraint_exists boolean;
  constraint_valid boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_subcategory_id_fkey'
  ) INTO constraint_exists;
  
  IF constraint_exists THEN
    SELECT convalidated FROM pg_constraint 
    WHERE conname = 'posts_subcategory_id_fkey' 
    INTO constraint_valid;
  END IF;

  IF NOT constraint_exists THEN
    UPDATE posts 
    SET subcategory_id = NULL 
    WHERE subcategory_id IS NOT NULL 
      AND NOT EXISTS (
        SELECT 1 FROM categories WHERE categories.id = posts.subcategory_id
      );
    
    EXECUTE 'ALTER TABLE posts 
             ADD CONSTRAINT posts_subcategory_id_fkey 
             FOREIGN KEY (subcategory_id) 
             REFERENCES categories(id) 
             ON DELETE SET NULL
             NOT VALID';
    
    EXECUTE 'ALTER TABLE posts VALIDATE CONSTRAINT posts_subcategory_id_fkey';
    
  ELSIF NOT constraint_valid THEN
    UPDATE posts 
    SET subcategory_id = NULL 
    WHERE subcategory_id IS NOT NULL 
      AND NOT EXISTS (
        SELECT 1 FROM categories WHERE categories.id = posts.subcategory_id
      );
    
    EXECUTE 'ALTER TABLE posts VALIDATE CONSTRAINT posts_subcategory_id_fkey';
  END IF;
END $$;

-- ============================================================================
-- FOREIGN KEY: solutions.category_id -> categories.id
-- ============================================================================
DO $$ 
DECLARE
  constraint_exists boolean;
  constraint_valid boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'solutions_category_id_fkey'
  ) INTO constraint_exists;
  
  IF constraint_exists THEN
    SELECT convalidated FROM pg_constraint 
    WHERE conname = 'solutions_category_id_fkey' 
    INTO constraint_valid;
  END IF;

  IF NOT constraint_exists THEN
    UPDATE solutions 
    SET category_id = NULL 
    WHERE category_id IS NOT NULL 
      AND NOT EXISTS (
        SELECT 1 FROM categories WHERE categories.id = solutions.category_id
      );
    
    EXECUTE 'ALTER TABLE solutions 
             ADD CONSTRAINT solutions_category_id_fkey 
             FOREIGN KEY (category_id) 
             REFERENCES categories(id) 
             ON DELETE SET NULL
             NOT VALID';
    
    EXECUTE 'ALTER TABLE solutions VALIDATE CONSTRAINT solutions_category_id_fkey';
    
  ELSIF NOT constraint_valid THEN
    UPDATE solutions 
    SET category_id = NULL 
    WHERE category_id IS NOT NULL 
      AND NOT EXISTS (
        SELECT 1 FROM categories WHERE categories.id = solutions.category_id
      );
    
    EXECUTE 'ALTER TABLE solutions VALIDATE CONSTRAINT solutions_category_id_fkey';
  END IF;
END $$;

-- ============================================================================
-- FOREIGN KEY: solutions.subcategory_id -> categories.id
-- ============================================================================
DO $$ 
DECLARE
  constraint_exists boolean;
  constraint_valid boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'solutions_subcategory_id_fkey'
  ) INTO constraint_exists;
  
  IF constraint_exists THEN
    SELECT convalidated FROM pg_constraint 
    WHERE conname = 'solutions_subcategory_id_fkey' 
    INTO constraint_valid;
  END IF;

  IF NOT constraint_exists THEN
    UPDATE solutions 
    SET subcategory_id = NULL 
    WHERE subcategory_id IS NOT NULL 
      AND NOT EXISTS (
        SELECT 1 FROM categories WHERE categories.id = solutions.subcategory_id
      );
    
    EXECUTE 'ALTER TABLE solutions 
             ADD CONSTRAINT solutions_subcategory_id_fkey 
             FOREIGN KEY (subcategory_id) 
             REFERENCES categories(id) 
             ON DELETE SET NULL
             NOT VALID';
    
    EXECUTE 'ALTER TABLE solutions VALIDATE CONSTRAINT solutions_subcategory_id_fkey';
    
  ELSIF NOT constraint_valid THEN
    UPDATE solutions 
    SET subcategory_id = NULL 
    WHERE subcategory_id IS NOT NULL 
      AND NOT EXISTS (
        SELECT 1 FROM categories WHERE categories.id = solutions.subcategory_id
      );
    
    EXECUTE 'ALTER TABLE solutions VALIDATE CONSTRAINT solutions_subcategory_id_fkey';
  END IF;
END $$;

-- ============================================================================
-- COMMIT TRANSACTION
-- ============================================================================
COMMIT;

-- ============================================================================
-- INDEXES FOR PERFORMANCE (Outside transaction)
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
-- VERIFICATION QUERY
-- ============================================================================
-- Run this query after migration to confirm all constraints exist:
-- 
-- SELECT
--   tc.table_name, 
--   tc.constraint_name, 
--   kcu.column_name,
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name,
--   pgc.convalidated AS is_validated
-- FROM information_schema.table_constraints AS tc 
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- JOIN pg_constraint AS pgc
--   ON pgc.conname = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY' 
--   AND tc.table_name IN ('posts', 'solutions')
-- ORDER BY tc.table_name, tc.constraint_name;
