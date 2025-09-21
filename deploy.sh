#!/bin/bash

# Deployment script for Hostinger VPS
# This script automates the deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="ultrasound-orb-store"
DOMAIN="yourdomain.com"  # Replace with your actual domain
EMAIL="your-email@example.com"  # Replace with your email for SSL
BACKUP_DIR="/home/backups"
APP_DIR="/home/$APP_NAME"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        warn "Running as root. This is acceptable for VPS deployment, but consider using a regular user for security."
        # Don't exit, just warn
    fi
}

# Update system packages
update_system() {
    log "Updating system packages..."
    apt update && apt upgrade -y
    apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
}

# Install Docker
install_docker() {
    log "Installing Docker..."
    
    if command -v docker &> /dev/null; then
        info "Docker is already installed"
        return
    fi
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
    
    log "Docker installed successfully"
}

# Install Docker Compose
install_docker_compose() {
    log "Installing Docker Compose..."
    
    if command -v docker-compose &> /dev/null; then
        info "Docker Compose is already installed"
        return
    fi
    
    # Install Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    log "Docker Compose installed successfully"
}

# Install Nginx (if not using Docker)
install_nginx() {
    log "Installing Nginx..."
    
    if command -v nginx &> /dev/null; then
        info "Nginx is already installed"
        return
    fi
    
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    
    log "Nginx installed successfully"
}

# Install Certbot for SSL
install_certbot() {
    log "Installing Certbot for SSL certificates..."
    
    if command -v certbot &> /dev/null; then
        info "Certbot is already installed"
        return
    fi
    
    apt install -y certbot python3-certbot-nginx
    
    log "Certbot installed successfully"
}

# Setup firewall
setup_firewall() {
    log "Setting up firewall..."
    
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    
    log "Firewall configured successfully"
}

# Create application directory
create_app_directory() {
    log "Creating application directory..."
    
    if [ ! -d "$APP_DIR" ]; then
        mkdir -p "$APP_DIR"
    fi
    
    cd "$APP_DIR"
}

# Clone or update repository
setup_repository() {
    log "Setting up repository..."
    
    if [ -d ".git" ]; then
        log "Updating existing repository..."
        git pull origin main
    else
        log "Cloning repository..."
        # Replace with your actual repository URL
        git clone https://github.com/yourusername/your-repo.git .
    fi
}

# Create environment file
create_env_file() {
    log "Creating environment file..."
    
    if [ ! -f ".env.production" ]; then
        cat > .env.production << EOF
# Production Environment Variables
NODE_ENV=production

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google Sheets Configuration
GOOGLE_SHEETS_PRIVATE_KEY=your_google_sheets_private_key
GOOGLE_SHEETS_CLIENT_EMAIL=your_google_sheets_client_email
GOOGLE_SHEETS_SPREADSHEET_ID=your_google_sheets_spreadsheet_id

# Optional: Monitoring
GRAFANA_PASSWORD=your_grafana_password
EOF
        
        warn "Please edit .env.production file with your actual configuration values"
        warn "Run: nano .env.production"
    fi
}

# Build and start application
deploy_application() {
    log "Building and starting application..."
    
    # Stop existing containers
    docker-compose down 2>/dev/null || true
    
    # Build and start
    docker-compose --env-file .env.production up -d --build
    
    # Wait for application to be ready
    log "Waiting for application to be ready..."
    sleep 30
    
    # Check if application is running
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log "Application is running successfully!"
    else
        error "Application failed to start. Check logs with: docker-compose logs"
    fi
}

# Setup SSL certificate
setup_ssl() {
    log "Setting up SSL certificate..."
    
    # Note: This assumes you're using the standalone Nginx setup
    # For Docker setup, you'll need to modify the nginx.conf file
    
    if [ "$DOMAIN" != "yourdomain.com" ]; then
        certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "$EMAIL"
        log "SSL certificate installed successfully"
    else
        warn "Please update the DOMAIN variable in this script and run SSL setup manually"
    fi
}

# Setup monitoring (optional)
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Start monitoring services
    docker-compose --profile monitoring up -d
    
    log "Monitoring services started"
    info "Grafana: http://$DOMAIN:3001 (admin/your_grafana_password)"
    info "Prometheus: http://$DOMAIN:9090"
}

# Create backup script
create_backup_script() {
    log "Creating backup script..."
    
    cat > backup.sh << 'EOF'
#!/bin/bash
# Backup script for the application

BACKUP_DIR="/home/backups"
APP_DIR="/home/ultrasound-orb-store"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Backup application data
tar -czf "$BACKUP_DIR/app_backup_$DATE.tar.gz" -C "$APP_DIR" .

# Backup database (if using local database)
# pg_dump your_database > "$BACKUP_DIR/db_backup_$DATE.sql"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/app_backup_$DATE.tar.gz"
EOF
    
    chmod +x backup.sh
    
    # Add to crontab for daily backups
    (crontab -l 2>/dev/null; echo "0 2 * * * $APP_DIR/backup.sh") | crontab -
    
    log "Backup script created and scheduled"
}

# Setup log rotation
setup_log_rotation() {
    log "Setting up log rotation..."
    
    tee /etc/logrotate.d/docker-app << EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
EOF
    
    log "Log rotation configured"
}

# Main deployment function
main() {
    log "Starting deployment process..."
    
    check_root
    update_system
    install_docker
    install_docker_compose
    install_nginx
    install_certbot
    setup_firewall
    create_app_directory
    setup_repository
    create_env_file
    
    warn "IMPORTANT: Please edit .env.production with your actual configuration values before continuing"
    warn "Run: nano .env.production"
    read -p "Press Enter after updating the environment file..."
    
    deploy_application
    setup_ssl
    setup_monitoring
    create_backup_script
    setup_log_rotation
    
    log "Deployment completed successfully!"
    info "Your application is now running at: http://$DOMAIN"
    info "Health check: http://$DOMAIN/api/health"
    info "Admin panel: http://$DOMAIN/admin"
    
    log "Useful commands:"
    info "View logs: docker-compose logs -f"
    info "Restart app: docker-compose restart"
    info "Update app: git pull && docker-compose up -d --build"
    info "Backup: ./backup.sh"
}

# Run main function
main "$@"