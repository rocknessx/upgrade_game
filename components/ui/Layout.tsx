'use client'

import { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import Navigation from './Navigation'

const inter = Inter({ subsets: ['latin'] })

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${inter.className}`}>
      <Navigation />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {children}
      </main>
    </div>
  )
}
