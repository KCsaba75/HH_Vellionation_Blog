# Vellio Nation - Setup Guide

This guide will help you set up the Vellio Nation wellness platform from scratch.

## Prerequisites

- A Replit account (you're already here!)
- A free Supabase account ([signup here](https://supabase.com))

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in the details:
   - **Project name**: `vellio-nation` (or any name you prefer)
   - **Database password**: Create a strong password and save it securely
   - **Region**: Choose the closest region to your users
4. Click **"Create new project"** and wait for setup to complete (~2 minutes)

---

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, click the **Settings** icon (⚙️) in the left sidebar
2. Click **"API"** in the settings menu
3. You'll see two important values:
   - **Project URL**: Looks like `https://xxxxx.supabase.co`
   - **anon/public key**: A long string starting with `eyJ...`
4. Keep this page open - you'll need these values in the next step

---

## Step 3: Configure Environment Variables in Replit

1. In Replit, open the **Secrets** tab (🔒 icon in the left sidebar, or Tools → Secrets)
2. Add the following secrets:

   **Secret 1:**
   - Key: `VITE_SUPABASE_URL`
   - Value: Paste your Supabase Project URL (from Step 2)

   **Secret 2:**
   - Key: `VITE_SUPABASE_ANON_KEY`
   - Value: Paste your Supabase anon/public key (from Step 2)

3. Click **"Add Secret"** for each one

---

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Copy and paste the full database schema from `supabase_migrations/000_full_database_setup.sql`
   - If this file doesn't exist, you'll need to create the tables manually (see Database Schema section below)
4. Click **"Run"** to execute the SQL
5. You should see a success message

### If you don't have the migration file, create these tables manually:

Run each SQL block separately in the Supabase SQL Editor:

#### 1. Create profiles table with triggers
```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  bio TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'blogger', 'admin')),
  rank TEXT DEFAULT 'New Member',
  points INT DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.email, 'member');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

#### 2. Create categories table
```sql
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id INT REFERENCES categories(id) ON DELETE CASCADE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
```

#### 3. Create posts table
```sql
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id INT REFERENCES categories(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  read_time TEXT,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_category_id ON posts(category_id);
CREATE INDEX idx_posts_status ON posts(status);
```

#### 4. Create solutions table
```sql
CREATE TABLE IF NOT EXISTS solutions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  affiliate_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id INT REFERENCES categories(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_solutions_slug ON solutions(slug);
CREATE INDEX idx_solutions_category_id ON solutions(category_id);
CREATE INDEX idx_solutions_status ON solutions(status);
```

#### 5. Create community_posts table
```sql
CREATE TABLE IF NOT EXISTS community_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id INT REFERENCES categories(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_category_id ON community_posts(category_id);
```

#### 6. Create comments table
```sql
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  post_id INT REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
```

#### 7. Create post_likes table
```sql
CREATE TABLE IF NOT EXISTS post_likes (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);
```

#### 8. Create settings table
```sql
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 9. Insert default categories
```sql
INSERT INTO categories (name, slug, parent_id, display_order) VALUES
  ('Weightloss', 'weightloss', NULL, 1),
  ('Mental Health', 'mental-health', NULL, 2),
  ('Fitness', 'fitness', NULL, 3),
  ('Nutrition', 'nutrition', NULL, 4)
ON CONFLICT (slug) DO NOTHING;
```

#### 10. Insert default settings
```sql
INSERT INTO settings (key, value) VALUES
  ('facebook_url', 'https://facebook.com/vellionation'),
  ('instagram_url', 'https://instagram.com/vellionation'),
  ('help_center_content', '<h1>How can we help you?</h1><p>Welcome to the Vellio Nation Help Center.</p>'),
  ('privacy_policy_content', '<h1>Privacy Policy</h1><p>Your privacy is important to us.</p>'),
  ('terms_content', '<h1>Terms of Service</h1><p>Please read these terms carefully.</p>')
ON CONFLICT (key) DO NOTHING;
```

#### 11. Reload the schema
```sql
NOTIFY pgrst, 'reload schema';
```

---

## Step 5: Set Up Storage Buckets

The app needs 4 public storage buckets for images:

1. In Supabase dashboard, click **"Storage"** in the left sidebar
2. Click **"Create a new bucket"** and create each of these buckets:
   - `avatars` (for user profile pictures)
   - `post_images` (for blog post featured images)
   - `solution_images` (for solution/product images)
   - `community_post_images` (for community post images)

3. **Make all buckets PUBLIC**:
   - Click on each bucket
   - Click the **"Settings"** tab
   - Toggle **"Public bucket"** to ON
   - Click **"Save"**

---

## Step 6: Create Your First Admin User

1. In Supabase dashboard, click **"Authentication"** → **"Users"**
2. Click **"Add user"** → **"Create new user"**
3. Enter:
   - **Email**: Your email address
   - **Password**: Create a strong password
   - **Auto Confirm User**: Toggle ON
4. Click **"Create user"**
5. After the user is created, go to **"Table Editor"** → **"profiles"**
6. Find your user's profile row
7. Edit the **role** field and change it from `member` to `admin`
8. Edit the **rank** field and change it to `Vellio Ambassador`
9. Click **"Save"**

---

## Step 7: Test Your Setup

1. Restart the Replit app (if it's not already running)
2. Visit your app's preview URL
3. Click **"Sign In"** and log in with your admin credentials
4. Navigate to `/admin` - you should see the Admin Dashboard
5. Try creating a blog post with a category
6. Check that everything works!

---

## Troubleshooting

### "Failed to fetch" or connection errors
- Double-check your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Replit Secrets
- Make sure the Supabase project is not paused (free tier pauses after inactivity)

### "relation does not exist" errors
- Re-run all the SQL migrations in the SQL Editor
- Run `NOTIFY pgrst, 'reload schema';` in SQL Editor

### Images not loading
- Verify all storage buckets are set to **PUBLIC**
- Check bucket names match exactly: `avatars`, `post_images`, `solution_images`, `community_post_images`

### Can't access admin dashboard
- Make sure you changed your user's role to `admin` in the profiles table
- Try logging out and back in

---

## Next Steps

Once everything is working:
- Create blog posts and categorize them
- Add solutions (affiliate products, apps, educational materials)
- Customize social media links in Settings
- Manage categories with the hierarchical category manager
- Invite users to join your wellness community!

---

## Need Help?

If you encounter any issues during setup, please check:
1. Supabase project dashboard for error logs
2. Browser console for JavaScript errors
3. The `replit.md` file for architecture details

Happy building! 🌱
