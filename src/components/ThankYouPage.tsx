'use client'

import { useState } from 'react'
import Image from 'next/image'
import Navbar from './Navbar'
import Footer from './Footer'

interface OrderData {
  name: string
  phone: string
  wilaya: string
  baladia: string
  address: string
  child_name: string
  quantity: number
  total_price: number
  product_image: string
  image_url: string | null
  created_at: string
}

interface ThankYouPageProps {
  orderData: OrderData
  onNewOrder: () => void
}

export default function ThankYouPage({ orderData, onNewOrder }: ThankYouPageProps) {
  const [showOrderDetails, setShowOrderDetails] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white print:bg-white" dir="rtl">
      <div className="print:hidden">
        <Navbar />
      </div>
      
      {/* Print-only invoice header */}
      <div className="hidden print:block print:bg-white print:p-8 print:border-b-2 print:border-gray-300">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">فاتورة طلب</h1>
          <p className="text-lg text-gray-600">كرة الموجات فوق الصوتية</p>
          <p className="text-sm text-gray-500">تاريخ الطلب: {new Date(orderData.created_at).toLocaleDateString('ar-SA')}</p>
        </div>
      </div>
      
      <div className="pt-20 pb-16 print:pt-0 print:pb-0">
        <div className="max-w-4xl mx-auto px-4">
          {/* Success Header */}
          <div className="text-center mb-12 print:hidden">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">شكراً لك!</h1>
            <p className="text-xl text-gray-700 mb-6">
              تم استلام طلبك بنجاح وسنتواصل معك قريباً
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-green-800 font-medium">
                📞 سنتواصل معك خلال 24 ساعة لتأكيد الطلب
              </p>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 print:shadow-none print:border print:border-gray-300 print:rounded-none">
            <div className="flex items-center justify-between mb-6 print:mb-4">
              <h2 className="text-2xl font-bold text-gray-900 print:text-xl">ملخص الطلب</h2>
              <button
                onClick={() => setShowOrderDetails(!showOrderDetails)}
                className="text-pink-600 hover:text-pink-700 font-medium flex items-center gap-2 print:hidden"
              >
                {showOrderDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                <svg 
                  className={`w-5 h-5 transition-transform ${showOrderDetails ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Product Info */}
            <div className="grid md:grid-cols-2 gap-8 mb-6 print:grid-cols-1 print:gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 print:text-base">المنتج</h3>
                <div className="flex items-center gap-4 print:gap-2">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden print:w-16 print:h-16">
                    <Image
                      src={orderData.product_image}
                      alt="كرة الموجات فوق الصوتية"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 print:text-sm">كرة الموجات فوق الصوتية</h4>
                    <p className="text-gray-600 print:text-sm">الكمية: {orderData.quantity}</p>
                    <p className="text-lg font-bold text-pink-600 print:text-base">
                      {orderData.total_price.toLocaleString()} دج
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 print:text-base">معلومات التوصيل</h3>
                <div className="space-y-2 text-gray-700 print:text-sm">
                  <p><span className="font-medium">الاسم:</span> {orderData.name}</p>
                  <p><span className="font-medium">الهاتف:</span> {orderData.phone}</p>
                  <p><span className="font-medium">اسم الطفل:</span> {orderData.child_name}</p>
                  <p><span className="font-medium">الولاية:</span> {orderData.wilaya}</p>
                  <p><span className="font-medium">البلدية:</span> {orderData.baladia}</p>
                </div>
              </div>
            </div>

            {/* Detailed Address and Uploaded Image */}
            <div className={`border-t pt-6 space-y-6 ${showOrderDetails ? 'block' : 'hidden'} print:block`}>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 print:text-base">العنوان التفصيلي</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg print:bg-white print:border print:border-gray-300 print:p-2 print:text-sm">
                  {orderData.address}
                </p>
              </div>
              
              {orderData.image_url && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 print:text-base">صورة الموجات فوق الصوتية المرفوعة</h3>
                  <div className="bg-gray-50 p-4 rounded-lg print:bg-white print:border print:border-gray-300 print:p-2">
                    <Image
                      src={orderData.image_url}
                      alt="صورة الموجات فوق الصوتية"
                      width={300}
                      height={300}
                      className="w-full max-w-sm mx-auto rounded-lg shadow-md print:shadow-none print:max-w-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 print:hidden">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">الخطوات التالية</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-pink-50 rounded-lg">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">تأكيد الطلب</h3>
                <p className="text-gray-600 text-sm">سنتواصل معك خلال 24 ساعة لتأكيد الطلب</p>
              </div>

              <div className="text-center p-6 bg-pink-50 rounded-lg">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">المعالجة</h3>
                <p className="text-gray-600 text-sm">نقوم بمعالجة طلبك وإعداد المنتج</p>
              </div>

              <div className="text-center p-6 bg-pink-50 rounded-lg">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">التوصيل</h3>
                <p className="text-gray-600 text-sm">نقوم بتوصيل المنتج إلى عنوانك</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">معلومات الاتصال</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">للاستفسارات</h3>
                <div className="space-y-2 text-gray-700">
                  <p>📞 0676896524</p>
                  <p>📧 bidayagift.help@gmail.com</p>
                  <p>🕒 9:00 ص - 6:00 م (السبت - الخميس)</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">معلومات مهمة</h3>
                <div className="space-y-2 text-gray-700 text-sm">
                  <p>• الدفع عند الاستلام</p>
                  <p>• شحن مجاني لجميع أنحاء الجزائر</p>
                  <p>• ضمان 60 يوم</p>
                  <p>• مدة التوصيل: 3-5 أيام عمل</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden">
            <button
              onClick={onNewOrder}
              className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              طلب جديد
            </button>
            <button
              onClick={handlePrint}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              طباعة الفاتورة
            </button>
          </div>
        </div>
      </div>

      {/* Print-only invoice footer */}
      <div className="hidden print:block print:bg-white print:p-8 print:border-t-2 print:border-gray-300 print:mt-8">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">تفاصيل الدفع</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">طريقة الدفع:</span> الدفع عند الاستلام</p>
              <p><span className="font-medium">المجموع الكلي:</span> {orderData.total_price.toLocaleString()} دج</p>
              <p><span className="font-medium">حالة الطلب:</span> في انتظار التأكيد</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">معلومات الشركة</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">الشركة:</span> كرة الموجات فوق الصوتية</p>
              <p><span className="font-medium">الهاتف:</span> +213 555 123 456</p>
              <p><span className="font-medium">البريد الإلكتروني:</span> info@ultrasound-orb.dz</p>
              <p><span className="font-medium">العنوان:</span> الجزائر العاصمة، الجزائر</p>
            </div>
          </div>
        </div>
        <div className="text-center mt-6 pt-4 border-t border-gray-300">
          <p className="text-sm text-gray-600">شكراً لاختيارك منتجاتنا - نتمنى لك تجربة ممتعة</p>
        </div>
      </div>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  )
}
