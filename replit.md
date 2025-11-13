# Vellio Nation Blog

## Overview
Vellio Nation is a wellness-focused blog and community platform built with React, Vite, and Supabase. The application provides a comprehensive blogging system, community features, product showcase, and user authentication.

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
- **`product_images`**: For product images
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
- Product showcase with affiliate links
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

### Product Management
- **Create**: New products with name, description, affiliate URL, rating, and SEO metadata
- **Read**: View all products with their status
- **Update**: Edit product details, status (active/inactive), and images
- **Delete**: Remove products with confirmation

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
- Preview command: `npm run preview`

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

## Recent Setup (November 13, 2025)
- Organized project files into proper directory structure
- Fixed Supabase configuration to use environment variables with fallbacks
- Updated Vite configuration for Replit environment (port 5000, 0.0.0.0 host)
- Fixed DOM property warnings (class → className in JSX)
- Created proper .gitignore for Node.js/React projects
- Set up workflow for development server with webview output
- Added full CRUD functionality to Admin Dashboard for blog posts and products
- Fixed Supabase relationship query errors in AdminPage
- Enhanced admin forms with comprehensive field coverage (excerpt, SEO, affiliate URLs, ratings)
- Implemented automatic rank assignment: Admin → "Vellio Ambassador", Blogger → "Health Hero"
- Added profile picture upload functionality with Supabase Storage integration
- Updated Header component to display user avatars in navigation
