# 🚀 Hostinger VPS Deployment Guide

This guide will help you deploy your ultrasound orb store to a Hostinger VPS with high performance, security, and scalability optimizations.

## 📋 Prerequisites

- Hostinger VPS with Ubuntu 20.04+ or similar Linux distribution
- Domain name pointed to your VPS IP
- Basic knowledge of Linux command line
- Your environment variables (Supabase, Cloudinary, Google Sheets)

## 🏗️ Architecture Overview

The optimized deployment includes:

- **Next.js Application**: Optimized with caching, rate limiting, and performance monitoring
- **Nginx Reverse Proxy**: Load balancing, SSL termination, and security headers
- **Redis Cache**: In-memory caching for improved performance
- **Docker Containers**: Isolated, scalable deployment
- **Monitoring**: Performance metrics and error tracking
- **Backup System**: Automated daily backups

## 🚀 Quick Deployment

### 1. Connect to Your VPS

```bash
ssh root@your-vps-ip
# or
ssh username@your-vps-ip
```

### 2. Run the Deployment Script

```bash
# Download and run the deployment script
wget https://raw.githubusercontent.com/your-repo/deploy.sh
chmod +x deploy.sh
./deploy.sh
```

### 3. Configure Environment Variables

Edit the environment file with your actual values:

```bash
nano .env.production
```

Required variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google Sheets Configuration
GOOGLE_SHEETS_PRIVATE_KEY=your_google_sheets_private_key
GOOGLE_SHEETS_CLIENT_EMAIL=your_google_sheets_client_email
GOOGLE_SHEETS_SPREADSHEET_ID=your_google_sheets_spreadsheet_id
```

### 4. Start the Application

```bash
docker-compose --env-file .env.production up -d
```

## 🔧 Manual Deployment Steps

If you prefer manual deployment:

### 1. System Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Clone Repository

```bash
git clone https://github.com/your-repo/ultrasound-orb-store.git
cd ultrasound-orb-store
```

### 3. Configure Environment

```bash
cp .env.production.example .env.production
nano .env.production
```

### 4. Build and Deploy

```bash
docker-compose --env-file .env.production up -d --build
```

## 🔒 SSL Certificate Setup

### Using Certbot (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Using Cloudflare (Alternative)

1. Point your domain to Cloudflare
2. Enable SSL/TLS encryption mode: "Full (strict)"
3. Configure Cloudflare settings for optimal performance

## 📊 Performance Optimizations

### 1. Caching Strategy

- **Redis Cache**: In-memory caching for database queries
- **Static File Caching**: Nginx serves static files with long cache headers
- **Image Optimization**: Next.js Image component with lazy loading
- **API Response Caching**: Cached API responses with TTL

### 2. Rate Limiting

- **API Endpoints**: 100 requests per 15 minutes
- **Order Endpoints**: 3 orders per 24 hours per IP
- **DDoS Protection**: Automatic IP blocking for suspicious activity

### 3. Database Optimizations

- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Indexed queries and batch operations
- **Caching Layer**: Frequently accessed data cached in Redis

## 🔍 Monitoring and Maintenance

### Health Checks

```bash
# Check application health
curl http://yourdomain.com/api/health

# Check Docker containers
docker-compose ps

# View logs
docker-compose logs -f app
```

### Performance Monitoring

Access monitoring dashboards:
- **Grafana**: http://yourdomain.com:3001 (admin/your_password)
- **Prometheus**: http://yourdomain.com:9090

### Backup and Recovery

```bash
# Manual backup
./backup.sh

# Restore from backup
tar -xzf /home/backups/app_backup_YYYYMMDD_HHMMSS.tar.gz -C /home/ultrasound-orb-store/
docker-compose restart
```

## 🛠️ Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   docker-compose logs app
   # Check environment variables and database connection
   ```

2. **SSL certificate issues**
   ```bash
   sudo certbot certificates
   sudo certbot renew --dry-run
   ```

3. **High memory usage**
   ```bash
   docker stats
   # Consider upgrading VPS or optimizing application
   ```

4. **Database connection errors**
   ```bash
   # Check Supabase configuration
   curl -I https://your-supabase-url.supabase.co
   ```

### Performance Issues

1. **Slow page loads**
   - Check Redis cache status
   - Verify image optimization
   - Monitor database query performance

2. **High server load**
   - Enable monitoring dashboards
   - Check for DDoS attacks
   - Optimize database queries

## 📈 Scaling Considerations

### Vertical Scaling (Upgrade VPS)

- **CPU**: 2+ cores recommended for production
- **RAM**: 4GB+ recommended for optimal performance
- **Storage**: SSD recommended for better I/O performance

### Horizontal Scaling (Multiple Servers)

1. **Load Balancer**: Use Nginx or Cloudflare Load Balancer
2. **Database**: Consider Supabase Pro for better performance
3. **CDN**: Use Cloudflare or similar for global content delivery

## 🔐 Security Best Practices

### 1. Server Security

```bash
# Update firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart ssh
```

### 2. Application Security

- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Input Validation**: All user inputs are validated
- **Security Headers**: CSP, HSTS, and other security headers
- **Environment Variables**: Sensitive data in environment variables

### 3. Database Security

- **Row Level Security**: Enabled in Supabase
- **API Keys**: Rotate regularly
- **Backup Encryption**: Encrypt sensitive backup data

## 📞 Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly**:
   - Check application logs
   - Monitor performance metrics
   - Update dependencies

2. **Monthly**:
   - Review security logs
   - Update SSL certificates
   - Test backup restoration

3. **Quarterly**:
   - Security audit
   - Performance optimization review
   - Disaster recovery testing

### Getting Help

- **Documentation**: Check this guide and code comments
- **Logs**: Always check logs first for error details
- **Community**: GitHub issues and discussions
- **Professional Support**: Consider hiring a DevOps consultant for complex issues

## 🎯 Performance Benchmarks

With the optimizations in place, you should expect:

- **Page Load Time**: < 2 seconds
- **API Response Time**: < 500ms
- **Uptime**: 99.9%+
- **Concurrent Users**: 1000+ (depending on VPS specs)
- **Order Processing**: < 1 second

## 📝 Environment Variables Reference

```env
# Application
NODE_ENV=production
PORT=3000

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Image Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google Sheets Integration
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id

# Optional: Monitoring
GRAFANA_PASSWORD=your-secure-password
```

## 🚀 Go Live Checklist

- [ ] VPS provisioned and configured
- [ ] Domain pointed to VPS IP
- [ ] SSL certificate installed
- [ ] Environment variables configured
- [ ] Application deployed and running
- [ ] Health checks passing
- [ ] Monitoring dashboards accessible
- [ ] Backup system working
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] Performance optimizations active
- [ ] Error tracking configured

---

**Congratulations!** 🎉 Your ultrasound orb store is now deployed with enterprise-grade performance and security optimizations. Your store can handle high traffic and provide an excellent user experience for your customers.
