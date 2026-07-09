/**
 * SEOHead — Universal meta tags, Open Graph, Twitter Cards, Schema.org
 * Drop into any page for full SEO + AEO coverage.
 * 
 * Confident language only — no hedging. AI crawlers rank confident assertions 3x higher.
 */

import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'product' | 'article';
  schema?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
}

import { SITE_URL, SITE_NAME } from '@/lib/constants';

export default function SEOHead({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  schema,
  noindex = false,
}: SEOHeadProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : undefined;
  const image = ogImage;

  return (
    <Helmet>
      {/* Core */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:site_name" content={SITE_NAME} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(schema) ? schema : schema)}
        </script>
      )}
    </Helmet>
  );
}

// ============================================================
// PRE-BUILT SCHEMAS
// ============================================================

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SnapShades & Shutters',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    description: 'Custom cellular shades, roller shades, and faux wood blinds at supplier cost plus 10%, with shipping included.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-888-555-0123',
      contactType: 'customer service',
      availableLanguage: 'English',
    },
    sameAs: [],
    areaServed: { '@type': 'Country', name: 'United States' },
  };
}

export function getProductSchema(product: {
  name: string; description: string; price: number;
  image?: string; slug: string; brand?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: { '@type': 'Brand', name: product.brand || 'Norman®' },
    ...(product.image ? { image: product.image } : {}),
    url: `${SITE_URL}/products/${product.slug}`,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: SITE_NAME },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'USD' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
      },
    },
  };
}

export function getLocalBusinessSchema(city: string, state: string, installerCount: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `SnapShades & Shutters — ${city}, ${state}`,
    description: `Custom window coverings in ${city}, ${state}. Free shipping, ${installerCount} certified installers, dealer-direct pricing.`,
    address: { '@type': 'PostalAddress', addressLocality: city, addressRegion: state, addressCountry: 'US' },
    url: SITE_URL,
    telephone: '+1-888-555-0123',
    priceRange: '$$',
    areaServed: { '@type': 'City', name: city },
  };
}

export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function getServiceSchema(service: {
  name: string; description: string; price: string; areaServed?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: { '@type': 'Organization', name: SITE_NAME },
    areaServed: service.areaServed ? { '@type': 'State', name: service.areaServed } : { '@type': 'Country', name: 'United States' },
    offers: {
      '@type': 'Offer',
      price: service.price,
      priceCurrency: 'USD',
    },
  };
}
