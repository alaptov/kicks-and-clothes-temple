#!/bin/bash

# Kicks and Clothes Temple - Server Setup Script
# Run this on your Linux server to set up the environment

set -e

echo "========================================"
echo "  Kicks and Clothes Temple Setup"
echo "========================================"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (sudo ./server-setup.sh)"
  exit 1
fi

# Update system
echo "Updating system packages..."
apt-get update && apt-get upgrade -y

# Install Docker
echo "Installing Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  rm get-docker.sh

  # Add current user to docker group
  usermod -aG docker $SUDO_USER
fi

# Install Docker Compose
echo "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
  apt-get install -y docker-compose-plugin
fi

# Install other utilities
echo "Installing utilities..."
apt-get install -y git certbot nginx-light

# Create application directory
APP_DIR="/opt/kc"
echo "Creating application directory at $APP_DIR..."
mkdir -p $APP_DIR
mkdir -p $APP_DIR/nginx/ssl
mkdir -p $APP_DIR/nginx/certbot

# Set up firewall
echo "Configuring firewall..."
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable

# Create systemd service for auto-restart
echo "Creating systemd service..."
cat > /etc/systemd/system/kc.service << 'EOF'
[Unit]
Description=Kicks and Clothes Temple
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/kc
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable kc.service

echo ""
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Clone your repository to $APP_DIR"
echo "2. Copy .env.example to .env and fill in values"
echo "3. Run: docker compose up -d"
echo ""
echo "For SSL certificates, run:"
echo "  certbot certonly --webroot -w /opt/kc/nginx/certbot -d yourdomain.com"
echo ""
echo "Then update nginx.conf with your domain and SSL paths"
echo ""
