# Meta Pixel Testing Checklist

## 🎯 Quick Testing Steps

### 1. Install Meta Pixel Helper
- [ ] Install [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) Chrome extension
- [ ] Pin the extension to your toolbar
- [ ] Visit your website: `https://bidayagift.shop`

### 2. Verify Pixel Installation
- [ ] Click Meta Pixel Helper icon
- [ ] Should see your pixel ID (e.g., `123456789012345`)
- [ ] Should see "PageView" event automatically fired
- [ ] No error messages in the helper

### 3. Test All Events
Visit your test page: `https://bidayagift.shop/pixel-test`

- [ ] **PageView**: Click "PageView" button
- [ ] **ViewContent**: Click "ViewContent" button  
- [ ] **AddToCart**: Click "AddToCart" button
- [ ] **InitiateCheckout**: Click "InitiateCheckout" button
- [ ] **Purchase**: Click "Purchase" button

### 4. Verify in Meta Pixel Helper
For each test event:
- [ ] Event appears in Meta Pixel Helper
- [ ] Event shows correct parameters
- [ ] Event has recent timestamp
- [ ] No duplicate events

### 5. Check Facebook Events Manager
- [ ] Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
- [ ] Select your pixel
- [ ] Check "Test Events" tab
- [ ] Verify events appear in real-time

## 🧪 Manual Testing Methods

### Method 1: Test Page (Recommended)
1. Visit: `https://bidayagift.shop/pixel-test`
2. Use the test buttons to fire events
3. Monitor Meta Pixel Helper
4. Check Facebook Events Manager

### Method 2: Browser Console
1. Open browser console (F12)
2. Copy and paste the test script from `test-pixel-events.js`
3. Run `testAllEvents()` to test all events
4. Run `checkPixelStatus()` to verify pixel setup

### Method 3: Real User Flow
1. Go through complete order process
2. Fill out form with test data
3. Complete purchase
4. Verify Purchase event fires with correct data

## 🔍 What to Look For

### ✅ Success Indicators
- Meta Pixel Helper shows your pixel ID
- Events appear with correct names
- Event parameters match expected values
- No error messages
- Events appear in Facebook Events Manager
- Console shows success messages

### ❌ Common Issues
- **"No pixel detected"**: Check environment variables
- **Events not firing**: Check JavaScript console for errors
- **Duplicate events**: Implement event deduplication
- **Wrong parameters**: Verify event data structure

## 📊 Event Parameters to Verify

### PageView Event
```javascript
{
  page_title: "Page Title",
  page_location: "https://bidayagift.shop"
}
```

### ViewContent Event
```javascript
{
  content_name: "كرة الموجات فوق الصوتية",
  content_category: "هدايا",
  content_ids: ["ultrasound-orb"],
  value: 5000,
  currency: "DZD"
}
```

### AddToCart Event
```javascript
{
  content_name: "كرة الموجات فوق الصوتية",
  content_category: "هدايا", 
  content_ids: ["ultrasound-orb"],
  value: 5000,
  currency: "DZD",
  num_items: 1
}
```

### InitiateCheckout Event
```javascript
{
  content_name: "كرة الموجات فوق الصوتية",
  content_category: "هدايا",
  content_ids: ["ultrasound-orb"],
  value: 5000,
  currency: "DZD",
  num_items: 1
}
```

### Purchase Event
```javascript
{
  value: 5000,
  currency: "DZD",
  content_name: "كرة الموجات فوق الصوتية",
  content_category: "هدايا",
  content_ids: ["ultrasound-orb"],
  num_items: 1,
  order_id: "unique_order_id"
}
```

## 🛠️ Troubleshooting

### Pixel Not Loading
1. Check environment variables:
   ```bash
   ssh root@185.97.146.104
   cd /var/www/fetalstore
   cat .env.production | grep META_PIXEL
   ```

2. Restart containers:
   ```bash
   docker-compose -f docker-compose.simple.yml down
   docker-compose -f docker-compose.simple.yml --env-file .env.production up -d
   ```

3. Check browser console for errors

### Events Not Firing
1. Verify pixel is loaded: `console.log(window.fbq)`
2. Check for JavaScript errors
3. Test with browser console script
4. Verify event parameters

### Duplicate Events
1. Check for multiple event listeners
2. Implement event deduplication
3. Use unique order IDs
4. Monitor event frequency

## 📱 Cross-Device Testing

### Desktop Testing
- [ ] Chrome with Meta Pixel Helper
- [ ] Firefox with Meta Pixel Helper
- [ ] Safari (if available)
- [ ] Edge

### Mobile Testing
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Mobile Meta Pixel Helper (if available)
- [ ] Test on actual mobile devices

## 🔒 Privacy & Compliance Testing

### GDPR Compliance
- [ ] Test with cookie consent banners
- [ ] Verify pixel doesn't fire before consent
- [ ] Test opt-out functionality
- [ ] Check privacy policy mentions pixel

### Ad Blocker Testing
- [ ] Test with ad blockers enabled
- [ ] Implement fallback tracking
- [ ] Monitor blocked requests
- [ ] Test with different ad blockers

## 📈 Performance Testing

### Load Time Impact
- [ ] Measure page load time with pixel
- [ ] Test pixel performance
- [ ] Monitor for slow responses
- [ ] Optimize if needed

### Event Performance
- [ ] Measure event firing time
- [ ] Test with slow connections
- [ ] Monitor for timeouts
- [ ] Implement retry logic

## 🎯 Production Readiness

### Before Going Live
- [ ] All events tested and working
- [ ] No JavaScript errors
- [ ] Events appear in Facebook Events Manager
- [ ] Cross-browser compatibility verified
- [ ] Mobile testing completed
- [ ] Performance acceptable
- [ ] Privacy compliance implemented

### Monitoring Setup
- [ ] Set up event monitoring
- [ ] Create alerts for pixel failures
- [ ] Regular testing schedule
- [ ] Performance monitoring

## 📞 Support Resources

### Facebook Resources
- [Facebook Business Help Center](https://www.facebook.com/business/help)
- [Meta Pixel Documentation](https://developers.facebook.com/docs/facebook-pixel/)
- [Facebook Marketing Community](https://www.facebook.com/groups/facebookmarketing/)

### Your Implementation
- Test Page: `https://bidayagift.shop/pixel-test`
- Test Script: `test-pixel-events.js`
- Debug Component: `PixelDebugger.tsx`
- Testing Guide: `META_PIXEL_TESTING_GUIDE.md`

## 🎉 Success Criteria

Your Meta Pixel is working correctly when:
- ✅ All events fire without errors
- ✅ Events appear in Meta Pixel Helper
- ✅ Events show in Facebook Events Manager
- ✅ Event parameters are accurate
- ✅ No duplicate events
- ✅ Cross-browser compatibility
- ✅ Mobile functionality
- ✅ Performance is acceptable

---

**Next Steps**: Once all tests pass, you can confidently launch Facebook and Instagram ad campaigns knowing your pixel will accurately track conversions and optimize your ad delivery.
