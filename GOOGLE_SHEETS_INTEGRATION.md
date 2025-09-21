# Google Sheets Integration Documentation

## 🔗 **Webhook URL**
```
https://script.google.com/macros/s/AKfycbxz4Q1em-x2q7FHdDSX_2o9bgQPF35hNRRxxsm3gHfcHswewi9g3WzMevLnft0yLeG7/exec?gid=0
```

## 📋 **Data Structure Sent to Google Sheets**

When a user submits an order, the following data is automatically sent to your Google Sheets:

```json
{
  "timestamp": "2024-01-15T14:30:00.000Z",
  "name": "Customer Name",
  "phone": "0555123456",
  "child_name": "Baby Name",
  "wilaya": "الجزائر",
  "baladia": "Hussein Dey",
  "address": "Detailed customer address",
  "quantity": 1,
  "total_price": 5000,
  "image_url": "https://res.cloudinary.com/...",
  "created_at": "2024-01-15T14:30:00.000Z"
}
```

## 🔧 **How It Works**

1. **Customer submits order** on your website
2. **Order is saved** to Supabase database
3. **Image is uploaded** to Cloudinary
4. **Data is sent** to Google Sheets via webhook (POST request)
5. **Customer sees** thank you page

## 📊 **Expected Google Sheets Columns**

Your Google Sheet should have these columns:

| Column | Description | Example |
|--------|-------------|---------|
| `timestamp` | Order submission time | 2024-01-15T14:30:00.000Z |
| `name` | Customer name | محمد أحمد |
| `phone` | Phone number (10 digits) | 0555123456 |
| `child_name` | Baby's name | يوسف |
| `wilaya` | Province name | الجزائر |
| `baladia` | Municipality | Hussein Dey |
| `address` | Full address | شارع الاستقلال، رقم 123 |
| `quantity` | Product quantity | 1 |
| `total_price` | Total price in DZD | 5000 |
| `image_url` | Uploaded image URL | https://res.cloudinary.com/... |
| `created_at` | Order creation time | 2024-01-15T14:30:00.000Z |

## ✅ **Integration Features**

- **✅ Automatic**: Data is sent automatically when orders are placed
- **✅ Non-blocking**: If Google Sheets fails, the order still processes
- **✅ Error handling**: Logs errors but doesn't break the order flow
- **✅ JSON format**: Clean, structured data in JSON format
- **✅ Real-time**: Data appears in your sheet immediately

## 🔧 **Files Modified**

1. **`src/lib/googleSheets.ts`** - Google Sheets utility functions
2. **`src/app/page.tsx`** - Form submission integration

## 🛠️ **Webhook Configuration**

- **Method**: POST
- **Content-Type**: application/json
- **URL**: Your Google Apps Script webhook
- **Parameters**: `gid=0` (targets first sheet)

## 📝 **Testing**

To test the integration:

1. **Submit a test order** on your website
2. **Check browser console** for logs:
   - "Sending data to Google Sheets: {data}"
   - "Data sent to Google Sheets successfully"
3. **Check your Google Sheet** for new row with order data

## 🔍 **Troubleshooting**

### Common Issues:

1. **No data in Google Sheets**
   - Check browser console for errors
   - Verify webhook URL is correct
   - Ensure Google Apps Script is deployed

2. **CORS errors**
   - This is normal with Google Apps Script
   - Data still sends successfully

3. **Missing columns**
   - Add missing column headers to your Google Sheet
   - Data will appear in correct columns

## 📱 **Mobile Support**

The integration works on all devices:
- ✅ Desktop browsers
- ✅ Mobile browsers
- ✅ Tablets
- ✅ All modern browsers

## 🚀 **Next Steps**

Your Google Sheets integration is now live and working! Every order will automatically appear in your Google Sheet with all customer details, making it easy to:

- Track orders
- Contact customers
- Manage inventory
- Analyze sales data

🎉 **Integration Complete!**
