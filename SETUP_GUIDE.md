# E-commerce Store with Cloudflare Integration - Setup Guide

This guide will help you set up a secure Next.js e-commerce store with Cloudflare integration and fake order prevention.

## Features

- ✅ IP-based rate limiting (max 3 orders per IP in 24 hours)
- ✅ Cloudflare firewall rule integration
- ✅ Admin dashboard for IP management
- ✅ Secure database with PostgreSQL/Supabase
- ✅ Production-ready security headers
- ✅ Comprehensive logging system
- ✅ Real-time IP tracking and blocking

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Cloudflare account with API access
- Domain with Cloudflare DNS

## Installation

1. **Clone and install dependencies:**
```bash
cd /home/badran/Downloads/Freelance_2025/Project_v2/website_code
npm install
```

2. **Set up environment variables:**
```bash
cp env.production.example .env.local
```

3. **Configure your environment variables in `.env.local`:**

### Database Configuration (Supabase)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Cloudflare Configuration
```env
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ZONE_ID=your_zone_id
CLOUDFLARE_ACCOUNT_ID=your_account_id
```

### Admin Configuration
```env
ADMIN_SECRET_TOKEN=your_secure_admin_token_here
NEXT_PUBLIC_ADMIN_TOKEN=your_public_admin_token_here
```

## Database Setup

1. **Run the database schema:**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase_schema.sql`
   - Execute the script

2. **Verify tables are created:**
   - `orders` - stores order information
   - `ip_tracking` - tracks IP addresses and order counts
   - `blocked_ips` - stores blocked IP addresses

## Cloudflare Setup

1. **Get your API credentials:**
   - Go to Cloudflare Dashboard → My Profile → API Tokens
   - Create a custom token with Zone:Edit permissions
   - Note down your Zone ID from the domain overview

2. **Configure firewall rules:**
   - The system will automatically create firewall rules for blocked IPs
   - Monitor blocked IPs in the Cloudflare dashboard

## Development

1. **Start the development server:**
```bash
npm run dev
```

2. **Access the application:**
   - Main store: `http://localhost:3000`
   - Admin dashboard: `http://localhost:3000/admin`

## Production Deployment

1. **Build the application:**
```bash
npm run build
```

2. **Start the production server:**
```bash
npm start
```

3. **Configure your domain:**
   - Point your domain to your hosting provider
   - Ensure Cloudflare is enabled for your domain

## Security Features

### IP Rate Limiting
- Maximum 3 orders per IP address in 24 hours
- Automatic IP blocking when limit exceeded
- Cloudflare firewall rule creation

### Security Headers
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection enabled

### Admin Dashboard
- View blocked IPs and statistics
- Reset IP limits
- Unblock IPs manually
- Real-time monitoring

## API Endpoints

### Order Creation
```
POST /api/orders
Content-Type: application/json

{
  "name": "Customer Name",
  "phone": "+213555123456",
  "wilaya": "16",
  "baladia": "Algiers",
  "address": "Full address",
  "child_name": "Child Name",
  "quantity": 1
}
```

### Admin IP Management
```
GET /api/admin/ip-management?action=stats
Authorization: Bearer your_admin_token

GET /api/admin/ip-management?action=blocked
Authorization: Bearer your_admin_token

POST /api/admin/ip-management
Authorization: Bearer your_admin_token
Content-Type: application/json

{
  "action": "reset_limits",
  "ip": "192.168.1.1"
}
```

## Monitoring and Logging

The system includes comprehensive logging:

- Order creation and blocking events
- IP blocking and unblocking actions
- Security events and suspicious activity
- Performance metrics
- Cloudflare API interactions

Logs are stored in:
- `logs/error.log` - Error logs
- `logs/combined.log` - All logs
- Console output in development

## Troubleshooting

### Common Issues

1. **Database connection errors:**
   - Verify Supabase credentials
   - Check if database functions are created

2. **Cloudflare API errors:**
   - Verify API token permissions
   - Check Zone ID and Account ID

3. **Rate limiting not working:**
   - Check if database functions are properly created
   - Verify IP extraction logic

### Debug Mode

Enable debug logging by setting:
```env
LOG_LEVEL=debug
```

## Security Best Practices

1. **Environment Variables:**
   - Never commit `.env.local` to version control
   - Use strong, unique tokens
   - Rotate secrets regularly

2. **Database Security:**
   - Use Row Level Security (RLS) in Supabase
   - Limit API key permissions
   - Monitor database access

3. **Cloudflare Security:**
   - Enable Bot Fight Mode
   - Configure WAF rules
   - Monitor security events

4. **Application Security:**
   - Keep dependencies updated
   - Monitor for security vulnerabilities
   - Implement proper error handling

## Performance Optimization

1. **Database Indexing:**
   - Indexes are automatically created for IP tracking
   - Monitor query performance

2. **Caching:**
   - Consider implementing Redis for session storage
   - Use Cloudflare caching for static assets

3. **Monitoring:**
   - Set up alerts for high error rates
   - Monitor memory and CPU usage
   - Track response times

## Support

For issues and questions:
1. Check the logs for error details
2. Verify all environment variables are set
3. Test database connectivity
4. Verify Cloudflare configuration

## License

This project is licensed under the MIT License.
