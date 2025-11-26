
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import BlogPage from '@/pages/BlogPage';
import BlogPostPage from '@/pages/BlogPostPage';
import CommunityPage from '@/pages/CommunityPage';
import SolutionsPage from '@/pages/SolutionsPage';
import SolutionDetailPage from '@/pages/SolutionDetailPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminPage from '@/pages/AdminPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { Toaster } from '@/components/ui/toaster';
import BlogDashboardPage from '@/pages/BlogDashboardPage';
import StaticPage from '@/pages/StaticPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Helmet>
          <title>Vellio Nation - Your Health & Wellness Community</title>
          <meta name="description" content="Join Vellio Nation - a modern wellness community focused on healthy living, weight loss, and mindful lifestyle transformation." />
        </Helmet>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:slug" element={<BlogPostPage />} />
            <Route path="community" element={<CommunityPage />} />
            <Route path="solutions" element={<SolutionsPage />} />
            <Route path="solutions/:id" element={<SolutionDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="dashboard/write" element={<BlogDashboardPage />} />
            <Route path="help-center" element={<StaticPage pageKey="page_content_help" />} />
            <Route path="privacy-policy" element={<StaticPage pageKey="page_content_privacy" />} />
            <Route path="terms-of-service" element={<StaticPage pageKey="page_content_terms" />} />
          </Route>
        </Routes>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
