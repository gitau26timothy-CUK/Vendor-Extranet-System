# Deployment Guide - Vendor Extranet System

This guide covers deployment options for the Vendor Extranet System.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Docker Deployment](#docker-deployment)
3. [Manual Deployment](#manual-deployment)
4. [Cloud Deployment](#cloud-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Post-Deployment](#post-deployment)

## Prerequisites

### Required Software
- Docker & Docker Compose (for containerized deployment)
- Node.js 18+ (for manual deployment)
- MongoDB 6.0+
- Redis 7+ (optional, for caching)
- Nginx (for production)

### Required Services
- OpenAI API Key (for AI features)
- SMTP Server (for email notifications)
- Domain name (for production)
- SSL Certificate (recommended)

## Docker Deployment

### Quick Start with Docker Compose

1. **Clone the repository**
```bash
git clone <repository-url>
cd vendor-extranet-system
```

2. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
nano .env
```

Required environment variables:
- `JWT_SECRET`: Strong random string for JWT signing
- `OPENAI_API_KEY`: Your OpenAI API key
- `SMTP_*`: Email server configuration

3. **Start all services**
```bash
docker-compose up -d
```

4. **Check service status**
```bash
docker-compose ps
```

5. **View logs**
```bash
docker-compose logs -f
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017
- Redis: localhost:6379

### Docker Commands

**Stop services:**
```bash
docker-compose down
```

**Restart services:**
```bash
docker-compose restart
```

**Rebuild images:**
```bash
docker-compose build --no-cache
docker-compose up -d
```

**View specific service logs:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Execute commands in containers:**
```bash
docker-compose exec backend npm run seed
docker-compose exec mongodb mongosh
```

## Manual Deployment

### Backend Deployment

1. **Install dependencies**
```bash
npm install --production
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with production values
```

3. **Start MongoDB**
```bash
# Using systemd
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

4. **Start the backend**
```bash
# Development
npm run dev

# Production with PM2
npm install -g pm2
pm2 start backend/server.js --name vendor-extranet-api
pm2 save
pm2 startup
```

### Frontend Deployment

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Configure API URL**
```bash
# Create .env.production
echo "VITE_API_URL=https://api.yourdomain.com/api" > .env.production
```

3. **Build for production**
```bash
npm run build
```

4. **Serve with Nginx**

Create Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/vendor-extranet/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. **Enable and restart Nginx**
```bash
sudo ln -s /etc/nginx/sites-available/vendor-extranet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Cloud Deployment

### AWS Deployment

#### Using EC2

1. **Launch EC2 instance**
   - AMI: Ubuntu 22.04 LTS
   - Instance type: t3.medium or larger
   - Security groups: Allow ports 22, 80, 443

2. **Connect and setup**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

3. **Deploy application**
```bash
git clone <repository-url>
cd vendor-extranet-system
cp .env.example .env
# Configure .env
docker-compose up -d
```

#### Using ECS (Elastic Container Service)

1. Push images to ECR
2. Create ECS cluster
3. Define task definitions
4. Create services
5. Configure load balancer

### Azure Deployment

#### Using Azure Container Instances

```bash
# Login to Azure
az login

# Create resource group
az group create --name vendor-extranet-rg --location eastus

# Create container instances
az container create \
  --resource-group vendor-extranet-rg \
  --name vendor-extranet-backend \
  --image your-registry/vendor-extranet-backend:latest \
  --dns-name-label vendor-extranet-api \
  --ports 5000

az container create \
  --resource-group vendor-extranet-rg \
  --name vendor-extranet-frontend \
  --image your-registry/vendor-extranet-frontend:latest \
  --dns-name-label vendor-extranet-app \
  --ports 80
```

### Google Cloud Platform

#### Using Cloud Run

```bash
# Build and push images
gcloud builds submit --tag gcr.io/PROJECT_ID/vendor-extranet-backend
gcloud builds submit --tag gcr.io/PROJECT_ID/vendor-extranet-frontend

# Deploy services
gcloud run deploy vendor-extranet-backend \
  --image gcr.io/PROJECT_ID/vendor-extranet-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

gcloud run deploy vendor-extranet-frontend \
  --image gcr.io/PROJECT_ID/vendor-extranet-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Environment Configuration

### Production Environment Variables

```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://username:password@host:27017/vendor_extranet?authSource=admin

# Security
JWT_SECRET=<strong-random-string-min-32-chars>
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12

# AI
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Frontend
FRONTEND_URL=https://yourdomain.com

# Redis (if using)
REDIS_HOST=redis-host
REDIS_PORT=6379
REDIS_PASSWORD=redis-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (min 32 characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Configure backup strategy
- [ ] Set up monitoring and alerts
- [ ] Review and update security headers
- [ ] Implement log rotation

## Post-Deployment

### 1. Database Initialization

```bash
# Create admin user
docker-compose exec backend node scripts/createAdmin.js

# Seed sample data (optional)
docker-compose exec backend node scripts/seedData.js
```

### 2. SSL Certificate Setup

Using Let's Encrypt with Certbot:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 3. Monitoring Setup

**Using PM2 (for Node.js)**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Monitor
pm2 monit
```

**Health Checks**
```bash
# Backend health
curl http://localhost:5000/health

# Frontend health
curl http://localhost:3000
```

### 4. Backup Strategy

**MongoDB Backup**
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
mkdir -p $BACKUP_DIR

docker-compose exec -T mongodb mongodump \
  --out=/tmp/backup_$DATE \
  --gzip

docker cp vendor-extranet-mongodb:/tmp/backup_$DATE $BACKUP_DIR/
EOF

chmod +x backup.sh

# Schedule with cron
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

### 5. Performance Optimization

- Enable Redis caching
- Configure CDN for static assets
- Optimize database indexes
- Enable gzip compression
- Implement lazy loading
- Use connection pooling

### 6. Monitoring and Logging

**Recommended Tools:**
- Application: PM2, New Relic, DataDog
- Infrastructure: CloudWatch, Azure Monitor, Stackdriver
- Logs: ELK Stack, Splunk, Papertrail
- Uptime: UptimeRobot, Pingdom

## Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```bash
# Check MongoDB status
docker-compose logs mongodb

# Verify connection string
echo $MONGODB_URI
```

**Port Already in Use**
```bash
# Find process using port
sudo lsof -i :5000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

**Out of Memory**
```bash
# Check memory usage
docker stats

# Increase container memory
# Edit docker-compose.yml and add:
# mem_limit: 2g
```

**SSL Certificate Issues**
```bash
# Renew certificate
sudo certbot renew --force-renewal

# Check certificate
sudo certbot certificates
```

## Rollback Procedure

```bash
# Stop current version
docker-compose down

# Checkout previous version
git checkout <previous-commit>

# Rebuild and start
docker-compose build
docker-compose up -d

# Restore database if needed
docker-compose exec mongodb mongorestore /backup/path
```

## Support

For deployment issues:
- Check logs: `docker-compose logs -f`
- Review documentation: README.md
- Contact: support@vendorextranet.com

---

**Last Updated:** May 2026