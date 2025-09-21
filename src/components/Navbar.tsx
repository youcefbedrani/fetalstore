'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-20 h-[56px] sm:w-12 sm:h-12 relative">
              <Image
                src="/logo.png"
                alt="كرة الموجات فوق الصوتية"
                width={100}
                height={100}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="mr-2 sm:mr-3 text-lg sm:text-xl font-bold text-gray-800 sm:hidden">كرة كريستالية مضيئة</span>
            {/* <span className="mr-2 sm:mr-3 text-base font-bold text-gray-800 sm:hidden">كرة كريستالية</span> */}
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 space-x-reverse">
            <a href="#home" className="text-gray-700 hover:text-pink-500 transition-colors">الرئيسية</a>
            <a href="#product" className="text-gray-700 hover:text-pink-500 transition-colors">المنتج</a>
            <a href="#features" className="text-gray-700 hover:text-pink-500 transition-colors">المميزات</a>
            <a href="#testimonials" className="text-gray-700 hover:text-pink-500 transition-colors">آراء العملاء</a>
            <a href="#faq" className="text-gray-700 hover:text-pink-500 transition-colors">الأسئلة الشائعة</a>
            <a href="#contact" className="text-gray-700 hover:text-pink-500 transition-colors">اتصل بنا</a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-pink-500 focus:outline-none p-2"
              aria-label="فتح القائمة"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t shadow-lg">
              <a 
                href="#home" 
                className="block px-3 py-3 text-gray-700 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                onClick={closeMenu}
              >
                الرئيسية
              </a>
              <a 
                href="#product" 
                className="block px-3 py-3 text-gray-700 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                onClick={closeMenu}
              >
                المنتج
              </a>
              <a 
                href="#features" 
                className="block px-3 py-3 text-gray-700 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                onClick={closeMenu}
              >
                المميزات
              </a>
              <a 
                href="#testimonials" 
                className="block px-3 py-3 text-gray-700 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                onClick={closeMenu}
              >
                آراء العملاء
              </a>
              <a 
                href="#faq" 
                className="block px-3 py-3 text-gray-700 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                onClick={closeMenu}
              >
                الأسئلة الشائعة
              </a>
              <a 
                href="#contact" 
                className="block px-3 py-3 text-gray-700 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                onClick={closeMenu}
              >
                اتصل بنا
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
