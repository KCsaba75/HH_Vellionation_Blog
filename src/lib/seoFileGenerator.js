import { supabase } from './customSupabaseClient';

const SITE_URL = 'https://www.vellionation.com';

const staticPages = [
  { url: '/', title: 'Vellio Nation - Your Health & Wellness Community', description: 'Join Vellio Nation and embark on your wellness journey. Get inspired, connect with our community, and achieve your health goals.' },
  { url: '/blog', title: 'Blog - Vellio Nation', description: 'Explore wellness articles, health tips, and lifestyle advice from our community of experts.' },
  { url: '/community', title: 'Community - Vellio Nation', description: 'Connect with like-minded individuals on their wellness journey. Share experiences and support each other.' },
  { url: '/solutions', title: 'Solutions - Vellio Nation', description: 'Discover wellness products, apps, and educational resources to support your healthy lifestyle.' },
  { url: '/login', title: 'Login - Vellio Nation', description: 'Login to your Vellio Nation account.' },
  { url: '/register', title: 'Join Vellio Nation', description: 'Create your Vellio Nation account and start your wellness journey today.' },
  { url: '/forgot-password', title: 'Forgot Password - Vellio Nation', description: 'Reset your Vellio Nation password.' },
  { url: '/help-center', title: 'Help Center - Vellio Nation', description: 'Find answers to common questions and get support.' },
  { url: '/privacy-policy', title: 'Privacy Policy - Vellio Nation', description: 'Learn how we protect your data and privacy.' },
  { url: '/terms-of-service', title: 'Terms of Service - Vellio Nation', description: 'Read our terms and conditions for using Vellio Nation.' },
];

function truncateText(text, maxLength = 150) {
  if (!text) return '';
  const cleaned = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength).trim() + '...';
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

function formatDate(date) {
  if (!date) return new Date().toISOString().split('T')[0];
  return new Date(date).toISOString().split('T')[0];
}

export async function generateLlmsTxt() {
  let entries = [];

  entries.push('# Vellio Nation');
  entries.push('');
  entries.push('> A wellness community platform dedicated to healthy living, mindful choices, and sustainable transformation.');
  entries.push('');
  entries.push('## Static Pages');

  for (const page of staticPages) {
    entries.push(`- [${page.title}](${SITE_URL}${page.url}): ${page.description}`);
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('title, slug, excerpt, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (posts && posts.length > 0) {
    entries.push('');
    entries.push('## Blog Posts');
    
    for (const post of posts) {
      const description = truncateText(post.excerpt) || 'Read this wellness article on Vellio Nation.';
      entries.push(`- [${post.title}](${SITE_URL}/blog/${post.slug}): ${description}`);
    }
  }

  const { data: solutions } = await supabase
    .from('solutions')
    .select('id, name, description')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (solutions && solutions.length > 0) {
    entries.push('');
    entries.push('## Solutions');
    
    for (const solution of solutions) {
      const description = truncateText(solution.description) || 'Discover this wellness solution on Vellio Nation.';
      entries.push(`- [${solution.name}](${SITE_URL}/solutions/${solution.id}): ${description}`);
    }
  }

  entries.push('');
  entries.push('---');
  entries.push(`Generated: ${new Date().toISOString().split('T')[0]}`);

  return entries.join('\n');
}

export async function generateSitemapXml() {
  let urls = [];

  for (const page of staticPages) {
    urls.push({
      loc: `${SITE_URL}${page.url}`,
      lastmod: formatDate(new Date()),
      changefreq: page.url === '/' ? 'weekly' : 'monthly',
      priority: page.url === '/' ? '1.0' : '0.5'
    });
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at, created_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false });

  if (posts && posts.length > 0) {
    for (const post of posts) {
      urls.push({
        loc: `${SITE_URL}/blog/${escapeXml(post.slug)}`,
        lastmod: formatDate(post.updated_at || post.created_at),
        changefreq: 'weekly',
        priority: '0.7'
      });
    }
  }

  const { data: solutions } = await supabase
    .from('solutions')
    .select('id, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (solutions && solutions.length > 0) {
    for (const solution of solutions) {
      urls.push({
        loc: `${SITE_URL}/solutions/${solution.id}`,
        lastmod: formatDate(solution.created_at),
        changefreq: 'weekly',
        priority: '0.6'
      });
    }
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

  return sitemap;
}

export async function uploadSeoFilesToStorage() {
  try {
    const llmsTxt = await generateLlmsTxt();
    const sitemapXml = await generateSitemapXml();

    const llmsBlob = new Blob([llmsTxt], { type: 'text/plain' });
    const sitemapBlob = new Blob([sitemapXml], { type: 'application/xml' });

    const { error: llmsError } = await supabase.storage
      .from('seo-files')
      .upload('llms.txt', llmsBlob, { upsert: true, contentType: 'text/plain' });

    if (llmsError && !llmsError.message.includes('already exists')) {
      console.error('Error uploading llms.txt:', llmsError);
    }

    const { error: sitemapError } = await supabase.storage
      .from('seo-files')
      .upload('sitemap.xml', sitemapBlob, { upsert: true, contentType: 'application/xml' });

    if (sitemapError && !sitemapError.message.includes('already exists')) {
      console.error('Error uploading sitemap.xml:', sitemapError);
    }

    console.log('SEO files regenerated successfully');
    return true;
  } catch (error) {
    console.error('Error regenerating SEO files:', error);
    return false;
  }
}

export async function regenerateSeoFiles() {
  return uploadSeoFilesToStorage();
}
