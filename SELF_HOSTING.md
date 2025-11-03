# Self-Hosting DisplayStudio - Easiest Options

## Why Self-Host?

Self-hosting avoids CORS issues entirely. When both the app and device are on your local network:
- ✅ No HTTPS→HTTP mixed content blocking
- ✅ No CORS workarounds needed
- ✅ Works in ALL browsers (Safari, Chrome, Firefox, mobile)
- ✅ Faster response times (no Vercel roundtrip)

## Option 1: macOS (Easiest - 5 Minutes)

**Requirements:** macOS with Node.js installed

### Quick Start

```bash
# Navigate to project
cd /Users/dalena/Projects/DisplayStudio

# Install dependencies (if not already done)
npm install

# Ensure .env.local exists with Convex credentials
# (should already exist from development)
cat .env.local

# Build for production
npm run build

# Start the server
npm start
```

**Note:** If `.env.local` doesn't exist, create it with:
```bash
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOY_KEY=prod:your-deployment-name|your-key-value
```

The app runs on **http://localhost:3000** and is accessible from any device on your network at **http://YOUR-MAC-IP:3000**

### Find Your Mac's IP Address

```bash
# Get your local IP
ipconfig getifaddr en0
# Example output: 192.168.1.204
```

Then access from any device: **http://192.168.1.204:3000**

### Keep It Running

**Option A: Leave Terminal Open**
- Simple: Just leave the terminal window open
- Stops when you close terminal or restart Mac

**Option B: Run in Background with nohup**
```bash
cd /Users/dalena/Projects/DisplayStudio
nohup npm start > displaystudio.log 2>&1 &
echo $! > .displaystudio.pid
```

To stop it later:
```bash
kill $(cat .displaystudio.pid)
```

**Option C: Auto-Start on Login (Recommended)**

Create file: `~/Library/LaunchAgents/com.displaystudio.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.displaystudio</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/npm</string>
        <string>start</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/Users/dalena/Projects/DisplayStudio</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/displaystudio.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/displaystudio.error.log</string>
</dict>
</plist>
```

Load it:
```bash
launchctl load ~/Library/LaunchAgents/com.displaystudio.plist
```

Unload it (to stop):
```bash
launchctl unload ~/Library/LaunchAgents/com.displaystudio.plist
```

## Option 2: Windows (Easy - 5 Minutes)

**Requirements:** Windows with Node.js installed

### Quick Start

```powershell
# Navigate to project
cd C:\path\to\DisplayStudio

# Install dependencies (if not already done)
npm install

# Ensure .env.local exists with Convex credentials
type .env.local

# Build for production
npm run build

# Start the server
npm start
```

**Note:** If `.env.local` doesn't exist, create it with:
```
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOY_KEY=prod:your-deployment-name|your-key-value
```

Access at **http://localhost:3000** or **http://YOUR-PC-IP:3000**

### Find Your Windows IP Address

```powershell
ipconfig
# Look for "IPv4 Address" under your network adapter
# Example: 192.168.1.205
```

### Keep It Running

**Option A: Leave PowerShell Open**
- Simple: Just leave the window open
- Stops when you close window or restart PC

**Option B: Run as Windows Service (Recommended)**

Install `node-windows`:
```powershell
npm install -g node-windows
```

Create service script `install-service.js`:
```javascript
const Service = require('node-windows').Service;

const svc = new Service({
  name: 'DisplayStudio',
  description: 'Matrix Switch Control Application',
  script: 'C:\\path\\to\\DisplayStudio\\node_modules\\next\\dist\\bin\\next',
  scriptOptions: 'start',
  workingDirectory: 'C:\\path\\to\\DisplayStudio'
});

svc.on('install', () => {
  svc.start();
});

svc.install();
```

Install as service:
```powershell
node install-service.js
```

Manage via Windows Services (services.msc) - look for "DisplayStudio"

## Option 3: Raspberry Pi (Best - 10 Minutes Setup)

**Why Best?**
- Low power consumption (runs 24/7 cheaply)
- Silent operation
- Dedicated device
- Easy to hide near AV equipment

**Requirements:**
- Raspberry Pi 3/4/5 (any model works)
- Raspbian/Raspberry Pi OS installed
- Connected to same network as matrix switch

### Setup

```bash
# SSH into your Pi
ssh pi@raspberrypi.local

# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone the repo
git clone https://github.com/YOUR_USERNAME/DisplayStudio.git
cd DisplayStudio

# Install dependencies
npm install

# Set up Convex environment variables
nano .env.local
```

Add these lines to `.env.local` (get values from your Convex dashboard):
```bash
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOY_KEY=prod:your-deployment-name|your-key-value
```

Save and exit (Ctrl+X, Y, Enter), then continue:

```bash
# IMPORTANT: Build the production version
npm run build

# Test run (verify it works before setting up service)
npm start
```

**Important Notes:**
- The `npm run build` step is REQUIRED before `npm start`
- You MUST set up `.env.local` with Convex credentials before building
- Get your Convex URL from: https://dashboard.convex.dev → Your Project → Settings
- Get your Deploy Key from: https://dashboard.convex.dev → Your Project → Settings → Deploy Keys
- The build process may take 2-5 minutes on Raspberry Pi
- If you get "Could not find production build" error, run `npm run build` again
- Once you see "✓ Ready" after running `npm start`, test accessing the app

Access at **http://raspberrypi.local:3000** or **http://RASPBERRY-PI-IP:3000**

### Auto-Start on Boot

Create systemd service:
```bash
sudo nano /etc/systemd/system/displaystudio.service
```

Paste (replace `/home/pi/DisplayStudio` with your actual path):
```ini
[Unit]
Description=DisplayStudio Matrix Control
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/DisplayStudio
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment="NODE_ENV=production"
EnvironmentFile=/home/pi/DisplayStudio/.env.local

[Install]
WantedBy=multi-user.target
```

**Important:** The `EnvironmentFile` line tells systemd to load your `.env.local` file with Convex credentials.

Enable and start:
```bash
sudo systemctl enable displaystudio
sudo systemctl start displaystudio
sudo systemctl status displaystudio
```

Logs:
```bash
sudo journalctl -u displaystudio -f
```

## Option 4: Docker (Cross-Platform - 15 Minutes)

**Works on:** macOS, Windows, Linux, Raspberry Pi

**Requirements:** Docker Desktop installed

### Create Dockerfile

Already exists in project (I'll create it next), or create manually:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Build and Run

```bash
# Build image
docker build -t displaystudio .

# Run container
docker run -d \
  --name displaystudio \
  --restart unless-stopped \
  -p 3000:3000 \
  displaystudio
```

Access at **http://localhost:3000** or **http://YOUR-IP:3000**

### Docker Compose (Even Easier)

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  displaystudio:
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

Run:
```bash
docker-compose up -d
```

## Option 5: Pre-Built Raspberry Pi Image (Future)

Coming soon: Download pre-configured image, flash to SD card, boot Pi. Zero configuration needed.

## Accessing From Mobile Devices

Once self-hosted, access from iPhone/iPad/Android:

1. Find your server's IP (e.g., 192.168.1.204)
2. Open browser on mobile device
3. Go to **http://192.168.1.204:3000**
4. Add to Home Screen for app-like experience:
   - iOS: Share → Add to Home Screen
   - Android: Menu → Add to Home Screen

Works perfectly in Safari, Chrome, Firefox - no CORS issues!

## Changing the Port

If port 3000 is in use:

```bash
# Set custom port
PORT=8080 npm start
```

Or edit `package.json`:
```json
{
  "scripts": {
    "start": "PORT=8080 next start"
  }
}
```

## Firewall Configuration

**macOS:**
System Settings → Network → Firewall → Options → Allow incoming connections for Node

**Windows:**
Windows Defender Firewall → Allow an app → Add Node.js

**Linux/Raspberry Pi:**
```bash
sudo ufw allow 3000/tcp
```

## Troubleshooting

**Can't access from other devices:**
- Verify server is running: `curl http://localhost:3000`
- Check firewall settings (see above)
- Ensure devices are on same network
- Try IP address instead of hostname

**Port already in use:**
- Change port (see above)
- Or kill existing process: `lsof -ti:3000 | xargs kill`

**Build fails:**
- Ensure Node.js 18+ installed: `node --version`
- Clear cache: `rm -rf .next node_modules && npm install`

**Won't start on boot:**
- Check service logs (see systemd/launchd commands above)
- Verify paths in service files are absolute
- Ensure npm is in PATH

## Recommended Setup

**For Home Use:** macOS LaunchAgent or Windows Service (use existing computer)

**For 24/7 Operation:** Raspberry Pi with systemd service (dedicated, low power)

**For Flexibility:** Docker (easy to move between machines)

## Performance

All options handle the DisplayStudio app easily:
- Raspberry Pi 3+: More than sufficient
- Any modern PC/Mac: Instant
- Memory usage: ~100MB
- CPU usage: <1% idle, <5% during switching

## Next Steps

1. Choose your option above
2. Follow the Quick Start steps
3. Test from another device on your network
4. Set up auto-start if desired
5. Enjoy CORS-free operation in all browsers!

## Managing the Server

**Stop/Restart/Kill processes:** See [SERVER_MANAGEMENT.md](SERVER_MANAGEMENT.md) for complete guide including:
- How to kill `npm start` processes
- Managing systemd services
- Switching between dev and production
- Troubleshooting port conflicts

**Quick commands:**
```bash
# Stop server running in terminal
Ctrl+C

# Kill by port
lsof -ti:3000 | xargs kill

# Restart systemd service
sudo systemctl restart displaystudio

# View service logs
sudo journalctl -u displaystudio -f
```

## Need Help?

- Check server logs for errors
- Verify Convex environment variables are set
- Ensure device IP is configured in Settings
- Test device connectivity: `curl http://192.168.1.222`
