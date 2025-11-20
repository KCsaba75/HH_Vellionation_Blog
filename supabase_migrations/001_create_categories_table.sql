-- Create hierarchical categories table for blog, community, and solutions
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL,
  type text NOT NULL CHECK (type IN ('blog', 'community', 'solutions')),
  parent_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  position integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create unique index for name within type and parent
CREATE UNIQUE INDEX categories_type_name_parent_idx ON categories(type, name, COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- Create index for faster queries
CREATE INDEX categories_type_idx ON categories(type);
CREATE INDEX categories_parent_id_idx ON categories(parent_id);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON categories FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow admin insert" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow admin update" ON categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin delete" ON categories FOR DELETE USING (auth.role() = 'authenticated');

-- Add category columns to existing tables
ALTER TABLE posts ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS subcategory_id uuid REFERENCES categories(id) ON DELETE SET NULL;

-- We'll add these columns for community and solutions tables when they're needed
-- ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id) ON DELETE SET NULL;
-- ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS subcategory_id uuid REFERENCES categories(id) ON DELETE SET NULL;

-- ALTER TABLE solutions ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id) ON DELETE SET NULL;
-- ALTER TABLE solutions ADD COLUMN IF NOT EXISTS subcategory_id uuid REFERENCES categories(id) ON DELETE SET NULL;

-- Migration function to convert old flat categories to hierarchical structure
-- This will read from settings table and create category entries
CREATE OR REPLACE FUNCTION migrate_flat_categories_to_hierarchical()
RETURNS void AS $$
DECLARE
  blog_cats jsonb;
  community_cats jsonb;
  cat_name text;
  cat_id uuid;
BEGIN
  -- Get existing categories from settings
  SELECT value INTO blog_cats FROM settings WHERE key = 'blog_categories';
  SELECT value INTO community_cats FROM settings WHERE key = 'community_categories';
  
  -- Migrate blog categories (as main categories with no parent)
  IF blog_cats IS NOT NULL THEN
    FOR cat_name IN SELECT jsonb_array_elements_text(blog_cats)
    LOOP
      INSERT INTO categories (name, slug, type, parent_id, position)
      VALUES (
        cat_name,
        lower(regexp_replace(cat_name, '[^a-zA-Z0-9]+', '-', 'g')),
        'blog',
        NULL,
        0
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
  
  -- Migrate community categories
  IF community_cats IS NOT NULL THEN
    FOR cat_name IN SELECT jsonb_array_elements_text(community_cats)
    LOOP
      INSERT INTO categories (name, slug, type, parent_id, position)
      VALUES (
        cat_name,
        lower(regexp_replace(cat_name, '[^a-zA-Z0-9]+', '-', 'g')),
        'community',
        NULL,
        0
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
  
  -- Create default "Uncategorized" for each type
  INSERT INTO categories (name, slug, type, parent_id, position)
  VALUES 
    ('Uncategorized', 'uncategorized', 'blog', NULL, 999),
    ('Uncategorized', 'uncategorized', 'community', NULL, 999),
    ('Uncategorized', 'uncategorized', 'solutions', NULL, 999)
  ON CONFLICT DO NOTHING;
  
END;
$$ LANGUAGE plpgsql;

-- Run the migration (comment this out after first run)
-- SELECT migrate_flat_categories_to_hierarchical();

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
