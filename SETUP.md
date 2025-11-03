# Quick Setup Guide

## 1. Initial Setup (5 minutes)

Run these commands to get started:

```bash
# Install dependencies (already done if you see node_modules/)
npm install

# Set up Convex - this will open a browser to authenticate
npx convex dev
```

When you run `npx convex dev`, it will:
1. Open your browser to log in to Convex
2. Ask you to create or select a project
3. Automatically update `.env.local` with your Convex URL
4. Start watching for changes to your Convex functions

**Keep the Convex dev server running in one terminal.**

## 2. Start the App

In a **new terminal window**, run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 3. First-Time Configuration

1. Click the **gear icon** (⚙️) in the top right
2. Verify or update the **Device IP Address** (default: 192.168.1.222)
3. Customize input and output labels
4. Click **Save Settings**

## 4. Using the App

### Quick Controls

**Option 1: Tap Input → Tap Output**
- Tap an input (turns blue)
- Tap one or more outputs to route that input

**Option 2: Tap Output → Tap Input**
- Tap an output (turns green)
- Tap an input to route it

**Option 3: Drag & Drop**
- Drag an input to an output
- Or drag an output to an input

### Status Updates

- The app polls your matrix switch every 3 seconds
- Active connections are highlighted
- Any connection errors appear at the top

## Troubleshooting

### "Connection error" message

✅ **Solutions:**
- Verify the matrix switch is powered on
- Check the IP address in Settings
- Ensure your computer is on the same network (192.168.1.x)
- Try accessing http://192.168.1.222 directly in your browser

### Convex errors

✅ **Solutions:**
- Make sure `npx convex dev` is running
- Check that `.env.local` contains `NEXT_PUBLIC_CONVEX_URL`
- Restart both terminals if needed

### Changes not saving

✅ **Solutions:**
- Verify Convex dev server is running
- Check browser console for errors (F12)
- Try refreshing the page

## Network Requirements

⚠️ **Important:** Your browser must be on the same local network as the matrix switch.

- Matrix device: Default 192.168.1.222
- Your computer: Must be on 192.168.1.x network
- No VPN or network isolation

## Development Tips

### Multiple Devices

The app syncs labels across all devices using Convex. You can:
- Configure labels on desktop, use on tablet
- Control from multiple phones simultaneously
- Labels update in real-time across devices

### Mobile Use

The interface is fully optimized for mobile:
- Works in portrait and landscape
- No scrolling required
- Touch-optimized tap targets
- Drag-and-drop on mobile Safari/Chrome

## What's Next?

The app is ready to use! Future enhancements could include:
- Scene save/recall
- Keyboard shortcuts
- Input/output preview thumbnails
- Batch routing operations

Enjoy your matrix switch control! 🎛️
