// Test function for Google Sheets integration
import { sendToGoogleSheetsEnhanced } from './googleSheets'

export async function testGoogleSheetsIntegration() {
  console.log('🧪 Testing Google Sheets integration...')
  
  const testData = {
    name: 'Test Customer',
    phone: '0555123456',
    child_name: 'Test Baby',
    wilaya: 'الجزائر',
    baladia: 'Test Municipality',
    address: 'Test Address 123',
    quantity: 2, // Test with quantity 2 (10% discount)
    total_price: 9000, // 2 * 5000 - 10% discount = 9000
    image_url: 'https://example.com/test-image.jpg',
    created_at: new Date().toISOString()
  }

  try {
    const success = await sendToGoogleSheetsEnhanced(testData)
    
    if (success) {
      console.log('✅ Test data sent to Google Sheets successfully!')
      console.log('📊 Check your Google Sheet for a new row with test data')
    } else {
      console.log('❌ Test failed - check console for errors')
    }
    
    return success
  } catch (error) {
    console.error('❌ Test error:', error)
    return false
  }
}

// Function to test different quantities
export async function testQuantityVariations() {
  console.log('🧪 Testing different quantities...')
  
  const quantities = [
    { qty: 1, price: 5000, discount: 0 },
    { qty: 2, price: 9000, discount: 10 },
    { qty: 3, price: 12750, discount: 15 }
  ]
  
  for (const test of quantities) {
    console.log(`📊 Testing quantity: ${test.qty} (${test.discount}% discount)`)
    
    const testData = {
      name: `Test Customer Qty${test.qty}`,
      phone: '0555123456',
      child_name: 'Test Baby',
      wilaya: 'الجزائر',
      baladia: 'Test Municipality',
      address: 'Test Address 123',
      quantity: test.qty,
      total_price: test.price,
      image_url: 'https://example.com/test-image.jpg',
      created_at: new Date().toISOString()
    }
    
    try {
      const success = await sendToGoogleSheetsEnhanced(testData)
      console.log(`${success ? '✅' : '❌'} Quantity ${test.qty} test ${success ? 'passed' : 'failed'}`)
    } catch (error) {
      console.error(`❌ Quantity ${test.qty} test error:`, error)
    }
  }
}

// Function to test from browser console
if (typeof window !== 'undefined') {
  const globalWindow = window as unknown as Record<string, unknown>
  globalWindow.testGoogleSheets = testGoogleSheetsIntegration
  globalWindow.testQuantities = testQuantityVariations
  console.log('🔧 Test functions available:')
  console.log('  - testGoogleSheets() - Test single order')
  console.log('  - testQuantities() - Test different quantities')
}
