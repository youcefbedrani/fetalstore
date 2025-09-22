# 🚀 Production Setup Guide

## 📋 **Manual Setup Instructions**

After cloning the repository, you need to manually configure the production environment variables.

### **Step 1: Create Production Environment File**

```bash
# Copy the template file
cp env.production.template .env.production

# Edit the file with your actual values
nano .env.production
# or
vim .env.production
```

### **Step 2: Configure Required Variables**

#### **🔐 Admin Authentication (REQUIRED)**

```bash
# Generate admin password hash
node generate_admin_password.js

# Then set these in .env.production:
ADMIN_PASSWORD_HASH=$2a$12$your_generated_hash_here
ADMIN_SECRET_TOKEN=your_secure_random_token_here
NEXT_PUBLIC_ADMIN_TOKEN=your_public_admin_token_here
```

**How to generate secure tokens:**
```bash
# Generate random tokens
openssl rand -hex 32
# or
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### **🗄️ Supabase Configuration (REQUIRED)**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Get these from:** Supabase Dashboard → Settings → API

#### **☁️ Cloudinary Configuration (REQUIRED)**

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Get these from:** Cloudinary Dashboard → Settings → Security

#### **📊 Google Sheets Integration (OPTIONAL)**

```bash
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_SHEET_ID=your_google_sheet_id
```

#### **📱 Meta Pixel (OPTIONAL)**

```bash
NEXT_PUBLIC_META_PIXEL_ID=your_meta_pixel_id
```

**Get this from:** Facebook Business Manager → Events Manager

#### **🛡️ Cloudflare Configuration (OPTIONAL)**

```bash
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ZONE_ID=your_cloudflare_zone_id
```

### **Step 3: Database Setup**

#### **Apply Database Schema**

```bash
# Connect to your Supabase database and run:
psql -h your-supabase-host -U postgres -d postgres -f visitor_analytics_schema.sql
```

**Or use Supabase Dashboard:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `visitor_analytics_schema.sql`
3. Run the SQL

### **Step 4: Install Dependencies**

```bash
npm install
# or
yarn install
```

### **Step 5: Build and Deploy**

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🔧 **Environment Variables Reference**

### **Required Variables**

| Variable | Description | Example |
|----------|-------------|---------|
| `ADMIN_PASSWORD_HASH` | Bcrypt hash of admin password | `$2a$12$...` |
| `ADMIN_SECRET_TOKEN` | Secret token for admin API | `abc123...` |
| `NEXT_PUBLIC_ADMIN_TOKEN` | Public admin token | `xyz789...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGciOiJIUzI1NiIs...` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-secret-key` |

### **Optional Variables**

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_SHEETS_PRIVATE_KEY` | Google Sheets service account key | `-----BEGIN PRIVATE KEY-----...` |
| `GOOGLE_SHEETS_CLIENT_EMAIL` | Google Sheets service account email | `service@project.iam.gserviceaccount.com` |
| `GOOGLE_SHEETS_SHEET_ID` | Google Sheets document ID | `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms` |
| `NEXT_PUBLIC_META_PIXEL_ID` | Facebook Meta Pixel ID | `123456789012345` |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token | `your-cloudflare-token` |
| `CLOUDFLARE_ZONE_ID` | Cloudflare zone ID | `your-zone-id` |

## 🛡️ **Security Best Practices**

### **Password Generation**

```bash
# Generate secure admin password
node generate_admin_password.js

# This will prompt you to enter a password and generate a bcrypt hash
```

### **Token Generation**

```bash
# Generate secure random tokens
openssl rand -hex 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **File Permissions**

```bash
# Set secure permissions for environment file
chmod 600 .env.production

# Ensure only owner can read/write
```

## 🚀 **Deployment Commands**

### **Git Commands**

```bash
# Add all files to git
git add .

# Commit changes
git commit -m "Add ultimate screenshot protection and admin dashboard"

# Push to repository
git push origin main
```

### **Production Commands**

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start

# Or use PM2 for process management
pm2 start npm --name "your-app" -- start
```

## 📁 **File Structure**

```
your-project/
├── .env.production          # Production environment variables (DO NOT COMMIT)
├── .gitignore              # Git ignore file
├── env.production.template # Template for production variables
├── generate_admin_password.js # Password hash generator
├── visitor_analytics_schema.sql # Database schema
├── src/
│   ├── app/
│   │   ├── admin/          # Admin dashboard
│   │   └── api/            # API endpoints
│   ├── components/         # React components
│   │   ├── ScreenshotProtection.tsx
│   │   ├── UltimateScreenshotProtection.tsx
│   │   ├── MobileHardwareProtection.tsx
│   │   └── ...
│   └── lib/                # Utility libraries
└── public/                 # Static files
```

## ⚠️ **Important Notes**

1. **Never commit `.env.production`** - It contains sensitive data
2. **Use strong passwords** - Generate secure admin passwords
3. **Keep tokens secure** - Don't share API keys or tokens
4. **Test locally first** - Test with `.env.local` before production
5. **Backup database** - Always backup your Supabase database
6. **Monitor logs** - Check application logs for errors

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Environment variables not loading**
   - Check file name is exactly `.env.production`
   - Restart the application after changes
   - Verify no spaces around `=` signs

2. **Database connection issues**
   - Verify Supabase URL and keys
   - Check database schema is applied
   - Ensure service role key has proper permissions

3. **Admin authentication not working**
   - Verify password hash is correct
   - Check admin tokens are set
   - Ensure no extra spaces in environment variables

4. **Screenshot protection not working**
   - Check browser console for errors
   - Verify all protection components are loaded
   - Test on different browsers and devices

## 📞 **Support**

If you encounter issues:
1. Check the console logs
2. Verify all environment variables are set
3. Test with a fresh installation
4. Check the documentation files in the project

---

**Your production environment is now ready!** 🎉
