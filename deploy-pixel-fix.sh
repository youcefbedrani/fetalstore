#!/bin/bash

echo "🚀 Deploying Meta Pixel Fix..."

# SSH into server and deploy
ssh root@185.97.146.104 << 'EOF'
cd /var/www/fetalstore

echo "📥 Pulling latest changes..."
git pull origin main

echo "🔄 Restarting containers..."
docker-compose -f docker-compose.simple.yml down
docker-compose -f docker-compose.simple.yml --env-file .env.production up -d

echo "⏳ Waiting for containers to start..."
sleep 10

echo "📊 Checking container status..."
docker-compose -f docker-compose.simple.yml ps

echo "✅ Deployment complete!"
echo "🧪 Test your pixel at: https://bidayagift.shop"
echo "🧪 Test events page: https://bidayagift.shop/test-events"
EOF

echo "🎉 Pixel fix deployed successfully!"
echo ""
echo "Next steps:"
echo "1. Visit: https://bidayagift.shop"
echo "2. Open browser console (F12)"
echo "3. Look for: '✅ Meta Pixel initialized successfully'"
echo "4. Check Meta Pixel Helper for pixel ID: 24528287270184892"
echo "5. Test with: https://bidayagift.shop/test-events"
