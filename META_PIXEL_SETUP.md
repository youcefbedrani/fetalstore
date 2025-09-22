# Meta Pixel Setup Guide for bidayagift.shop

## 🎯 Overview
This guide will help you set up Meta Pixel (Facebook Pixel) for tracking conversions from your Facebook and Instagram ads.

## 📋 Prerequisites
- Facebook Business Manager account
- Facebook Page for your business
- Access to Facebook Ads Manager

## 🚀 Step-by-Step Setup

### 1. Create Meta Pixel
1. Go to [Facebook Business Manager](https://business.facebook.com/)
2. Navigate to **Events Manager** → **Data Sources** → **Pixels**
3. Click **"Create a Pixel"**
4. Name your pixel: `bidayagift-pixel`
5. Enter your website URL: `https://bidayagift.shop`
6. Click **"Create"**

### 2. Get Your Pixel ID
1. After creating the pixel, you'll see your **Pixel ID** (looks like: `123456789012345`)
2. Copy this ID - you'll need it for the next step

### 3. Add Pixel ID to Your Server
1. SSH into your VPS:
   ```bash
   ssh root@185.97.146.104
   ```

2. Navigate to your project:
   ```bash
   cd /var/www/fetalstore
   ```

3. Edit your environment file:
   ```bash
   nano .env.production
   ```

4. Add your Meta Pixel ID:
   ```bash
   # Meta Pixel Configuration
   NEXT_PUBLIC_META_PIXEL_ID=123456789012345
   ```
   (Replace `123456789012345` with your actual Pixel ID)

5. Save and exit (Ctrl+X, then Y, then Enter)

6. Restart your containers:
   ```bash
   docker-compose -f docker-compose.simple.yml down
   docker-compose -f docker-compose.simple.yml --env-file .env.production up -d
   ```

### 4. Verify Pixel Installation
1. Install [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) Chrome extension
2. Visit your website: `https://bidayagift.shop`
3. Click the Pixel Helper extension icon
4. You should see:
   - ✅ **PageView** event fired
   - ✅ Pixel ID matches your configuration

### 5. Test Purchase Tracking
1. Place a test order on your website
2. Check the Pixel Helper - you should see:
   - ✅ **Purchase** event fired
   - ✅ Event includes value, currency, and product details

## 📊 Events Being Tracked

### Automatic Events
- **PageView**: Tracks when someone visits your website
- **Purchase**: Tracks when someone completes an order

### Purchase Event Details
- **Value**: Order total in DZD
- **Currency**: DZD (Algerian Dinar)
- **Content Name**: "كرة الموجات فوق الصوتية"
- **Content Category**: "هدايا"
- **Content IDs**: ["ultrasound-orb"]
- **Num Items**: Quantity ordered

## 🎯 Creating Facebook Ads

### 1. Create Conversion Campaign
1. Go to [Facebook Ads Manager](https://ads.facebook.com/)
2. Click **"Create"**
3. Choose **"Conversions"** as your campaign objective
4. Select your pixel: `bidayagift-pixel`
5. Choose **"Purchase"** as your conversion event

### 2. Set Up Ad Set
1. **Audience**: Target people in Algeria
2. **Placements**: Facebook and Instagram feeds
3. **Budget**: Start with $5-10/day
4. **Bidding**: Optimize for conversions

### 3. Create Ad Creative
1. **Format**: Single image or carousel
2. **Images**: Use your product photos
3. **Text**: Highlight the unique value proposition
4. **Call-to-Action**: "Shop Now" or "Learn More"

## 🔍 Monitoring Performance

### Key Metrics to Track
- **Purchase Conversions**: Number of orders from ads
- **Cost Per Purchase**: How much you pay per order
- **Return on Ad Spend (ROAS)**: Revenue generated per dollar spent
- **Conversion Rate**: Percentage of visitors who purchase

### Facebook Ads Manager Reports
1. Go to **Ads Manager** → **Campaigns**
2. Add columns for:
   - Purchases
   - Cost per Purchase
   - ROAS
   - Conversion Rate

## 🛠️ Troubleshooting

### Pixel Not Firing
1. Check if `NEXT_PUBLIC_META_PIXEL_ID` is set correctly
2. Verify containers are restarted after environment changes
3. Check browser console for JavaScript errors
4. Use Facebook Pixel Helper to debug

### Purchase Events Not Tracking
1. Ensure the order completion flow works correctly
2. Check if `fbq('track', 'Purchase')` is being called
3. Verify the purchase event includes all required parameters

### Low Conversion Tracking
1. Check if your pixel is properly installed
2. Verify your conversion window settings
3. Ensure your ads are driving quality traffic

## 📈 Optimization Tips

### 1. Audience Optimization
- Create lookalike audiences based on your customers
- Use interest targeting for gift buyers
- Retarget website visitors who didn't purchase

### 2. Creative Optimization
- Test different images and videos
- A/B test ad copy and headlines
- Use dynamic product ads for retargeting

### 3. Landing Page Optimization
- Ensure fast loading times
- Optimize for mobile devices
- Use clear call-to-action buttons

## 🔒 Privacy Compliance

### GDPR Compliance
- Add cookie consent banner
- Provide opt-out options
- Update privacy policy

### Data Protection
- Only collect necessary data
- Secure data transmission
- Regular security audits

## 📞 Support

If you need help with Meta Pixel setup:
1. Check [Facebook Business Help Center](https://www.facebook.com/business/help)
2. Contact Facebook Business Support
3. Join Facebook Marketing Community groups

## 🎉 Success Metrics

Your Meta Pixel is working correctly when you see:
- ✅ PageView events in Events Manager
- ✅ Purchase events when orders are placed
- ✅ Accurate conversion tracking in Ads Manager
- ✅ Proper attribution of sales to ad campaigns

---

**Note**: Always test your pixel implementation before launching major ad campaigns to ensure accurate tracking and optimization.
