# Google Sheets Integration Setup

## Current Status
✅ Orders are being saved to Supabase successfully  
❌ Google Apps Script webhook is not working (returns "Moved Temporarily")  
✅ Data is being logged in console for manual entry  

## Quick Solutions

### Option 1: Use Zapier (Recommended)
1. Go to [Zapier.com](https://zapier.com)
2. Create a new Zap
3. Choose "Webhooks" as trigger
4. Choose "Google Sheets" as action
5. Copy the webhook URL and add it to `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK=your_zapier_webhook_url_here
   ```

### Option 2: Use Make.com (formerly Integromat)
1. Go to [Make.com](https://make.com)
2. Create a new scenario
3. Add "Webhook" trigger
4. Add "Google Sheets" action
5. Copy the webhook URL and add it to `.env.local`

### Option 3: Manual Entry (Current Working Solution)
The data is currently being logged in the console. You can:
1. Open browser console (F12) when making an order
2. Look for "📋 Google Sheets Entry:"
3. Copy the tab-separated data
4. Paste it into your Google Sheet

### Option 4: Fix Google Apps Script
1. Go to [Google Apps Script](https://script.google.com)
2. Create a new project
3. Copy the code from `google_apps_script_updated.js`
4. Deploy as Web App with these settings:
   - Execute as: Me
   - Who has access: Anyone
5. Copy the new webhook URL to `.env.local`

## Current Data Format
The system logs data in this format:
```
timestamp	name	phone	child_name	wilaya	baladia	address	quantity	total_price	image_url	created_at
```

## Testing
To test the integration:
1. Make a test order
2. Check the console logs
3. Look for "📊 Google Sheets API received data"
4. Check if webhook response shows success or failure

## Troubleshooting
- If you see "Moved Temporarily" error, the Google Apps Script is not properly deployed
- If you see "✅ Data sent to Google Apps Script successfully", it's working
- If you see "❌ Google Apps Script failed", check the webhook URL and deployment