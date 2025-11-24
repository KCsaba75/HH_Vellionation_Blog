# Vellio Nation Blog

## Overview
Vellio Nation is a wellness-focused blog and community platform designed to provide a comprehensive blogging system, community features, and a solutions showcase for affiliate products, apps, and educational materials. It includes robust user authentication and content management capabilities. The project aims to foster a vibrant community around wellness topics and offer curated resources.

## User Preferences
The user prefers iterative development and clear communication. They expect the agent to ask for confirmation before making major changes and to provide detailed explanations for complex implementations. The user also prefers simple language and a functional programming style where appropriate.

## System Architecture
The application is built with a modern web stack: React 18.2 with Vite for the frontend, styled using Tailwind CSS, Tailwind Animate, and Framer Motion. UI components leverage Radix UI alongside custom components. Supabase serves as the backend for authentication, database management, and storage. React Quill is integrated for rich text editing.

### Key Features
- **User Authentication**: Handled by Supabase.
- **Content Management**: Full CRUD operations for blog posts and solutions, managed via an admin dashboard.
- **Community Features**: Comments and discussions.
- **Solutions Showcase**: Integrates affiliate links for products, apps, and educational materials.
- **Theming**: Supports light/dark mode switching.
- **User Profiles**: Management includes avatar uploads.
- **SEO**: Pages are SEO-friendly using React Helmet.
- **Gamification**: Features user roles, ranks (Member, Blogger, Admin), and a point-based system for rank progression (New Member, Contributor, Health Hero, Vellio Ambassador). Ranks are automatically assigned based on role changes.
- **Hierarchical Category Management**: Supports main categories and subcategories for blog posts, community content, and solutions.

### Design Patterns & Technical Implementations
- **Modular Project Structure**: Organized into `components`, `contexts`, `pages`, `hooks`, `lib`, and `utils` for maintainability.
- **Database Schema**: Utilizes a comprehensive Supabase schema with RLS, indexes, and triggers, managed via SQL migrations. Foreign key constraints are carefully handled to ensure data integrity and performance.
- **Environment Configuration**: Uses Vite's environment variables for Supabase credentials.
- **Image Storage**: Managed through Supabase Storage buckets for avatars, post images, solution images, and community post images, all configured as public.
- **PostgREST Query Handling**: Emphasizes column-based foreign key hints (`!column_name`) in Supabase queries over constraint name references to ensure resilience against schema cache issues.

## External Dependencies
- **Supabase**: Backend services for authentication, PostgreSQL database, and object storage.
- **React Router DOM**: Client-side routing.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Framer Motion**: Animation library.
- **Radix UI**: Unstyled, accessible UI components.
- **React Quill**: Rich text editor component.