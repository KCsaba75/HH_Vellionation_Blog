# 🚀 Vellio Nation - Complete Supabase Setup Guide

This guide will walk you through recreating your Supabase backend from scratch. Follow each step carefully in order.

---

## 📋 Prerequisites

- A Supabase account (free tier is sufficient)
- Access to this Replit project
- 30 minutes of time

---

## Step 1: Create New Supabase Project

### 1.1 Go to Supabase Dashboard
1. Navigate to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Click **"New Project"** button

### 1.2 Configure Project Settings
1. **Organization**: Select your organization (or create one)
2. **Name**: Enter a project name (e.g., `vellio-nation` or `vellio-nation-dev`)
3. **Database Password**: Choose a **strong password** and **SAVE IT SOMEWHERE SAFE**
4. **Region**: Select the region closest to your users (e.g., `East US`, `West Europe`)
5. **Pricing Plan**: Free (or Pro if you prefer)
6. Click **"Create new project"**

⏳ **Wait 2-3 minutes** for Supabase to provision your database.

---

## Step 2: Enable Email Authentication

### 2.1 Navigate to Authentication Settings
1. In your Supabase project dashboard, click **"Authentication"** in the left sidebar
2. Click **"Providers"** tab
3. Find **"Email"** in the list

### 2.2 Enable Email Provider
1. Click on **"Email"**
2. Toggle **"Enable Email provider"** to ON
3. **Confirm email** setting:
   - For **development**: You can DISABLE "Confirm email" for easier testing
   - For **production**: Keep "Confirm email" ENABLED for security
4. Click **"Save"**

---

## Step 3: Create Storage Buckets (CRITICAL!)

You need to create **4 storage buckets** and set them all to **PUBLIC**.

### 3.1 Navigate to Storage
1. Click **"Storage"** in the left sidebar
2. Click **"New bucket"** button

### 3.2 Create Bucket: `avatars`
1. **Name**: `avatars`
2. **Public bucket**: ✅ **Toggle ON** (IMPORTANT!)
3. Click **"Create bucket"**

### 3.3 Create Bucket: `post_images`
1. Click **"New bucket"** again
2. **Name**: `post_images`
3. **Public bucket**: ✅ **Toggle ON**
4. Click **"Create bucket"**

### 3.4 Create Bucket: `solution_images`
1. Click **"New bucket"** again
2. **Name**: `solution_images`
3. **Public bucket**: ✅ **Toggle ON**
4. Click **"Create bucket"**

### 3.5 Create Bucket: `community_post_images`
1. Click **"New bucket"** again
2. **Name**: `community_post_images`
3. **Public bucket**: ✅ **Toggle ON**
4. Click **"Create bucket"**

### 3.6 Verify All Buckets Are Public
Go to each bucket and check that the **"Public"** badge is visible. If not:
1. Click on the bucket name
2. Go to **"Settings"**
3. Toggle **"Public bucket"** to ON
4. Click **"Save"**

✅ **You should now have 4 public buckets!**

---

## Step 4: Run SQL Migrations

Now we'll create all database tables, Row Level Security policies, and triggers.

### 4.1 Navigate to SQL Editor
1. Click **"SQL Editor"** in the left sidebar
2. Click **"New query"** button

### 4.2 Run Migration: `000_full_database_setup.sql`

1. **Open the file** `supabase_migrations/000_full_database_setup.sql` in this Replit project
2. **Copy the ENTIRE contents** of the file (Ctrl+A, Ctrl+C)
3. **Paste** into the Supabase SQL Editor
4. Click **"Run"** button (or press Ctrl+Enter)
5. ✅ **Wait for success message**: "Success. No rows returned"

**What this does:**
- Creates all 10 tables (profiles, posts, solutions, categories, comments, etc.)
- Enables Row Level Security (RLS) with proper access control
- Creates indexes for performance
- Sets up automatic profile creation when users sign up

### 4.3 Run Migration: `004_default_data.sql`

1. **Open the file** `supabase_migrations/004_default_data.sql` in this Replit project
2. **Copy the ENTIRE contents** of the file
3. **Paste** into the Supabase SQL Editor (clear the previous query first)
4. Click **"Run"** button
5. ✅ **Wait for success message**

**What this does:**
- Populates default settings (social links, page content)
- Creates default categories for Blog, Community, and Solutions
- Sets up initial data structure

### 4.4 Reload PostgREST Schema Cache (CRITICAL!)

1. In the SQL Editor, **clear the previous query**
2. **Paste this command**:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
3. Click **"Run"**
4. ✅ **You should see**: "Success. No rows returned"

**Why this is important:** This forces Supabase's PostgREST API to refresh its schema cache, making all foreign key relationships immediately available. Without this, you'll get PGRST204 errors!

---

## Step 5: Get Your API Credentials

### 5.1 Navigate to API Settings
1. Click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"** tab

### 5.2 Copy Your Credentials
You'll need two values:

1. **Project URL**
   - Find the section "Project URL"
   - Copy the URL (it looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **Save this** - you'll need it in the next step

2. **anon public key**
   - Scroll down to "Project API keys"
   - Find the **"anon public"** key
   - Click the **"Copy"** button
   - **Save this** - you'll need it in the next step

⚠️ **Security Note**: The `anon public` key is safe to use in your frontend code. DO NOT use the `service_role` key in your frontend!

---

## Step 6: Update Environment Variables in Replit

### 6.1 Open .env File
1. In this Replit project, find and open the **`.env`** file
2. If it doesn't exist, create it in the root directory

### 6.2 Add Your Supabase Credentials
Paste the following, replacing with your actual values:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDE1NTc2MDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Replace:**
- `https://xxxxxxxxxxxxx.supabase.co` with your **Project URL** from Step 5.2
- `eyJhbGci...` with your **anon public key** from Step 5.2

### 6.3 Save the File
1. Press **Ctrl+S** (or Cmd+S on Mac) to save
2. The environment variables will be automatically loaded by Vite

---

## Step 7: Restart Your Application

### 7.1 Restart the Workflow
1. Click the **"Stop"** button in Replit (if the server is running)
2. Click the **"Run"** button to restart
3. Wait for the dev server to start (you should see "VITE ready" in the console)

### 7.2 Open the App
1. Click the **webview/browser icon** in Replit to open your app
2. The app should now be connected to your new Supabase backend!

---

## Step 8: Create Your First Admin User

### 8.1 Register a New Account
1. In your app, click **"Sign Up"** or **"Register"**
2. Enter your **email** and **password**
3. Submit the form
4. If you disabled email confirmation in Step 2.2, you'll be logged in immediately
5. If email confirmation is enabled, check your email and click the confirmation link

### 8.2 Promote Yourself to Admin (via Supabase Dashboard)

Your account was created as a "member" by default. Let's promote it to admin:

1. Go back to your **Supabase Dashboard**
2. Click **"Table Editor"** in the left sidebar
3. Click on the **"profiles"** table
4. Find your user row (look for your email)
5. Click on the **"role"** cell for your user
6. Change it from `member` to `admin`
7. Click on the **"rank"** cell
8. Change it to `Vellio Ambassador`
9. Click **"Save"** or press Enter

### 8.3 Refresh Your App
1. Refresh your browser (F5 or Cmd+R)
2. You should now see the **"Admin"** link in your navigation menu!
3. Click **"Admin"** to access the Admin Dashboard

---

## Step 9: Verify Everything Works

### 9.1 Test Core Features

Try these actions to make sure everything is working:

✅ **User Profile**
- Click on your profile/avatar
- Try uploading a profile picture
- Update your name and bio
- Save changes

✅ **Blog Posts** (Admin Dashboard)
- Go to Admin → Blog Posts
- Click "Create Post"
- Fill in title, content, category
- Upload an image
- Save as draft or publish
- View the post on the blog page

✅ **Solutions** (Admin Dashboard)
- Go to Admin → Solutions
- Click "Create Solution"
- Fill in name, description, rating
- Try uploading an image ← **This should now work!**
- Save the solution

✅ **Categories** (Admin Dashboard)
- Go to Admin → Settings → Categories
- Create a new category or subcategory
- Verify it appears in the dropdowns

✅ **Community Posts**
- Go to Community page
- Create a new community post
- Try liking a post
- Try commenting on a post

---

## 🎉 Setup Complete!

Congratulations! Your Vellio Nation backend is fully set up and running!

---

## 📚 Next Steps

### Optional: Add More Categories
1. Go to **Admin Dashboard → Settings → Categories**
2. Add subcategories under your main categories
3. Example: Under "Nutrition", add "Healthy Recipes", "Meal Planning", etc.

### Optional: Customize Page Content
1. Go to **Admin Dashboard → Settings → Pages**
2. Edit the Help Center, Privacy Policy, and Terms of Service pages
3. Add your own content using the rich text editor

### Optional: Add Social Media Links
1. Go to **Admin Dashboard → Settings → Social Media**
2. Add your Facebook and Instagram URLs
3. They'll appear in the footer

---

## 🐛 Troubleshooting

### Problem: "Could not find the 'profiles' column" Error (PGRST204)

**Solution:**
1. Go to Supabase Dashboard → SQL Editor
2. Run this command:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
3. Refresh your app

### Problem: Images Won't Upload

**Solution:**
1. Check that all 4 storage buckets are set to **PUBLIC**
2. Go to Storage → Click each bucket → Settings → Make sure "Public bucket" is ON

### Problem: Can't Log In / Registration Fails

**Solution:**
1. Check that Email provider is enabled: Authentication → Providers → Email
2. Check your `.env` file has the correct Supabase URL and anon key
3. Restart your Replit app

### Problem: "relation 'profiles' does not exist"

**Solution:**
1. You forgot to run the SQL migrations!
2. Go back to **Step 4** and run `000_full_database_setup.sql`

### Problem: Admin Dashboard Not Accessible

**Solution:**
1. Make sure you promoted your user to `admin` role in the profiles table
2. Make sure you refreshed your app after changing the role

---

## 📖 Additional Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Replit Documentation**: https://docs.replit.com
- **Project Documentation**: See `replit.md` in this project

---

## 🆘 Need Help?

If you encounter issues not covered in this guide:
1. Check the **console logs** in your browser (F12 → Console)
2. Check the **Replit console** for server errors
3. Review the `replit.md` file for more technical details
4. Check the Supabase Dashboard → Logs for database errors

---

**Good luck, and enjoy building with Vellio Nation! 🌟**
