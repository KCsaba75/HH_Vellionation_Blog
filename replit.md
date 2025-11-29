# Vellio Nation Blog

## Overview
Vellio Nation is a wellness-focused blog and community platform built with React, Vite, and Supabase. It offers a comprehensive blogging system, community interaction features, a showcase for affiliate products and educational materials, and robust user authentication. The platform aims to foster a vibrant community around wellness, providing valuable content and resources.

## User Preferences
I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the `plugins/` folder.
Do not make changes to the `tools/` folder.

## System Architecture
The application is built with React 18.2 and Vite 4.5 for the frontend, utilizing React Router DOM 6.16 for navigation. Styling is handled with Tailwind CSS 3.3, Tailwind Animate, and Framer Motion for animations. UI components are built using Radix UI alongside custom components. Supabase serves as the backend for authentication and database management. Tiptap is used for rich text editing with native image resizing.

### UI/UX Decisions
- **Responsive Design**: The application features a fully responsive design, with particular attention paid to mobile optimization for the admin dashboard (card layouts for tables), tab menus, dialog forms, and settings.
- **Theme Switching**: Supports light/dark mode.
- **Header & Footer**: Consistent navigation and branding across the platform.

### Technical Implementations
- **Core Features**: User authentication, blog post management (CRUD), community comments, solutions showcase, theme switching, admin dashboard, user profile management (including avatar upload), social media integration, and SEO-friendly pages using React Helmet.
- **Admin Dashboard**: Provides comprehensive CRUD operations for blog posts, solutions, and user management. Includes role-based access control and automatic rank assignment based on roles.
- **User Profiles**: Allows users to view and edit profile information, upload avatars, and track gamified ranks and points.
- **Category System**: Implements a hierarchical category system stored in a `categories` table with `parent_id` for nested relationships. Categories are typed (`blog`, `community`, `solutions`) and used across posts, solutions, and community content.
- **Data Persistence**: Critical implementation detail to destructure joined objects (e.g., `categories`, `profiles`) before Supabase insert/update operations to prevent "unknown column" errors.
- **Deployment**: Configured for SPA deployment using `serve dist -s -l 5000` to handle client-side routing.

### Feature Specifications
- **Blog Management**: Create, read, update, and delete blog posts with rich text content, categories, and SEO metadata. Includes search functionality by title and excerpt.
- **Solutions Management**: Create, read, update, and delete solutions (products, apps, educational materials) with descriptions, affiliate URLs, ratings, and images. Features sidebar category navigation for filtering.
- **User Management**: View users, update roles (Member, Blogger, Admin), and automatically assign ranks ("Health Hero" for Bloggers, "Vellio Ambassador" for Admins).
- **Settings Management**: Configure social media links, manage blog/community categories, and edit static page content.
- **Gamification**: User ranks (New Member, Contributor, Health Hero, Vellio Ambassador) based on points or roles, with automatic rank updates.
- **Profile Picture Upload**: Securely uploads and displays user avatars via Supabase Storage.

## External Dependencies
- **Supabase**: Used for user authentication, database management, and file storage (for avatars, post images, solution images, community post images). Requires specific storage buckets (`avatars`, `post_images`, `solution_images`, `community_post_images`) to be public.
- **React Router DOM**: For client-side routing.
- **Tailwind CSS**: For utility-first styling.
- **Framer Motion**: For animations.
- **Radix UI**: For unstyled, accessible UI components.
- **Tiptap**: For rich text editing with native image resize support via tiptap-extension-resize-image.

## Recent Updates

### November 25, 2025
- **Blog Sidebar Navigation**: Redesigned BlogPage with left sidebar category navigation
  - Expandable categories with nested subcategories
  - Visual indication of selected filter
  - "Filtering by" chip with clear button
  - Consistent UX with Solutions and Community pages
- **Latest Articles Recommendation**: Added 4-card "Latest Articles" section below comments on blog posts
  - Responsive grid (2 cols tablet, 4 cols desktop)
  - Shows image, category, title, excerpt, read time
  - Excludes current post, only shows published posts
- **Blog Post PDF Export**: Added PDF button on blog posts for logged-in users only (opens print-friendly view)
- **Share Button Restriction**: Share dropdown now only visible to logged-in users
- **Blog Search**: Added search input field to BlogPage with real-time filtering by title and excerpt
- **Solutions Sidebar Navigation**: Redesigned SolutionsPage with left sidebar category navigation and expandable subcategories
- **SPA Routing Fix**: Changed preview script to use `serve dist -s -l 5000` for proper SPA fallback

### November 26, 2025
- **Rich Text Editor Migration to Tiptap**: Migrated from React Quill to Tiptap editor
  - Native drag-handle image resizing (no external plugins needed)
  - Drag & drop and paste image upload to Supabase
  - Full toolbar with headings, formatting, lists, alignment, links
  - Solves React Quill + Radix Dialog hook conflicts
  - Clean, modern React-first architecture
  - Used in AdminPage and BlogDashboardPage via shared RichTextEditor component
- **JWT Error Handling Fix**: Improved session cleanup in SupabaseAuthContext
  - signOut now always clears local state (user, session, profile) even if server logout fails
  - getProfile detects deleted profiles (PGRST116 error) and auto-signs out user
  - Fixes "User from sub claim in JWT does not exist" error after profile deletion
  - Requires Supabase Database Trigger for full auth.users cleanup (see docs below)
- **Forgot Password Feature**: Added password reset functionality
  - ForgotPasswordPage: Email input form that sends Supabase password reset link
  - ResetPasswordPage: New password form after clicking email link
  - LoginPage: Added "Forgot password?" link below password field
  - Uses Supabase's built-in resetPasswordForEmail and updateUser methods
- **Gamification System**: Complete ranking and achievement system
  - **Ranks**: New Member (0pts), Contributor (100pts), Health Hero (500pts), Vellio Ambassador (1000pts)
  - **Points System**: Blog post (+50), Comment (+10), Community post (+25), Daily login (+5 with streak bonus)
  - **Badges**: 11 unlockable achievements across categories (content, community, engagement, profile)
  - **Daily Login Streak**: Consecutive login rewards with multiplier bonus
  - **RankProgressCard**: Visual rank display with progress bar, streak tracking
  - **BadgeGrid**: Achievement showcase with earned/locked states
  - **Auto-award**: Points and badges awarded automatically on actions

### November 28, 2025
- **Code Splitting**: Implemented React.lazy() for all page routes with Suspense fallback
  - Each page loads as separate chunk (AdminPage 7.96 KB, ProfilePage 6.12 KB, etc.)
  - PageLoader spinner during lazy route loading
  - Faster initial page load
- **Project Cleanup & Optimization**:
  - Removed unused components: CallToAction.jsx, WelcomeMessage.jsx, HeroImage.jsx
  - Removed unused pages: ProductsPage.jsx, ProductDetailPage.jsx
  - Removed duplicate AuthContext.jsx (SupabaseAuthContext is used)
  - Removed React Quill CSS imports from BlogPostPage and StaticPage
  - Added legacy Quill CSS support in index.css for existing content
  - Uninstalled 11 unused npm packages (react-quill, quill plugins, tinymce, unused radix components)
  - Build size reduced by removing 29 packages
- **Advanced SEO Enhancements**:
  - Fixed index.html title from "Hostinger Horizons" to "Vellio Nation"
  - Changed lang attribute from Hungarian (hu) to English (en)
  - Updated all meta descriptions and OG tags to English
  - Added theme-color meta tag (#22c55e - primary green)
  - Added robots.txt with sitemap reference
  - Dynamic sitemap generation script (scripts/generate-sitemap.js) fetches blog posts and solutions from Supabase with lastmod dates
  - Added Open Graph and Twitter cards to all pages (HomePage, BlogPage, CommunityPage, SolutionsPage, BlogPostPage, SolutionDetailPage)
  - JSON-LD structured data: Organization, WebSite+SearchAction on HomePage; BlogPosting on BlogPostPage; Product on SolutionDetailPage
  - BreadcrumbList JSON-LD schema on BlogPostPage and SolutionDetailPage for navigation trails
  - Added canonical URLs to all pages
- **Image Optimization**:
  - Hero image preload with fetchpriority="high" in index.html
  - Added width/height attributes to hero image to prevent CLS
  - Preconnect to Supabase domain for faster API calls
  - Added `loading="lazy"` attribute to below-the-fold images
- **Bundle Optimization**:
  - Configured Vite manualChunks for optimal code splitting
  - Vendor chunks: vendor-react (162.90 KB), vendor-ui (132.31 KB), vendor-supabase (133.35 KB), vendor-tiptap (369.22 KB)
  - Improved caching efficiency for vendor libraries
  - Build process: generate-llms.js → generate-sitemap.js → vite build

### November 29, 2025
- **Accessibility Enhancements**:
  - Added aria-label to all icon-only buttons across Header, BlogPostPage, SolutionDetailPage, CommunityPage, CommunityComments
  - Added aria-expanded to mobile menu button
  - English language aria-labels for screen reader support (US audience)
- **Performance Optimization**:
  - Removed unused Google Fonts preconnect (using Tailwind system fonts)
  - Added DNS prefetch for Supabase domain
  - Added critical inline CSS for faster initial render
  - React.memo() applied to PageLoader and Footer components
  - Production build: 14.18s build time, optimized chunks
- **Site Image Management**:
  - Admin dashboard now includes "Home Page Images" section in Settings tab
  - Site logo, Hero image, and Community section image can be uploaded/changed via admin
  - Images stored in Supabase Storage (`site_images` bucket) with 1-year cache
  - Header dynamically loads logo from settings with fallback to default
  - HomePage dynamically loads hero/community images from settings with fallback defaults
  - Settings stored in `home_images` key with `{ logo: url, hero: url, community: url }` structure

## Supabase Database Setup

### Required Database Trigger for Account Deletion
When a user deletes their profile, this trigger automatically removes them from auth.users, allowing email reuse for re-registration:

```sql
-- Function to delete auth user when profile is deleted
CREATE OR REPLACE FUNCTION delete_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM auth.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
CREATE TRIGGER on_profile_deleted
  AFTER DELETE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION delete_auth_user();
```

### Required RLS Policy for Profile Deletion
```sql
CREATE POLICY "Users can delete own profile" 
ON profiles 
FOR DELETE 
TO authenticated 
USING (auth.uid() = id);
```

### Required Gamification Tables
```sql
-- Add streak and login tracking columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS max_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_date DATE;

-- Create user_badges table for tracking earned badges
CREATE TABLE IF NOT EXISTS user_badges (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id VARCHAR(50) NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS on user_badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own badges
CREATE POLICY "Users can view own badges" 
ON user_badges 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Policy for system to insert badges
CREATE POLICY "Users can earn badges" 
ON user_badges 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);
```