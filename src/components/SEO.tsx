import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  type?: 'website' | 'product' | 'article';
  image?: string;
  price?: number;
  productName?: string;
}

const BASE_URL = 'https://snapshades.com';
const SITE_NAME = 'SnapShades';

export default function SEO({ title, description, path = '/', type = 'website', image, price, productName }: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Custom Window Treatments, Measured by Phone`;
  const fullDesc = description || 'Snap photos of your windows. Get custom blinds, shades, and shutters delivered or professionally installed. Starting at $29.99/window.';
  const fullUrl = `${BASE_URL}${path}`;
  const fullImage = image || `${BASE_URL}/og-image.jpg`;

  useEffect(() => {
    document.title = fullTitle;

    // Meta tags
    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', fullDesc);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', fullDesc, true);
    setMeta('og:url', fullUrl, true);
    setMeta('og:image', fullImage, true);
    setMeta('og:type', type, true);
    setMeta('og:site_name', SITE_NAME, true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', fullDesc);
    setMeta('twitter:image', fullImage);

    // JSON-LD structured data
    const existingLD = document.querySelector('#snapshades-ld');
    if (existingLD) existingLD.remove();

    const ldScript = document.createElement('script');
    ldScript.id = 'snapshades-ld';
    ldScript.type = 'application/ld+json';

    if (type === 'product' && productName && price) {
      ldScript.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: productName,
        description: fullDesc,
        url: fullUrl,
        image: fullImage,
        brand: { '@type': 'Brand', name: 'Norman®' },
        offers: {
          '@type': 'Offer',
          price: price.toFixed(2),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          seller: { '@type': 'Organization', name: SITE_NAME },
        },
      });
    } else {
      ldScript.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: BASE_URL,
        description: fullDesc,
        logo: `${BASE_URL}/logo.png`,
        sameAs: [],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+1-888-555-0123',
          contactType: 'customer service',
        },
        areaServed: { '@type': 'Country', name: 'US' },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Custom Window Treatments',
          itemListElement: [
            { '@type': 'OfferCatalog', name: 'Honeycomb Shades' },
            { '@type': 'OfferCatalog', name: 'Roller Shades' },
            { '@type': 'OfferCatalog', name: 'Plantation Shutters' },
            { '@type': 'OfferCatalog', name: 'Roman Shades' },
            { '@type': 'OfferCatalog', name: 'Blinds' },
          ],
        },
      });
    }
    document.head.appendChild(ldScript);

    return () => {
      const script = document.querySelector('#snapshades-ld');
      if (script) script.remove();
    };
  }, [fullTitle, fullDesc, fullUrl, fullImage, type, productName, price]);

  return null; // No visible output
}

/**
 * FAQ structured data for landing page
 */
export function FAQSchema({ faqs }: { faqs: { q: string; a: string }[] }) {
  useEffect(() => {
    const existingFAQ = document.querySelector('#snapshades-faq-ld');
    if (existingFAQ) existingFAQ.remove();

    const script = document.createElement('script');
    script.id = 'snapshades-faq-ld';
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a,
        },
      })),
    });
    document.head.appendChild(script);

    return () => {
      const el = document.querySelector('#snapshades-faq-ld');
      if (el) el.remove();
    };
  }, [faqs]);

  return null;
}

/**
 * LocalBusiness schema for installer marketplace
 */
export function LocalBusinessSchema() {
  useEffect(() => {
    const script = document.createElement('script');
    script.id = 'snapshades-local-ld';
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'HomeAndConstructionBusiness',
      name: SITE_NAME,
      url: BASE_URL,
      description: 'Custom window treatment installation service. Professional blinds, shades, and shutter installation nationwide.',
      areaServed: { '@type': 'Country', name: 'US' },
      priceRange: '$29.99 - $999+',
      serviceType: ['Window Treatment Installation', 'Blind Installation', 'Shutter Installation'],
    });
    document.head.appendChild(script);

    return () => {
      const el = document.querySelector('#snapshades-local-ld');
      if (el) el.remove();
    };
  }, []);

  return null;
}
