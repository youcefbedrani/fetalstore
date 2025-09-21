// Server-side Cloudinary upload using Next.js API route
// This bypasses CORS issues and network restrictions

export const uploadImageToCloudinaryServer = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Server upload failed: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.url) {
      throw new Error('Server upload failed: No URL returned');
    }

    return result.url;
  } catch (error) {
    console.error('Server-side upload error:', error);
    throw new Error(`خطأ في رفع الصورة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
  }
};
