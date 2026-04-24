# Vellio Nation Blog

## Overview
Vellio Nation is a wellness-focused blog and community platform built with React, Vite, and Supabase. It aims to foster a vibrant community by offering a comprehensive blogging system, interactive community features, a showcase for affiliate products and educational content, and robust user authentication. The platform is designed to provide valuable resources and encourage engagement around wellness topics, with a vision to become a leading online destination for wellness enthusiasts.

## User Preferences
I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the `tools/` folder.

## System Architecture
The application uses React 18.2 with Vite 4.5 for the frontend, and React Router DOM 6.16 for navigation. Styling is managed with Tailwind CSS 3.3, Tailwind Animate, and Framer Motion for animations. UI components leverage Radix UI and custom implementations. Supabase handles backend services, including authentication and database management. Tiptap is integrated for rich text editing, supporting native image resizing.

### UI/UX Decisions
- **Responsive Design**: Optimized for various devices, including mobile, across all features.
- **Theme Switching**: Supports both light and dark modes.
- **Header & Footer**: Ensures consistent navigation and branding.

### Technical Implementations
- **Core Features**: Includes user authentication, CRUD operations for blog posts and solutions, community comments, theme switching, an admin dashboard with role-based access, user profile management with avatar uploads, social media integration, and SEO-friendly pages using React Helmet.
- **Admin Dashboard**: Provides full CRUD capabilities for blog posts, solutions, and user management, featuring role-based access control and automatic rank assignment.
- **User Profiles**: Allows users to manage information, upload avatars, and track gamified ranks and points.
- **Category System**: A hierarchical category system for organizing `blog`, `community`, and `solutions` content.
- **Data Persistence**: Critical handling of joined Supabase objects to prevent "unknown column" errors.
- **SPA Pre-rendering for SEO**: Implements build-time pre-rendering for public routes using `scripts/prerender.js` to generate static HTML files with injected SEO metadata, ensuring content is crawlable without JavaScript execution.
- **Gamification**: Implements a comprehensive ranking system based on points earned through user actions, alongside unlockable badges and login streaks.
- **Advanced SEO**: Includes dynamic sitemap generation, Open Graph and Twitter card support, JSON-LD structured data, and canonical URLs.
- **Performance Optimization**: Features code splitting, image optimization (WebP conversion, lazy loading), and async main stylesheet loading to improve LCP and overall performance. Font loading is optimized to prevent CLS.
- **Accessibility**: Enhanced with `aria-label` attributes, improved screen reader support, and an All in One Accessibility widget for WCAG/ADA compliance.
- **Blog Disclaimer**: Admin-configurable FTC compliance disclaimer displayed on all blog posts.
- **Cookie Consent System**: GDPR-compliant cookie consent popup, managing user preferences and article reading limits for guests.
- **Article Reading Limit**: Guests are limited to 1 article per day, with content blurred and a registration prompt after the limit is reached.
- **Site Image Management**: Admin dashboard allows uploading and managing site-wide images.
- **Dynamic Content Generation**: `sitemap.xml` and `llms.txt` are dynamically generated at build-time and can be regenerated at runtime via admin actions, with redirects to Supabase Storage copies.
- **Founding Member Feature**: The first 200 registered users automatically receive "Founding Member" status.
- **English-Only UI Policy**: The site targets a US, English-speaking audience and the codebase has NO i18n framework — every visible UI string must be in English. No `t()` / `i18next` setup exists. If an admin user's profile name (stored in `profiles.name`) contains non-English text, it will surface anywhere their name is rendered (Header user dropdown when they are logged in, post author byline if they author posts, comment author when they comment, Admin Users tab listing). Profile names are user-editable on the `/profile` page; the codebase does not auto-correct or translate them.
- **Email Notifications System**: Supports opt-in email notifications for new blog posts (via Supabase Edge Function and Resend API) and a newsletter (via Supabase table).

### Feature Specifications
- **Blog Management**: Tools for creating, managing, and searching blog posts, with rich text, categorization, and SEO metadata.
- **Solutions Management**: CRUD for products, apps, and educational materials, including descriptions, affiliate links, ratings, and images.
- **User Management**: Tools to view users, update roles, and manage automatic rank assignments.
- **Settings Management**: Configuration for social media links, blog/community categories, static page content, and analytics tracking codes.
- **Analytics & Tracking**: Admin-configurable Google Analytics (GA4) and Facebook Pixel integration.
- **Profile Picture Upload**: Secure avatar management.
- **Password Reset**: Implemented forgot password and reset password functionalities.
- **Blog & Solutions Navigation**: Redesigned pages with left sidebar category navigation for improved content discovery.
- **Blog Post Features**: Includes "Latest Articles" recommendations, PDF export for logged-in users, and restricted share button visibility.
- **Rich Text Editor**: Utilizes Tiptap for robust content creation, offering image drag-handle resizing, drag & drop, and comprehensive formatting.
- **Blog Author Section**: Displays author profile pictures, names, and bios below blog posts.
- **Article Read Tracking**: Logs logged-in users' article reads for gamification and marketing segmentation.

## External Dependencies
- **Supabase**: Backend for authentication, database, and storage.
- **React Router DOM**: Client-side routing.
- **Tailwind CSS**: Utility-first styling framework.
- **Framer Motion**: Animation library.
- **Radix UI**: Unstyled, accessible UI components.
- **Tiptap**: Rich text editor with `tiptap-extension-resize-image` for image resizing.