'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
// import { supabase } from '@/lib/supabase' // Using API route instead
import { uploadImageToCloudinary, getOptimizedImageUrl as getOptimizedImageUrlLocal } from '@/lib/cloudinary'
import { uploadImageToCloudinaryServer } from '@/lib/cloudinaryServer'
import { sendToGoogleSheetsEnhanced } from '@/lib/googleSheetsWebhook'
import '@/lib/testGoogleSheets' // Load test function
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ThankYouPage from '@/components/ThankYouPage'

interface FormData {
  name: string
  phone: string
  wilaya: string
  baladia: string
  address: string
  childName: string
  cod: boolean
  image: File | null
  quantity: number
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    wilaya: '',
    baladia: '',
    address: '',
    childName: '',
    cod: true,
    image: null,
    quantity: 1
  })
  
  // Product pricing (shipping included)
  const originalPrice = 7500 // Original price before discount
  const productPrice = 5500 // Current discounted price
  const deliveryPrice = 0 // Free shipping - included in product price
  const discounts = { 1: 0, 2: 0.1, 3: 0.15 }
  const totalDiscount = Math.round(((originalPrice - productPrice) / originalPrice) * 100) // 29% discount
  
  // Calculate total price
  const calculateTotal = () => {
    const subtotal = productPrice * formData.quantity
    const discount = subtotal * discounts[formData.quantity as keyof typeof discounts]
    const discountedSubtotal = subtotal - discount
    return discountedSubtotal + deliveryPrice // deliveryPrice is now 0
  }
  
  const getSubtotal = () => {
    const subtotal = productPrice * formData.quantity
    const discount = subtotal * discounts[formData.quantity as keyof typeof discounts]
    return subtotal - discount
  }
  
  const getQuantityPrice = (qty: number) => {
    const subtotal = productPrice * qty
    const discount = subtotal * discounts[qty as keyof typeof discounts]
    return subtotal - discount
  }
  
  const getQuantityDiscount = (qty: number) => {
    if (qty === 2) return '10% خصم'
    if (qty === 3) return '15% خصم'
    return null
  }
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [orderData, setOrderData] = useState<{
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
  } | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [selectedExample] = useState(2)
  const [showVideo, setShowVideo] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [hasStartedForm, setHasStartedForm] = useState(false)

  // Scroll to top when thank you page is shown
  useEffect(() => {
    if (showSuccess) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [showSuccess])

  // Show floating button when user scrolls down (commented out for now)
  /*
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setShowFloatingButton(scrollTop > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  */

  // Auto-slide functionality for images
  useEffect(() => {
    if (!showVideo) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % 3) // 3 images total
      }, 3000) // Change slide every 3 seconds

      return () => clearInterval(interval)
    }
  }, [showVideo])

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [cameraStream])

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }
    if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + 3) % 3)
    }
  }

  // Camera functionality (commented out for now)
  /*
  const startCamera = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('المتصفح لا يدعم الكاميرا. يرجى استخدام متصفح حديث أو رفع الصورة من الجهاز.')
        return
      }

      // Mobile-optimized camera settings
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' }, // Use back camera on mobile
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          aspectRatio: { ideal: 16/9 }
        }
      }

      // Try back camera first, fallback to front camera
      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (backCameraError) {
        console.log('Back camera not available, trying front camera', backCameraError)
        constraints.video.facingMode = { ideal: 'user' }
        stream = await navigator.mediaDevices.getUserMedia(constraints)
      }

      setCameraStream(stream)
      setShowCamera(true)
    } catch (error) {
      console.error('Error accessing camera:', error)
      if (error.name === 'NotAllowedError') {
        alert('تم رفض الوصول إلى الكاميرا. يرجى السماح بالوصول إلى الكاميرا في إعدادات المتصفح.')
      } else if (error.name === 'NotFoundError') {
        alert('لم يتم العثور على كاميرا. يرجى التأكد من وجود كاميرا في الجهاز.')
      } else {
        alert('لا يمكن الوصول إلى الكاميرا. يرجى التأكد من السماح بالوصول إلى الكاميرا أو رفع الصورة من الجهاز.')
      }
    }
  }
  */

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setShowCamera(false)
    setCapturedImage(null)
  }

  const capturePhoto = () => {
    const video = document.getElementById('camera-video') as HTMLVideoElement
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    
    if (video && context) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)
      
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)
      setCapturedImage(imageDataUrl)
      
      // Convert to File object
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' })
          setFormData(prev => ({ ...prev, image: file }))
          setImagePreview(imageDataUrl)
        }
      }, 'image/jpeg', 0.8)
    }
  }

  const useCapturedPhoto = () => {
    if (capturedImage) {
      setImagePreview(capturedImage)
      stopCamera()
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
  }

  // Algerian Wilayas and Baladias
  const algerianWilayas = {
    '01': 'أدرار',
    '02': 'الشلف',
    '03': 'الأغواط',
    '04': 'أم البواقي',
    '05': 'باتنة',
    '06': 'بجاية',
    '07': 'بسكرة',
    '08': 'بشار',
    '09': 'البليدة',
    '10': 'البويرة',
    '11': 'تمنراست',
    '12': 'تبسة',
    '13': 'تلمسان',
    '14': 'تيارت',
    '15': 'تيزي وزو',
    '16': 'الجزائر',
    '17': 'الجلفة',
    '18': 'جيجل',
    '19': 'سطيف',
    '20': 'سعيدة',
    '21': 'سكيكدة',
    '22': 'سيدي بلعباس',
    '23': 'عنابة',
    '24': 'قالمة',
    '25': 'قسنطينة',
    '26': 'المدية',
    '27': 'مستغانم',
    '28': 'المسيلة',
    '29': 'معسكر',
    '30': 'ورقلة',
    '31': 'وهران',
    '32': 'البيض',
    '33': 'إليزي',
    '34': 'برج بوعريريج',
    '35': 'بومرداس',
    '36': 'الطارف',
    '37': 'تندوف',
    '38': 'تيسمسيلت',
    '39': 'الوادي',
    '40': 'خنشلة',
    '41': 'سوق أهراس',
    '42': 'تيبازة',
    '43': 'ميلة',
    '44': 'عين الدفلى',
    '45': 'النعامة',
    '46': 'عين تيموشنت',
    '47': 'غرداية',
    '48': 'غليزان'
  }

  const algerianBaladias = {
    '01': ['أدرار', 'تيميمون', 'أولف', 'إن قزام', 'فنوغيل'],
    '02': ['الشلف', 'وادي الفضة', 'بوقادير', 'الزبوجة', 'أولاد فارس'],
    '03': ['الأغواط', 'عين ماضي', 'حاسي الرمل', 'قصر الحيران', 'الغيشة'],
    '04': ['أم البواقي', 'عين البيضاء', 'عين مليلة', 'مسكيانة', 'سوق نعمان'],
    '05': ['باتنة', 'بريكة', 'أولاد سي سليمان', 'تازولت', 'عين التوتة'],
    '06': ['بجاية', 'أقبو', 'أميزور', 'القصر', 'تيزي وزو'],
    '07': ['بسكرة', 'أولاد جلال', 'ليشانة', 'زريبة الوادي', 'الوطاية'],
    '08': ['بشار', 'تندوف', 'أدرار', 'تيميمون', 'أولف'],
    '09': ['البليدة', 'بوفاريك', 'الأربعاء', 'بوقرة', 'بومرداس'],
    '10': ['البويرة', 'الأخضرية', 'سور الغزلان', 'الهاشمية', 'عين بسام'],
    '11': ['تمنراست', 'عين قزام', 'أبلسة', 'تاظروك', 'تين زاوتين'],
    '12': ['تبسة', 'بئر العاتر', 'مرسط', 'العوينات', 'بئر مقدم'],
    '13': ['تلمسان', 'غليزان', 'مغنية', 'الرمشي', 'بني صاف'],
    '14': ['تيارت', 'مدروسة', 'عين الذهب', 'سيدي علي ملال', 'فرندة'],
    '15': ['تيزي وزو', 'مشطرا', 'أزفون', 'بني دوالة', 'ذراع الميزان'],
    '16': ['الجزائر الوسطى', 'باب الزوار', 'الحراش', 'الرويبة', 'الدار البيضاء', 'بئر مراد رايس', 'بئر خادم', 'بئر توتة', 'بوروبة', 'الشراقة'],
    '17': ['الجلفة', 'حاسي بحبح', 'عين وسارة', 'الشارف', 'البيض'],
    '18': ['جيجل', 'الطاهير', 'الميلية', 'القالة', 'الطاهير'],
    '19': ['سطيف', 'عين ولمان', 'بئر العرش', 'بئر حدادة', 'بوقاعة', 'جميلة', 'قنزات', 'الماين', 'بني ورتيلان', 'بني عزيز', 'بني فودة', 'بني شيبانة'],
    '20': ['سعيدة', 'عين الحجر', 'يوب', 'سيدي أحمد', 'البيض'],
    '21': ['سكيكدة', 'القل', 'الزيتونة', 'أم الطوب', 'بجاية'],
    '22': ['سيدي بلعباس', 'عين البرد', 'مولاي سليمان', 'تسالة', 'رأس الماء'],
    '23': ['عنابة', 'برج الطهر', 'الحجار', 'سرايدي', 'البوني'],
    '24': ['قالمة', 'حمام دباغ', 'عين مخلوف', 'قلعة بوصبع', 'وادي الزناتي'],
    '25': ['قسنطينة', 'الخروب', 'عين عبيد', 'حامة بوزيان', 'زيغود يوسف', 'ابن زياد'],
    '26': ['المدية', 'برج بوعريريج', 'قصر البخاري', 'أولاد عنتر', 'سيدي نايل'],
    '27': ['مستغانم', 'عشعاشة', 'عين تادلس', 'سيدي علي', 'حاسي مماش'],
    '28': ['المسيلة', 'بوسعادة', 'أولاد دراج', 'سيدي عيسى', 'عين الحجل'],
    '29': ['معسكر', 'سيق', 'غريس', 'عين فكان', 'المحمدية'],
    '30': ['ورقلة', 'تقرت', 'المنيعة', 'حاسي مسعود', 'الرويسات'],
    '31': ['وهران', 'عين الترك', 'أرزيو', 'بطيوة', 'بوسفر', 'المرسى الكبير', 'قديل', 'السانية', 'بئر الجير', 'حاسي بن عقبة', 'عين البية', 'عين الكرمة', 'بوتليليس', 'بوفاتيس'],
    '32': ['البيض', 'بوقادير', 'الأبيض سيدي الشيخ', 'البيض', 'بوسمغون'],
    '33': ['إليزي', 'جانت', 'برج عمر إدريس', 'عين أميناس', 'تيمياوين'],
    '34': ['برج بوعريريج', 'رأس الوادي', 'بئر قاصد علي', 'المنصورة', 'بئر غبالو'],
    '35': ['بومرداس', 'بودواو', 'الخروبة', 'بني مراد', 'بودواو'],
    '36': ['الطارف', 'القل', 'بوقاعة', 'الزيتونة', 'أم الطوب'],
    '37': ['تندوف', 'أولاد خالد', 'تيمياوين', 'عين صالح', 'أدرار'],
    '38': ['تيسمسيلت', 'خميستي', 'ثنية الحد', 'برج الأمير عبد القادر', 'لرجام'],
    '39': ['الوادي', 'الرويسات', 'المنيعة', 'حاسي خليفة', 'الطالب العربي'],
    '40': ['خنشلة', 'بابار', 'ششار', 'أولاد رشاش', 'بئر العاتر'],
    '41': ['سوق أهراس', 'سدراتة', 'أم العظائم', 'بئر بوحوش', 'الحدادة'],
    '42': ['تيبازة', 'شرشال', 'دواودة', 'فوكة', 'القليعة'],
    '43': ['ميلة', 'فرجيوة', 'شلغوم العيد', 'تاجنانت', 'عين البيضاء'],
    '44': ['عين الدفلى', 'خميس مليانة', 'بومدفع', 'الروينة', 'جندل'],
    '45': ['النعامة', 'المسيلة', 'عين الصفراء', 'مغرار', 'تيميمون'],
    '46': ['عين تيموشنت', 'حمام بوحجر', 'أولاد بن عبد القادر', 'عين الكيحل', 'بني صاف'],
    '47': ['غرداية', 'متليلي', 'المنيعة', 'زلفانة', 'بريان'],
    '48': ['غليزان', 'وادي رهيو', 'المنصورة', 'عين طارق', 'مازونة']
  }


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    
    // Mark that user has started filling the form
    if (!hasStartedForm) {
      setHasStartedForm(true)
    }
    
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    
    // Mark that user has started filling the form
    if (!hasStartedForm) {
      setHasStartedForm(true)
    }
    
    if (!file) {
      setFormData(prev => ({ ...prev, image: null }))
      setImagePreview(null)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'يرجى اختيار ملف صورة صالح' }))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' }))
      return
    }

    setFormData(prev => ({ ...prev, image: file }))
    
    // Create image preview
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
    
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب'
    } else if (!/^[0-9+\-\s]{8,20}$/.test(formData.phone.trim())) {
      newErrors.phone = 'رقم الهاتف غير صحيح'
    }
    
    if (!formData.wilaya) {
      newErrors.wilaya = 'الولاية مطلوبة'
    }
    
    if (!formData.baladia) {
      newErrors.baladia = 'البلدية مطلوبة'
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'العنوان التفصيلي مطلوب'
    }
    
    if (!formData.childName.trim()) {
      newErrors.childName = 'اسم الطفل مطلوب'
    }
    
    // Image is now optional - orders can be submitted without image
    // if (!formData.image) {
    //   newErrors.image = 'يرجى رفع صورة الموجات فوق الصوتية'
    // }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadImageToCloudinaryService = async (file: File): Promise<string> => {
    try {
      // Try client-side upload first
      try {
        const cloudinaryUrl = await uploadImageToCloudinary(file)
        return cloudinaryUrl
      } catch (clientError) {
        console.warn('Client-side upload failed, trying server-side')
        
        // Fallback to server-side upload
        const cloudinaryUrl = await uploadImageToCloudinaryServer(file)
        return cloudinaryUrl
      }
    } catch (error) {
      console.error('Image upload error:', error)
      throw new Error(`خطأ في رفع الصورة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`)
    }
  }



  // submitToGoogleSheets function removed - using sendToGoogleSheetsEnhanced instead

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submission started...')
    
    const isValid = validateForm()
    console.log('Form validation result:', isValid)
    
    if (!isValid) {
      console.log('Form validation failed, stopping submission')
      return
    }
    
    setIsSubmitting(true)
    setIsUploadingImage(true)
    
    try {
      // Try to upload image to Cloudinary, but don't fail the order if it fails
      let cloudinaryUrl = ''
      let optimizedImageUrl = ''
      
      if (formData.image) {
        try {
          console.log('Uploading image...')
          cloudinaryUrl = await uploadImageToCloudinaryService(formData.image)
          optimizedImageUrl = getOptimizedImageUrlLocal(cloudinaryUrl, 400, 400)
          console.log('✅ Image uploaded successfully')
        } catch (imageError) {
          console.warn('⚠️ Image upload failed, but continuing with order:', imageError)
          // Continue without image - don't fail the entire order
          cloudinaryUrl = ''
          optimizedImageUrl = ''
        }
      }
      
      const orderData = {
        name: formData.name,
        phone: formData.phone,
        wilaya: formData.wilaya,
        baladia: formData.baladia,
        address: formData.address,
        child_name: formData.childName,
        cod: formData.cod,
        quantity: formData.quantity,
        total_price: getQuantityPrice(formData.quantity),
        product_name: 'كرة الموجات فوق الصوتية',
        product_image: `/${selectedExample}.png`,
        image_path: cloudinaryUrl || null,
        image_url: optimizedImageUrl || null,
        status: formData.cod ? 'pending_cod' : 'pending',
        created_at: new Date().toISOString()
      }
      
      // Submit order to API route instead of direct Supabase
      console.log('Submitting order to API...', orderData)
      
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        })
        
        console.log('API response status:', response.status, response.statusText)
        
        const result = await response.json()
        console.log('API response data:', result)
        
        if (!response.ok) {
          const errorMessage = result.message || `خطأ في إرسال الطلب: ${response.statusText}`
          if (result.details && Array.isArray(result.details)) {
            throw new Error(`${errorMessage}\nالتفاصيل: ${result.details.join(', ')}`)
          }
          throw new Error(errorMessage)
        }
        
        if (!result.success) {
          throw new Error(result.message || 'فشل في إرسال الطلب')
        }
        
        console.log('✅ Order submitted successfully to Supabase:', result.order)
      } catch (apiError) {
        console.error('API submission error:', apiError)
        throw new Error(`خطأ في إرسال الطلب: ${apiError instanceof Error ? apiError.message : 'خطأ غير معروف'}`)
      }
      
      const sheetsData = {
        name: formData.name,
        phone: formData.phone,
        child_name: formData.childName,
        wilaya: algerianWilayas[formData.wilaya as keyof typeof algerianWilayas],
        baladia: formData.baladia,
        address: formData.address,
        quantity: formData.quantity,
        total_price: getQuantityPrice(formData.quantity),
        image_url: optimizedImageUrl || 'لم يتم رفع صورة',
        created_at: orderData.created_at
      }
      
      // Try to send to Google Sheets (optional - won't fail the order if it fails)
      console.log('Attempting to send data to Google Sheets...', sheetsData)
      try {
        const sheetsSuccess = await sendToGoogleSheetsEnhanced(sheetsData)
        if (sheetsSuccess) {
          console.log('✅ Order data sent to Google Sheets successfully')
        } else {
          console.warn('⚠️ Failed to send data to Google Sheets')
        }
      } catch (error) {
        console.warn('Google Sheets submission failed, but order will continue:', error)
      }
      
      setOrderData({
        name: formData.name,
        phone: formData.phone,
        wilaya: algerianWilayas[formData.wilaya as keyof typeof algerianWilayas],
        baladia: formData.baladia,
        address: formData.address,
        child_name: formData.childName,
        quantity: formData.quantity,
        total_price: getQuantityPrice(formData.quantity),
        product_image: `/${selectedExample}.png`,
        image_url: optimizedImageUrl || null,
        created_at: orderData.created_at
      })
      
      // Show success message
      if (cloudinaryUrl) {
        console.log('✅ Order submitted successfully with image')
      } else {
        console.log('✅ Order submitted successfully without image (upload failed)')
      }
      
      // Track purchase with Meta Pixel
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Purchase', {
          value: getQuantityPrice(formData.quantity),
          currency: 'DZD',
          content_name: 'كرة الموجات فوق الصوتية',
          content_category: 'هدايا',
          content_ids: ['ultrasound-orb'],
          num_items: formData.quantity
        });
        console.log('✅ Meta Pixel Purchase event tracked');
      }
      
      setShowSuccess(true)
      
    } catch (error) {
      console.error('Submission error:', error)
      alert(`خطأ في إرسال الطلب: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`)
    } finally {
      setIsSubmitting(false)
      setIsUploadingImage(false)
    }
  }

  // Show thank you page when order is successful
  if (showSuccess && orderData) {
    return (
      <ThankYouPage 
        orderData={orderData}
        onNewOrder={() => {
          setShowSuccess(false)
          setOrderData(null)
          setHasStartedForm(false)
          setFormData({
            name: '',
            phone: '',
            wilaya: '',
            baladia: '',
            address: '',
            childName: '',
            cod: true,
            image: null,
            quantity: 1
          })
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white" dir="rtl">
      <Navbar />

      {/* Home Section - Special Offer Banner */}
      <section id="home" className="bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 px-4 text-center">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm sm:text-base font-bold">
            🎉 عرض خاص و محدود ! خصم 27% + توصيل مجاني - وفر 2,000 دج الآن! 🎉
          </p>
        </div>
      </section>

      {/* Product Section */}
      <section id="product" className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Product Title and Description with Photos */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-8 sm:mb-12">
            {/* Product Images and Video */}
            <div className="space-y-4 sm:space-y-6">
              <div className="relative">
                <div className="aspect-square bg-gray-100 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl">
                  {showVideo ? (
                    <video
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                      muted
                      loop
                      poster="/1.png"
                    >
                      <source src="/video.mp4" type="video/mp4" />
                      متصفحك لا يدعم تشغيل الفيديو
                    </video>
                  ) : (
                    <div 
                      className="relative w-full h-full"
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      {/* Image Carousel */}
                      <div className="relative w-full h-full overflow-hidden">
                        {[1, 2, 3].map((num, index) => (
                          <div
                            key={num}
                            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                              index === currentSlide 
                                ? 'translate-x-0' 
                                : index < currentSlide 
                                  ? '-translate-x-full' 
                                  : 'translate-x-full'
                            }`}
                          >
                            <Image
                              src={`/${num}.png`}
                              alt={`كرة الموجات فوق الصوتية - مثال ${num}`}
                              width={600}
                              height={600}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      
                      {/* Navigation Arrows */}
                      <button
                        onClick={() => setCurrentSlide((prev) => (prev - 1 + 3) % 3)}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                        title="الصورة السابقة"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => setCurrentSlide((prev) => (prev + 1) % 3)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                        title="الصورة التالية"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Play/Pause Button Overlay */}
                <button
                  onClick={() => setShowVideo(!showVideo)}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all z-10"
                  title={showVideo ? "إظهار الصور" : "تشغيل الفيديو"}
                >
                  {showVideo ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Media Selection Tabs */}
              <div className="flex gap-2 sm:gap-4 justify-center">
                {/* Video Tab */}
                <button
                  onClick={() => setShowVideo(true)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                    showVideo 
                      ? 'border-pink-500 bg-pink-50 text-pink-700' 
                      : 'border-gray-200 hover:border-pink-300 text-gray-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span className="text-sm font-medium">فيديو</span>
                </button>
                
                {/* Images Tab */}
                <button
                  onClick={() => setShowVideo(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                    !showVideo 
                      ? 'border-pink-500 bg-pink-50 text-pink-700' 
                      : 'border-gray-200 hover:border-pink-300 text-gray-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">صور</span>
                </button>
              </div>
              
              {/* Slide Indicators and Thumbnails - Only show when not showing video */}
              {!showVideo && (
                <div className="space-y-4">
                  {/* Slide Indicators */}
                  <div className="flex justify-center gap-2">
                    {[0, 1, 2].map((index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          currentSlide === index 
                            ? 'bg-pink-500 scale-125' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        title={`الصورة ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                  {/* Thumbnail Navigation */}
                  <div className="flex gap-2 sm:gap-4 justify-center">
                    {[1, 2, 3].map((num, index) => (
                      <button
                        key={num}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          currentSlide === index 
                            ? 'border-pink-500 ring-2 ring-pink-200 scale-105' 
                            : 'border-gray-200 hover:border-pink-300 hover:scale-105'
                        }`}
                        title={`انقر لعرض الصورة ${num}`}
                      >
                        <Image
                          src={`/${num}.png`}
                          alt={`مثال ${num}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Product Title and Description */}
            <div className="text-center lg:text-right">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                أجمل ذكرياتك داخل كرة كريستالية مضيئة
              </h2>
              <p className="text-gray-700 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed">
                هل تبحث عن هدية مختلفة فعلاً؟ الكرة الكريستالية المضيئة تحول لحظاتك الثمينة إلى عمل فني يضيء كل زاوية من منزلك. 
                صورة مخصصة مجانية، قاعدة خشبية أنيقة، ونقش أساسي مجاني يجعلها أكثر تميزًا.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="flex text-yellow-400">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
                <span className="text-gray-700 text-sm sm:text-lg font-medium">4.9/5 (1,087 تقييم)</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">5,500 دج</span>
                <div className="flex items-center gap-2 sm:gap-4">
                  <span className="text-lg sm:text-2xl text-gray-500 line-through">7,500 دج</span>
                  <span className="bg-red-100 text-red-800 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold">خصم {totalDiscount}%</span>
                </div>
                <div className="mt-2">
                  <span className="bg-green-100 text-green-800 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold">+ توصيل مجاني </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <div id="order-form" className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">اطلب الآن</h2>
              
              {/* Quantity Selection */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">اختر الكمية</label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[1, 2, 3].map((qty) => (
                    <button
                      key={qty}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, quantity: qty }))
                        // Mark that user has started filling the form
                        if (!hasStartedForm) {
                          setHasStartedForm(true)
                        }
                      }}
                      className={`p-3 sm:p-4 border-2 rounded-lg text-center transition-all ${
                        formData.quantity === qty
                          ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-200'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 sm:text-lg">×{qty}</div>
                      <div className="text-xs sm:text-sm text-gray-600">{getQuantityPrice(qty).toLocaleString()} دج</div>
                      {getQuantityDiscount(qty) && (
                        <div className="text-xs text-green-600 font-semibold">{getQuantityDiscount(qty)}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-right text-sm sm:text-base text-gray-900 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="أدخل اسمك الكامل"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onInput={(e) => {
                      // Only allow numeric characters
                      const target = e.target as HTMLInputElement
                      target.value = target.value.replace(/[^0-9]/g, '')
                      if (target.value !== formData.phone) {
                        setFormData(prev => ({ ...prev, phone: target.value }))
                      }
                    }}
                    maxLength={10}
                    pattern="[0-9]{10}"
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-right text-sm sm:text-base text-gray-900 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="أدخل رقم هاتفك (10 أرقام)"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                {/* Child Name */}
                <div>
                  <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الطفل *
                  </label>
                  <input
                    type="text"
                    id="childName"
                    name="childName"
                    value={formData.childName}
                    onChange={handleInputChange}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-right text-sm sm:text-base text-gray-900 ${
                      errors.childName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="أدخل اسم الطفل"
                  />
                  {errors.childName && <p className="text-red-500 text-sm mt-1">{errors.childName}</p>}
                </div>

                {/* Wilaya */}
                <div>
                  <label htmlFor="wilaya" className="block text-sm font-medium text-gray-700 mb-2">
                    الولاية *
                  </label>
                  <select
                    id="wilaya"
                    name="wilaya"
                    value={formData.wilaya}
                    onChange={handleInputChange}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-right text-sm sm:text-base text-gray-900 ${
                      errors.wilaya ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">اختر الولاية</option>
                    {Object.entries(algerianWilayas).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                  {errors.wilaya && <p className="text-red-500 text-sm mt-1">{errors.wilaya}</p>}
                </div>

                {/* Baladia */}
                <div>
                  <label htmlFor="baladia" className="block text-sm font-medium text-gray-700 mb-2">
                    البلدية *
                  </label>
                  <select
                    id="baladia"
                    name="baladia"
                    value={formData.baladia}
                    onChange={handleInputChange}
                    disabled={!formData.wilaya}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-right text-sm sm:text-base text-gray-900 ${
                      errors.baladia ? 'border-red-500' : 'border-gray-300'
                    } ${!formData.wilaya ? 'bg-gray-100' : ''}`}
                  >
                    <option value="">
                      {!formData.wilaya ? 'اختر الولاية أولاً' : 'اختر البلدية'}
                    </option>
                    {formData.wilaya && algerianBaladias[formData.wilaya as keyof typeof algerianBaladias]?.map((baladia) => (
                      <option key={baladia} value={baladia}>{baladia}</option>
                    ))}
                  </select>
                  {errors.baladia && <p className="text-red-500 text-sm mt-1">{errors.baladia}</p>}
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    العنوان التفصيلي *
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-right text-sm sm:text-base text-gray-900 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="أدخل العنوان التفصيلي (الحي، الشارع، رقم المنزل)"
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                {/* Image Upload and Camera */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رفع صورة الموجات فوق الصوتية *
                  </label>
                  
                  {/* Upload/Camera Options */}
                  <div className="space-y-3 mb-4">
                    {/* Mobile-first camera button */}
                    {/* <button
                      type="button"
                      onClick={startCamera}
                      disabled={isUploadingImage}
                      className="w-full flex items-center justify-center text-white gap-3 px-6 py-4 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg hover:from-pink-600 hover:to-red-600 transition-all transform hover:scale-105 disabled:opacity-50 shadow-lg"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-lg font-bold">التقاط صورة بالكاميرا</span>
                    </button> */}
                    
                    {/* Upload button */}
                    <button
                      type="button"
                      onClick={() => document.getElementById('image')?.click()}
                      disabled={isUploadingImage}
                      className="w-full flex items-center justify-center text-gray-700 gap-3 px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-pink-400 hover:bg-pink-50 transition-colors disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm font-medium">رفع صورة من الجهاز</span>
                    </button>
                  </div>

                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isUploadingImage}
                  />

                  {/* Image Preview Area */}
                  <div className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors ${
                    isUploadingImage 
                      ? 'border-blue-400 bg-blue-50' 
                      : imagePreview 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-gray-300'
                  }`}>
                    {isUploadingImage ? (
                      <>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4">
                          <div className="animate-spin rounded-full h-full w-full border-b-2 border-blue-500"></div>
                        </div>
                        <p className="text-blue-600 mb-2 text-sm sm:text-base font-medium">
                          جاري رفع الصورة...
                        </p>
                        <p className="text-xs sm:text-sm text-blue-500">يرجى الانتظار</p>
                      </>
                    ) : imagePreview ? (
                      <>
                        <div className="relative mb-3 sm:mb-4">
                        <Image 
                          src={imagePreview} 
                          alt="معاينة الصورة" 
                          width={128}
                          height={128}
                          className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-lg object-cover border-2 border-green-400"
                        />
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-green-600 mb-2 text-sm sm:text-base font-medium">
                          ✓ تم رفع الصورة بنجاح: {formData.image?.name || 'صورة من الكاميرا'}
                        </p>
                        <p className="text-xs sm:text-sm text-green-500">اضغط على الأزرار أعلاه لتغيير الصورة</p>
                      </>
                    ) : (
                      <>
                        <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-600 mb-2 text-sm sm:text-base">
                          اختر طريقة رفع الصورة من الأعلى
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">ملفات JPG, PNG مقبولة (حد أقصى 5 ميجابايت)</p>
                      </>
                    )}
                  </div>
                  {errors.image && <p className="text-red-500 text-sm mt-1">{String(errors.image)}</p>}
                </div>

                {/* Payment Information */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center ml-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-800">الدفع عند الاستلام</h3>
                      <p className="text-sm text-green-600">آمن ومضمون - ادفع عند استلام طلبك</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-green-700">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>لا تدفع شيئاً مقدماً</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>ضمان الجودة 100%</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 ml-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>توصيل مجاني لجميع الولايات</span>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">تفاصيل السعر</h3>
                  
                  {/* Product Price */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">سعر المنتج (×{formData.quantity}):</span>
                    <span className="font-medium text-black">
                      {(productPrice * formData.quantity).toLocaleString()} دج
                    </span>
                  </div>
                  
                  {/* Discount */}
                  {formData.quantity > 1 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>خصم ({formData.quantity === 2 ? '10%' : '15%'}):</span>
                      <span className="font-medium">
                        -{((productPrice * formData.quantity) * discounts[formData.quantity as keyof typeof discounts]).toLocaleString()} دج
                      </span>
                    </div>
                  )}
                  
                  {/* Subtotal */}
                  <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                    <span className="text-gray-700">المجموع الفرعي:</span>
                    <span className="font-medium text-black">
                      {getSubtotal().toLocaleString()} دج
                    </span>
                  </div>
                  
                  {/* Delivery */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">رسوم التوصيل:</span>
                    <span className="font-medium text-green-600">
                      مجاني لجميع الولايات
                    </span>
                  </div>
                  
                  {/* Delivery Savings */}
                  <div className="flex justify-between items-center text-green-600 bg-green-50 p-2 rounded">
                    <span className="text-sm">توفير رسوم التوصيل:</span>
                    <span className="font-medium text-sm">
                      -750 دج
                    </span>
                  </div>
                  
                  {/* Total */}
                  <div className="flex justify-between items-center border-t-2 border-gray-300 pt-3">
                    <span className="text-lg font-bold text-gray-900">المجموع الكلي:</span>
                    <span className="text-xl font-bold text-pink-600">
                      {calculateTotal().toLocaleString()} دج
                    </span>
                  </div>
                </div>


                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  onClick={() => console.log('Submit button clicked!')}
                  className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-black"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isUploadingImage ? 'جاري رفع الصورة...' : 'جاري إرسال الطلب...'}
                    </>
                  ) : (
                    'تأكيد الطلب'
                  )}
                </button>
              </form>
          </div>
        </div>
      </section>

      {/* Video Presentation Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">شاهد المنتج في الفيديو</h2>
            <p className="text-gray-600 text-sm sm:text-black">اكتشف جمال كرة الموجات فوق الصوتية في هذا العرض التوضيحي</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video bg-gray-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-2xl">
              <video
                className="w-full h-full object-cover"
                controls
                poster="/section1.png"
                preload="metadata"
              >
                <source src="/video.mp4" type="video/mp4" />
                متصفحك لا يدعم تشغيل الفيديو
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Product Explanation Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">ما هي كرة الموجات فوق الصوتية؟</h2>
            <p className="text-gray-700 sm:text-lg max-w-3xl mx-auto leading-relaxed px-4">
              كرة الموجات فوق الصوتية هي تحفة فنية مصنوعة من الكريستال الفاخر، تحمل أول صورة لطفلك منقوشة بدقة عالية باستخدام تقنية الليزر المتقدمة
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="space-y-6 sm:space-y-8">
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">ذكرى لا تُنسى</h3>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-black">احتفظ بأول صورة لطفلك في تحفة فنية جميلة ستكون معك مدى الحياة</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">تقنية متقدمة</h3>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-black">نستخدم أحدث تقنيات الليزر لضمان وضوح ودقة الصورة المنقوشة</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">هدية مثالية</h3>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-black">مثالية كهدية للأمهات الجدد أو كذكرى خاصة للعائلة</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <div className="aspect-square bg-gray-100 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl">
                <Image
                  src="/section1.png"
                  alt="كرة الموجات فوق الصوتية - شرح المنتج"
                  width={500}
                  height={500}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">كيف يعمل المنتج؟</h2>
            <p className="text-gray-600 text-sm sm:text-black">عملية بسيطة لإنشاء ذكرى لا تُنسى</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="relative mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-white text-xl sm:text-2xl font-bold">1</span>
                </div>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src="/section2.png"
                    alt="الخطوة الأولى - رفع الصورة"
                    width={300}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3 className="text-lg text-black sm:text-xl font-semibold mb-2 sm:mb-3">ارفع صورة الموجات فوق الصوتية</h3>
              <p className="text-gray-600 text-sm sm:text-black">ارفع صورة الموجات فوق الصوتية لطفلك مع معلومات الطلب</p>
            </div>

            <div className="text-center">
              <div className="relative mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-white text-xl sm:text-2xl font-bold">2</span>
                </div>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src="/section3.png"
                    alt="الخطوة الثانية - النقش بالليزر"
                    width={300}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3 className="text-lg text-black sm:text-xl font-semibold mb-2 sm:mb-3">النقش بالليزر</h3>
              <p className="text-gray-600 text-sm sm:text-black">نقوم بنقش الصورة داخل الكرة الكريستالية باستخدام تقنية الليزر المتقدمة</p>
            </div>

            <div className="text-center">
              <div className="relative mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-white text-xl sm:text-2xl font-bold">3</span>
                </div>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src="/1.png"
                    alt="الخطوة الثالثة - التوصيل"
                    width={300}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3 className="text-lg text-black sm:text-xl font-semibold mb-2 sm:mb-3">التوصيل إلى باب منزلك</h3>
              <p className="text-gray-600 text-sm sm:text-black">نقوم بتوصيل المنتج النهائي إلى عنوانك مع ضمان الجودة</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Specifications Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">مواصفات المنتج</h2>
            <p className="text-gray-700 text-base sm:text-lg">تفاصيل دقيقة عن كرة الموجات فوق الصوتية</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="border-l-4 border-pink-500 pl-6 bg-gray-50 p-4 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">الأبعاد</h3>
                  <p className="text-gray-700 font-medium mb-1">قطر الكرة: 6 سم (2.36 بوصة)</p>
                  <p className="text-gray-700 font-medium">الوزن: 200 جرام</p>
                </div>

                <div className="border-l-4 border-pink-500 pl-6 bg-gray-50 p-4 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">المادة</h3>
                  <p className="text-gray-700 font-medium mb-1">كريستال K9 عالي الجودة</p>
                  <p className="text-gray-700 font-medium">شفاف 100% مع لمعان مميز</p>
                </div>

                <div className="border-l-4 border-pink-500 pl-6 bg-gray-50 p-4 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">تقنية النقش</h3>
                  <p className="text-gray-700 font-medium mb-1">ليزر ثلاثي الأبعاد</p>
                  <p className="text-gray-700 font-medium">دقة عالية ووضوح ممتاز</p>
                </div>

                <div className="border-l-4 border-pink-500 pl-6 bg-gray-50 p-4 rounded-r-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">التغليف</h3>
                  <p className="text-gray-700 font-medium mb-1">صندوق هدايا فاخر</p>
                  <p className="text-gray-700 font-medium">شريط وردي أنيق</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-xl">
          <Image
                  src="/demension.png"
                  alt="مواصفات كرة الموجات فوق الصوتية"
                  width={500}
                  height={500}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
                <p className="text-sm font-semibold text-gray-800">أبعاد دقيقة</p>
                <p className="text-xs text-gray-600">6 سم × 6 سم</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gift Ideas Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">أفكار هدايا مميزة</h2>
            <p className="text-gray-600 text-sm sm:text-base">مثالية لكل المناسبات الخاصة</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl text-black font-semibold mb-3">للأمهات الجدد</h3>
              <p className="text-gray-600">هدية مثالية للاحتفال بولادة الطفل الجديد</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-xl text-black font-semibold mb-3">للعائلة</h3>
              <p className="text-gray-600">ذكرى جميلة تجمع العائلة حولها</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl text-black font-semibold mb-3">للمناسبات</h3>
              <p className="text-gray-600">مثالية لأعياد الميلاد والمناسبات الخاصة</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">مميزات المنتج</h2>
            <p className="text-gray-600 text-sm sm:text-base">لماذا تختار كرة الموجات فوق الصوتية الخاصة بنا؟</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg text-black font-semibold mb-2">نقش عالي الجودة</h3>
              <p className="text-gray-600 text-sm">تقنية الليزر المتقدمة لضمان وضوح ودقة الصورة</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg text-black font-semibold mb-2">كريستال K9 فاخر</h3>
              <p className="text-gray-600 text-sm">مصنوع من أفضل أنواع الكريستال لضمان الشفافية واللمعان</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg text-black font-semibold mb-2">ضمان 60 يوم</h3>
              <p className="text-gray-600 text-sm">ضمان استرداد الأموال لمدة 60 يوم إذا لم تكن راضياً</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg text-black font-semibold mb-2">شحن مجاني</h3>
              <p className="text-gray-600 text-sm">شحن مجاني لجميع أنحاء الجزائر (توفير 750 دج)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">آراء عملائنا</h2>
            <p className="text-gray-700 text-base sm:text-lg">ما يقوله عملاؤنا عن كرة الموجات فوق الصوتية</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">&quot;منتج رائع جداً! الجودة ممتازة والنقش واضح جداً. أنصح به بشدة لكل أم تريد الاحتفاظ بذكرى جميلة.&quot;</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-pink-200 rounded-full flex items-center justify-center">
                  <span className="text-pink-600 font-bold">ف</span>
                </div>
                <div className="mr-3">
                  <div className="font-bold text-gray-900">فاطمة أحمد</div>
                  <div className="text-sm text-gray-600">الجزائر العاصمة</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">&quot;خدمة ممتازة وتوصيل سريع. الكرة جميلة جداً والتفاصيل واضحة. شكراً لكم على هذا المنتج الرائع.&quot;</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-pink-200 rounded-full flex items-center justify-center">
                  <span className="text-pink-600 font-bold">م</span>
                </div>
                <div className="mr-3">
                  <div className="font-bold text-gray-900">مريم بوعزة</div>
                  <div className="text-sm text-gray-600">وهران</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">&quot;هدية مثالية! اشتريت واحدة لزوجتي وواحدة لأمي. كلاهما سعيد جداً بالمنتج. أنصح به بشدة.&quot;</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-pink-200 rounded-full flex items-center justify-center">
                  <span className="text-pink-600 font-bold">ع</span>
                </div>
                <div className="mr-3">
                  <div className="font-bold text-gray-900">عبد الرحمن</div>
                  <div className="text-sm text-gray-600">قسنطينة</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">الأسئلة الشائعة</h2>
            <p className="text-gray-600 text-sm sm:text-base">إجابات على أكثر الأسئلة شيوعاً</p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">كيف يتم النقش على الكرة؟</h3>
              <p className="text-gray-600 text-sm sm:text-base">نستخدم تقنية الليزر المتقدمة لنقش صورة الموجات فوق الصوتية داخل الكرة الكريستالية، مما يضمن وضوح ودقة الصورة.</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">ما هي مدة التوصيل؟</h3>
              <p className="text-gray-600 text-sm sm:text-base">نقوم بالتوصيل خلال 3-5 أيام عمل لجميع أنحاء الجزائر. التوصيل مجاني لجميع الطلبات (توفير 750 دج لكل طلب).</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">هل يمكنني إرجاع المنتج؟</h3>
              <p className="text-gray-600 text-sm sm:text-base">نعم، لديك 60 يوم لإرجاع المنتج واسترداد الأموال إذا لم تكن راضياً عن الجودة.</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">ما هي أبعاد الكرة؟</h3>
              <p className="text-gray-600 text-sm sm:text-base">قطر الكرة 6 سم (2.36 بوصة) وهي مثالية للعرض في المنزل أو المكتب.</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">هل يمكنني طلب كمية كبيرة؟</h3>
              <p className="text-gray-600 text-sm sm:text-base">نعم، نقدم خصومات خاصة للكميات الكبيرة. اتصل بنا للحصول على عرض سعر مخصص.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">اتصل بنا</h2>
            <p className="text-gray-600 text-sm sm:text-base">نحن هنا لمساعدتك في أي وقت</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900">معلومات الاتصال</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-pink-500 ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700 text-sm sm:text-base">+213 555 123 456</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-pink-500 ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700 text-sm sm:text-base">info@ultrasound-orb.dz</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-pink-500 ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700 text-sm sm:text-base">الجزائر العاصمة، الجزائر</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900">ساعات العمل</h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm sm:text-base">السبت - الخميس:</span>
                  <span className="text-gray-700 text-sm sm:text-base font-medium">9:00 ص - 6:00 م</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm sm:text-base">الجمعة:</span>
                  <span className="text-red-500 text-sm sm:text-base font-medium">مغلق</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <Footer />

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Mobile-optimized camera interface */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-black bg-opacity-50 text-white p-4 flex justify-between items-center z-10">
              <h3 className="text-lg font-bold">التقاط صورة</h3>
              <button
                onClick={stopCamera}
                className="text-white hover:text-gray-300 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Camera/Image Area */}
            <div className="flex-1 relative">
              {capturedImage ? (
                <div className="w-full h-full flex flex-col">
                  <div className="flex-1 relative">
                    <Image 
                      src={capturedImage} 
                      alt="الصورة الملتقطة" 
                      width={400}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  <video
                    id="camera-video"
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    ref={(video) => {
                      if (video && cameraStream) {
                        video.srcObject = cameraStream
                      }
                    }}
                  />
                  
                  {/* Camera overlay with focus indicator */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-20 h-20 border-2 border-white rounded-lg opacity-50"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Bottom Controls */}
            <div className="bg-black bg-opacity-50 p-4">
              {capturedImage ? (
                <div className="flex gap-4">
                  <button
                    onClick={retakePhoto}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    إعادة التقاط
                  </button>
                  <button
                    onClick={useCapturedPhoto}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    استخدام هذه الصورة
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-8">
                  {/* Cancel Button */}
                  <button
                    onClick={stopCamera}
                    className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  {/* Capture Button */}
                  <button
                    onClick={capturePhoto}
                    className="bg-white hover:bg-gray-100 text-gray-800 p-6 rounded-full transition-colors shadow-lg"
                  >
                    <div className="w-12 h-12 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 bg-gray-800 rounded-full"></div>
                    </div>
                  </button>
                  
                  {/* Switch Camera Button (placeholder for future enhancement) */}
                  <button
                    onClick={() => {}}
                    className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-full transition-colors opacity-50"
                    disabled
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Order Button - Only show when form is empty or not submitted */}
      {!showSuccess && !isSubmitting && !hasStartedForm && (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
          <button
            onClick={() => {
              // Scroll to order form section
              document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })
              // Focus on name field after a short delay
              setTimeout(() => {
                const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement
                if (nameInput) {
                  nameInput.focus()
                }
              }, 500)
            }}
            className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-lg shadow-2xl transition-all transform hover:scale-105 text-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span> حوّل الصورة لذكرى خالدة </span>
            </div>
            <div className="text-sm opacity-90 mt-1">
              خصم 27% + توصيل مجاني
            </div>
          </button>
        </div>
      )}

    </div>
  )
}