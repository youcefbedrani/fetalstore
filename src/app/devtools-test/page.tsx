'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageProtection } from '@/components/PageProtection';

export default function DevToolsTestPage() {
  const [devToolsDetected, setDevToolsDetected] = useState(false);
  const [blockedAttempts, setBlockedAttempts] = useState(0);
  const [lastBlockedKey, setLastBlockedKey] = useState('');

  useEffect(() => {
    // Listen for developer tools detection
    const handleDevToolsDetection = () => {
      setDevToolsDetected(true);
    };

    // Listen for blocked keyboard attempts
    const handleKeyBlock = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(event.key)) {
        setBlockedAttempts(prev => prev + 1);
        setLastBlockedKey(`Ctrl+Shift+${event.key.toUpperCase()}`);
      } else if (event.key === 'F12') {
        setBlockedAttempts(prev => prev + 1);
        setLastBlockedKey('F12');
      }
    };

    // Override console methods to detect dev tools
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args) => {
      if (args[0]?.includes('🚫 Developer Tools')) {
        setDevToolsDetected(true);
      }
      return originalLog.apply(console, args);
    };

    console.warn = (...args) => {
      if (args[0]?.includes('🚫 Developer Tools')) {
        setDevToolsDetected(true);
      }
      return originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      if (args[0]?.includes('🚫 Developer Tools')) {
        setDevToolsDetected(true);
      }
      return originalError.apply(console, args);
    };

    document.addEventListener('keydown', handleKeyBlock, { capture: true });

    return () => {
      document.removeEventListener('keydown', handleKeyBlock, { capture: true });
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return (
    <PageProtection>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🛡️ اختبار حماية أدوات المطور
          </h1>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`bg-white rounded-lg shadow-md p-6 ${devToolsDetected ? 'bg-red-50 border-2 border-red-200' : 'bg-green-50 border-2 border-green-200'}`}>
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${devToolsDetected ? 'bg-red-100' : 'bg-green-100'}`}>
                  {devToolsDetected ? '🚫' : '✅'}
                </div>
                <div className="mr-4">
                  <h3 className="text-lg font-semibold text-gray-900">حالة أدوات المطور</h3>
                  <p className={`text-sm ${devToolsDetected ? 'text-red-600' : 'text-green-600'}`}>
                    {devToolsDetected ? 'تم اكتشافها' : 'غير مكتشفة'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  🔒
                </div>
                <div className="mr-4">
                  <h3 className="text-lg font-semibold text-gray-900">محاولات محظورة</h3>
                  <p className="text-2xl font-bold text-blue-600">{blockedAttempts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  ⌨️
                </div>
                <div className="mr-4">
                  <h3 className="text-lg font-semibold text-gray-900">آخر مفتاح محظور</h3>
                  <p className="text-sm text-gray-600">{lastBlockedKey || 'لا يوجد'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Test Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">🧪 تعليمات الاختبار</h3>
            <div className="space-y-3 text-yellow-700">
              <div className="flex items-start">
                <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-sm font-bold ml-2">1</span>
                <p>جرب الضغط على <code className="bg-yellow-200 px-2 py-1 rounded">Ctrl+Shift+I</code> - يجب أن يتم منعه</p>
              </div>
              <div className="flex items-start">
                <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-sm font-bold ml-2">2</span>
                <p>جرب الضغط على <code className="bg-yellow-200 px-2 py-1 rounded">F12</code> - يجب أن يتم منعه</p>
              </div>
              <div className="flex items-start">
                <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-sm font-bold ml-2">3</span>
                <p>جرب الضغط على <code className="bg-yellow-200 px-2 py-1 rounded">Ctrl+Shift+J</code> - يجب أن يتم منعه</p>
              </div>
              <div className="flex items-start">
                <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-sm font-bold ml-2">4</span>
                <p>جرب الضغط على <code className="bg-yellow-200 px-2 py-1 rounded">Ctrl+Shift+C</code> - يجب أن يتم منعه</p>
              </div>
              <div className="flex items-start">
                <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-sm font-bold ml-2">5</span>
                <p>جرب فتح أدوات المطور من القائمة - يجب أن يتم اكتشافها</p>
              </div>
            </div>
          </div>

          {/* Protected Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">محتوى محمي</h3>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  هذا النص محمي من النسخ والاختيار. جرب تحديده - لن يعمل!
                </p>
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded">
                  <h4 className="font-bold mb-2">عنصر محمي</h4>
                  <p>هذا العنصر محمي بالكامل من النسخ والسحب</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">صورة محمية</h3>
              <img 
                src="/logo.png" 
                alt="شعار محمي" 
                className="w-full h-48 object-contain rounded"
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  pointerEvents: 'none'
                }}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              />
              <p className="text-sm text-gray-600 mt-2">
                هذه الصورة محمية من السحب والنسخ
              </p>
            </div>
          </div>

          {/* Real-time Status */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h3 className="text-lg font-semibold mb-4">📊 الحالة المباشرة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">أدوات المطور:</span>
                  <span className={`font-bold ${devToolsDetected ? 'text-red-600' : 'text-green-600'}`}>
                    {devToolsDetected ? 'مكتشفة' : 'غير مكتشفة'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">المحاولات المحظورة:</span>
                  <span className="font-bold text-blue-600">{blockedAttempts}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">آخر مفتاح:</span>
                  <span className="font-bold text-orange-600">{lastBlockedKey || 'لا يوجد'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الحماية:</span>
                  <span className="font-bold text-green-600">نشطة</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            <Link
              href="/"
              className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
            >
              الصفحة الرئيسية
            </Link>
            <Link
              href="/protection-test"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              اختبار الحماية العام
            </Link>
          </div>
        </div>
      </div>
    </PageProtection>
  );
}
