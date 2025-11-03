# DisplayStudio - 60 Second Quickstart

## Your Current Computer (Easiest - 2 Minutes)

You already have the code at `/Users/dalena/Projects/DisplayStudio`. Just run the server!

### macOS (Your Computer)

```bash
cd /Users/dalena/Projects/DisplayStudio
./start-server.sh
```

That's it! The script handles everything:
- ✅ Installs dependencies if needed
- ✅ Builds the app if needed
- ✅ Starts the server
- ✅ Shows you the URLs to access it

**Access the app:**
- From your Mac: http://localhost:3000
- From iPhone/iPad/other devices: http://YOUR-MAC-IP:3000 (script shows your IP)

**Works in ALL browsers** - Safari, Chrome, Firefox, mobile - no CORS issues!

### To Keep It Running

**Simple way:** Just leave the terminal window open

**Better way:** Run in background
```bash
cd /Users/dalena/Projects/DisplayStudio
nohup npm start > server.log 2>&1 &
```

**Best way:** Auto-start on Mac login (see [SELF_HOSTING.md](SELF_HOSTING.md) for LaunchAgent setup)

## Windows Computer

```
cd C:\path\to\DisplayStudio
start-server.bat
```

Access at http://localhost:3000 or http://YOUR-PC-IP:3000

## What If I Want 24/7 Operation?

**Best option:** Raspberry Pi ($35-75)
- Silent, low power
- Hide it near your AV equipment
- Access from any device on network
- Setup in 10 minutes

See [SELF_HOSTING.md](SELF_HOSTING.md) for Raspberry Pi guide.

## Stopping/Restarting the Server

**Stop server running in terminal:**
```bash
# Press Ctrl+C
```

**Kill server by port (if Ctrl+C doesn't work):**
```bash
lsof -ti:3000 | xargs kill
```

**For more details:** See [SERVER_MANAGEMENT.md](SERVER_MANAGEMENT.md)

## Troubleshooting

**"Command not found" error:**
- Make script executable: `chmod +x start-server.sh`

**"Port 3000 in use":**
- Kill existing process: `lsof -ti:3000 | xargs kill`
- Or use different port: `PORT=3001 npm start`

**Can't access from other devices:**
- Check firewall settings
- Ensure all devices on same WiFi network
- Try accessing by IP address (script shows it)

**Build fails:**
- Ensure Node.js 18+ installed: `node --version`
- Ensure .env.local exists with Convex credentials
- Clear cache: `rm -rf .next node_modules && npm install`

## Need More Control?

See these guides:
- **[SELF_HOSTING.md](SELF_HOSTING.md)** - Complete deployment options
- **[CORS_WORKAROUND.md](CORS_WORKAROUND.md)** - If you must use Vercel
- **[README.md](README.md)** - Full documentation
