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
The application is built with React 18.2 and Vite 4.5 for the frontend, utilizing React Router DOM 6.16 for navigation. Styling is handled with Tailwind CSS 3.3, Tailwind Animate, and Framer Motion for animations. UI components are built using Radix UI alongside custom components. Supabase serves as the backend for authentication and database management, while React Quill is integrated for rich text editing.

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
- **React Quill**: For rich text editing capabilities.

## Recent Updates

### November 25, 2025
- **Blog Post PDF Export**: Added PDF button on blog posts for logged-in users only (opens print-friendly view)
- **Share Button Restriction**: Share dropdown now only visible to logged-in users
- **Blog Search**: Added search input field to BlogPage with real-time filtering by title and excerpt
- **Solutions Sidebar Navigation**: Redesigned SolutionsPage with left sidebar category navigation and expandable subcategories
- **SPA Routing Fix**: Changed preview script to use `serve dist -s -l 5000` for proper SPA fallback