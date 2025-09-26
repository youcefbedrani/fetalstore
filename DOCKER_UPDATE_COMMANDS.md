# 🐳 Docker Update Commands

## 🔄 **Complete Docker Update Process**

### **Step 1: Navigate to Your Project Directory**
```bash
cd /var/www/fetalstore
```

### **Step 2: Pull Latest Code**
```bash
# Stash any local changes first
git stash

# Pull the latest code
git pull origin main

# If you want to keep your local changes, use:
# git stash pop
```

### **Step 3: Stop Docker Containers**
```bash
# Stop all running containers
docker-compose down

# Or if using docker-compose with specific file:
docker-compose -f docker-compose.yml down

# Or stop specific containers:
docker stop container_name
```

### **Step 4: Rebuild Docker Images**
```bash
# Rebuild all images with latest code
docker-compose build

# Or rebuild specific service:
docker-compose build web

# Force rebuild without cache:
docker-compose build --no-cache
```

### **Step 5: Start Docker Containers**
```bash
# Start all services
docker-compose up -d

# Or start specific service:
docker-compose up -d web
```

### **Step 6: Check Container Status**
```bash
# Check running containers
docker ps

# Check all containers (including stopped)
docker ps -a

# Check logs
docker-compose logs

# Check logs for specific service:
docker-compose logs web
```

## 🚀 **Quick Update Commands (One-liner)**

### **Complete Update in One Command**
```bash
cd /var/www/fetalstore && git stash && git pull origin main && docker-compose down && docker-compose build && docker-compose up -d
```

### **Step by Step (Safer)**
```bash
# 1. Navigate to project
cd /var/www/fetalstore

# 2. Update code
git stash
git pull origin main

# 3. Restart Docker
docker-compose down
docker-compose build
docker-compose up -d

# 4. Check status
docker ps
docker-compose logs
```

## 🔧 **Docker Management Commands**

### **Container Management**
```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Stop all containers
docker stop $(docker ps -q)

# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune -a
```

### **Docker Compose Commands**
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Rebuild and restart
docker-compose up -d --build

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f web
```

### **Service Management**
```bash
# Start specific service
docker-compose up -d web

# Stop specific service
docker-compose stop web

# Restart specific service
docker-compose restart web

# Rebuild specific service
docker-compose build web
```

## 📊 **Monitoring Commands**

### **Check Container Health**
```bash
# Check container status
docker ps

# Check resource usage
docker stats

# Check logs in real-time
docker-compose logs -f

# Check specific service logs
docker-compose logs -f web
docker-compose logs -f nginx
docker-compose logs -f database
```

### **Check Application Status**
```bash
# Check if application is responding
curl http://localhost:3000

# Check if nginx is responding
curl http://localhost:80

# Check container health
docker inspect container_name | grep Health
```

## 🛠️ **Troubleshooting Commands**

### **If Containers Won't Start**
```bash
# Check logs for errors
docker-compose logs

# Check container status
docker ps -a

# Check system resources
docker system df

# Clean up unused resources
docker system prune -a
```

### **If Build Fails**
```bash
# Rebuild without cache
docker-compose build --no-cache

# Check Dockerfile syntax
docker build -t test .

# Check for port conflicts
netstat -tlnp | grep :3000
netstat -tlnp | grep :80
```

### **If Application Won't Load**
```bash
# Check container logs
docker-compose logs web

# Check nginx logs
docker-compose logs nginx

# Check if ports are exposed
docker port container_name

# Test internal connectivity
docker exec -it container_name curl localhost:3000
```

## 🔄 **Environment Variables Update**

### **If You Updated Environment Variables**
```bash
# Stop containers
docker-compose down

# Update .env file
nano .env

# Rebuild and start
docker-compose up -d --build
```

### **Check Environment Variables**
```bash
# Check environment variables in container
docker exec -it container_name env

# Check specific variable
docker exec -it container_name printenv VARIABLE_NAME
```

## 📝 **Docker Compose File Examples**

### **Basic docker-compose.yml**
```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - .:/app
    depends_on:
      - database

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - web

  database:
    image: postgres:13
    environment:
      - POSTGRES_DB=your_db
      - POSTGRES_USER=your_user
      - POSTGRES_PASSWORD=your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 🚨 **Emergency Commands**

### **If Everything is Broken**
```bash
# Stop all containers
docker-compose down

# Remove all containers and images
docker-compose down --rmi all

# Clean up everything
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

### **Quick Recovery**
```bash
# Restart everything
docker-compose restart

# Or force restart
docker-compose down && docker-compose up -d
```

## 📋 **Update Checklist**

- [ ] Navigate to project directory
- [ ] Stash local changes
- [ ] Pull latest code
- [ ] Stop Docker containers
- [ ] Rebuild Docker images
- [ ] Start Docker containers
- [ ] Check container status
- [ ] Check application logs
- [ ] Test website functionality

## 🎯 **Recommended Update Process**

```bash
# 1. Navigate to project
cd /var/www/fetalstore

# 2. Update code
git stash
git pull origin main

# 3. Restart Docker
docker-compose down
docker-compose build
docker-compose up -d

# 4. Verify everything is working
docker ps
docker-compose logs -f
curl http://localhost:3000
```

---

**Your Docker containers will be updated with the latest code!** 🐳
