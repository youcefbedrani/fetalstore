'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageProtection, ElementProtection, ImageProtection, TextProtection } from '@/components/PageProtection';
import { useProtectionContext } from '@/components/ProtectionProvider';

export default function ProtectionTestPage() {
  const { isProtected, enableProtection, disableProtection } = useProtectionContext();
  const [showControls, setShowControls] = useState(false);

  return (
    <PageProtection>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            حماية الموقع - اختبار الحماية
          </h1>

          {/* Protection Status */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">حالة الحماية</h2>
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-full ${isProtected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isProtected ? 'مفعلة' : 'معطلة'}
              </div>
              <button
                onClick={() => setShowControls(!showControls)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {showControls ? 'إخفاء التحكم' : 'إظهار التحكم'}
              </button>
            </div>
          </div>

          {/* Protection Controls */}
          {showControls && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">إعدادات الحماية</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={enableProtection}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  تفعيل الحماية
                </button>
                <button
                  onClick={disableProtection}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  إلغاء الحماية
                </button>
              </div>
            </div>
          )}

          {/* Test Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Protected Text */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">نص محمي</h3>
              <TextProtection>
                <p className="text-gray-700 leading-relaxed">
                  هذا النص محمي من النسخ والاختيار. جرب النقر المزدوج أو السحب لتحديد النص - لن يعمل!
                  يمكنك أيضاً تجربة النقر بزر الماوس الأيمن - سيتم منعه.
                </p>
              </TextProtection>
            </div>

            {/* Protected Image */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">صورة محمية</h3>
              <ImageProtection
                src="/logo.png"
                alt="شعار محمي"
                className="w-full h-48 object-contain rounded"
              />
              <p className="text-sm text-gray-600 mt-2">
                هذه الصورة محمية من السحب والنسخ
              </p>
            </div>

            {/* Protected Element */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">عنصر محمي</h3>
              <ElementProtection className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded">
                <h4 className="text-lg font-bold mb-2">محتوى محمي</h4>
                <p>هذا العنصر محمي بالكامل من النسخ والسحب</p>
              </ElementProtection>
            </div>

            {/* Test Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">نموذج (غير محمي)</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل اسمك"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الرسالة
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="اكتب رسالتك هنا"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  إرسال
                </button>
              </form>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">تعليمات الاختبار</h3>
            <div className="space-y-2 text-yellow-700">
              <p>• جرب النقر بزر الماوس الأيمن - يجب أن يتم منعه</p>
              <p>• جرب تحديد النص بالسحب - يجب أن يتم منعه</p>
              <p>• جرب اختصارات لوحة المفاتيح: Ctrl+C, Ctrl+A, F12 - يجب أن يتم منعها</p>
              <p>• جرب سحب الصور - يجب أن يتم منعه</p>
              <p>• جرب Ctrl+S للحفظ - يجب أن يتم منعه</p>
              <p>• جرب Ctrl+P للطباعة - يجب أن يتم منعه</p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Link
              href="/"
              className="inline-block bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
            >
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    </PageProtection>
  );
}
