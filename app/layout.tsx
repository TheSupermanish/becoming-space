import type { Metadata, Viewport } from 'next';
import './globals.css';
import { BottomNav } from '@/components/features/BottomNav';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#C67B5C',
};

export const metadata: Metadata = {
  title: 'Athena - A Safe Place for Your Mind',
  description: 'Vent your struggles, flex your wins. An anonymous mental health community with AI support.',
  icons: {
    icon: '/icon.svg',
    apple: '/icon-192x192.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Athena',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Athena',
    title: 'Athena - A Safe Place for Your Mind',
    description: 'Anonymous mental health support with AI-powered therapeutic guidance.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Athena - A Safe Place for Your Mind',
    description: 'Anonymous mental health support with AI-powered therapeutic guidance.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-cream">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
