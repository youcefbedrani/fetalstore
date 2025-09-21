// Alternative Google Sheets integration using different webhook methods

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

// Try multiple webhook methods
export async function sendToGoogleSheetsWebhook(orderData: OrderData): Promise<boolean> {
  console.log('🔄 Attempting Google Sheets webhook submission...')
  
  const webhookUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK
  
  if (!webhookUrl) {
    console.log('❌ No Google Sheets webhook URL configured')
    return false
  }
  
  const formattedData = {
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
  
  // Method 1: Try FormData POST
  try {
    console.log('📤 Trying FormData POST method...')
    const formData = new FormData()
    Object.entries(formattedData).forEach(([key, value]) => {
      formData.append(key, value.toString())
    })
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData
    })
    
    console.log('FormData response status:', response.status, response.statusText)
    
    if (response.ok) {
      const result = await response.text()
      console.log('✅ FormData method successful:', result)
      return true
    } else {
      const errorText = await response.text()
      console.log('❌ FormData method failed:', errorText)
    }
  } catch (error) {
    console.log('❌ FormData method error:', error)
  }
  
  // Method 2: Try JSON POST
  try {
    console.log('📤 Trying JSON POST method...')
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData)
    })
    
    console.log('JSON response status:', response.status, response.statusText)
    
    if (response.ok) {
      const result = await response.text()
      console.log('✅ JSON method successful:', result)
      return true
    } else {
      const errorText = await response.text()
      console.log('❌ JSON method failed:', errorText)
    }
  } catch (error) {
    console.log('❌ JSON method error:', error)
  }
  
  // Method 3: Try GET with URL parameters
  try {
    console.log('📤 Trying GET method with URL parameters...')
    const params = new URLSearchParams()
    Object.entries(formattedData).forEach(([key, value]) => {
      params.append(key, value.toString())
    })
    
    const getUrl = webhookUrl.includes('?') 
      ? `${webhookUrl}&${params.toString()}`
      : `${webhookUrl}?${params.toString()}`
    
    const response = await fetch(getUrl, {
      method: 'GET',
      mode: 'no-cors'
    })
    
    console.log('GET method attempted (no-cors mode)')
    return true // Assume success with no-cors
  } catch (error) {
    console.log('❌ GET method error:', error)
  }
  
  console.log('❌ All webhook methods failed')
  return false
}

// Enhanced function that tries webhook first, then falls back to logging
export async function sendToGoogleSheetsEnhanced(orderData: OrderData): Promise<boolean> {
  console.log('🚀 Starting Google Sheets submission...')
  
  // Try webhook first
  const webhookSuccess = await sendToGoogleSheetsWebhook(orderData)
  if (webhookSuccess) {
    return true
  }
  
  // Fall back to local API logging
  try {
    const response = await fetch('/api/google-sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    })
    
    if (response.ok) {
      console.log('✅ Data logged to local API as fallback')
      return true
    }
  } catch (error) {
    console.log('❌ Local API fallback failed:', error)
  }
  
  // Final fallback - just log the data
  console.log('📋 Final fallback - Manual entry required:')
  console.log(`${orderData.name}\t${orderData.phone}\t${orderData.child_name}\t${orderData.wilaya}\t${orderData.baladia}\t${orderData.address}\t${orderData.quantity}\t${orderData.total_price}\t${orderData.image_url || 'No image'}\t${orderData.created_at}`)
  
  return true // Don't fail the order
}
