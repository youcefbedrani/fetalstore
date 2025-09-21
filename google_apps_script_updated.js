// Updated Google Apps Script for Crystal Ball Orders
// This script properly handles quantity and all order data

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
    const quantity = e.parameter.quantity || '1';
    const total_price = e.parameter.total_price || '';
    const image_url = e.parameter.image_url || '';
    const created_at = e.parameter.created_at || timestamp;
    
    // Log the received data for debugging
    console.log('Received order data:', {
      name: name,
      phone: phone,
      child_name: child_name,
      wilaya: wilaya,
      baladia: baladia,
      address: address,
      quantity: quantity,
      total_price: total_price,
      image_url: image_url,
      created_at: created_at
    });
    
    // Add row to sheet with proper column order
    sheet.appendRow([
      timestamp,        // A: timestamp
      name,            // B: name
      phone,           // C: phone
      child_name,      // D: child_name
      wilaya,          // E: wilaya
      baladia,         // F: baladia
      address,         // G: address
      quantity,        // H: quantity (THIS IS THE KEY FIELD)
      total_price,     // I: total_price
      image_url,       // J: image_url
      created_at       // K: created_at
    ]);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data logged successfully',
        quantity: quantity,
        total_price: total_price
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Handle GET requests (fallback method)
  return doPost(e);
}

// Function to set up column headers (run this once)
function setupHeaders() {
  const sheet = SpreadsheetApp.getActiveSheet();
  
  // Set column headers
  sheet.getRange(1, 1, 1, 11).setValues([[
    'timestamp',
    'name', 
    'phone',
    'child_name',
    'wilaya',
    'baladia', 
    'address',
    'quantity',      // Column H - This is where quantity will appear
    'total_price',
    'image_url',
    'created_at'
  ]]);
  
  // Format headers
  sheet.getRange(1, 1, 1, 11).setFontWeight('bold');
  sheet.getRange(1, 1, 1, 11).setBackground('#f0f0f0');
  
  console.log('Headers set up successfully');
}

// Test function to verify the script works
function testScript() {
  const testData = {
    parameter: {
      name: 'Test Customer',
      phone: '0555123456',
      child_name: 'Test Baby',
      wilaya: 'الجزائر',
      baladia: 'Test Municipality',
      address: 'Test Address 123',
      quantity: '2',
      total_price: '9000',
      image_url: 'https://example.com/test.jpg',
      created_at: new Date().toISOString()
    }
  };
  
  const result = doPost(testData);
  console.log('Test result:', result.getContent());
}
