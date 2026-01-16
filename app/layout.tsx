import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BDR Sales App',
  description: 'Enterprise Sales Prospecting Tool',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} h-screen flex overflow-hidden bg-slate-50`}>
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="h-full flex flex-col">
            {/* Header could go here if separate from page content */}
            <div className="flex-1 p-8">
              {children}
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
