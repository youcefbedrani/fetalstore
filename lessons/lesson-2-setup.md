# Lesson 2: Generate Pixel ID and Setup in Meta Business Suite

## 🎯 Learning Objectives

By the end of this lesson, you will be able to:
- Create a Meta Business account
- Set up Facebook Business Manager
- Generate your Pixel ID
- Configure pixel settings
- Understand pixel verification process

## 🏢 Setting Up Meta Business Account

### Step 1: Create Meta Business Account

1. **Go to** [business.facebook.com](https://business.facebook.com)
2. **Click** "Create Account"
3. **Enter** your business information:
   - Business name
   - Your name
   - Business email
   - Business phone number

### Step 2: Verify Your Business

Meta will ask you to verify your business through:
- **Email verification**
- **Phone number verification**
- **Business documentation** (if required)

## 🔧 Facebook Business Manager Setup

### Step 1: Access Business Manager

1. **Log in** to [business.facebook.com](https://business.facebook.com)
2. **Navigate** to "Business Settings" (gear icon)
3. **Review** your business information

### Step 2: Add Your Website

1. **Go to** "Brand Safety" → "Domains"
2. **Click** "Add" to add your website domain
3. **Enter** your domain (e.g., `yourstore.com`)
4. **Verify** domain ownership (we'll cover this later)

## 📊 Creating Your Pixel

### Step 1: Navigate to Events Manager

1. **Go to** [facebook.com/events_manager](https://facebook.com/events_manager)
2. **Select** your business account
3. **Click** "Connect Data Sources"
4. **Choose** "Web"

### Step 2: Configure Your Pixel

1. **Enter** your website URL
2. **Choose** "Facebook Pixel" as the integration method
3. **Name** your pixel (e.g., "My Store Pixel")
4. **Click** "Create"

### Step 3: Get Your Pixel ID

After creating your pixel, you'll see:
- **Pixel ID**: A 15-16 digit number (e.g., `123456789012345`)
- **Base Code**: JavaScript code to install
- **Event Setup Tool**: For easy event configuration

## 🔧 Pixel Configuration

### Basic Settings

```javascript
// Your pixel will look like this:
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', 'YOUR_PIXEL_ID'); // Replace with your actual Pixel ID
fbq('track', 'PageView');
```

### Advanced Settings

1. **Go to** your pixel in Events Manager
2. **Click** "Settings" tab
3. **Configure**:
   - **Automatic Advanced Matching**: Match users across devices
   - **Conversions API**: Server-side tracking (advanced)
   - **Data Processing Options**: GDPR compliance settings

## 🎯 Event Configuration

### Standard E-commerce Events

In Events Manager, you can set up:

1. **PageView**: Automatic page tracking
2. **ViewContent**: Product page views
3. **AddToCart**: Add to cart button clicks
4. **InitiateCheckout**: Checkout process start
5. **Purchase**: Completed transactions

### Event Parameters

For e-commerce events, you'll need:

```javascript
// Example: Purchase event
fbq('track', 'Purchase', {
  value: 25.00,
  currency: 'USD',
  content_ids: ['product_123'],
  content_type: 'product'
});
```

## 🔍 Domain Verification

### Why Verify Your Domain?

Domain verification:
- **Prevents** unauthorized pixel usage
- **Enables** advanced matching
- **Improves** data quality
- **Required** for some ad features

### Verification Methods

1. **HTML File Upload**:
   - Download verification file
   - Upload to your website root
   - Confirm in Business Manager

2. **DNS TXT Record**:
   - Add TXT record to your DNS
   - Verify in Business Manager

3. **Meta Tag**:
   - Add meta tag to your website
   - Verify in Business Manager

## 📱 Mobile App Integration (Optional)

If you have a mobile app:

1. **Go to** Events Manager
2. **Click** "Connect Data Sources"
3. **Choose** "App"
4. **Select** your app platform (iOS/Android)
5. **Follow** the setup instructions

## 🔒 Privacy and Compliance

### GDPR Settings

1. **Go to** Pixel Settings
2. **Enable** "Data Processing Options"
3. **Configure**:
   - **Country**: Select your country
   - **State**: Select your state (if applicable)
   - **Data Processing Terms**: Accept Meta's terms

### Cookie Consent Integration

```javascript
// Example: Conditional pixel loading
function loadFacebookPixel() {
  if (hasUserConsent()) {
    // Load pixel code here
    fbq('init', 'YOUR_PIXEL_ID');
  }
}
```

## 🧪 Testing Your Pixel

### Test Events

1. **Go to** Events Manager
2. **Click** "Test Events" tab
3. **Visit** your website
4. **Perform** actions (view products, add to cart)
5. **Verify** events appear in real-time

### Common Issues

- **Pixel not firing**: Check if code is properly installed
- **Events not showing**: Verify event names and parameters
- **Delayed events**: Some events may take time to appear

## 📋 Checklist

Before moving to the next lesson, ensure you have:

- ✅ Meta Business account created
- ✅ Facebook Business Manager set up
- ✅ Pixel created and ID obtained
- ✅ Domain added to Business Manager
- ✅ Basic pixel settings configured
- ✅ Test events working

## 🎯 Your Pixel ID

**Important**: Save your Pixel ID! You'll need it for the Next.js implementation.

Your Pixel ID format: `123456789012345`

## 🚀 Next Steps

In the next lesson, we'll integrate your pixel into a Next.js project with TypeScript.

---

**Ready for Lesson 3?** [Add Pixel Code to Next.js Project with TypeScript →](./lesson-3-nextjs-integration.md)
