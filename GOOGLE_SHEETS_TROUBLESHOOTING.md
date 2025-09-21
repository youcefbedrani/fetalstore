# Google Sheets Troubleshooting Guide

## 🔍 **Why Orders Might Not Appear in Google Sheets**

### **1. Google Apps Script Issues**
- **Script not deployed**: Make sure your Google Apps Script is deployed as a web app
- **Permissions**: Ensure the script has permission to access your Google Sheet
- **Script errors**: Check the Google Apps Script execution logs

### **2. Data Format Issues**
- **Column headers**: Your Google Sheet needs proper column headers
- **Data types**: Some data might not be in the expected format

### **3. Network/CORS Issues**
- **Browser blocking**: Some browsers block cross-origin requests
- **Firewall**: Corporate firewalls might block the requests

## 🛠️ **Troubleshooting Steps**

### **Step 1: Test the Integration**
1. **Open your website** in browser
2. **Open Developer Tools** (F12)
3. **Go to Console tab**
4. **Type**: `testGoogleSheets()`
5. **Press Enter**
6. **Check console** for success/error messages

### **Step 2: Check Browser Console**
When you submit an order, look for these messages:
- ✅ `"Attempting to send data to Google Sheets..."`
- ✅ `"Data sent successfully via FormData method"` OR `"Data sent successfully via URL method"`
- ❌ Any error messages in red

### **Step 3: Verify Google Apps Script**
1. **Go to**: [Google Apps Script](https://script.google.com)
2. **Open your script**
3. **Check execution logs**:
   - Go to "Executions" in the left menu
   - Look for recent executions
   - Check for any errors

### **Step 4: Check Your Google Sheet**
1. **Open your Google Sheet**
2. **Check if column headers exist**:
   ```
   timestamp | name | phone | child_name | wilaya | baladia | address | quantity | total_price | image_url | created_at
   ```
3. **Look for new rows** at the bottom

## 🔧 **Common Fixes**

### **Fix 1: Update Google Apps Script**
Your Google Apps Script should look like this:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Get data from form submission
    const timestamp = new Date().toISOString();
    const name = e.parameter.name || '';
    const phone = e.parameter.phone || '';
    const child_name = e.parameter.child_name || '';
    const wilaya = e.parameter.wilaya || '';
    const baladia = e.parameter.baladia || '';
    const address = e.parameter.address || '';
    const quantity = e.parameter.quantity || '';
    const total_price = e.parameter.total_price || '';
    const image_url = e.parameter.image_url || '';
    const created_at = e.parameter.created_at || '';
    
    // Add row to sheet
    sheet.appendRow([
      timestamp,
      name,
      phone,
      child_name,
      wilaya,
      baladia,
      address,
      quantity,
      total_price,
      image_url,
      created_at
    ]);
    
    return ContentService.createTextOutput('Success');
  } catch (error) {
    return ContentService.createTextOutput('Error: ' + error.toString());
  }
}

function doGet(e) {
  return doPost(e); // Handle GET requests too
}
```

### **Fix 2: Set Up Column Headers**
In your Google Sheet, add these headers in row 1:
```
A1: timestamp
B1: name
C1: phone
D1: child_name
E1: wilaya
F1: baladia
G1: address
H1: quantity
I1: total_price
J1: image_url
K1: created_at
```

### **Fix 3: Deploy the Script**
1. **In Google Apps Script**:
   - Click "Deploy" → "New deployment"
   - Choose "Web app" as type
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone"
   - Click "Deploy"
   - Copy the web app URL

## 🧪 **Testing Methods**

### **Method 1: Browser Console Test**
```javascript
// In browser console:
testGoogleSheets()
```

### **Method 2: Manual URL Test**
Open this URL in your browser (replace with your data):
```
https://script.google.com/macros/s/AKfycbxz4Q1em-x2q7FHdDSX_2o9bgQPF35hNRRxxsm3gHfcHswewi9g3WzMevLnft0yLeG7/exec?gid=0&name=Test&phone=0555123456&child_name=TestBaby&wilaya=الجزائر&baladia=Test&address=Test123&quantity=1&total_price=5000&image_url=&created_at=2024-01-15T10:00:00.000Z
```

### **Method 3: Submit Real Order**
1. **Fill out the form** on your website
2. **Submit the order**
3. **Check console** for success messages
4. **Check Google Sheet** for new row

## 📞 **Still Not Working?**

If none of the above fixes work:

1. **Check Google Apps Script logs** for specific errors
2. **Try a different browser** (Chrome, Firefox, Safari)
3. **Disable browser extensions** temporarily
4. **Check if your firewall** blocks the requests
5. **Verify the webhook URL** is correct

## 🎯 **Expected Behavior**

When working correctly, you should see:
- ✅ Console message: "Data sent successfully"
- ✅ New row in Google Sheet with order data
- ✅ No error messages in browser console

---

**Need more help?** Check the browser console for specific error messages and share them for further troubleshooting.
