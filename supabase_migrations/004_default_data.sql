-- ============================================================================
-- VELLIO NATION - DEFAULT DATA SEED
-- ============================================================================
-- This migration populates initial settings and default categories
-- Run this AFTER 000_full_database_setup.sql
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING)
-- ============================================================================

-- ============================================================================
-- SETTINGS: Default Application Settings
-- ============================================================================

-- Social Media Links
INSERT INTO settings (key, value)
VALUES ('social_links', '{"facebook": "", "instagram": ""}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Blog Categories (legacy - now using hierarchical categories table)
INSERT INTO settings (key, value)
VALUES ('blog_categories', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Community Categories (legacy - now using hierarchical categories table)
INSERT INTO settings (key, value)
VALUES ('community_categories', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Help Center Page Content
INSERT INTO settings (key, value)
VALUES ('page_content_help', '{
  "content": "<h1>Welcome to Vellio Nation Help Center</h1><p>Find answers to common questions and get support for using our wellness community platform.</p><h2>Getting Started</h2><p>Learn how to create your account, set up your profile, and start engaging with our community.</p><h2>Community Guidelines</h2><p>Read our community guidelines to understand how to participate respectfully and positively.</p><h2>Contact Support</h2><p>If you need additional help, please contact our support team.</p>"
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Privacy Policy Page Content
INSERT INTO settings (key, value)
VALUES ('page_content_privacy', '{
  "content": "<h1>Privacy Policy</h1><p>Last updated: ' || to_char(CURRENT_DATE, 'YYYY-MM-DD') || '</p><h2>Information We Collect</h2><p>We collect information you provide directly to us, such as your name, email address, and profile information.</p><h2>How We Use Your Information</h2><p>We use the information we collect to provide, maintain, and improve our services.</p><h2>Data Security</h2><p>We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access.</p><h2>Your Rights</h2><p>You have the right to access, update, or delete your personal information at any time.</p>"
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Terms of Service Page Content
INSERT INTO settings (key, value)
VALUES ('page_content_terms', '{
  "content": "<h1>Terms of Service</h1><p>Last updated: ' || to_char(CURRENT_DATE, 'YYYY-MM-DD') || '</p><h2>Acceptance of Terms</h2><p>By accessing and using Vellio Nation, you accept and agree to be bound by these Terms of Service.</p><h2>User Accounts</h2><p>You are responsible for maintaining the confidentiality of your account and password.</p><h2>Content Guidelines</h2><p>You agree not to post content that is offensive, illegal, or violates the rights of others.</p><h2>Limitation of Liability</h2><p>Vellio Nation shall not be liable for any indirect, incidental, or consequential damages.</p>"
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- CATEGORIES: Default Blog Categories
-- ============================================================================

-- Blog: Nutrition (Main Category)
INSERT INTO categories (name, slug, type, parent_id, position)
VALUES ('Nutrition', 'nutrition', 'blog', NULL, 1)
ON CONFLICT DO NOTHING;

-- Blog: Fitness (Main Category)
INSERT INTO categories (name, slug, type, parent_id, position)
VALUES ('Fitness', 'fitness', 'blog', NULL, 2)
ON CONFLICT DO NOTHING;

-- Blog: Mental Health (Main Category)
INSERT INTO categories (name, slug, type, parent_id, position)
VALUES ('Mental Health', 'mental-health', 'blog', NULL, 3)
ON CONFLICT DO NOTHING;

-- Blog: Lifestyle (Main Category)
INSERT INTO categories (name, slug, type, parent_id, position)
VALUES ('Lifestyle', 'lifestyle', 'blog', NULL, 4)
ON CONFLICT DO NOTHING;

-- Blog: General (Main Category - Catch-all)
INSERT INTO categories (name, slug, type, parent_id, position)
VALUES ('General', 'general', 'blog', NULL, 10)
ON CONFLICT DO NOTHING;

-- Blog: Uncategorized (Fallback)
INSERT INTO categories (name, slug, type, parent_id, position)
VALUES ('Uncategorized', 'uncategorized', 'blog', NULL, 999)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CATEGORIES: Default Community Categories
-- ============================================================================

-- Community: General Discussion (Main Category)
INSERT INTO categories (name, slug, type, parent_id, position)
VALUES ('General Discussion', 'general-discussion', 'community', NULL, 1)
ON CONFLICT DO NOTHING;

-- Community: Success Stories (Main Category)
INSERT INTO categories (name, slug, type, parent_id, position)
VALUES ('Success Stories', 'success-stories', 'community', NULL, 2)
ON CONFLICT DO NOTHING;

-- Community: Questions & Answers (Main Category)
INSERT INTO categories (name, slug, type, parent_id, position)
VALUES ('Questions & Answers', 'questions-answers', 'community', NULL, 3)
ON CONFLICT DO NOTHING;

-- Community: Support & Motivation (Main Category)
INSERT INTO categories (name, slug, type, parent_id, position)
VALUES ('Support & Motivation', 'support-motivation', 'community', NULL, 4)
ON CONFLICT DO NOTHING;

-- Community: Uncategorized (Fallback)
INSERT INTO categories (name, slug, type, parent_id, position)
VALUES ('Uncategorized', 'uncategorized', 'community', NULL, 999)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CATEGORIES: Default Solutions Categories
-- ============================================================================

-- Solutions: Products (Main Category)
INSERT INTO categories (name, slug, type, parent_id, position)
VALUES ('Products', 'products', 'solutions', NULL, 1)
ON CONFLICT DO NOTHING;

-- Solutions: Apps & Tools (Main Category)
INSERT INTO categories (name, slug, type, parent_id, position)
VALUES ('Apps & Tools', 'apps-tools', 'solutions', NULL, 2)
ON CONFLICT DO NOTHING;

-- Solutions: Educational Materials (Main Category)
INSERT INTO categories (name, slug, type, parent_id, position)
VALUES ('Educational Materials', 'educational-materials', 'solutions', NULL, 3)
ON CONFLICT DO NOTHING;

-- Solutions: Services (Main Category)
INSERT INTO categories (name, slug, type, parent_id, position)
VALUES ('Services', 'services', 'solutions', NULL, 4)
ON CONFLICT DO NOTHING;

-- Solutions: Uncategorized (Fallback)
INSERT INTO categories (name, slug, type, parent_id, position)
VALUES ('Uncategorized', 'uncategorized', 'solutions', NULL, 999)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- EXAMPLE SUBCATEGORIES (Optional - Commented Out)
-- ============================================================================
-- Uncomment these to add example subcategories under main categories

-- Blog > Nutrition > Subcategories
-- WITH nutrition_cat AS (SELECT id FROM categories WHERE slug = 'nutrition' AND type = 'blog')
-- INSERT INTO categories (name, slug, type, parent_id, position)
-- SELECT 'Healthy Recipes', 'healthy-recipes', 'blog', id, 1 FROM nutrition_cat
-- ON CONFLICT DO NOTHING;

-- WITH nutrition_cat AS (SELECT id FROM categories WHERE slug = 'nutrition' AND type = 'blog')
-- INSERT INTO categories (name, slug, type, parent_id, position)
-- SELECT 'Meal Planning', 'meal-planning', 'blog', id, 2 FROM nutrition_cat
-- ON CONFLICT DO NOTHING;

-- Blog > Fitness > Subcategories
-- WITH fitness_cat AS (SELECT id FROM categories WHERE slug = 'fitness' AND type = 'blog')
-- INSERT INTO categories (name, slug, type, parent_id, position)
-- SELECT 'Workout Routines', 'workout-routines', 'blog', id, 1 FROM fitness_cat
-- ON CONFLICT DO NOTHING;

-- WITH fitness_cat AS (SELECT id FROM categories WHERE slug = 'fitness' AND type = 'blog')
-- INSERT INTO categories (name, slug, type, parent_id, position)
-- SELECT 'Exercise Tips', 'exercise-tips', 'blog', id, 2 FROM fitness_cat
-- ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Verify settings in Supabase Dashboard: Table Editor > settings
-- 2. Verify categories in Supabase Dashboard: Table Editor > categories
-- 3. Customize social links, page content as needed via Admin Dashboard
-- 4. Add subcategories via Admin Dashboard > Settings > Categories
-- ============================================================================
