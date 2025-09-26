# 🚀 VPS Deployment Commands

## 📋 **Complete VPS Deployment Process**

### **Step 1: Connect to Your VPS**
```bash
# Connect via SSH
ssh root@your-vps-ip-address
# or
ssh username@your-vps-ip-address
```

### **Step 2: Update System and Install Dependencies**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git (if not installed)
sudo apt install git -y

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx (if not installed)
sudo apt install nginx -y
```

### **Step 3: Clone Your Repository**
```bash
# Navigate to web directory
cd /var/www

# Clone your repository
git clone https://github.com/your-username/your-repository-name.git

# Navigate to project directory
cd your-repository-name

# Or if you already have the project, pull latest changes
git pull origin main
```

### **Step 4: Install Dependencies**
```bash
# Install project dependencies
npm install

# Or if using yarn
yarn install
```

### **Step 5: Set Up Environment Variables**
```bash
# Copy the template
cp env.production.template .env.production

# Edit the environment file
nano .env.production
# or
vim .env.production
```

**Fill in your actual values in `.env.production`:**
```bash
# Admin Authentication
ADMIN_PASSWORD_HASH=$2a$12$your_generated_hash_here
ADMIN_SECRET_TOKEN=your_secure_random_token_here
NEXT_PUBLIC_ADMIN_TOKEN=your_public_admin_token_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Other configurations...
```

### **Step 6: Generate Admin Password Hash**
```bash
# Generate admin password hash
node generate_admin_password.js

# This will prompt you to enter a password and generate a bcrypt hash
# Copy the generated hash to .env.production
```

### **Step 7: Build the Application**
```bash
# Build for production
npm run build

# Check if build was successful
ls -la .next/
```

### **Step 8: Set Up Database Schema**
```bash
# Connect to your Supabase database and run the schema
# You can do this via Supabase Dashboard → SQL Editor
# Copy and paste the contents of visitor_analytics_schema.sql
```

### **Step 9: Configure Nginx**
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/your-domain.com
```

**Nginx configuration content:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/your-domain.com /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### **Step 10: Start the Application with PM2**
```bash
# Start the application with PM2
pm2 start npm --name "your-app-name" -- start

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup

# Check PM2 status
pm2 status

# View logs
pm2 logs your-app-name
```

### **Step 11: Set Up SSL Certificate (Optional but Recommended)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

## 🔄 **Daily VPS Management Commands**

### **Update Your Application**
```bash
# Navigate to project directory
cd /var/www/your-repository-name

# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Rebuild the application
npm run build

# Restart the application
pm2 restart your-app-name
```

### **Check Application Status**
```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs your-app-name

# Check Nginx status
sudo systemctl status nginx

# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
htop
```

### **Backup Commands**
```bash
# Backup your application
tar -czf backup-$(date +%Y%m%d).tar.gz /var/www/your-repository-name

# Backup environment file
cp .env.production .env.production.backup

# Backup PM2 configuration
pm2 save
```

### **Restart Services**
```bash
# Restart your application
pm2 restart your-app-name

# Restart Nginx
sudo systemctl restart nginx

# Restart all PM2 processes
pm2 restart all
```

## 🛠️ **Troubleshooting Commands**

### **Check Logs**
```bash
# Application logs
pm2 logs your-app-name

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# System logs
sudo journalctl -u nginx
```

### **Check Ports**
```bash
# Check if port 3000 is listening
sudo netstat -tlnp | grep :3000

# Check if port 80 is listening
sudo netstat -tlnp | grep :80

# Check if port 443 is listening (SSL)
sudo netstat -tlnp | grep :443
```

### **Check Firewall**
```bash
# Check UFW status
sudo ufw status

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow SSH
sudo ufw allow 22
```

## 📊 **Monitoring Commands**

### **System Monitoring**
```bash
# Check system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check network connections
netstat -tulpn
```

### **Application Monitoring**
```bash
# PM2 monitoring
pm2 monit

# Check PM2 processes
pm2 list

# View PM2 logs in real-time
pm2 logs --lines 100
```

## 🔧 **Useful VPS Commands**

### **File Management**
```bash
# Navigate to project
cd /var/www/your-repository-name

# List files
ls -la

# Edit files
nano filename
vim filename

# Copy files
cp source destination

# Move files
mv source destination

# Delete files
rm filename

# Create directories
mkdir directory-name
```

### **Git Commands on VPS**
```bash
# Check git status
git status

# Pull latest changes
git pull origin main

# Check git log
git log --oneline

# Check current branch
git branch

# Switch branches
git checkout branch-name
```

### **Environment Management**
```bash
# Check environment variables
printenv

# Set environment variables
export VARIABLE_NAME=value

# Check Node.js version
node --version

# Check npm version
npm --version

# Check PM2 version
pm2 --version
```

## 🚨 **Emergency Commands**

### **If Application Crashes**
```bash
# Restart PM2 processes
pm2 restart all

# Check PM2 status
pm2 status

# View error logs
pm2 logs --err

# Restart Nginx
sudo systemctl restart nginx
```

### **If Server is Slow**
```bash
# Check system resources
htop

# Check disk space
df -h

# Check memory usage
free -h

# Restart services
sudo systemctl restart nginx
pm2 restart all
```

### **If Database Connection Fails**
```bash
# Check environment variables
cat .env.production

# Test database connection
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"

# Restart application
pm2 restart your-app-name
```

## 📝 **Quick Deployment Checklist**

- [ ] Connect to VPS via SSH
- [ ] Update system packages
- [ ] Install Node.js, Git, PM2, Nginx
- [ ] Clone repository
- [ ] Install dependencies
- [ ] Set up environment variables
- [ ] Generate admin password hash
- [ ] Build application
- [ ] Set up database schema
- [ ] Configure Nginx
- [ ] Start application with PM2
- [ ] Set up SSL certificate
- [ ] Test website

---

**Your VPS is now ready to host your website!** 🎉
