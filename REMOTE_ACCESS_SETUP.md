# Remote Access Setup Guide

This guide explains how to set up remote access to your matrix switcher so you can control it from anywhere using the Display Studio app hosted on Vercel.

## Why Remote Access?

By default, your matrix switcher is only accessible on your local network (e.g., 192.168.1.122). This means you can only control it when connected to the same WiFi/network.

With remote access configured:
- ✅ Control your matrix from anywhere with internet
- ✅ Use the Vercel-hosted app (no local server needed)
- ✅ Secure HTTPS connection via Cloudflare Tunnel
- ✅ No router port forwarding required

## Overview

You'll set up a small proxy server on a Raspberry Pi that:
1. Stays on your local network with the matrix device
2. Connects to Cloudflare Tunnel for secure remote access
3. Translates HTTPS requests from the internet to HTTP for your local device

**Time Required:** 30-45 minutes

## What You'll Need

- **Raspberry Pi** (Model 3, 4, or Zero 2 W recommended)
- **Power supply** for the Pi
- **MicroSD card** (8GB+) with Raspberry Pi OS installed
- **Domain name** with DNS managed by Cloudflare (free account works)
- **SSH access** to your Raspberry Pi

## Step-by-Step Setup

### Step 1: Prepare Your Raspberry Pi

1. **Install Raspberry Pi OS** (if not already done):
   - Download [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
   - Flash Raspberry Pi OS Lite to SD card
   - Enable SSH during setup

2. **Connect to your Pi via SSH:**
   ```bash
   ssh pi@raspberrypi.local
   # Default password: raspberry (change this!)
   ```

3. **Update system:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs git
   node --version  # Should show v20.x
   ```

### Step 2: Install the Proxy Server

1. **Clone the repository:**
   ```bash
   cd ~
   git clone https://github.com/YOUR-USERNAME/DisplayStudio.git
   cd DisplayStudio/raspberry-pi-proxy
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure the proxy:**
   ```bash
   cp .env.example .env
   nano .env
   ```

   Update these values:
   ```env
   PORT=3001
   MATRIX_DEVICE_IP=192.168.1.122  # Your matrix device IP
   MATRIX_DEVICE_AUTH=admin:admin  # Your device credentials
   ```

   Save and exit (Ctrl+X, Y, Enter)

4. **Test the proxy:**
   ```bash
   npm start
   ```

   You should see:
   ```
   ╔════════════════════════════════════════╗
   ║  Display Studio Proxy Server           ║
   ║  Status: Running                       ║
   ║  Port: 3001                            ║
   ╚════════════════════════════════════════╝
   ```

   Press Ctrl+C to stop for now.

### Step 3: Set Up Cloudflare Tunnel

1. **Make sure you have a Cloudflare account:**
   - Go to [cloudflare.com](https://cloudflare.com) and sign up (free)
   - Add your domain to Cloudflare
   - Update your domain's nameservers to Cloudflare's

2. **Run the setup script:**
   ```bash
   ./setup-cloudflare-tunnel.sh
   ```

3. **Follow the prompts:**

   **Authenticate:**
   - Script will open a browser (or give you a URL)
   - Log into your Cloudflare account
   - Authorize the tunnel

   **Create Tunnel:**
   - Enter a name: `display-studio`

   **Configure DNS:**
   - Enter hostname: `matrix.yourdomain.com`
   - Replace `yourdomain.com` with your actual domain

   **Install Service:**
   - Choose **Yes** to install as system service
   - This makes the tunnel start automatically on boot

4. **Verify tunnel is running:**
   ```bash
   sudo systemctl status cloudflared
   ```

   Should show "active (running)"

### Step 4: Test the Connection

1. **From your Pi, test the tunnel:**
   ```bash
   curl https://matrix.yourdomain.com/health
   ```

   Should return:
   ```json
   {
     "status": "ok",
     "matrixDevice": "192.168.1.122",
     "version": "1.0.0"
   }
   ```

2. **From another device (phone, laptop), test:**
   - Open browser
   - Go to `https://matrix.yourdomain.com/health`
   - Should see the same JSON response

If you see this, your tunnel is working! 🎉

### Step 5: Configure Display Studio App

1. **Open your Vercel-hosted Display Studio app**

2. **Click the Settings icon** (gear in top right)

3. **Find "Remote Access URL (Optional)"** field

4. **Enter your tunnel URL:**
   ```
   https://matrix.yourdomain.com
   ```
   ⚠️ **Important:** No trailing slash!

5. **Click "Save"**

6. **Test it:** Try switching inputs/outputs in the app

### Step 6: Make Proxy Start on Boot

To ensure the proxy server starts automatically:

1. **Create systemd service:**
   ```bash
   sudo nano /etc/systemd/system/display-studio-proxy.service
   ```

2. **Paste this configuration:**
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

   [Install]
   WantedBy=multi-user.target
   ```

3. **Enable and start:**
   ```bash
   sudo systemctl enable display-studio-proxy
   sudo systemctl start display-studio-proxy
   sudo systemctl status display-studio-proxy
   ```

## Testing Your Setup

### Test from Local Network

1. Open Display Studio app on local device
2. Clear the "Remote Access URL" field in Settings
3. Make sure "Device IP" is your local IP (192.168.1.122)
4. Test switching - should work via local network

### Test from Internet

1. Open Display Studio app on phone (disconnect from WiFi, use cellular)
2. Settings should have tunnel URL configured
3. Test switching - should work via internet!

### Test Health Endpoint

```bash
# Should always return status
curl https://matrix.yourdomain.com/health
```

## Troubleshooting

### "Connection failed" in app

**Check proxy is running:**
```bash
sudo systemctl status display-studio-proxy
```

**Check tunnel is running:**
```bash
sudo systemctl status cloudflared
```

**View logs:**
```bash
# Proxy logs
sudo journalctl -u display-studio-proxy -f

# Tunnel logs
sudo journalctl -u cloudflared -f
```

### Health endpoint returns error

**Check network:**
```bash
ping 192.168.1.122
```

**Test direct connection to device:**
```bash
curl -u admin:admin \
  -X POST \
  -d 'matrixdata={"COMMAND":"GETSWS"}' \
  http://192.168.1.122/cgi-bin/matrixs.cgi
```

### App still using local IP

1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)
2. Check Settings - is tunnel URL saved correctly?
3. Look for "Using Cloudflare Tunnel" message in browser console

### Tunnel stopped working

**Restart services:**
```bash
sudo systemctl restart cloudflared
sudo systemctl restart display-studio-proxy
```

**Check Cloudflare dashboard:**
- Go to cloudflare.com
- Navigate to Zero Trust > Networks > Tunnels
- Verify tunnel status

## Maintenance

### Updating the Proxy

```bash
cd ~/DisplayStudio
git pull
cd raspberry-pi-proxy
npm install
sudo systemctl restart display-studio-proxy
```

### Viewing Logs

```bash
# Live proxy logs
sudo journalctl -u display-studio-proxy -f

# Live tunnel logs
sudo journalctl -u cloudflared -f

# Last 50 proxy logs
sudo journalctl -u display-studio-proxy -n 50
```

### Restarting Everything

```bash
sudo systemctl restart display-studio-proxy
sudo systemctl restart cloudflared
```

## Security Considerations

✅ **Good:**
- Cloudflare Tunnel uses end-to-end encryption
- No router ports need to be opened
- Tunnel URL is only known to you

⚠️ **Improve:**
- Change default matrix device password (admin:admin)
- Use a unique tunnel name
- Consider adding authentication to the proxy

## Cost

- **Cloudflare Tunnel:** FREE
- **Cloudflare DNS:** FREE
- **Raspberry Pi:** One-time hardware cost (~$35-75)
- **Vercel Hosting:** FREE (hobby plan)

**Total ongoing cost:** $0/month 🎉

## Benefits vs Local-Only Setup

| Feature | Local Only | With Remote Access |
|---------|-----------|-------------------|
| Control from home network | ✅ | ✅ |
| Control from anywhere | ❌ | ✅ |
| Requires local server | ✅ | ❌ |
| PWA installable | ✅ | ✅ |
| HTTPS (required for PWA) | ❌ | ✅ |
| Easy updates | ❌ | ✅ |

## Next Steps

1. ✅ Set up remote access (you're here!)
2. Install Display Studio as PWA on your devices (see `PWA_INSTALL.md`)
3. Configure input/output labels in Settings
4. Enjoy controlling your matrix from anywhere!

## Need Help?

- Check the detailed `raspberry-pi-proxy/README.md`
- Review logs: `sudo journalctl -u cloudflared -f`
- Test each component individually (health endpoint, local proxy, tunnel)
- Verify Cloudflare tunnel status in dashboard

## Advanced Topics

- Running multiple proxies for multiple devices
- Custom domain configuration
- Adding rate limiting
- Monitoring and alerts

See `raspberry-pi-proxy/README.md` for advanced configuration options.
