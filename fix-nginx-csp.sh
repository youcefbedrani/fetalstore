#!/bin/bash

# Fix nginx CSP headers to allow Facebook Pixel
echo "🔧 Fixing nginx CSP headers for Facebook Pixel..."

# Backup original nginx.conf
cp /var/www/fetalstore/nginx.conf /var/www/fetalstore/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)

# Update CSP header to allow Facebook scripts
sed -i 's|script-src '\''self'\'' '\''unsafe-inline'\'' '\''unsafe-eval'\''|script-src '\''self'\'' '\''unsafe-inline'\'' '\''unsafe-eval'\'' https://connect.facebook.net https://cdn.jsdelivr.net|g' /var/www/fetalstore/nginx.conf

# Update connect-src to allow Facebook connections
sed -i 's|connect-src '\''self'\'' https://\*.supabase.co https://api.cloudflare.com|connect-src '\''self'\'' https://\*.supabase.co https://api.cloudflare.com https://connect.facebook.net https://www.facebook.com|g' /var/www/fetalstore/nginx.conf

# Update img-src to allow Facebook tracking pixels
sed -i 's|img-src '\''self'\'' data: https:|img-src '\''self'\'' data: https: https://www.facebook.com|g' /var/www/fetalstore/nginx.conf

# Add font-src for Google Fonts
sed -i 's|style-src '\''self'\'' '\''unsafe-inline'\''|style-src '\''self'\'' '\''unsafe-inline'\'' https://fonts.googleapis.com|g' /var/www/fetalstore/nginx.conf

# Add font-src directive if not exists
if ! grep -q "font-src" /var/www/fetalstore/nginx.conf; then
    sed -i 's|img-src '\''self'\'' data: https: https://www.facebook.com;|img-src '\''self'\'' data: https: https://www.facebook.com; font-src '\''self'\'' https://fonts.gstatic.com;|g' /var/www/fetalstore/nginx.conf
fi

echo "✅ nginx.conf updated successfully!"

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ nginx configuration is valid!"
    
    # Reload nginx
    echo "🔄 Reloading nginx..."
    nginx -s reload
    
    if [ $? -eq 0 ]; then
        echo "✅ nginx reloaded successfully!"
        echo "🎯 Facebook Pixel should now work!"
    else
        echo "❌ Failed to reload nginx"
        exit 1
    fi
else
    echo "❌ nginx configuration test failed!"
    echo "🔄 Restoring backup..."
    cp /var/www/fetalstore/nginx.conf.backup.$(date +%Y%m%d_%H%M%S) /var/www/fetalstore/nginx.conf
    exit 1
fi

echo "🎉 Meta Pixel fix complete! Test your website now."
