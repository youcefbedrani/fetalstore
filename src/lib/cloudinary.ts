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

  // Create FormData for upload
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', 'orders_photos')
  formData.append('tags', 'storykids,order,user-upload')

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Cloudinary upload error details:', errorData)
      throw new Error(`Upload failed: ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`)
    }

    const result = await response.json()
    return result.secure_url
  } catch (error) {
    console.error('Cloudinary upload error:', error)
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
