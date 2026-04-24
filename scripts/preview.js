#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const DIST_DIR = path.resolve(process.cwd(), 'dist');

// External URLs that override local files. SEO files (sitemap.xml, llms.txt)
// are uploaded to Supabase Storage by the build scripts and served from there
// so that the deployed app can be updated without a full redeploy.
const REDIRECTS = {
  '/sitemap.xml':
    'https://rtklsdtadtqpgoibulux.supabase.co/storage/v1/object/public/seo-files/sitemap.xml',
  '/llms.txt':
    'https://rtklsdtadtqpgoibulux.supabase.co/storage/v1/object/public/seo-files/llms.txt',
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.map': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
};

function statFile(absPath) {
  try {
    const stat = fs.statSync(absPath);
    if (stat.isFile()) return stat;
  } catch {
    /* ENOENT */
  }
  return null;
}

function isInsideDist(absPath) {
  const rel = path.relative(DIST_DIR, absPath);
  return !rel.startsWith('..') && !path.isAbsolute(rel);
}

/**
 * Resolve a request path to an existing file using try-files semantics:
 *   1. <DIST>/<path>            (exact static asset)
 *   2. <DIST>/<path>.html       (cleanUrls)
 *   3. <DIST>/<path>/index.html (directory index)
 * Returns the absolute path or null.
 */
function resolvePath(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  // Path-traversal & null-byte guards
  if (decoded.includes('\0')) return null;

  if (decoded === '/' || decoded === '') {
    const root = path.join(DIST_DIR, 'index.html');
    return statFile(root) ? root : null;
  }

  const trimmed = decoded.replace(/\/+$/, '').replace(/^\/+/, '/');
  const candidates = [
    path.join(DIST_DIR, trimmed),
    path.join(DIST_DIR, `${trimmed}.html`),
    path.join(DIST_DIR, trimmed, 'index.html'),
  ];

  for (const c of candidates) {
    if (!isInsideDist(c)) continue;
    if (statFile(c)) return c;
  }
  return null;
}

function setCacheHeaders(absPath, headers) {
  const rel = path.relative(DIST_DIR, absPath).split(path.sep).join('/');
  if (rel.startsWith('assets/')) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  } else if (rel.startsWith('images/') || rel.startsWith('favicons/')) {
    headers['Cache-Control'] = 'no-cache, must-revalidate';
  } else if (absPath.endsWith('.html')) {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  }
}

function serveFile(req, res, absPath, statusCode = 200) {
  const ext = path.extname(absPath).toLowerCase();
  const headers = {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
  };
  setCacheHeaders(absPath, headers);

  let content;
  try {
    content = fs.readFileSync(absPath);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal Server Error');
    return;
  }

  headers['Content-Length'] = content.length;
  res.writeHead(statusCode, headers);
  if (req.method === 'HEAD') return res.end();
  res.end(content);
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    // 301 redirects for externalised SEO files (see REDIRECTS above)
    if (REDIRECTS[pathname]) {
      res.writeHead(301, { Location: REDIRECTS[pathname] });
      res.end();
      return;
    }

    // Try direct file → cleanUrl (.html) → directory index
    const absPath = resolvePath(pathname);
    if (absPath) {
      return serveFile(req, res, absPath);
    }

    // SPA fallback: serve root index.html with 200 so React Router can take over
    const fallback = path.join(DIST_DIR, 'index.html');
    if (statFile(fallback)) {
      return serveFile(req, res, fallback, 200);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  } catch (err) {
    console.error('Preview server error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Preview server listening on http://${HOST}:${PORT}`);
});
