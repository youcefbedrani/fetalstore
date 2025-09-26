# Meta Pixel Testing & Verification Guide

## 🎯 Overview
This comprehensive guide will help you test and verify that your Meta Pixel is working correctly with test events and real user interactions.

## 🔧 Testing Tools You Need

### 1. Meta Pixel Helper (Essential)
- **Chrome Extension**: [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
- **Firefox Add-on**: [Meta Pixel Helper](https://addons.mozilla.org/en-US/firefox/addon/meta-pixel-helper/)

### 2. Facebook Events Manager
- Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
- Select your pixel
- View real-time events

### 3. Browser Developer Tools
- Network tab to see pixel requests
- Console for debugging JavaScript

## 🧪 Testing Methods

### Method 1: Real User Testing (Recommended)

#### Step 1: Install Meta Pixel Helper
1. Install the browser extension
2. Visit your website: `https://bidayagift.shop`
3. Click the Meta Pixel Helper icon
4. You should see your pixel ID and events

#### Step 2: Test PageView Event
1. **Expected Result**: PageView event should fire automatically
2. **Check**: Meta Pixel Helper shows "PageView" event
3. **Verify**: Event appears in Facebook Events Manager

#### Step 3: Test Purchase Event
1. Go through the complete order process
2. Fill out the form with test data
3. Complete the purchase
4. **Expected Result**: Purchase event should fire with:
   - Value: Order total in DZD
   - Currency: DZD
   - Content details
   - Order ID

#### Step 4: Test Other Events
Your website tracks these events:
- **ViewContent**: When page loads
- **AddToCart**: When quantity is selected
- **InitiateCheckout**: When form is submitted
- **Purchase**: When order is completed

### Method 2: Test Events (Facebook's Built-in Testing)

#### Step 1: Access Test Events
1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Select your pixel
3. Click "Test Events" tab
4. Click "Send Test Event"

#### Step 2: Send Test Events
You can send these test events:

```javascript
// Test PageView
fbq('track', 'PageView');

// Test ViewContent
fbq('track', 'ViewContent', {
  content_name: 'كرة الموجات فوق الصوتية',
  content_category: 'هدايا',
  content_ids: ['ultrasound-orb'],
  value: 5000,
  currency: 'DZD'
});

// Test AddToCart
fbq('track', 'AddToCart', {
  content_name: 'كرة الموجات فوق الصوتية',
  content_category: 'هدايا',
  content_ids: ['ultrasound-orb'],
  value: 5000,
  currency: 'DZD',
  num_items: 1
});

// Test InitiateCheckout
fbq('track', 'InitiateCheckout', {
  content_name: 'كرة الموجات فوق الصوتية',
  content_category: 'هدايا',
  content_ids: ['ultrasound-orb'],
  value: 5000,
  currency: 'DZD',
  num_items: 1
});

// Test Purchase
fbq('track', 'Purchase', {
  value: 5000,
  currency: 'DZD',
  content_name: 'كرة الموجات فوق الصوتية',
  content_category: 'هدايا',
  content_ids: ['ultrasound-orb'],
  num_items: 1,
  order_id: 'test_order_123'
});
```

### Method 3: Browser Console Testing

#### Step 1: Open Developer Tools
1. Press F12 or right-click → Inspect
2. Go to Console tab

#### Step 2: Test Pixel Availability
```javascript
// Check if pixel is loaded
console.log('Pixel available:', typeof window.fbq !== 'undefined');

// Check pixel ID
console.log('Pixel ID:', process.env.NEXT_PUBLIC_META_PIXEL_ID);

// Test event manually
if (window.fbq) {
  window.fbq('track', 'PageView');
  console.log('Test PageView event sent');
}
```

#### Step 3: Monitor Network Requests
1. Go to Network tab
2. Filter by "facebook" or "fb"
3. Look for requests to:
   - `connect.facebook.net/en_US/fbevents.js`
   - `facebook.com/tr` (tracking endpoint)

## 🔍 What to Look For

### ✅ Success Indicators

#### Meta Pixel Helper Should Show:
- Your pixel ID (e.g., `123456789012345`)
- Events list with timestamps
- Event parameters (value, currency, etc.)
- No error messages

#### Facebook Events Manager Should Show:
- Real-time events appearing
- Event details with correct parameters
- No duplicate events
- Proper attribution

#### Browser Console Should Show:
- No JavaScript errors
- Success messages like "✅ Meta Pixel Purchase event tracked successfully"
- No "❌" error messages

### ❌ Common Issues

#### Pixel Not Loading
- **Symptom**: Meta Pixel Helper shows "No pixel detected"
- **Cause**: Missing or incorrect pixel ID
- **Solution**: Check `NEXT_PUBLIC_META_PIXEL_ID` in environment variables

#### Events Not Firing
- **Symptom**: Pixel loads but no events appear
- **Cause**: JavaScript errors or incorrect event calls
- **Solution**: Check browser console for errors

#### Duplicate Events
- **Symptom**: Same event appears multiple times
- **Cause**: Event listeners not properly cleaned up
- **Solution**: Implement event deduplication

## 🛠️ Debugging Your Current Implementation

### Check Your Environment Variables
```bash
# SSH into your server
ssh root@185.97.146.104

# Check if pixel ID is set
cd /var/www/fetalstore
cat .env.production | grep META_PIXEL
```

### Verify Pixel Loading
1. Visit your website
2. Open browser console
3. Type: `console.log(window.fbq)`
4. Should return a function, not undefined

### Test Event Firing
1. Complete a test order
2. Check console for success messages
3. Verify events appear in Meta Pixel Helper

## 📊 Testing Checklist

### Before Going Live:
- [ ] Meta Pixel Helper installed and working
- [ ] Pixel ID correctly configured
- [ ] PageView event fires on page load
- [ ] ViewContent event fires with correct parameters
- [ ] AddToCart event fires when quantity selected
- [ ] InitiateCheckout event fires on form submission
- [ ] Purchase event fires on order completion
- [ ] All events appear in Facebook Events Manager
- [ ] No duplicate events
- [ ] No JavaScript errors in console
- [ ] Events work on mobile devices
- [ ] Events work in different browsers

### Test Data to Use:
```javascript
// Test order data
{
  name: "Test User",
  phone: "0555123456",
  address: "Test Address, Algiers",
  quantity: 1,
  total: 5000
}
```

## 🚀 Advanced Testing

### A/B Testing Pixel Events
```javascript
// Test different event parameters
const testEventVariations = [
  {
    value: 5000,
    currency: 'DZD',
    content_name: 'كرة الموجات فوق الصوتية'
  },
  {
    value: 10000,
    currency: 'DZD', 
    content_name: 'كرة الموجات فوق الصوتية',
    num_items: 2
  }
];

// Test each variation
testEventVariations.forEach((params, index) => {
  setTimeout(() => {
    window.fbq('track', 'Purchase', params);
    console.log(`Test event ${index + 1} sent`);
  }, index * 1000);
});
```

### Performance Testing
```javascript
// Measure pixel performance
const startTime = performance.now();

window.fbq('track', 'Purchase', {
  value: 5000,
  currency: 'DZD'
}, {
  eventCallback: () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`Pixel event completed in ${duration}ms`);
  }
});
```

## 🔒 Privacy & Compliance Testing

### GDPR Compliance
- Test with cookie consent banners
- Verify pixel doesn't fire before consent
- Test opt-out functionality

### Ad Blocker Testing
- Test with ad blockers enabled
- Implement fallback tracking
- Monitor blocked requests

## 📈 Monitoring & Maintenance

### Daily Checks:
- [ ] Events appearing in Facebook Events Manager
- [ ] No error spikes in console
- [ ] Purchase events matching actual orders

### Weekly Checks:
- [ ] Review event parameters accuracy
- [ ] Check for duplicate events
- [ ] Verify conversion tracking accuracy

### Monthly Checks:
- [ ] Update pixel code if needed
- [ ] Review and optimize event parameters
- [ ] Analyze pixel performance metrics

## 🆘 Troubleshooting Common Issues

### Issue: "Pixel not detected"
**Solution:**
1. Check if `NEXT_PUBLIC_META_PIXEL_ID` is set
2. Restart your containers after environment changes
3. Clear browser cache and cookies

### Issue: "Events not appearing"
**Solution:**
1. Check browser console for JavaScript errors
2. Verify event parameters are correct
3. Test with Facebook's Test Events tool

### Issue: "Duplicate events"
**Solution:**
1. Implement event deduplication
2. Check for multiple event listeners
3. Use unique order IDs

## 📞 Getting Help

### Facebook Resources:
- [Facebook Business Help Center](https://www.facebook.com/business/help)
- [Meta Pixel Documentation](https://developers.facebook.com/docs/facebook-pixel/)
- [Facebook Marketing Community](https://www.facebook.com/groups/facebookmarketing/)

### Your Implementation Status:
✅ Pixel code installed in layout.tsx
✅ Purchase event implemented
✅ ViewContent event implemented  
✅ AddToCart event implemented
✅ InitiateCheckout event implemented
✅ Error handling included
✅ Retry mechanism for failed events

## 🎉 Success Metrics

Your Meta Pixel is working correctly when you see:
- ✅ Real-time events in Facebook Events Manager
- ✅ Accurate conversion tracking
- ✅ Proper attribution of sales to ad campaigns
- ✅ No technical errors or issues
- ✅ Consistent event firing across all user actions

---

**Next Steps**: Once testing is complete, you can confidently launch Facebook and Instagram ad campaigns knowing your pixel will accurately track conversions and optimize your ad delivery.
