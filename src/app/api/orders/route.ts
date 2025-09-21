import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getClientInfo } from '@/lib/ip-tracking';
import { createCacheMiddleware } from '@/lib/cache';
import { createRateLimit, rateLimitConfigs } from '@/lib/rateLimiting';
import { withPerformanceMonitoring } from '@/lib/monitoring';
// import { checkIPRateLimit } from '@/lib/ip-tracking';
// import { blockIPWithCloudflare } from '@/lib/cloudflare';
import Joi from 'joi';

// Order validation schema
const orderSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  phone: Joi.string().min(8).max(20).required(),
  wilaya: Joi.string().min(1).max(10).required(),
  baladia: Joi.string().min(2).max(100).required(),
  address: Joi.string().min(5).max(500).required(),
  child_name: Joi.string().min(2).max(255).required(),
  cod: Joi.boolean().default(true),
  quantity: Joi.number().integer().min(1).max(10).default(1),
  total_price: Joi.number().positive().optional(),
  product_name: Joi.string().default('كرة الموجات فوق الصوتية'),
  product_image: Joi.string().optional(),
  image_path: Joi.string().allow(null).optional(),
  image_url: Joi.string().allow(null).optional(),
  status: Joi.string().optional(),
  created_at: Joi.string().optional(),
});

// Create rate limit middleware for orders
const orderRateLimit = createRateLimit(rateLimitConfigs.orders);

// Create performance monitoring wrapper
const monitoredPOST = withPerformanceMonitoring(async (request: NextRequest) => {
  try {
    // Get client information
    const clientInfo = getClientInfo(request);

    // Parse and validate request body
    const body = await request.json();
    console.log('Received order data:', body);
    
    const { error: validationError, value: orderData } = orderSchema.validate(body);
    
    if (validationError) {
      console.error('Validation error:', validationError.details);
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
    
    console.log('Validated order data:', orderData);

    // Calculate total price (assuming 3500 DZD per unit)
    const unitPrice = 3500;
    const totalPrice = orderData.quantity * unitPrice;

    // Create order using optimized database service
    const { data: order, error: insertError } = await db.createOrder({
      ...orderData,
      total_price: totalPrice,
      status: 'pending_cod',
    });

    if (insertError) {
      console.error('Error creating order:', insertError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message: `Failed to create order: ${insertError.message}`,
          details: insertError
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
});

// Export the rate-limited and monitored POST handler
export const POST = (request: NextRequest) => 
  orderRateLimit(request, () => monitoredPOST(request));

// Get orders (admin endpoint) with caching
export async function GET(request: NextRequest) {
  // Create cache middleware for this endpoint
  const cacheMiddleware = createCacheMiddleware({
    ttl: 300000, // 5 minutes
    keyGenerator: (req) => {
      const url = new URL(req.url);
      const limit = url.searchParams.get('limit') || '50';
      const offset = url.searchParams.get('offset') || '0';
      return `orders:${limit}:${offset}`;
    },
    skipCache: (req) => {
      // Skip cache for admin requests without proper auth
      const authHeader = req.headers.get('authorization');
      return !authHeader || !authHeader.startsWith('Bearer ');
    }
  });

  return cacheMiddleware(request, async () => {
    try {
      // Check for admin authentication (you should implement proper auth)
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      // Use optimized database service
      const { data: orders, error } = await db.getOrders(limit, offset);

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
  });
}
