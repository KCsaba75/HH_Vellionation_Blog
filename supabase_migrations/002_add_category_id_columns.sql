-- Add category_id and subcategory_id columns to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS subcategory_id uuid REFERENCES categories(id) ON DELETE SET NULL;

-- Add category_id and subcategory_id columns to solutions table
ALTER TABLE solutions
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS subcategory_id uuid REFERENCES categories(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_subcategory_id ON posts(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_solutions_category_id ON solutions(category_id);
CREATE INDEX IF NOT EXISTS idx_solutions_subcategory_id ON solutions(subcategory_id);

-- Migration helper: Populate category_id from existing category string (optional)
-- This attempts to match the string category to a category name in the categories table
-- Run this AFTER you've created your categories in the categories table
-- Uncomment the following lines when ready to migrate existing data:

-- UPDATE posts p
-- SET category_id = c.id
-- FROM categories c
-- WHERE c.type = 'blog' 
--   AND c.parent_id IS NULL 
--   AND p.category = c.name;

-- UPDATE solutions s
-- SET category_id = c.id
-- FROM categories c
-- WHERE c.type = 'solutions' 
--   AND c.parent_id IS NULL 
--   AND s.category = c.name;
