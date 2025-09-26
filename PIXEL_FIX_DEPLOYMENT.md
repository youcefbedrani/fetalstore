# Meta Pixel Fix - Deployment Guide

## 🎯 Problem Fixed
Your Meta Pixel was detected but not properly activated because it was using a fallback value instead of your actual pixel ID `24528287270184892`.

## ✅ What I Fixed

### 1. **Pixel ID Hardcoded in Layout**
- **File**: `src/app/layout.tsx`
- **Change**: Replaced `process.env.NEXT_PUBLIC_META_PIXEL_ID || 'YOUR_PIXEL_ID'` with `'24528287270184892'`
- **Result**: Pixel now uses your actual ID instead of fallback

### 2. **Test Events Setup**
- **New Page**: `https://bidayagift.shop/test-events`
- **Features**: Send test events with your unique test code `TEST93223`
- **Purpose**: Verify pixel is working with Facebook's test events system

### 3. **Updated Test Script**
- **File**: `test-pixel-events.js`
- **Enhancement**: All test events now include `test_event_code: 'TEST93223'`
- **Usage**: Copy-paste in browser console to test events

## 🚀 How to Deploy the Fix

### Step 1: Deploy to Your Server
```bash
# SSH into your server
ssh root@185.97.146.104

# Navigate to your project
cd /var/www/fetalstore

# Pull the latest changes (if using git)
git pull origin main

# Or copy the updated files manually
# - src/app/layout.tsx
# - src/app/test-events/page.tsx
# - test-pixel-events.js

# Restart your containers
docker-compose -f docker-compose.simple.yml down
docker-compose -f docker-compose.simple.yml --env-file .env.production up -d
```

### Step 2: Update Environment Variables (Optional)
```bash
# Edit your environment file
nano .env.production

# Add or update this line:
NEXT_PUBLIC_META_PIXEL_ID=24528287270184892

# Save and restart containers
docker-compose -f docker-compose.simple.yml down
docker-compose -f docker-compose.simple.yml --env-file .env.production up -d
```

## 🧪 How to Test the Fix

### Method 1: Test Events Page (Recommended)
1. **Visit**: `https://bidayagift.shop/test-events`
2. **Enter Test Code**: `TEST93223` (or your current test code from Facebook)
3. **Click**: "Send All Test Events"
4. **Check**: Facebook Events Manager for the events

### Method 2: Browser Console
1. **Open**: Browser console (F12)
2. **Copy-Paste**: The content of `test-pixel-events.js`
3. **Run**: `testAllEventsWithCode("TEST93223")`
4. **Check**: Facebook Events Manager

### Method 3: Meta Pixel Helper
1. **Install**: [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
2. **Visit**: `https://bidayagift.shop`
3. **Check**: Should show pixel ID `24528287270184892` and PageView event
4. **Verify**: No more warnings about pixel not being activated

## 🔍 What to Look For

### ✅ Success Indicators
- **Meta Pixel Helper**: Shows pixel ID `24528287270184892` without warnings
- **Facebook Events Manager**: Shows test events with your test code
- **Browser Console**: Shows success messages when sending test events
- **No Warnings**: Pixel Helper no longer shows "pixel has not been activated"

### ❌ If Still Not Working
1. **Check Environment Variables**: Ensure `NEXT_PUBLIC_META_PIXEL_ID=24528287270184892`
2. **Restart Containers**: After any environment changes
3. **Clear Browser Cache**: Hard refresh (Ctrl+F5)
4. **Check Console Errors**: Look for JavaScript errors

## 📊 Expected Results

### Before Fix:
- ❌ Pixel detected but not activated
- ❌ Warning: "pixel has not been activated for this event"
- ❌ No data sent to Meta

### After Fix:
- ✅ Pixel properly activated with correct ID
- ✅ Events sent to Meta successfully
- ✅ Test events appear in Facebook Events Manager
- ✅ No warnings in Meta Pixel Helper

## 🎯 Test Events You Can Send

### With Test Code TEST93223:
```javascript
// PageView
fbq('track', 'PageView', {
  page_title: 'Test Page',
  page_location: window.location.href,
  test_event_code: 'TEST93223'
});

// Purchase
fbq('track', 'Purchase', {
  value: 5000,
  currency: 'DZD',
  content_name: 'كرة الموجات فوق الصوتية',
  content_category: 'هدايا',
  content_ids: ['ultrasound-orb'],
  num_items: 1,
  order_id: 'test_order_123',
  test_event_code: 'TEST93223'
});
```

## 🚀 Next Steps

1. **Deploy the fix** to your server
2. **Test using the test events page**
3. **Verify in Facebook Events Manager**
4. **Once confirmed working**, you can:
   - Launch Facebook/Instagram ad campaigns
   - Set up conversion tracking
   - Optimize ad delivery based on pixel data

## 📞 Support

If you need help:
1. Check the test events page: `https://bidayagift.shop/test-events`
2. Use the browser console script: `test-pixel-events.js`
3. Verify in Facebook Events Manager
4. Check Meta Pixel Helper for any remaining issues

---

**The pixel should now work correctly and send data to Meta!** 🎉
