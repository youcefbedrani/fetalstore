// Client-side Cloudinary upload using fetch API
// This avoids Node.js modules that don't work in the browser

// Upload image to Cloudinary using client-side upload
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET


  if (!cloudName) {
    throw new Error('Cloudinary cloud name not configured')
  }

  if (!uploadPreset) {
    throw new Error('Cloudinary upload preset not configured')
  }

  // Validate file
  if (!file) {
    throw new Error('لم يتم اختيار صورة للرفع')
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    throw new Error('حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت')
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    throw new Error('نوع الملف غير مدعوم. يرجى اختيار صورة (JPG, PNG, WebP, GIF)')
  }

  // Create FormData for upload
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', 'orders_photos')
  formData.append('tags', 'storykids,order,user-upload')

  try {
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Provide more specific error messages
      if (response.status === 400) {
        throw new Error('خطأ في بيانات الصورة. يرجى التحقق من نوع وحجم الملف.')
      } else if (response.status === 401) {
        throw new Error('خطأ في إعدادات رفع الصور. يرجى المحاولة لاحقاً.')
      } else if (response.status === 403) {
        throw new Error('تم تجاوز حد رفع الصور. يرجى المحاولة لاحقاً.')
      } else if (response.status >= 500) {
        throw new Error('خطأ في الخادم. يرجى المحاولة لاحقاً.')
      } else {
        throw new Error(`فشل في رفع الصورة: ${errorData.error?.message || response.statusText}`)
      }
    }

    const result = await response.json()
    return result.secure_url
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('خطأ في الاتصال. يرجى التحقق من الإنترنت والمحاولة مرة أخرى.')
    }
    
    // Handle CORS errors
    if (error instanceof TypeError && error.message.includes('CORS')) {
      throw new Error('خطأ في إعدادات الأمان. يرجى المحاولة لاحقاً.')
    }
    
    // Handle network connectivity issues
    if (error instanceof TypeError && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
      throw new Error('خطأ في الاتصال. يرجى التحقق من الإنترنت والمحاولة مرة أخرى.')
    }
    
    // Re-throw our custom errors
    if (error instanceof Error && error.message.includes('خطأ')) {
      throw error
    }
    
    // Default error
    throw new Error('فشل في رفع الصورة. يرجى المحاولة مرة أخرى.')
  }
}

// Get optimized image URL with transformations
export const getOptimizedImageUrl = (
  cloudinaryUrl: string,
  width?: number,
  height?: number,
  quality: string = 'auto'
): string => {
  if (!cloudinaryUrl || !cloudinaryUrl.includes('cloudinary.com')) {
    return cloudinaryUrl
  }

  const transformations = []
  
  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  if (quality) transformations.push(`q_${quality}`)
  
  transformations.push('f_auto', 'c_limit')

  const baseUrl = cloudinaryUrl.split('/upload/')[0]
  const imagePath = cloudinaryUrl.split('/upload/')[1]
  
  return `${baseUrl}/upload/${transformations.join(',')}/${imagePath}`
}

// Get public ID from Cloudinary URL (for future admin use)
export const getPublicIdFromUrl = (url: string): string | null => {
  if (!url || !url.includes('cloudinary.com')) {
    return null
  }
  
  const parts = url.split('/')
  const filename = parts[parts.length - 1]
  const publicId = filename.split('.')[0]
  
  return `orders_photos/${publicId}`
}
