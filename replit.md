# Vellio Nation Blog

## Overview
Vellio Nation is a wellness-focused blog and community platform built with React, Vite, and Supabase. The application provides a comprehensive blogging system, community features, solutions showcase (affiliate products, apps, and educational materials), and user authentication.

## Tech Stack
- **Frontend**: React 18.2, Vite 4.5
- **Routing**: React Router DOM 6.16
- **Styling**: Tailwind CSS 3.3, Tailwind Animate, Framer Motion
- **UI Components**: Radix UI, custom components
- **Backend**: Supabase (authentication, database)
- **Rich Text Editor**: React Quill

## Project Structure
```
├── src/
│   ├── components/
│   │   ├── ui/          # UI components (buttons, dialogs, etc.)
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Layout.jsx
│   ├── contexts/        # React contexts (Auth, Theme)
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility libraries
│   ├── utils/           # Utility functions
│   ├── main.jsx         # App entry point
│   └── index.css        # Global styles
├── plugins/             # Vite plugins
│   ├── visual-editor/
│   ├── selection-mode/
│   └── utils/
├── tools/               # Build tools
├── index.html
├── vite.config.js
└── tailwind.config.js
```

## Environment Variables
The application uses the following environment variables (configured via Vite):

- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

See `.env.example` for template.

## Supabase Storage Configuration
The application requires the following Supabase Storage buckets to be created:

- **`avatars`**: For user profile pictures
- **`post_images`**: For blog post featured images
- **`solution_images`**: For solution images (products, apps, educational materials)
- **`community_post_images`**: For community post images

**Important**: Make sure these buckets are set to **public** in Supabase Storage settings to allow image access.

## Development Setup
1. Dependencies are automatically installed via npm
2. The dev server runs on port 5000 with host 0.0.0.0
3. Vite is configured to allow all hosts for proper Replit iframe integration

## Key Features
- User authentication with Supabase
- Blog post management with rich text editor
- Community comments and discussions
- Solutions showcase with affiliate links (products, apps, educational materials)
- Theme switching (light/dark mode)
- Admin dashboard for content management with full CRUD operations
- User profile management with avatar upload
- Social media integration
- SEO-friendly pages with React Helmet

## Admin Dashboard Features
The admin dashboard (`/admin`) provides comprehensive management capabilities for administrators:

### Blog Management
- **Create**: New blog posts with title, excerpt, content (rich text), category, and SEO metadata
- **Read**: View all blog posts with author information and status
- **Update**: Edit existing blog posts including content, status (draft/published), and images
- **Delete**: Remove blog posts with confirmation

### Solutions Management
- **Create**: New solutions (products, apps, educational materials) with name, description, affiliate URL, rating, and SEO metadata
- **Read**: View all solutions with their status
- **Update**: Edit solution details, status (active/inactive), and images
- **Delete**: Remove solutions with confirmation

### User Management
- **Read**: View all registered users with their roles and ranks
- **Update**: Change user roles (member, blogger, admin)
- **Automatic Rank Assignment**: 
  - When a user is promoted to **blogger**, their rank is automatically set to **"Health Hero"**
  - When a user is promoted to **admin**, their rank is automatically set to **"Vellio Ambassador"**
- Note: Admins cannot change their own role for security

### Settings Management
- Configure social media links (Facebook, Instagram)
- Manage blog categories (add, rename, delete)
- Manage community categories (add, rename, delete)
- Edit static page content (Help Center, Privacy Policy, Terms of Service)

## User Roles & Ranks

### Roles
- **Member**: Default role for new users, can read and comment on posts
- **Blogger**: Can create and publish blog posts (automatically receives "Health Hero" rank)
- **Admin**: Full access to admin dashboard and all features (automatically receives "Vellio Ambassador" rank)

### Ranks (Based on Points or Role)
The platform features a gamification system with ranks based on user activity points:

- **New Member** (0 points) - Default rank for new registered users
- **Contributor** (100 points) - Earned through active participation
- **Health Hero** (500 points OR blogger role) - Awarded to active contributors or bloggers
- **Vellio Ambassador** (1000 points OR admin role) - The highest rank for top contributors or admins

**Automatic Rank Updates**: When an admin promotes a user to blogger or admin role through the User Management panel, the system automatically assigns the corresponding rank (Health Hero for bloggers, Vellio Ambassador for admins).

## Workflow Configuration
- **dev-server**: Runs `npm run dev` on port 5000 (webview)

## Build Configuration
- Build command: `npm run build` (includes LLM generation step)
- Preview command: `npm run preview` (uses `serve dist -s -l 5000`)
- **Deployment**: Autoscale with `serve` package in SPA mode
- **SPA Routing**: The `-s` flag enables single page application fallback - all routes return `index.html` and React Router handles client-side routing (no 404 on page refresh)

## User Profile Features
Users can manage their profiles at `/profile`:

### Profile Information
- **View Profile**: Display name, bio, rank, points, and badges
- **Edit Profile**: Update name and bio information
- **Profile Picture**: Upload and update profile picture (avatar)
  - Supports all image formats (JPG, PNG, GIF, etc.)
  - Real-time preview after upload
  - Avatar displayed in header navigation and profile page

### Profile Picture Upload
- Click the camera icon when in edit mode to upload a new profile picture
- Images are stored securely in Supabase Storage (`avatars` bucket)
- Profile picture appears in:
  - Header navigation (desktop and mobile)
  - User dropdown menu
  - Profile page

### Gamification
- **Rank Progress**: Visual progress bar showing points toward next rank
- **Badges & Achievements**: Coming soon feature

## Category System Architecture (November 24, 2025)
The application uses a **hierarchical category system** with the `categories` table:

### Database Structure
- **categories table**: Stores all categories with optional `parent_id` for hierarchical relationships
  - Main categories: `parent_id = NULL`
  - Subcategories: `parent_id` references main category ID
  - Foreign key relationships:
    - `posts.category_id` → `categories.id` (main category)
    - `posts.subcategory_id` → `categories.id` (optional subcategory)
    - `solutions.category_id` → `categories.id` (main category)
    - `solutions.subcategory_id` → `categories.id` (optional subcategory)
    - `community_posts.category_id` → `categories.id`
    - `community_posts.subcategory_id` → `categories.id`

### Components
- **CategorySelector**: Dropdown component for selecting main category + optional subcategory in forms
- **HierarchicalCategoryManager**: Admin UI component for managing categories (create, edit, delete, reorder)

### Critical Implementation Detail
⚠️ **Always destructure joined objects before Supabase insert/update**:
```javascript
const { categories, profiles, ...cleanData } = editingItem;
await supabase.from('table').insert(cleanData); // Only send column data
```
This prevents "unknown column" errors when form state contains joined relational data.

## Recent Updates

### November 24, 2025 - Mobile Responsiveness, Category System & Bug Fixes
**Bug Fixes:**
- Fixed blog/solution update error: Added `subcategories` to destructuring in handleFormSubmit
  - Error: "Could not find the 'subcategories' column of 'posts' in the schema cache"
  - Root cause: Joined `subcategories` object wasn't stripped before Supabase update
  - Solution: `const { categories, subcategories, profiles, ...cleanedData } = editingItem;`
- **SETUP_GUIDE.md Updated**: Fixed incomplete and incorrect database schema
  - **Added `type` field** to categories table with CHECK constraint ('blog', 'community', 'solutions')
  - **Added `position` field** to categories table (renamed from display_order for consistency)
  - **Fixed `community_posts.title`** to be nullable (UI doesn't provide this field)
  - **Added missing tables**: `community_post_likes`, `community_comments`
  - **Fixed profiles trigger**: Removed reference to non-existent `email` column
  - **Updated default categories** with proper type values for blog/community/solutions

**Mobile Responsiveness Improvements:**
- **Admin Dashboard Mobile Optimization:**
  - Converted all tables (Blog Posts, Solutions, Users) to responsive card layouts on mobile devices
  - Desktop: Traditional table view (md and above)
  - Mobile: Card-based layout with all information and actions
  - Improved touch targets with larger padding (p-2.5 vs p-2)
  - Responsive typography (text-sm, text-xs)
- **Tab Menu Optimization:**
  - Fixed tab menu overlap on mobile by changing TabsTrigger base component from `inline-flex` to `flex`
  - Responsive grid layout: 2 columns (mobile) → 3 columns (tablet) → 5 columns (desktop)
  - Tab text scales: text-xs on mobile, text-sm on larger screens
  - Settings tab centers with col-span-2 on mobile
  - All tabs respect grid boundaries with w-full + truncate
- **Dialog Forms Mobile Optimization:**
  - Forms now use 95% viewport width on mobile (max-w-[95vw])
  - Responsive padding and spacing (p-4 sm:p-6)
  - All form fields optimized for mobile with text-sm labels and inputs
  - Buttons stack vertically on mobile (flex-col sm:flex-row)
  - Upload buttons condensed ("Upload"/"Change" instead of full text)
- **Settings Tab Optimization:**
  - Responsive padding and spacing throughout (p-4 sm:p-6, gap-4 sm:gap-8)
  - Form inputs with proper touch targets (p-2.5, text-sm)
  - ReactQuill editors optimized for mobile ([&_.ql-toolbar]:text-xs)
- **Header & Button Improvements:**
  - Headers flex-wrap on small screens
  - Create buttons show condensed text on mobile ("New" vs "Create Post")
  - All action buttons sized appropriately for mobile touch
- Architect reviewed: PASS (4 review cycles) - fully mobile responsive

### November 24, 2025 - Category System Migration & Subcategory Display
- Migrated from settings table JSON arrays to hierarchical categories table with foreign keys
- Created CategorySelector component for hierarchical category/subcategory selection
- Updated all pages to use category_id/subcategory_id instead of text-based category field:
  - AdminPage: Blog and Solutions forms use CategorySelector, tables display category + subcategory
  - BlogDashboardPage: Post creation form uses CategorySelector, table displays category + subcategory
  - CommunityPage: Category filtering uses categories table, posts display category + subcategory
  - BlogPage, BlogPostPage: Display category names from joined categories table with subcategory support
- Updated Settings tab to use HierarchicalCategoryManager for category management
- Fixed critical CRUD bug: Strip joined objects (categories, profiles) before Supabase persistence
- **Subcategory Visibility Fix**: Updated all queries to join subcategory_id with alias pattern:
  - `categories!...category_id_fkey(name), subcategories:categories!...subcategory_id_fkey(name)`
  - Display pattern: "Category → Subcategory" (subcategory only shown if exists)
  - Applied to: BlogPage, BlogPostPage, BlogDashboardPage, AdminPage (posts & solutions), CommunityPage
- **CategorySelector UUID Bug Fix**: Removed parseInt() conversion that was blocking category selection
  - Category IDs are UUIDs (not integers), parseInt was converting them to NaN/null
  - Now properly preserves UUID strings for Supabase foreign key relationships
  - Added user-friendly warning message when categories cannot be loaded
- All changes reviewed and approved by architect (3 review cycles, all PASS)

### November 13, 2025 - Initial Setup
- Organized project files into proper directory structure
- Fixed Supabase configuration to use environment variables with fallbacks
- Updated Vite configuration for Replit environment (port 5000, 0.0.0.0 host)
- Fixed DOM property warnings (class → className in JSX)
- Created proper .gitignore for Node.js/React projects
- Set up workflow for development server with webview output
- Added full CRUD functionality to Admin Dashboard for blog posts and solutions
- Fixed Supabase relationship query errors in AdminPage
- Enhanced admin forms with comprehensive field coverage (excerpt, SEO, affiliate URLs, ratings)
- Implemented automatic rank assignment: Admin → "Vellio Ambassador", Blogger → "Health Hero"
- Added profile picture upload functionality with Supabase Storage integration
- Updated Header component to display user avatars in navigation
