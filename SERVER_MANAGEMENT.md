# Server Management Guide

## Stopping/Restarting the Server

### Option 1: If Running in Terminal (Easiest)

If you started the server with `npm start` in a terminal window:

**Stop the server:**
```bash
# Press Ctrl+C in the terminal
```

**Restart the server:**
```bash
npm start
```

### Option 2: If Running in Background

If you used `nohup` or the process is running in background:

**Find the process:**
```bash
# Find Node.js processes
ps aux | grep node

# Or find by port (if using port 3000)
lsof -i :3000
```

**Kill the process:**
```bash
# Kill by PID (replace 12345 with actual PID from ps command)
kill 12345

# Or force kill if it doesn't stop
kill -9 12345

# Or kill all node processes (careful!)
killall node
```

**Easier - kill by port:**
```bash
# Kill whatever is running on port 3000
lsof -ti:3000 | xargs kill

# Or force kill
lsof -ti:3000 | xargs kill -9
```

### Option 3: If Running as systemd Service

If you set up the systemd service (auto-start on boot):

**Stop the server:**
```bash
sudo systemctl stop displaystudio
```

**Start the server:**
```bash
sudo systemctl start displaystudio
```

**Restart the server:**
```bash
sudo systemctl restart displaystudio
```

**Check status:**
```bash
sudo systemctl status displaystudio
```

**View logs:**
```bash
# Live logs
sudo journalctl -u displaystudio -f

# Last 50 lines
sudo journalctl -u displaystudio -n 50
```

**Disable auto-start:**
```bash
sudo systemctl disable displaystudio
```

**Enable auto-start:**
```bash
sudo systemctl enable displaystudio
```

## Common Scenarios

### Scenario 1: Update Code and Restart

```bash
cd ~/DisplayStudio

# Stop server (if running as service)
sudo systemctl stop displaystudio

# Pull latest code
git pull

# Install any new dependencies
npm install

# Rebuild
npm run build

# Start server
sudo systemctl start displaystudio
```

### Scenario 2: Switch from Production to Development

```bash
# Stop production server
sudo systemctl stop displaystudio

# Or if running in terminal, Ctrl+C

# Start development server
npm run dev
```

**Development server features:**
- Hot reload (changes appear instantly)
- Runs on port 3000 by default
- Better error messages
- No build step needed

### Scenario 3: Change Port

If port 3000 is in use or you want a different port:

**One-time:**
```bash
PORT=8080 npm start
```

**Permanent (edit package.json):**
```json
{
  "scripts": {
    "start": "PORT=8080 next start"
  }
}
```

**For systemd service:**
Edit `/etc/systemd/system/displaystudio.service` and add:
```ini
[Service]
Environment="PORT=8080"
```

Then reload and restart:
```bash
sudo systemctl daemon-reload
sudo systemctl restart displaystudio
```

### Scenario 4: Multiple Environments

Run both dev and production simultaneously:

```bash
# Production on port 3000
npm start &

# Development on port 3001 (in another terminal)
PORT=3001 npm run dev
```

## Quick Reference Commands

```bash
# Kill by port
lsof -ti:3000 | xargs kill

# Restart systemd service
sudo systemctl restart displaystudio

# View service logs
sudo journalctl -u displaystudio -f

# Stop Ctrl+C doesn't work? Force kill terminal session
pkill -f "npm start"

# Find all Node processes
ps aux | grep node

# Check what's using port 3000
lsof -i :3000
```

## Troubleshooting

**"Port 3000 already in use":**
```bash
# Kill whatever is using it
lsof -ti:3000 | xargs kill
```

**"Cannot find module" after git pull:**
```bash
npm install
npm run build
```

**Service won't start after changes:**
```bash
# Reload systemd configuration
sudo systemctl daemon-reload
sudo systemctl restart displaystudio
```

**Process won't die:**
```bash
# Force kill (replace PID)
kill -9 PID

# Or force kill by port
lsof -ti:3000 | xargs kill -9
```

**Lost terminal with running server:**
```bash
# Find the process
ps aux | grep "npm start"

# Kill it
kill PID
```

## Best Practices

**For Development:**
- Use `npm run dev` (hot reload, better errors)
- Run in terminal (easy to stop with Ctrl+C)

**For Production (24/7):**
- Use systemd service (auto-restart, runs on boot)
- Use `npm start` (optimized production build)
- Monitor logs: `sudo journalctl -u displaystudio -f`

**For Testing:**
- Use `npm start` in terminal
- Easy to stop and restart
- See console output directly
