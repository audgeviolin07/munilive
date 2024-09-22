import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'muni - your health, connected',
  description: 'Manage your health conditions and medications with ease',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-sky-400 via-sky-700 to-sky-900`}>
        <nav className="bg-white/10 backdrop-blur-lg">
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <a href="/" className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-8 h-8 text-white"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                <span className="text-2xl font-bold text-white">muni</span>
              </a>
              <div className="flex space-x-4">
                <a href="/" className="text-white hover:text-gray-200">Home</a>
                <a href="/checkin" className="text-white hover:text-gray-200">Check-in</a>
                <a href="/community" className="text-white hover:text-gray-200">Community</a>
              </div>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}