import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://www.vellionation.com';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rtklsdtadtqpgoibulux.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0a2xzZHRhZHRxcGdvaWJ1bHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzOTM0MTAsImV4cCI6MjA3Nzk2OTQxMH0.mLf0EfbHZc0ur069ihRwEIIVIMmvO0ogthymfKa0rHs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const staticPages = [
  { url: '/', changefreq: 'weekly', priority: '1.0' },
  { url: '/blog', changefreq: 'daily', priority: '0.9' },
  { url: '/community', changefreq: 'daily', priority: '0.8' },
  { url: '/solutions', changefreq: 'weekly', priority: '0.8' },
  { url: '/login', changefreq: 'monthly', priority: '0.3' },
  { url: '/register', changefreq: 'monthly', priority: '0.3' },
  { url: '/help-center', changefreq: 'monthly', priority: '0.4' },
  { url: '/privacy-policy', changefreq: 'monthly', priority: '0.3' },
  { url: '/terms-of-service', changefreq: 'monthly', priority: '0.3' },
];

function formatDate(date) {
  if (!date) return new Date().toISOString().split('T')[0];
  return new Date(date).toISOString().split('T')[0];
}

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function generateSitemap() {
  console.log('Generating dynamic sitemap...');
  
  let urls = [];

  for (const page of staticPages) {
    urls.push({
      loc: `${SITE_URL}${page.url}`,
      lastmod: formatDate(new Date()),
      changefreq: page.changefreq,
      priority: page.priority
    });
  }

  try {
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('slug, updated_at, created_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });

    if (postsError) {
      console.warn('Could not fetch posts:', postsError.message);
    } else if (posts && posts.length > 0) {
      console.log(`Found ${posts.length} published blog posts`);
      for (const post of posts) {
        urls.push({
          loc: `${SITE_URL}/blog/${escapeXml(post.slug)}`,
          lastmod: formatDate(post.updated_at || post.created_at),
          changefreq: 'weekly',
          priority: '0.7'
        });
      }
    }
  } catch (err) {
    console.warn('Error fetching posts:', err.message);
  }

  try {
    const { data: solutions, error: solutionsError } = await supabase
      .from('solutions')
      .select('id, updated_at, created_at')
      .eq('status', 'active')
      .order('updated_at', { ascending: false });

    if (solutionsError) {
      console.warn('Could not fetch solutions:', solutionsError.message);
    } else if (solutions && solutions.length > 0) {
      console.log(`Found ${solutions.length} active solutions`);
      for (const solution of solutions) {
        urls.push({
          loc: `${SITE_URL}/solutions/${solution.id}`,
          lastmod: formatDate(solution.updated_at || solution.created_at),
          changefreq: 'weekly',
          priority: '0.6'
        });
      }
    }
  } catch (err) {
    console.warn('Error fetching solutions:', err.message);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, sitemap, 'utf8');
  console.log(`Sitemap generated with ${urls.length} URLs at ${outputPath}`);
}

generateSitemap().catch(console.error);
