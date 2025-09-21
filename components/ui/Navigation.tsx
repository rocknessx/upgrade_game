'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, Home, User, Plus, Sword } from 'lucide-react'
import { UPGRADE_COLORS } from '@/lib/constants'

export default function Navigation() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Reddit KO</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-1 text-gray-700 hover:text-orange-500">
                <Home size={20} />
                <span>Ana Sayfa</span>
              </Link>
              
              {session && (
                <>
                  <Link href="/upgrade" className="flex items-center space-x-1 text-gray-700 hover:text-orange-500">
                    <Sword size={20} />
                    <span>Upgrade</span>
                  </Link>
                  <Link href="/create" className="flex items-center space-x-1 text-gray-700 hover:text-orange-500">
                    <Plus size={20} />
                    <span>Post Oluştur</span>
                  </Link>
                </>
              )}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {session ? (
                <div className="flex items-center space-x-3">
                  <Link 
                    href={`/u/${session.user.username}`}
                    className="flex items-center space-x-2 text-gray-700 hover:text-orange-500"
                  >
                    <User size={20} />
                    <span>{session.user.username}</span>
                    {/* Upgrade level gösterimi */}
                    <span className={`text-sm font-bold ${UPGRADE_COLORS[0]}`}>
                      +0
                    </span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-gray-600 hover:text-red-500"
                  >
                    Çıkış
                  </button>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <Link
                    href="/auth/signin"
                    className="text-gray-700 hover:text-orange-500"
                  >
                    Giriş
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden text-gray-700"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-2 space-y-2">
            <Link href="/" className="flex items-center space-x-2 p-2 text-gray-700">
              <Home size={20} />
              <span>Ana Sayfa</span>
            </Link>
            
            {session ? (
              <>
                <Link href="/upgrade" className="flex items-center space-x-2 p-2 text-gray-700">
                  <Sword size={20} />
                  <span>Upgrade</span>
                </Link>
                <Link href="/create" className="flex items-center space-x-2 p-2 text-gray-700">
                  <Plus size={20} />
                  <span>Post Oluştur</span>
                </Link>
                <Link href={`/u/${session.user.username}`} className="flex items-center space-x-2 p-2 text-gray-700">
                  <User size={20} />
                  <span>{session.user.username}</span>
                  <span className={`text-sm font-bold ${UPGRADE_COLORS[0]}`}>
                    +0
                  </span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="w-full text-left p-2 text-red-500"
                >
                  Çıkış
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link href="/auth/signin" className="block p-2 text-gray-700">
                  Giriş
                </Link>
                <Link href="/auth/signup" className="block p-2 bg-orange-500 text-white rounded-md text-center">
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
