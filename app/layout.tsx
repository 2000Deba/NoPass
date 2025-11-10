import type { Metadata } from 'next'
import { Providers } from './providers'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
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
  title: 'NoPass - Password Manager',
  description: 'Securely store and manage your passwords and credit cards in one place.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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