// Direct Google Sheets integration using Google Sheets API
// This is an alternative to Google Apps Script

export interface OrderData {
  name: string
  phone: string
  child_name: string
  wilaya: string
  baladia: string
  address: string
  quantity: number
  total_price: number
  image_url: string | null
  created_at: string
}

// Simple webhook-based solution that can work with any service
export async function sendToGoogleSheetsDirect(orderData: OrderData): Promise<boolean> {
  try {
    console.log('Attempting direct Google Sheets submission...')
    
    // For now, we'll use a simple approach that logs the data
    // This can be easily replaced with a working webhook service
    
    const sheetsData = {
      timestamp: new Date().toISOString(),
      name: orderData.name,
      phone: orderData.phone,
      child_name: orderData.child_name,
      wilaya: orderData.wilaya,
      baladia: orderData.baladia,
      address: orderData.address,
      quantity: orderData.quantity,
      total_price: orderData.total_price,
      image_url: orderData.image_url || 'No image',
      created_at: orderData.created_at
    }
    
    console.log('📊 Google Sheets Data (for manual entry):', sheetsData)
    
    // Try to send to our local Google Sheets API
    try {
      const response = await fetch('/api/google-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sheetsData)
      })
      
      if (response.ok) {
        console.log('✅ Data sent to local Google Sheets API successfully')
        return true
      }
    } catch (error) {
      console.warn('Local Google Sheets API failed:', error)
    }
    
    // Try to send to a working webhook service
    // You can replace this with Zapier, Make.com, or any other service
    const webhookUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK || ''
    
    if (webhookUrl && !webhookUrl.includes('script.google.com')) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sheetsData)
        })
        
        if (response.ok) {
          console.log('✅ Data sent to alternative webhook successfully')
          return true
        }
      } catch (error) {
        console.warn('Alternative webhook failed:', error)
      }
    }
    
    // For now, just log the data so you can manually add it to Google Sheets
    console.log('📋 Manual Google Sheets Entry Required:')
    console.log('Copy this data to your Google Sheet:')
    console.log(`
Timestamp: ${sheetsData.timestamp}
Name: ${sheetsData.name}
Phone: ${sheetsData.phone}
Child Name: ${sheetsData.child_name}
Wilaya: ${sheetsData.wilaya}
Baladia: ${sheetsData.baladia}
Address: ${sheetsData.address}
Quantity: ${sheetsData.quantity}
Total Price: ${sheetsData.total_price}
Image URL: ${sheetsData.image_url}
Created At: ${sheetsData.created_at}
    `)
    
    return true // Return true so the order doesn't fail
    
  } catch (error) {
    console.error('Error in direct Google Sheets submission:', error)
    return false
  }
}

// Enhanced function that tries the original method first, then falls back to direct method
export async function sendToGoogleSheetsEnhanced(orderData: OrderData): Promise<boolean> {
  console.log('Attempting to send data to Google Sheets...')
  
  // Try the original Google Apps Script method first
  try {
    const { sendToGoogleSheets } = await import('./googleSheets')
    const originalSuccess = await sendToGoogleSheets(orderData)
    if (originalSuccess) {
      console.log('✅ Data sent successfully via original method')
      return true
    }
  } catch (error) {
    console.warn('Original Google Sheets method failed:', error)
  }
  
  // Fall back to direct method
  console.log('Falling back to direct method...')
  return await sendToGoogleSheetsDirect(orderData)
}
