# Cloudflare Setup Guide

## ✅ Your Cloudflare API Token Setup is Correct!

Based on your screenshot, you have the right permissions:
- **Token name:** Edit zone DNS
- **Permissions:** Zone.DNS
- **Resources:** 1 Zone
- **Status:** Active ✅

## 🔧 Next Steps to Complete Cloudflare Integration:

### 1. Get Your Zone ID
1. Go to your domain in Cloudflare dashboard
2. On the right side, you'll see "Zone ID"
3. Copy this value

### 2. Get Your Account ID
1. Go to Cloudflare dashboard
2. Click on your account name (top right)
3. Copy the "Account ID" from the sidebar

### 3. Create Environment File
Create a file called `.env.local` in your project root with:

```env
# Database Configuration (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Cloudflare Configuration
CLOUDFLARE_API_TOKEN=your_actual_token_from_screenshot
CLOUDFLARE_ZONE_ID=your_zone_id_from_domain_overview
CLOUDFLARE_ACCOUNT_ID=your_account_id_from_dashboard

# Admin Configuration
ADMIN_SECRET_TOKEN=admin_secret_12345
NEXT_PUBLIC_ADMIN_TOKEN=admin_public_67890

# Security Configuration
JWT_SECRET=jwt_secret_key_here
ENCRYPTION_KEY=encryption_key_here

# Rate Limiting Configuration
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Logging Configuration
LOG_LEVEL=info
LOG_FILE_MAX_SIZE=5242880
LOG_FILE_MAX_FILES=5

# Production Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Test Cloudflare Integration

After setting up the environment variables, test the integration:

```bash
# Start the server
npm run dev

# Test health endpoint (should show cloudflare as "configured")
curl http://localhost:3000/api/health

# Test admin dashboard
# Visit: http://localhost:3000/admin
```

## 🎯 What Your Cloudflare Token Can Do:

With "Zone.DNS" permissions, your application can:
- ✅ Create firewall rules to block IPs
- ✅ List existing firewall rules
- ✅ Delete firewall rules
- ✅ Manage IP lists
- ✅ Block/unblock IPs automatically

## 🔍 Testing the Integration:

1. **Start your server:**
   ```bash
   npm run dev
   ```

2. **Check health status:**
   ```bash
   curl http://localhost:3000/api/health
   ```
   Should show: `"cloudflare":"configured"`

3. **Test IP blocking:**
   - Make 3+ orders from the same IP
   - Check admin dashboard for blocked IPs
   - Verify Cloudflare firewall rules are created

## 🚨 Important Notes:

- **Your API token is correct** - Zone.DNS permissions are sufficient
- **No additional setup needed** - the application handles everything
- **Test locally first** - make sure everything works before production
- **Keep your token secure** - never commit it to version control

## 📊 Expected Behavior:

1. **Normal operation:** IPs can make up to 3 orders in 24 hours
2. **Rate limit exceeded:** IP gets blocked in database AND Cloudflare
3. **Admin dashboard:** Shows all blocked IPs and statistics
4. **Automatic unblocking:** After 24 hours, IPs are automatically unblocked

Your setup is perfect! Just add the environment variables and you're ready to go! 🚀
