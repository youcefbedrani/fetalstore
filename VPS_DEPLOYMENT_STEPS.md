# 🚀 VPS Deployment Steps - Optimized Path

## ✅ **Recommended: Use `/var/www` Directory**

You're absolutely right! Using `/var/www` is the standard and best practice for web applications. Here are the updated deployment steps:

## **Step 1: Connect to Your VPS**

```bash
ssh root@srv1021382
```

## **Step 2: Create Web Directory and Clone Repository**

```bash
# Create web directory (you already did this!)
mkdir /var/www && cd /var/www

# Clone your repository
git clone https://github.com/youcefbedrani/fetalstore.git
cd fetalstore

# Make deployment script executable
chmod +x deploy.sh
```

## **Step 3: Run Automated Deployment**

```bash
# Run the deployment script
./deploy.sh
```

## **Step 4: Manual Deployment (Alternative)**

If you prefer manual deployment:

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 3. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Install Nginx
sudo apt install nginx -y

# 5. Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y

# 6. Setup firewall
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

## **Step 5: Configure Environment Variables**

```bash
# Create environment file
nano .env.production
```

Add your configuration:

```env
# Application
NODE_ENV=production
PORT=3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google Sheets Configuration
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id

# Redis (Optional - will use fallback if not configured)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# Monitoring (Optional)
GRAFANA_PASSWORD=your_secure_password
```

## **Step 6: Deploy the Application**

```bash
# Build and start the application
docker-compose --env-file .env.production up -d --build

# Check if containers are running
docker-compose ps

# View logs
docker-compose logs -f app
```

## **Step 7: Setup SSL Certificate**

```bash
# Get SSL certificate (replace yourdomain.com with your actual domain)
sudo certbot --nginx -d yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## **Step 8: Verify Deployment**

```bash
# Check application health
curl http://localhost:3000/api/health

# Check if Nginx is working
curl http://yourdomain.com/api/health

# Check container status
docker-compose ps
```

## **Why `/var/www` is Better:**

✅ **Standard Location**: Industry standard for web applications  
✅ **Proper Permissions**: Web server can access files correctly  
✅ **Security**: Better security isolation  
✅ **Organization**: Keeps web files separate from system files  
✅ **Backup**: Easier to backup web applications  
✅ **Multiple Sites**: Can host multiple websites in subdirectories  

## **Directory Structure After Deployment:**

```
/var/www/
├── fetalstore/                 # Your application
│   ├── src/                   # Source code
│   ├── public/                # Static files
│   ├── docker-compose.yml     # Docker configuration
│   ├── .env.production        # Environment variables
│   └── ...
├── other-website/             # Future websites
└── ...
```

## **Quick Commands for Management:**

```bash
# Navigate to your app
cd /var/www/fetalstore

# Start application
docker-compose up -d

# Stop application
docker-compose down

# Restart application
docker-compose restart

# View logs
docker-compose logs -f app

# Update application
git pull origin main
docker-compose --env-file .env.production up -d --build
```

## **Backup Commands:**

```bash
# Backup your application
cd /var/www
tar -czf /home/backups/fetalstore_backup_$(date +%Y%m%d_%H%M%S).tar.gz fetalstore/

# Restore from backup
cd /var/www
tar -xzf /path/to/backup.tar.gz
```

## **Monitoring Commands:**

```bash
# Check application health
curl http://yourdomain.com/api/health

# Check container stats
docker stats

# Check disk usage
df -h

# Check memory usage
free -h
```

## **Expected Results:**

After deployment, your store will be accessible at:
- **Main Site**: `http://yourdomain.com`
- **Health Check**: `http://yourdomain.com/api/health`
- **Admin Panel**: `http://yourdomain.com/admin`
- **Grafana**: `http://yourdomain.com:3001`
- **Prometheus**: `http://yourdomain.com:9090`

Your optimized store is now ready for high-traffic hosting! 🚀
