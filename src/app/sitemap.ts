// src/app/sitemap.ts
/**
 * Dynamic sitemap generation for QR Generator Pro
 * Generates XML sitemap for better SEO and search engine discovery
 */

import { MetadataRoute } from 'next';
import { APP_CONFIG, SEO_CONFIG } from '@/lib/constants';

// Base URL from environment or fallback
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://qr-generator-web-iota.vercel.app/';

// Static routes configuration
interface RouteConfig {
  url: string;
  lastModified?: Date | string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

// Main pages and their SEO configuration
const staticRoutes: RouteConfig[] = [
  {
    url: '',  // Homepage
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0
  },
  {
    url: '/docs',  // Documentation
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8
  },
  // Add more static routes as needed
];

// QR Mode specific pages (if you have separate pages for each mode)
const qrModeRoutes: RouteConfig[] = [
  {
    url: '/?mode=basic',
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    url: '/?mode=colored',
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    url: '/?mode=svg',
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    url: '/?mode=hq',
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7
  }
];

// Feature and help pages
const featureRoutes: RouteConfig[] = [
  {
    url: '/features/url-qr',
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6
  },
  {
    url: '/features/text-qr',
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6
  },
  {
    url: '/features/email-qr',
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6
  },
  {
    url: '/features/phone-qr',
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6
  },
  {
    url: '/features/wifi-qr',
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6
  }
];

// Blog or tutorial pages (if implemented)
const tutorialRoutes: RouteConfig[] = [
  {
    url: '/tutorials/getting-started',
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5
  },
  {
    url: '/tutorials/qr-best-practices',
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5
  },
  {
    url: '/tutorials/color-customization',
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5
  }
];

// API documentation routes
const apiRoutes: RouteConfig[] = [
  {
    url: '/api-docs',
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.4
  },
  {
    url: '/api-docs/generate-qr',
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.4
  }
];

// Utility function to generate popular QR data examples
function generatePopularQRExamples(): RouteConfig[] {
  const examples = [
    'https://github.com',
    'https://google.com',
    'https://youtube.com',
    'mailto:contact@example.com',
    'tel:+1234567890'
  ];

  return examples.map((data, index) => ({
    url: `/?data=${encodeURIComponent(data)}`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.3
  }));
}

// Function to get dynamic content (could be from CMS or database)
async function getDynamicRoutes(): Promise<RouteConfig[]> {
  // In a real application, you might fetch from:
  // - CMS (Contentful, Strapi, etc.)
  // - Database
  // - External API
  // - File system

  try {
    // Placeholder for dynamic content fetching
    // const posts = await fetch(`${process.env.CMS_API_URL}/posts`);
    // const data = await posts.json();
    
    // For now, return empty array since we don't have dynamic content
    return [];
  } catch (error) {
    console.error('Failed to fetch dynamic routes for sitemap:', error);
    return [];
  }
}

// Main sitemap generation function
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Get dynamic routes
    const dynamicRoutes = await getDynamicRoutes();
    
    // Generate popular QR examples
    const popularExamples = generatePopularQRExamples();
    
    // Combine all routes
    const allRoutes: RouteConfig[] = [
      ...staticRoutes,
      ...qrModeRoutes,
      ...featureRoutes,
      ...tutorialRoutes,
      ...apiRoutes,
      ...popularExamples,
      ...dynamicRoutes
    ];

    // Convert to sitemap format
    const sitemapEntries: MetadataRoute.Sitemap = allRoutes.map((route) => ({
      url: `${BASE_URL}${route.url}`,
      lastModified: route.lastModified || new Date(),
      changeFrequency: route.changeFrequency || 'monthly',
      priority: route.priority || 0.5
    }));

    return sitemapEntries;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return at least the homepage in case of error
    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0
      }
    ];
  }
}

// Alternative export for static generation
export async function generateSitemapXML(): Promise<string> {
  const routes = await sitemap();
  
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`;

  const xmlFooter = `</urlset>`;

  const urlEntries = routes.map(route => `
  <url>
    <loc>${route.url}</loc>
    <lastmod>${new Date(route.lastModified || new Date()).toISOString()}</lastmod>
    <changefreq>${route.changeFrequency || 'monthly'}</changefreq>
    <priority>${route.priority || 0.5}</priority>
  </url>`).join('');

  return `${xmlHeader}${urlEntries}${xmlFooter}`;
}

// Sitemap index for large sites (future expansion)
export async function generateSitemapIndex(): Promise<string> {
  const sitemaps = [
    {
      url: `${BASE_URL}/sitemap.xml`,
      lastModified: new Date()
    }
    // Add more sitemaps if you split them by category:
    // { url: `${BASE_URL}/sitemap-blog.xml`, lastModified: new Date() },
    // { url: `${BASE_URL}/sitemap-products.xml`, lastModified: new Date() }
  ];

  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  const xmlFooter = `</sitemapindex>`;

  const sitemapEntries = sitemaps.map(sitemap => `
  <sitemap>
    <loc>${sitemap.url}</loc>
    <lastmod>${sitemap.lastModified.toISOString()}</lastmod>
  </sitemap>`).join('');

  return `${xmlHeader}${sitemapEntries}${xmlFooter}`;
}

// Configuration for Next.js revalidation
export const revalidate = 86400; // Revalidate daily (24 hours)

// Metadata for the sitemap route
export const metadata = {
  title: `${APP_CONFIG.name} - Sitemap`,
  description: `XML sitemap for ${APP_CONFIG.name} - ${SEO_CONFIG.DESCRIPTION}`,
  robots: {
    index: false, // Don't index the sitemap page itself
    follow: false
  }
};