import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    
    console.log('📊 Google Sheets API received data:', orderData);
    
    // For now, we'll just log the data
    // This can be easily connected to Google Sheets API or any other service
    
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
    };
    
    // Log the data in a format that's easy to copy to Google Sheets
    console.log('📋 Google Sheets Entry:');
    console.log(`${formattedData.timestamp}\t${formattedData.name}\t${formattedData.phone}\t${formattedData.child_name}\t${formattedData.wilaya}\t${formattedData.baladia}\t${formattedData.address}\t${formattedData.quantity}\t${formattedData.total_price}\t${formattedData.image_url}\t${formattedData.created_at}`);
    
    // Try to send to Google Apps Script webhook
    const webhookUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK;
    if (webhookUrl) {
      try {
        console.log('Attempting to send to Google Apps Script webhook...');
        
        // Try FormData method
        const formData = new FormData();
        formData.append('timestamp', formattedData.timestamp);
        formData.append('name', formattedData.name);
        formData.append('phone', formattedData.phone);
        formData.append('child_name', formattedData.child_name);
        formData.append('wilaya', formattedData.wilaya);
        formData.append('baladia', formattedData.baladia);
        formData.append('address', formattedData.address);
        formData.append('quantity', formattedData.quantity.toString());
        formData.append('total_price', formattedData.total_price.toString());
        formData.append('image_url', formattedData.image_url);
        formData.append('created_at', formattedData.created_at);

        const response = await fetch(webhookUrl, {
          method: 'POST',
          body: formData
        });

        console.log('Google Apps Script response status:', response.status, response.statusText);
        
        if (response.ok) {
          const result = await response.text();
          console.log('✅ Data sent to Google Apps Script successfully:', result);
        } else {
          const errorText = await response.text();
          console.log('❌ Google Apps Script failed:', errorText);
        }
      } catch (error) {
        console.log('❌ Google Apps Script error:', error);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Data logged for Google Sheets',
      data: formattedData
    });
    
  } catch (error) {
    console.error('Error in Google Sheets API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process Google Sheets data'
      },
      { status: 500 }
    );
  }
}
