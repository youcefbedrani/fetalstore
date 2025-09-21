#!/bin/bash

# E-commerce Store Deployment Script
# This script handles the deployment of the Next.js e-commerce store with Cloudflare integration

set -e  # Exit on any error

echo "🚀 Starting deployment of E-commerce Store with Cloudflare Integration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."
    
    required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "CLOUDFLARE_API_TOKEN"
        "CLOUDFLARE_ZONE_ID"
        "ADMIN_SECRET_TOKEN"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi
    
    print_success "All required environment variables are set"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ -f "package-lock.json" ]; then
        npm ci --production=false
    else
        npm install
    fi
    
    print_success "Dependencies installed successfully"
}

# Run linting
run_linting() {
    print_status "Running ESLint..."
    
    if npm run lint; then
        print_success "Linting passed"
    else
        print_warning "Linting failed, but continuing with deployment"
    fi
}

# Build the application
build_application() {
    print_status "Building application..."
    
    # Clean previous build
    rm -rf .next
    
    # Build the application
    npm run build
    
    print_success "Application built successfully"
}

# Create logs directory
create_logs_directory() {
    print_status "Creating logs directory..."
    
    mkdir -p logs
    touch logs/error.log logs/combined.log
    chmod 644 logs/error.log logs/combined.log
    
    print_success "Logs directory created"
}

# Set up log rotation
setup_log_rotation() {
    print_status "Setting up log rotation..."
    
    cat > /etc/logrotate.d/ecommerce-store << EOF
/home/badran/Downloads/Freelance_2025/Project_v2/website_code/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 $(whoami) $(whoami)
    postrotate
        # Restart the application if it's running
        if [ -f /var/run/ecommerce-store.pid ]; then
            kill -USR1 \$(cat /var/run/ecommerce-store.pid) 2>/dev/null || true
        fi
    endscript
}
EOF
    
    print_success "Log rotation configured"
}

# Create systemd service
create_systemd_service() {
    print_status "Creating systemd service..."
    
    cat > /etc/systemd/system/ecommerce-store.service << EOF
[Unit]
Description=E-commerce Store with Cloudflare Integration
After=network.target

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=/home/badran/Downloads/Freelance_2025/Project_v2/website_code
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/home/badran/Downloads/Freelance_2025/Project_v2/website_code/.env.local
PIDFile=/var/run/ecommerce-store.pid

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    print_success "Systemd service created"
}

# Start the service
start_service() {
    print_status "Starting e-commerce store service..."
    
    systemctl enable ecommerce-store
    systemctl start ecommerce-store
    
    # Wait a moment for the service to start
    sleep 5
    
    if systemctl is-active --quiet ecommerce-store; then
        print_success "Service started successfully"
    else
        print_error "Failed to start service"
        systemctl status ecommerce-store
        exit 1
    fi
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Wait for the service to be ready
    sleep 10
    
    # Check if the service is responding
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_success "Health check passed"
    else
        print_error "Health check failed"
        print_status "Service logs:"
        journalctl -u ecommerce-store --no-pager -n 20
        exit 1
    fi
}

# Setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    # Create monitoring script
    cat > /home/badran/Downloads/Freelance_2025/Project_v2/website_code/monitor.sh << 'EOF'
#!/bin/bash

# Simple monitoring script for the e-commerce store
LOG_FILE="/home/badran/Downloads/Freelance_2025/Project_v2/website_code/logs/monitor.log"

check_service() {
    if ! systemctl is-active --quiet ecommerce-store; then
        echo "$(date): Service is down, attempting restart..." >> $LOG_FILE
        systemctl restart ecommerce-store
        sleep 10
        
        if systemctl is-active --quiet ecommerce-store; then
            echo "$(date): Service restarted successfully" >> $LOG_FILE
        else
            echo "$(date): Failed to restart service" >> $LOG_FILE
        fi
    fi
}

check_health() {
    if ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "$(date): Health check failed" >> $LOG_FILE
    fi
}

check_service
check_health
EOF
    
    chmod +x /home/badran/Downloads/Freelance_2025/Project_v2/website_code/monitor.sh
    
    # Add to crontab for monitoring every 5 minutes
    (crontab -l 2>/dev/null; echo "*/5 * * * * /home/badran/Downloads/Freelance_2025/Project_v2/website_code/monitor.sh") | crontab -
    
    print_success "Monitoring setup completed"
}

# Main deployment function
main() {
    echo "=========================================="
    echo "E-commerce Store Deployment Script"
    echo "=========================================="
    
    check_env_vars
    install_dependencies
    run_linting
    build_application
    create_logs_directory
    setup_log_rotation
    create_systemd_service
    start_service
    health_check
    setup_monitoring
    
    echo "=========================================="
    print_success "Deployment completed successfully!"
    echo "=========================================="
    echo ""
    echo "Service Status:"
    systemctl status ecommerce-store --no-pager
    echo ""
    echo "Access URLs:"
    echo "  - Main Store: http://localhost:3000"
    echo "  - Admin Dashboard: http://localhost:3000/admin"
    echo "  - Health Check: http://localhost:3000/api/health"
    echo ""
    echo "Useful Commands:"
    echo "  - View logs: journalctl -u ecommerce-store -f"
    echo "  - Restart service: systemctl restart ecommerce-store"
    echo "  - Stop service: systemctl stop ecommerce-store"
    echo "  - Check status: systemctl status ecommerce-store"
    echo ""
}

# Run main function
main "$@"
