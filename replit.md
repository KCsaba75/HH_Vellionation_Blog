# Vellio Nation Blog

## Overview
Vellio Nation is a wellness-focused blog and community platform built with React, Vite, and Supabase. It aims to create a vibrant community by offering a comprehensive blogging system, interactive community features, a showcase for affiliate products and educational content, and robust user authentication. The platform is designed to provide valuable resources and foster engagement around wellness topics.

## User Preferences
I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
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
- **Performance Optimization**: Features code splitting with `React.lazy()` and Suspense, image optimization (preload, lazy loading, width/height attributes), async main stylesheet loading to improve LCP and overall performance.
- **WebP Image Conversion**: All image uploads (blog posts, solutions, avatars, community posts, site images) are automatically converted to WebP format client-side before uploading to Supabase Storage. This reduces file sizes by 15-26% and improves page load speed. Utility functions in `src/lib/imageUtils.js` handle conversion with configurable quality and max dimensions.
- **Accessibility**: Enhanced with `aria-label` attributes for icon-only buttons, improved screen reader support, and All in One Accessibility widget (23 free features, 140 languages, delayed load for performance) for WCAG/ADA compliance.
- **Blog Disclaimer**: Admin-configurable FTC compliance disclaimer (rich text) displayed at the bottom of all blog posts. Managed via Settings in Admin Dashboard.
- **Cookie Consent System**: GDPR-compliant cookie consent popup on first visit. Saves user preferences (theme, affiliate disclosure acknowledgment). Guests can read 1 article per day; cookie resets at midnight. Uses `CookieConsentContext` for state management.
- **Article Reading Limit**: Guests limited to 1 article per day. After reading, content is blurred with prompt to register/login. Limit resets at midnight (cookie-based). Logged-in users have unlimited access. Includes midnight timer and visibility change detection for accurate state sync.
- **Site Image Management**: Admin dashboard allows uploading and managing site-wide images (logo, hero, community section) stored in Supabase Storage, with robust placeholder handling.
- **Dynamic Content Generation**: Build scripts generate `llms.txt` and `sitemap.xml` from Supabase content. SEO files are also regenerated automatically when posts/solutions are created, updated, or deleted via `regenerateSeoFiles()` function.

### Feature Specifications
- **Blog Management**: Comprehensive tools for creating, managing, and searching blog posts, with rich text, categorization, and SEO metadata.
- **Solutions Management**: CRUD for products, apps, and educational materials, including descriptions, affiliate links, ratings, and images, with category-based filtering.
- **User Management**: Tools to view users, update roles, and manage automatic rank assignments.
- **Settings Management**: Configuration for social media links, blog/community categories, static page content, and analytics tracking codes.
- **Analytics & Tracking**: Admin-configurable Google Analytics (GA4) and Facebook Pixel integration. Tracking IDs are stored in Supabase settings and injected into all pages via TrackingScripts component. Only valid tracking IDs are accepted (regex validation) to prevent XSS attacks.
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