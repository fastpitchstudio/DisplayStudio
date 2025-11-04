# Display Studio - Cloudflare Tunnel Proxy

This proxy server enables remote access to your matrix switcher device through a Cloudflare Tunnel, allowing you to control your device from anywhere using the Vercel-hosted Display Studio app.

## Overview

**The Problem:**
- Matrix switcher only supports HTTP (not HTTPS)
- Device is on local network only (e.g., 192.168.1.122)
- Browsers block HTTPS → HTTP (mixed content)
- Vercel-hosted app can't reach local devices

**The Solution:**
- Run this proxy on a Raspberry Pi on your local network
- Proxy translates HTTPS requests to HTTP for the device
- Cloudflare Tunnel exposes the proxy with HTTPS
- Vercel app calls the tunnel URL instead of local IP

## Architecture

```
Internet
   ↓
Vercel App (HTTPS)
   ↓
Cloudflare Tunnel (HTTPS)
   ↓
Raspberry Pi Proxy (HTTP)
   ↓
Matrix Switcher Device (HTTP)
```

## Requirements

- Raspberry Pi (3, 4, or Zero 2 W) running Raspberry Pi OS
- Node.js 18+ installed on the Pi
- A domain managed in Cloudflare (free account works)
- Matrix switcher on the same local network as the Pi

## Quick Start

### 1. Install Node.js on Raspberry Pi

```bash
# Check if Node.js is installed
node --version

# If not installed or version < 18, install latest
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be 20.x
npm --version
```

### 2. Clone and Setup Proxy

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/DisplayStudio.git
cd DisplayStudio/raspberry-pi-proxy

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env
```

Edit `.env`:
```env
PORT=3001
MATRIX_DEVICE_IP=192.168.1.122
MATRIX_DEVICE_AUTH=admin:admin
```

### 3. Test the Proxy Locally

```bash
# Start the proxy server
npm start

# In another terminal, test it
curl http://localhost:3001/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-11-04T...",
  "matrixDevice": "192.168.1.122",
  "version": "1.0.0"
}
```

### 4. Setup Cloudflare Tunnel

```bash
# Run the interactive setup script
./setup-cloudflare-tunnel.sh
```

Follow the prompts:
1. **Authenticate**: Opens browser to log into Cloudflare
2. **Create Tunnel**: Enter a name (e.g., "display-studio")
3. **Configure DNS**: Enter subdomain (e.g., "matrix.yourdomain.com")
4. **Install Service**: Choose Yes to auto-start on boot

### 5. Configure Display Studio App

1. Deploy or access your Vercel-hosted Display Studio app
2. Open **Settings** (gear icon)
3. Find **"Remote Access URL (Optional)"**
4. Enter: `https://matrix.yourdomain.com`
5. Click **Save**

### 6. Test End-to-End

```bash
# From any device with internet access
curl https://matrix.yourdomain.com/health
```

Then open Display Studio in a browser and verify you can control the matrix switcher!

## Maintenance

### View Logs

```bash
# Proxy logs
sudo journalctl -u cloudflared -f

# If running proxy manually
npm start
```

### Restart Services

```bash
# Restart Cloudflare Tunnel
sudo systemctl restart cloudflared

# Restart proxy (if running as service)
# See "Running Proxy as Service" below
```

### Update Proxy

```bash
cd DisplayStudio
git pull
cd raspberry-pi-proxy
npm install
# Restart service if running as one
```

## Running Proxy as a System Service

To run the proxy automatically on boot:

### 1. Create Service File

```bash
sudo nano /etc/systemd/system/display-studio-proxy.service
```

Add:
```ini
[Unit]
Description=Display Studio Matrix Proxy
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/DisplayStudio/raspberry-pi-proxy
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### 2. Enable and Start

```bash
sudo systemctl enable display-studio-proxy
sudo systemctl start display-studio-proxy

# Check status
sudo systemctl status display-studio-proxy

# View logs
sudo journalctl -u display-studio-proxy -f
```

## Troubleshooting

### Proxy won't start

**Check if port 3001 is in use:**
```bash
sudo lsof -i :3001
```

**Check permissions:**
```bash
ls -la ~/.env
# Should be readable by your user
```

### Cloudflare Tunnel not connecting

**Check tunnel status:**
```bash
sudo systemctl status cloudflared
```

**View tunnel logs:**
```bash
sudo journalctl -u cloudflared -f
```

**Verify tunnel exists:**
```bash
cloudflared tunnel list
```

### Can't reach matrix device from proxy

**Test direct connection:**
```bash
curl -u admin:admin \
  -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'matrixdata={"COMMAND":"GETSWS"}' \
  http://192.168.1.122/cgi-bin/matrixs.cgi
```

### App still uses local IP

1. Check Settings panel - is tunnel URL saved?
2. Clear browser cache and reload
3. Check browser console for errors
4. Verify tunnel URL is correct (no trailing slash)

## Security Notes

- Cloudflare Tunnel provides end-to-end encryption
- No ports need to be opened on your router
- Authentication is handled by the matrix device (Basic Auth)
- Consider changing default admin:admin credentials

## Advanced Configuration

### Custom Port

Edit `.env`:
```env
PORT=8080
```

Update `~/.cloudflared/config.yml`:
```yaml
ingress:
  - hostname: matrix.yourdomain.com
    service: http://localhost:8080  # Changed port
```

Restart both services.

### Multiple Matrix Devices

Run multiple proxy instances on different ports, each with its own tunnel configuration.

### Rate Limiting

Add rate limiting to the proxy if needed (not implemented by default).

## Support

- Check logs first: `sudo journalctl -u cloudflared -f`
- Test health endpoint: `curl https://matrix.yourdomain.com/health`
- Verify local proxy works: `curl http://localhost:3001/health`
- Check Cloudflare dashboard for tunnel status

## Files

- `server.js` - Express proxy server
- `package.json` - Node.js dependencies
- `.env` - Configuration (create from .env.example)
- `setup-cloudflare-tunnel.sh` - Interactive setup script
- `cloudflared-config.yml` - Template for tunnel configuration

## License

MIT - Same as Display Studio project
