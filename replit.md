# Vellio Nation Blog

## Overview
Vellio Nation is a wellness-focused blog and community platform built with React, Vite, and Supabase. It aims to create a vibrant community by offering a comprehensive blogging system, interactive community features, a showcase for affiliate products and educational content, and robust user authentication. The platform is designed to provide valuable resources and foster engagement around wellness topics.

## User Preferences
I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the `plugins/` folder.
Do not make changes to the `tools/` folder.

## System Architecture
The application uses React 18.2 with Vite 4.5 for the frontend, and React Router DOM 6.16 for navigation. Styling is managed with Tailwind CSS 3.3, Tailwind Animate, and Framer Motion for animations. UI components leverage Radix UI and custom implementations. Supabase handles backend services, including authentication and database management. Tiptap is integrated for rich text editing, supporting native image resizing.

### UI/UX Decisions
- **Responsive Design**: Optimized for various devices, especially mobile, across all features including the admin dashboard, tab menus, dialog forms, and settings.
- **Theme Switching**: Supports both light and dark modes.
- **Header & Footer**: Ensures consistent navigation and branding.

### Technical Implementations
- **Core Features**: Includes user authentication, CRUD operations for blog posts and solutions, community comments, theme switching, an admin dashboard with role-based access, user profile management with avatar uploads, social media integration, and SEO-friendly pages using React Helmet.
- **Admin Dashboard**: Provides full CRUD capabilities for blog posts, solutions, and user management, featuring role-based access control and automatic rank assignment.
- **User Profiles**: Allows users to manage their information, upload avatars, and track gamified ranks and points.
- **Category System**: A hierarchical category system with `parent_id` for nested relationships, supporting `blog`, `community`, and `solutions` content types.
- **Data Persistence**: Critical handling of joined Supabase objects to prevent "unknown column" errors during insert/update operations.
- **Deployment**: Configured for SPA deployment using `serve dist -s -l 5000` for client-side routing.
- **Gamification**: Implements a comprehensive ranking system (New Member, Contributor, Health Hero, Vellio Ambassador) based on points earned through actions like posting, commenting, and daily logins, alongside unlockable badges and login streaks.
- **Advanced SEO**: Includes dynamic sitemap generation, Open Graph and Twitter card support, JSON-LD structured data (Organization, WebSite, BlogPosting, Product, BreadcrumbList), and canonical URLs.
- **Performance Optimization**: Features code splitting with `React.lazy()` and Suspense, image optimization (preload, lazy loading, width/height attributes), critical CSS inlining, and async main stylesheet loading to improve LCP and overall performance.
- **Accessibility**: Enhanced with `aria-label` attributes for icon-only buttons and improved screen reader support.
- **Site Image Management**: Admin dashboard allows uploading and managing site-wide images (logo, hero, community section) stored in Supabase Storage, with robust placeholder handling.
- **Dynamic Content Generation**: A build script generates `llms.txt` dynamically from Supabase content, including blog posts, solutions, and static page descriptions.

### Feature Specifications
- **Blog Management**: Comprehensive tools for creating, managing, and searching blog posts, with rich text, categorization, and SEO metadata.
- **Solutions Management**: CRUD for products, apps, and educational materials, including descriptions, affiliate links, ratings, and images, with category-based filtering.
- **User Management**: Tools to view users, update roles, and manage automatic rank assignments.
- **Settings Management**: Configuration for social media links, blog/community categories, and static page content.
- **Profile Picture Upload**: Secure avatar management via Supabase Storage.
- **Password Reset**: Implemented forgot password and reset password functionalities using Supabase's built-in methods.
- **Blog & Solutions Navigation**: Redesigned pages with left sidebar category navigation for improved content discovery.
- **Blog Post Features**: Includes "Latest Articles" recommendations, PDF export for logged-in users, and restricted share button visibility.
- **Rich Text Editor**: Utilizes Tiptap for robust content creation, offering image drag-handle resizing, drag & drop, and comprehensive formatting.
- **Blog Author Section**: Displays author profile pictures, names, and bios below blog posts.

## External Dependencies
- **Supabase**: Backend for authentication, database, and storage (avatars, post images, solution images, community images, site images). Requires specific public storage buckets.
- **React Router DOM**: Client-side routing.
- **Tailwind CSS**: Utility-first styling framework.
- **Framer Motion**: Animation library.
- **Radix UI**: Unstyled, accessible UI components.
- **Tiptap**: Rich text editor with `tiptap-extension-resize-image` for image resizing.