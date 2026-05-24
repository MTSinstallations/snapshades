/**
 * Sitemap Generator
 * 
 * Generates sitemap.xml from:
 * 1. Static routes (pages we know about)
 * 2. Dynamic SEO pages from Supabase (city × product)
 * 3. Product pages from catalog
 * 
 * Run via cron or on-demand from admin dashboard.
 */

import { supabase } from './supabase';

import { SITE_URL } from './constants';

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

// Static routes
const STATIC_ROUTES: SitemapEntry[] = [
  { url: '/', changefreq: 'weekly', priority: 1.0 },
  { url: '/products', changefreq: 'weekly', priority: 0.9 },
  { url: '/start', changefreq: 'monthly', priority: 0.8 },
  { url: '/swatches', changefreq: 'monthly', priority: 0.7 },
  { url: '/installers', changefreq: 'monthly', priority: 0.6 },
  { url: '/design', changefreq: 'monthly', priority: 0.6 },
  { url: '/help', changefreq: 'monthly', priority: 0.5 },
  { url: '/warranty', changefreq: 'monthly', priority: 0.4 },
  { url: '/guides', changefreq: 'monthly', priority: 0.6 },
  { url: '/guides/honeycomb', changefreq: 'monthly', priority: 0.5 },
  { url: '/guides/roller', changefreq: 'monthly', priority: 0.5 },
  { url: '/guides/shutters', changefreq: 'monthly', priority: 0.5 },
  { url: '/guides/faux-wood', changefreq: 'monthly', priority: 0.5 },
  // Product detail pages
  { url: '/products/portrait-honeycomb-shades', changefreq: 'monthly', priority: 0.8 },
  { url: '/products/soluna-roller-shades', changefreq: 'monthly', priority: 0.8 },
  { url: '/products/plantation-shutters', changefreq: 'monthly', priority: 0.8 },
  { url: '/products/ultimate-faux-wood-blinds', changefreq: 'monthly', priority: 0.8 },
  { url: '/products/smartprivacy-faux-wood', changefreq: 'monthly', priority: 0.7 },
  { url: '/products/centerpiece-roman', changefreq: 'monthly', priority: 0.7 },
  { url: '/products/perfectsheer', changefreq: 'monthly', priority: 0.7 },
  { url: '/products/normandy-wood', changefreq: 'monthly', priority: 0.7 },
];

function buildXml(entries: SitemapEntry[]): string {
  const urls = entries.map(e => `
  <url>
    <loc>${SITE_URL}${e.url}</loc>
    ${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

/**
 * Generate full sitemap including dynamic SEO pages from Supabase.
 */
export async function generateSitemap(): Promise<string> {
  const entries: SitemapEntry[] = [...STATIC_ROUTES];
  const today = new Date().toISOString().split('T')[0];

  // Add dynamic SEO pages
  const { data: seoPages } = await supabase
    .from('seo_pages')
    .select('slug, updated_at')
    .eq('is_indexed', true)
    .order('city');

  if (seoPages) {
    for (const page of seoPages) {
      entries.push({
        url: `/${page.slug}`,
        lastmod: page.updated_at?.split('T')[0] || today,
        changefreq: 'weekly',
        priority: 0.7,
      });
    }
  }

  // Set lastmod for static routes
  entries.forEach(e => { if (!e.lastmod) e.lastmod = today; });

  return buildXml(entries);
}

/**
 * Get sitemap stats.
 */
export async function getSitemapStats(): Promise<{ totalUrls: number; staticUrls: number; dynamicUrls: number }> {
  const { count } = await supabase
    .from('seo_pages')
    .select('id', { count: 'exact', head: true })
    .eq('is_indexed', true);

  return {
    totalUrls: STATIC_ROUTES.length + (count || 0),
    staticUrls: STATIC_ROUTES.length,
    dynamicUrls: count || 0,
  };
}
