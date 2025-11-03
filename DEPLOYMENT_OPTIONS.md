# Deployment Options for DisplayStudio

## The Problem

DisplayStudio needs to communicate with a local network device (192.168.x.x). This creates a deployment challenge:

**Vercel (Cloud Hosting):**
- ❌ Cannot access devices on your local network
- ❌ Browser → Vercel → Local Device = FAILS (Vercel can't see local IPs)
- ✅ Works for development on `localhost:3000` (same network)

## Solution: Self-Host on Local Network

For production use with local devices, you need to host the app on a machine that's on the same network as the matrix switch.

### Option 1: Raspberry Pi / Local Server (Recommended)

**Hardware:**
- Raspberry Pi 4 (or any Linux machine on the network)
- Or: Old laptop, NUC, or existing server

**Setup:**
```bash
# Clone the repo
git clone https://github.com/fastpitchstudio/DisplayStudio.git
cd DisplayStudio

# Install dependencies
npm install

# Build for production
npm run build

# Start the production server
npm start
```

The app will run on `http://your-pi-ip:3000` and be accessible to any device on your network.

**Make it start on boot (Linux/Raspberry Pi):**
```bash
# Create systemd service
sudo nano /etc/systemd/system/displaystudio.service
```

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

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start
sudo systemctl enable displaystudio
sudo systemctl start displaystudio
```

### Option 2: Docker Container

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t displaystudio .
docker run -d -p 3000:3000 --restart unless-stopped displaystudio
```

### Option 3: Use Vercel for Static Assets + Self-Host API

You can host the UI on Vercel but run the API routes locally:

1. Deploy UI to Vercel (fast, global CDN)
2. Run a local proxy server that Vercel can reach via Tailscale/VPN
3. Configure app to use custom API URL

This is more complex but gives you the benefits of Vercel's CDN while maintaining local device access.

## Current Behavior

The app automatically detects the environment:

- **Localhost** (`localhost:3000`): Uses direct browser→device connection
- **Production** (Vercel): Attempts to use API proxy (will fail for local devices)

**Console messages:**
- `✓ Using direct device connection (localhost mode)` - Working correctly
- `⚠ Using proxy connection (production mode - Vercel cannot reach local device)` - Will fail

## Recommended Production Setup

**For Home/Office Use:**
1. Use a Raspberry Pi on the same network as the matrix switch
2. Access via `http://raspberrypi.local:3000` from any device on the network
3. Optionally set up mDNS for easy discovery: `http://displaystudio.local`

**For Remote Access:**
1. Self-host on local network (Raspberry Pi)
2. Use Tailscale/ZeroTier VPN for secure remote access
3. Access the local server through the VPN

## Why Not Vercel for Production?

Vercel's serverless functions run in AWS Lambda (Virginia, Frankfurt, etc.). They have **no way** to access private IP addresses (192.168.x.x) on your home/office network. This is a fundamental networking limitation, not a bug.

The Next.js API routes were designed as a CORS workaround for development, but they can't work in cloud deployment for local devices.

## Quick Local Deployment

The fastest way to get running:

```bash
# On any Linux/Mac machine on your network
git clone https://github.com/fastpitchstudio/DisplayStudio.git
cd DisplayStudio
npm install
npm run build
npm start
```

Then visit `http://your-machine-ip:3000` from any device on the network.

## Future: Cloud-Compatible Device

If your matrix switch manufacturer adds cloud connectivity or a public API, you could then use Vercel. But for local-only devices, self-hosting is the only viable option.
