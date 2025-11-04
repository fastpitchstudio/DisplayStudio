#!/bin/bash

# Display Studio - Cloudflare Tunnel Setup Script for Raspberry Pi
# This script installs and configures Cloudflare Tunnel (cloudflared)

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Display Studio - Cloudflare Tunnel Setup                ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if running on Raspberry Pi
if [[ ! -f /proc/device-tree/model ]] || ! grep -q "Raspberry Pi" /proc/device-tree/model 2>/dev/null; then
    echo "⚠️  Warning: This script is designed for Raspberry Pi"
    echo "   You can still proceed, but some steps may differ."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if cloudflared is already installed
if command -v cloudflared &> /dev/null; then
    echo "✓ cloudflared is already installed"
    cloudflared --version
else
    echo "📦 Installing cloudflared..."

    # Detect architecture
    ARCH=$(uname -m)
    if [[ "$ARCH" == "aarch64" ]] || [[ "$ARCH" == "arm64" ]]; then
        CLOUDFLARED_ARCH="arm64"
    elif [[ "$ARCH" == "armv7l" ]] || [[ "$ARCH" == "armv6l" ]]; then
        CLOUDFLARED_ARCH="arm"
    else
        echo "❌ Unsupported architecture: $ARCH"
        exit 1
    fi

    # Download and install cloudflared
    wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${CLOUDFLARED_ARCH} -O cloudflared
    sudo mv cloudflared /usr/local/bin/
    sudo chmod +x /usr/local/bin/cloudflared

    echo "✓ cloudflared installed successfully"
    cloudflared --version
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  STEP 1: Authenticate with Cloudflare"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "This will open a browser window for you to log in to Cloudflare."
echo "If running headless, you'll get a URL to open on another device."
echo ""
read -p "Press Enter to continue..."

cloudflared tunnel login

echo ""
echo "✓ Authentication complete!"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "  STEP 2: Create Tunnel"
echo "═══════════════════════════════════════════════════════════"
echo ""
read -p "Enter a name for your tunnel (e.g., display-studio): " TUNNEL_NAME

if [[ -z "$TUNNEL_NAME" ]]; then
    TUNNEL_NAME="display-studio"
fi

cloudflared tunnel create "$TUNNEL_NAME"

TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')

if [[ -z "$TUNNEL_ID" ]]; then
    echo "❌ Failed to create tunnel"
    exit 1
fi

echo "✓ Tunnel created: $TUNNEL_NAME (ID: $TUNNEL_ID)"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "  STEP 3: Configure DNS"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Enter the hostname you want to use (e.g., matrix.yourdomain.com)"
echo "This should be a subdomain of a domain you have in Cloudflare."
echo ""
read -p "Hostname: " TUNNEL_HOSTNAME

if [[ -z "$TUNNEL_HOSTNAME" ]]; then
    echo "❌ Hostname is required"
    exit 1
fi

cloudflared tunnel route dns "$TUNNEL_NAME" "$TUNNEL_HOSTNAME"

echo "✓ DNS configured: $TUNNEL_HOSTNAME → $TUNNEL_NAME"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "  STEP 4: Create Configuration File"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Create config directory if it doesn't exist
mkdir -p ~/.cloudflared

# Create config file
cat > ~/.cloudflared/config.yml <<EOF
tunnel: $TUNNEL_ID
credentials-file: /home/$(whoami)/.cloudflared/$TUNNEL_ID.json

ingress:
  - hostname: $TUNNEL_HOSTNAME
    service: http://localhost:3001
  - service: http_status:404
EOF

echo "✓ Configuration file created at ~/.cloudflared/config.yml"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "  STEP 5: Install as System Service"
echo "═══════════════════════════════════════════════════════════"
echo ""
read -p "Install cloudflared as a system service? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo cloudflared service install
    sudo systemctl start cloudflared
    sudo systemctl enable cloudflared

    echo "✓ Service installed and started"
    echo ""
    echo "Service status:"
    sudo systemctl status cloudflared --no-pager
else
    echo "⚠️  Skipped service installation"
    echo "   You can run manually with: cloudflared tunnel run $TUNNEL_NAME"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Setup Complete! 🎉                                       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Your tunnel is configured and ready to use!"
echo ""
echo "Tunnel Details:"
echo "  • Name:     $TUNNEL_NAME"
echo "  • ID:       $TUNNEL_ID"
echo "  • Hostname: $TUNNEL_HOSTNAME"
echo "  • Target:   http://localhost:3001"
echo ""
echo "Next Steps:"
echo "  1. Start the Display Studio proxy server:"
echo "     cd $(pwd)"
echo "     npm install"
echo "     npm start"
echo ""
echo "  2. Test the tunnel:"
echo "     curl https://$TUNNEL_HOSTNAME/health"
echo ""
echo "  3. Add this URL to your Vercel environment variables:"
echo "     NEXT_PUBLIC_MATRIX_PROXY_URL=https://$TUNNEL_HOSTNAME"
echo ""
echo "To manage your tunnel:"
echo "  • Start:   sudo systemctl start cloudflared"
echo "  • Stop:    sudo systemctl stop cloudflared"
echo "  • Status:  sudo systemctl status cloudflared"
echo "  • Logs:    sudo journalctl -u cloudflared -f"
echo ""
