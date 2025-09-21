// Google Sheets integration utility
export interface OrderData {
  name: string
  phone: string
  child_name: string
  wilaya: string
  baladia: string
  address: string
  quantity: number
  total_price: number
  image_url?: string
  created_at: string
}

export async function sendToGoogleSheets(orderData: OrderData): Promise<boolean> {
  try {
    // Your Google Sheets webhook URL
    const webhookUrl = 'https://script.google.com/macros/s/AKfycbxz4Q1em-x2q7FHdDSX_2o9bgQPF35hNRRxxsm3gHfcHswewi9g3WzMevLnft0yLeG7/exec?gid=0'
    
    // Prepare data for Google Sheets (as form data - Google Apps Script prefers this)
    const formData = new FormData()
    formData.append('timestamp', new Date().toISOString())
    formData.append('name', orderData.name)
    formData.append('phone', orderData.phone)
    formData.append('child_name', orderData.child_name)
    formData.append('wilaya', orderData.wilaya)
    formData.append('baladia', orderData.baladia)
    formData.append('address', orderData.address)
    formData.append('quantity', orderData.quantity.toString())
    formData.append('total_price', orderData.total_price.toString())
    formData.append('image_url', orderData.image_url || '')
    formData.append('created_at', orderData.created_at)

    console.log('Sending data to Google Sheets:', {
      timestamp: new Date().toISOString(),
      name: orderData.name,
      phone: orderData.phone,
      child_name: orderData.child_name,
      wilaya: orderData.wilaya,
      baladia: orderData.baladia,
      address: orderData.address,
      quantity: orderData.quantity,
      total_price: orderData.total_price,
      image_url: orderData.image_url || '',
      created_at: orderData.created_at
    })

    // Send to Google Sheets webhook using FormData
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      console.error('Failed to send data to Google Sheets:', response.statusText)
      return false
    }

    const result = await response.text()
    console.log('Data sent to Google Sheets successfully:', result)
    return true

  } catch (error) {
    console.error('Error sending data to Google Sheets:', error)
    return false
  }
}

// Alternative method using URL parameters (GET request)
export async function sendToGoogleSheetsViaURL(orderData: OrderData): Promise<boolean> {
  try {
    const webhookUrl = 'https://script.google.com/macros/s/AKfycbxz4Q1em-x2q7FHdDSX_2o9bgQPF35hNRRxxsm3gHfcHswewi9g3WzMevLnft0yLeG7/exec'
    
    // Prepare URL with parameters
    const params = new URLSearchParams({
      gid: '0',
      timestamp: new Date().toISOString(),
      name: orderData.name,
      phone: orderData.phone,
      child_name: orderData.child_name,
      wilaya: orderData.wilaya,
      baladia: orderData.baladia,
      address: orderData.address,
      quantity: orderData.quantity.toString(),
      total_price: orderData.total_price.toString(),
      image_url: orderData.image_url || '',
      created_at: orderData.created_at
    })

    const fullUrl = `${webhookUrl}?${params.toString()}`
    console.log('Sending data to Google Sheets via URL:', fullUrl)

    // Send to Google Sheets webhook using GET request
    await fetch(fullUrl, {
      method: 'GET',
      mode: 'no-cors' // This is important for Google Apps Script
    })

    console.log('Data sent to Google Sheets via URL successfully')
    return true

  } catch (error) {
    console.error('Error sending data to Google Sheets via URL:', error)
    return false
  }
}

// Enhanced function that tries multiple methods
export async function sendToGoogleSheetsEnhanced(orderData: OrderData): Promise<boolean> {
  console.log('Attempting to send data to Google Sheets...')
  
  // Try FormData method first
  try {
    const formDataSuccess = await sendToGoogleSheets(orderData)
    if (formDataSuccess) {
      console.log('✅ Data sent successfully via FormData method')
      return true
    }
  } catch (error) {
    console.warn('FormData method failed:', error)
  }

  // Try URL method as fallback
  try {
    const urlSuccess = await sendToGoogleSheetsViaURL(orderData)
    if (urlSuccess) {
      console.log('✅ Data sent successfully via URL method')
      return true
    }
  } catch (error) {
    console.warn('URL method failed:', error)
  }

  console.error('❌ All methods failed to send data to Google Sheets')
  return false
}
