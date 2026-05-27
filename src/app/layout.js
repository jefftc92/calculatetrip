import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { SITE_NAME, SITE_URL } from '@/lib/utils'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Best All-Inclusive Resorts`,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Independent ratings and reviews for the best all-inclusive resorts in the Caribbean and Latin America. Compare resorts by food, beach, pool, value, service, and more.',
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
