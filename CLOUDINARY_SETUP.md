# Cloudinary Setup Guide

This guide will help you set up Cloudinary for image storage in your Ultrasound Orb website.

## 🚀 Quick Setup

### 1. Create Cloudinary Account

1. Go to [Cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your Credentials

1. Log into your Cloudinary dashboard
2. Go to **Dashboard** section
3. Copy the following values:
   - **Cloud Name** (e.g., `your-cloud-name`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### 3. Create Upload Preset

1. Go to your Cloudinary dashboard
2. Navigate to **Settings** → **Upload**
3. Scroll down to **Upload presets**
4. Click **Add upload preset**
5. Configure the preset:
   - **Preset name**: `storykids_unsigned`
   - **Signing Mode**: `Unsigned` (for client-side uploads)
   - **Folder**: `orders_photos`
   - **Tags**: `storykids,order,user-upload`
   - **Transformation**: `w_800,h_800,c_limit,q_auto,f_auto`
6. Click **Save**

### 4. Update Environment Variables

Edit your `.env.local` file and replace the placeholder values:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dulct8pma
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=storykids_unsigned
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

### 5. Update Supabase Database

Run the updated SQL schema in your Supabase project:

```sql
-- Add the new image_url column to existing orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Update existing records if needed
UPDATE orders SET image_url = image_path WHERE image_url IS NULL;
```

## 🎯 Features

### ✅ What Cloudinary Provides:

- **Automatic Image Optimization**: Images are automatically optimized for web delivery
- **Multiple Formats**: Automatically serves WebP, AVIF, or JPEG based on browser support
- **Responsive Images**: Different sizes for different screen sizes
- **CDN Delivery**: Fast global content delivery
- **Image Transformations**: Resize, crop, quality adjustment on-the-fly
- **Secure Uploads**: API key authentication for secure uploads

### 📸 Image Processing:

- **Upload Folder**: `orders_photos/`
- **Max Size**: 800x800 pixels (automatically resized)
- **Quality**: Auto-optimized for web
- **Format**: Auto (WebP/AVIF/JPEG based on browser)
- **Tags**: `storykids`, `order`, `user-upload`

## 🔧 Configuration Details

### Upload Settings:
```javascript
{
  folder: 'orders_photos',
  resource_type: 'auto',
  transformation: [
    {
      width: 800,
      height: 800,
      crop: 'limit',
      quality: 'auto',
      format: 'auto'
    }
  ],
  tags: ['storykids', 'order', 'user-upload']
}
```

### Optimized URL Generation:
```javascript
// Original URL
https://res.cloudinary.com/dulct8pma/image/upload/v1234567890/orders_photos/image.jpg

// Optimized URL (400x400, auto quality, auto format)
https://res.cloudinary.com/dulct8pma/image/upload/w_400,h_400,q_auto,f_auto/orders_photos/image.jpg
```

## 📊 Database Schema

The orders table now includes:

```sql
CREATE TABLE orders (
    -- ... other fields ...
    image_path VARCHAR(500),    -- Full Cloudinary URL
    image_url VARCHAR(500),     -- Optimized Cloudinary URL
    -- ... other fields ...
);
```

## 🧪 Testing

### 1. Test Upload:
1. Open your website
2. Fill out the order form
3. Upload an image
4. Submit the order
5. Check the database for the new URLs

### 2. Verify URLs:
- `image_path`: Full Cloudinary URL
- `image_url`: Optimized URL for display

### 3. Check Cloudinary Dashboard:
1. Go to your Cloudinary dashboard
2. Navigate to **Media Library**
3. Look for the `orders_photos` folder
4. Verify your uploaded images

## 🚨 Troubleshooting

### Common Issues:

1. **"Cloudinary cloud name not configured"**
   - Check your `.env.local` file
   - Ensure `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set

2. **"Invalid API credentials"**
   - Verify your API key and secret
   - Check for typos in the environment variables

3. **"Upload failed"**
   - Check your internet connection
   - Verify the image file is valid (JPG, PNG, etc.)
   - Check Cloudinary dashboard for upload limits

### Debug Mode:
Add this to your `.env.local` for debugging:
```env
CLOUDINARY_DEBUG=true
```

## 💰 Pricing

### Free Tier Includes:
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month
- 1,000 uploads/month

### Paid Plans:
- Start from $89/month for higher limits
- Pay-as-you-go options available

## 🔒 Security

### Best Practices:
1. **Never expose API Secret** in client-side code
2. **Use environment variables** for all credentials
3. **Set upload limits** in Cloudinary settings
4. **Use signed uploads** for production (optional)

### Upload Security:
- Images are uploaded directly from client to Cloudinary
- API key is public (safe for client-side use)
- API secret is server-side only (secure)

## 📈 Performance Benefits

### Before (Supabase Storage):
- Raw image files
- No optimization
- Limited CDN
- Manual resizing needed

### After (Cloudinary):
- ✅ Automatic optimization
- ✅ Global CDN delivery
- ✅ Multiple format support
- ✅ On-the-fly transformations
- ✅ Better performance
- ✅ Reduced bandwidth usage

## 🎉 You're All Set!

Your website now uses Cloudinary for professional image handling. Users will experience:
- Faster image loading
- Better image quality
- Automatic optimization
- Global CDN delivery

Test your setup by uploading an image through the order form!
