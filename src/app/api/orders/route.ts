import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getClientInfo, checkIPRateLimit } from '@/lib/ip-tracking';
import { blockIPWithCloudflare } from '@/lib/cloudflare';
import Joi from 'joi';

// Order validation schema
const orderSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  wilaya: Joi.string().length(2).required(),
  baladia: Joi.string().min(2).max(100).required(),
  address: Joi.string().min(10).max(500).required(),
  child_name: Joi.string().min(2).max(255).required(),
  cod: Joi.boolean().default(true),
  quantity: Joi.number().integer().min(1).max(10).default(1),
  product_name: Joi.string().default('كرة الموجات فوق الصوتية'),
  product_image: Joi.string().optional(),
  image_path: Joi.string().optional(),
  image_url: Joi.string().uri().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get client information
    const clientInfo = getClientInfo(request);
    
    // Check IP rate limit
    const rateLimitResult = await checkIPRateLimit(clientInfo.ip);
    
    if (!rateLimitResult.allowed) {
      // Log the blocked attempt
      console.warn(`Order blocked for IP ${clientInfo.ip}: ${rateLimitResult.reason}`);
      
      // If this is a rate limit exceeded, block the IP with Cloudflare
      if (rateLimitResult.reason === 'Rate limit exceeded') {
        await blockIPWithCloudflare(clientInfo.ip, 'Rate limit exceeded (3 orders in 24h)');
      }
      
      return NextResponse.json(
        {
          success: false,
          error: 'Order limit exceeded',
          message: 'You have reached the maximum number of orders allowed. Please try again later.',
          details: {
            reason: rateLimitResult.reason,
            remaining: rateLimitResult.remaining,
            reset_time: rateLimitResult.reset_time,
          }
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { error: validationError, value: orderData } = orderSchema.validate(body);
    
    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Invalid order data provided',
          details: validationError.details.map(d => d.message)
        },
        { status: 400 }
      );
    }

    // Calculate total price (assuming 3500 DZD per unit)
    const unitPrice = 3500;
    const totalPrice = orderData.quantity * unitPrice;

    // Get Supabase client
    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message: 'Unable to connect to database'
        },
        { status: 500 }
      );
    }

    // Create order in database
    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert({
        ...orderData,
        total_price: totalPrice,
        client_ip: clientInfo.ip,
        user_agent: clientInfo.userAgent,
        cloudflare_country: clientInfo.country,
        cloudflare_ray_id: clientInfo.rayId,
        status: 'pending_cod',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating order:', insertError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message: 'Failed to create order'
        },
        { status: 500 }
      );
    }

    // Log successful order
    console.log(`Order created successfully: ${order.id} for IP ${clientInfo.ip}`);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order.id,
        name: order.name,
        phone: order.phone,
        total_price: order.total_price,
        quantity: order.quantity,
        status: order.status,
        created_at: order.created_at,
      },
      rate_limit: {
        order_count: rateLimitResult.order_count,
        remaining: rateLimitResult.remaining,
        reset_time: rateLimitResult.reset_time,
      }
    });

  } catch (error) {
    console.error('Unexpected error in order creation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

// Get orders (admin endpoint)
export async function GET(request: NextRequest) {
  try {
    // Check for admin authentication (you should implement proper auth)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        limit,
        offset,
        has_more: orders.length === limit
      }
    });

  } catch (error) {
    console.error('Error in GET orders:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
