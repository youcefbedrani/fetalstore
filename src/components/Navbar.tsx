'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  const closeMenu = () => setIsMenuOpen(false)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
    closeMenu()
  }

  // Track active section based on scroll position
  useEffect(() => {
    const sections = ['home', 'product', 'features', 'testimonials', 'faq', 'contact']
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100 // Offset for navbar height
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i])
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i])
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
            <button 
              onClick={() => scrollToSection('home')} 
              className={`transition-colors cursor-pointer ${
                activeSection === 'home' 
                  ? 'text-pink-500 font-semibold' 
                  : 'text-gray-700 hover:text-pink-500'
              }`}
            >
              الرئيسية
            </button>
            <button 
              onClick={() => scrollToSection('product')} 
              className={`transition-colors cursor-pointer ${
                activeSection === 'product' 
                  ? 'text-pink-500 font-semibold' 
                  : 'text-gray-700 hover:text-pink-500'
              }`}
            >
              المنتج
            </button>
            <button 
              onClick={() => scrollToSection('features')} 
              className={`transition-colors cursor-pointer ${
                activeSection === 'features' 
                  ? 'text-pink-500 font-semibold' 
                  : 'text-gray-700 hover:text-pink-500'
              }`}
            >
              المميزات
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')} 
              className={`transition-colors cursor-pointer ${
                activeSection === 'testimonials' 
                  ? 'text-pink-500 font-semibold' 
                  : 'text-gray-700 hover:text-pink-500'
              }`}
            >
              آراء العملاء
            </button>
            <button 
              onClick={() => scrollToSection('faq')} 
              className={`transition-colors cursor-pointer ${
                activeSection === 'faq' 
                  ? 'text-pink-500 font-semibold' 
                  : 'text-gray-700 hover:text-pink-500'
              }`}
            >
              الأسئلة الشائعة
            </button>
            <button 
              onClick={() => scrollToSection('contact')} 
              className={`transition-colors cursor-pointer ${
                activeSection === 'contact' 
                  ? 'text-pink-500 font-semibold' 
                  : 'text-gray-700 hover:text-pink-500'
              }`}
            >
              اتصل بنا
            </button>
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
              <button 
                onClick={() => scrollToSection('home')} 
                className={`block w-full text-right px-3 py-3 rounded-lg transition-colors ${
                  activeSection === 'home' 
                    ? 'text-pink-500 bg-pink-50 font-semibold' 
                    : 'text-gray-700 hover:text-pink-500 hover:bg-pink-50'
                }`}
              >
                الرئيسية
              </button>
              <button 
                onClick={() => scrollToSection('product')} 
                className={`block w-full text-right px-3 py-3 rounded-lg transition-colors ${
                  activeSection === 'product' 
                    ? 'text-pink-500 bg-pink-50 font-semibold' 
                    : 'text-gray-700 hover:text-pink-500 hover:bg-pink-50'
                }`}
              >
                المنتج
              </button>
              <button 
                onClick={() => scrollToSection('features')} 
                className={`block w-full text-right px-3 py-3 rounded-lg transition-colors ${
                  activeSection === 'features' 
                    ? 'text-pink-500 bg-pink-50 font-semibold' 
                    : 'text-gray-700 hover:text-pink-500 hover:bg-pink-50'
                }`}
              >
                المميزات
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')} 
                className={`block w-full text-right px-3 py-3 rounded-lg transition-colors ${
                  activeSection === 'testimonials' 
                    ? 'text-pink-500 bg-pink-50 font-semibold' 
                    : 'text-gray-700 hover:text-pink-500 hover:bg-pink-50'
                }`}
              >
                آراء العملاء
              </button>
              <button 
                onClick={() => scrollToSection('faq')} 
                className={`block w-full text-right px-3 py-3 rounded-lg transition-colors ${
                  activeSection === 'faq' 
                    ? 'text-pink-500 bg-pink-50 font-semibold' 
                    : 'text-gray-700 hover:text-pink-500 hover:bg-pink-50'
                }`}
              >
                الأسئلة الشائعة
              </button>
              <button 
                onClick={() => scrollToSection('contact')} 
                className={`block w-full text-right px-3 py-3 rounded-lg transition-colors ${
                  activeSection === 'contact' 
                    ? 'text-pink-500 bg-pink-50 font-semibold' 
                    : 'text-gray-700 hover:text-pink-500 hover:bg-pink-50'
                }`}
              >
                اتصل بنا
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
