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
- Admin dashboard for content management
- Social media integration
- SEO-friendly pages with React Helmet

## Workflow Configuration
- **dev-server**: Runs `npm run dev` on port 5000 (webview)

## Build Configuration
- Build command: `npm run build` (includes LLM generation step)
- Preview command: `npm run preview`

## Recent Setup (November 13, 2025)
- Organized project files into proper directory structure
- Fixed Supabase configuration to use environment variables with fallbacks
- Updated Vite configuration for Replit environment (port 5000, 0.0.0.0 host)
- Fixed DOM property warnings (class → className in JSX)
- Created proper .gitignore for Node.js/React projects
- Set up workflow for development server with webview output
