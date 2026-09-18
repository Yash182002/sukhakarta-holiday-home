import type { Metadata } from 'next';
import { PAGE_METADATA } from '@/lib/metadata';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = PAGE_METADATA.book;

const bookJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://sukhakartaholidayhome.in/book#webpage',
  url: 'https://sukhakartaholidayhome.in/book',
  name: 'Book Your Stay in Alibag | Sukhakarta Holiday Home',
  description:
    'Book Sukhakarta Holiday Home directly and get the best rates. No OTA commissions. Instant confirmation. AC rooms from ₹1499/night in Alibag, Maharashtra.',
  isPartOf: {
    '@type': 'WebSite',
    url: 'https://sukhakartaholidayhome.in',
    name: 'Sukhakarta Holiday Home',
  },
  about: {
    '@type': 'LodgingBusiness',
    '@id': 'https://sukhakartaholidayhome.in/#business',
    name: 'Sukhakarta Holiday Home',
    image: 'https://sukhakartaholidayhome.in/logo.webp',
    telephone: '+91-8087541496',
    email: 'sukhakartaholidayhome@gmail.com',
    priceRange: '₹1499 and up',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'House no 826, Kurul',
      addressLocality: 'Alibag',
      postalCode: '402209',
      addressRegion: 'Maharashtra',
      addressCountry: 'IN',
    },
    checkinTime: '12:00',
    checkoutTime: '11:00',
  },
  potentialAction: {
    '@type': 'ReserveAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://sukhakartaholidayhome.in/book',
      actionPlatform: [
        'http://schema.org/DesktopWebPlatform',
        'http://schema.org/MobileWebPlatform',
      ],
    },
    result: {
      '@type': 'LodgingReservation',
      name: 'Reservation at Sukhakarta Holiday Home',
    },
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sukhakartaholidayhome.in' },
      { '@type': 'ListItem', position: 2, name: 'Book Now', item: 'https://sukhakartaholidayhome.in/book' },
    ],
  },
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJsonLd) }}
      />
      {children}
    </AuthProvider>
  );
}
