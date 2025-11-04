# Quick Start: 5-Minute Setup

Get your Display Studio remote access running in 5 minutes!

## Prerequisites
- ✅ Raspberry Pi connected to same network as matrix device
- ✅ SSH access to Pi
- ✅ Domain managed in Cloudflare

## Setup Commands

```bash
# 1. Install Node.js (if needed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# 2. Clone and install
cd ~
git clone https://github.com/YOUR-USERNAME/DisplayStudio.git
cd DisplayStudio/raspberry-pi-proxy
npm install

# 3. Configure
cp .env.example .env
nano .env  # Edit MATRIX_DEVICE_IP

# 4. Setup tunnel
./setup-cloudflare-tunnel.sh
# Follow prompts:
#  - Login to Cloudflare
#  - Enter tunnel name: display-studio
#  - Enter hostname: matrix.yourdomain.com
#  - Install service: Yes

# 5. Start proxy as service
sudo nano /etc/systemd/system/display-studio-proxy.service
# Paste service config (see README.md)

sudo systemctl enable display-studio-proxy
sudo systemctl start display-studio-proxy

# 6. Test
curl https://matrix.yourdomain.com/health
```

## Configure App

1. Open Display Studio on Vercel
2. Settings → Remote Access URL
3. Enter: `https://matrix.yourdomain.com`
4. Save and test!

## Troubleshooting

```bash
# Check status
sudo systemctl status cloudflared
sudo systemctl status display-studio-proxy

# View logs
sudo journalctl -u cloudflared -f
sudo journalctl -u display-studio-proxy -f

# Restart
sudo systemctl restart cloudflared display-studio-proxy
```

## Done!

Your matrix switcher is now accessible from anywhere! 🎉

See `README.md` for detailed instructions and `../REMOTE_ACCESS_SETUP.md` for complete guide.
