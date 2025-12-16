import type { Metadata } from 'next'
import { Providers } from './providers'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DownloadAppBanner from '@/components/DownloadAppBanner'
import { ThemeProvider } from '@/components/theme-provider'
import { PasswordsProvider } from './context/PasswordsContext'
import { CardsProvider } from './context/CardsContext'
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'NoPass | Secure Password Manager',
  description: 'NoPass lets you securely store and manage all your passwords and credit cards in one encrypted place. Simple, fast, and private — built with Next.js and MongoDB.',
  keywords: [
    'NoPass',
    'password manager',
    'secure storage',
    'data security',
    'password vault',
    'privacy tool',
    'Next.js',
    'MongoDB',
    'TailwindCSS',
    'NextAuth',
  ],
  authors: [{ name: 'Debasish Seal' }],
  creator: 'Debasish Seal',
  publisher: 'Debasish Seal',
  metadataBase: new URL('https://nopass-deba.vercel.app'),
  openGraph: {
    title: 'NoPass | Secure Password Manager',
    description:
      'NoPass helps you store and organize all your passwords and cards safely. Access anywhere, anytime — securely.',
    url: 'https://nopass-deba.vercel.app',
    siteName: 'NoPass',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NoPass - Password Manager',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NoPass | Secure Password Manager',
    description:
      'Manage and protect all your passwords and credit cards with NoPass. Privacy-first, easy to use.',
    images: ['/og-image.png'],
    creator: '@ShilDebasish',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Android-only App Download Banner */}
        <DownloadAppBanner />
        <Toaster />
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
            <CardsProvider>
              <PasswordsProvider>
                <Navbar />
                {children}
                <Footer />
              </PasswordsProvider>
            </CardsProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}