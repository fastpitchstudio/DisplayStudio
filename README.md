# Matrix Switch Control

A beautiful, responsive web application to control your 8x8 video matrix switch. Features bidirectional multi-routing, real-time status updates, and persistent configuration via Convex.

[![GitHub](https://img.shields.io/badge/GitHub-DisplayStudio-blue?logo=github)](https://github.com/YOUR_USERNAME/DisplayStudio)

> **Note:** Replace `YOUR_USERNAME` in the badge above with your actual GitHub username.

## Features

- **Bidirectional Multi-Routing**: Select one input and tap multiple outputs, or select one output and tap multiple inputs for rapid connections
- **Visual Feedback**: Pulsing animations on selected buttons, highlighted connections, and snap-lock badge animations on successful routing
- **Selection Timeout**: Keep your initial selection active for configurable seconds (default 5s) to enable tap-tap-tap workflow
- **Background Dismiss**: Click/tap the background to clear all selections
- **Responsive Design**: Compact layout fits on screens down to 800px vertical without scrolling, with proportional scaling
- **Real-time Status**: Polls device status every 5 seconds with optimistic UI updates
- **Persistent Configuration**: Store custom labels, device IP, and timeout settings in Convex database
- **Fixed Badge Grid**: Each button displays an 8-slot badge grid (2 rows × 4 columns) showing connection status at a glance
- **Direct Device Control**: Communicates directly with matrix switch over HTTP with cumulative routing support

## Deployment Options

### Option 1: Self-Host (Recommended - No CORS Issues!)

Self-hosting avoids all browser CORS issues and works in Safari, Chrome, Firefox, and mobile browsers.

**Easiest method (macOS/Linux):**
```bash
./start-server.sh
```

**Windows:**
```
start-server.bat
```

**What it does:**
- Installs dependencies automatically
- Builds the app
- Starts server on http://localhost:3000
- Shows your network IP for access from other devices

See **[SELF_HOSTING.md](SELF_HOSTING.md)** for complete guide including:
- macOS auto-start on login
- Windows service setup
- Raspberry Pi 24/7 deployment
- Docker deployment

### Option 2: Use Vercel (Requires CORS Workaround)

**This app connects directly from your browser to a local network device (HTTP). Since Vercel serves over HTTPS, you need to disable CORS in your browser.**

**Quick Start - Chrome with CORS Disabled:**

**Mac:**
```bash
open -na "Google Chrome" --args --disable-web-security --user-data-dir="/tmp/chrome-matrix"
```

**Windows:**
```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C:\tmp\chrome-matrix"
```

Then visit the app URL in that Chrome window. See [CORS_WORKAROUND.md](CORS_WORKAROUND.md) for details.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Convex

First, create a Convex account at [convex.dev](https://convex.dev) if you don't have one.

Then initialize your Convex project:

```bash
npx convex dev
```

This will:
- Prompt you to log in to Convex
- Create a new project (or select an existing one)
- Generate `.env.local` with your `NEXT_PUBLIC_CONVEX_URL`
- Start the Convex development server

### 3. Configure Your Matrix Switch

The app is pre-configured with the default IP address: `192.168.1.222`

You can change this in the Settings panel (gear icon) once the app is running.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### Required Environment Variables

Set these in your Vercel project settings (Settings → Environment Variables):

```bash
# Required for Convex deployment during build
CONVEX_DEPLOY_KEY=prod:your-deployment-name|your-key-value

# Required for the app to connect to Convex at runtime
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

**Note:** Only `CONVEX_DEPLOY_KEY` and `NEXT_PUBLIC_CONVEX_URL` are needed. The `CONVEX_DEPLOYMENT` is read from `convex.json`.

### Getting Convex Deploy Key

1. Go to your Convex dashboard: https://dashboard.convex.dev
2. Select your project
3. Go to Settings → Deploy Keys
4. Create a new deploy key for production
5. Copy the key and add it to Vercel as `CONVEX_DEPLOY_KEY`

### Build Configuration

The build process automatically:
1. Deploys Convex schema and functions to production (`npx convex deploy --prod`)
2. Generates TypeScript types in `convex/_generated/`
3. Builds the Next.js application (`npm run build:next`)

The deployment info is read from `convex.json`:
```json
{
  "project": "displaystudio",
  "team": "fastpitchstudio",
  "prodUrl": "https://descriptive-beagle-218.convex.cloud"
}
```

No additional configuration needed - just push to your connected GitHub repo!

## Usage

### Switching Inputs to Outputs

**Method 1: Multi-Tap Mode (Input → Multiple Outputs)**
1. Tap an input source button (pulsing blue border indicates selection)
2. Tap one or more output buttons to route that input to them
3. The input stays selected for 5 seconds (configurable) allowing rapid tap-tap-tap workflow
4. Badge slots on output buttons animate and light up to show the new connection
5. To cancel early, click the background or tap the same input again

**Method 2: Multi-Tap Mode (Output → Multiple Inputs)**
1. Tap an output destination button (pulsing green border indicates selection)
2. Tap one or more input buttons to route them to that output
3. The output stays selected for 5 seconds allowing multiple connections
4. Badge slots on the output button show which input is currently active
5. To cancel early, click the background or tap the same output again

**Method 3: Drag & Drop**
- Drag an input button and drop on an output button
- Or drag an output button and drop on an input button
- Works in both directions for quick single connections

**Visual Indicators:**
- **Pulsing Border**: Shows which button is currently selected (blue = input, green = output)
- **Highlighted Badges**: Active connection slots are brightly colored (inputs show green badges for outputs, outputs show blue badges for inputs)
- **Dimmed Badges**: Inactive slots are dark gray
- **Snap Animation**: When a connection is made, the affected badge slot briefly scales and wiggles
- **Toast Notification**: Success message appears at bottom center showing "IN# → OUT#"

### Reading Connection Status

Each input and output button displays a fixed 8-slot badge grid:

**Input Buttons** (Sources):
- Show which outputs (1-8) are currently receiving this input
- Green highlighted badges = connected outputs
- Display custom output labels in badges

**Output Buttons** (Displays):
- Show which input (1-8) is currently routed to this output
- Blue highlighted badge = current input source
- Display custom input label in the badge

This makes it easy to see all connections at a glance without selecting anything.

### Configuring Settings

1. Click the gear icon (top right)
2. **Device IP Address**: Update if your matrix switch has a different IP
3. **Input Labels**: Customize names for all 8 inputs (e.g., "Laptop", "Camera 1")
4. **Output Labels**: Customize names for all 8 outputs (e.g., "Projector", "Monitor 2")
5. **Selection Timeout**: Adjust how long selections stay active (1-60 seconds, default 5)
6. **Show Debug Panel**: Toggle the debug panel for testing commands
7. Click "Save"

All settings are automatically saved to Convex and persist across sessions and devices.

## Technical Details

### Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Database**: Convex (serverless, real-time)
- **Device Communication**: Direct HTTP with Basic Auth

### Device API

The matrix switch uses HTTP POST with Basic Auth (admin/admin):

```typescript
// Switch input 1 to output 2
matrixdata={"COMMAND":"SW 1 2"}

// Switch input 5 to multiple outputs
matrixdata={"COMMAND":"SW 5 1 2 3 4"}

// Get current status
matrixdata={"COMMAND":"GETSWS"}
```

### Project Structure

```
├── app/
│   ├── page.tsx              # Main page with Convex integration
│   ├── layout.tsx            # Root layout with Convex provider
│   ├── globals.css           # Global styles & Tailwind imports
│   └── ConvexClientProvider.tsx
├── components/
│   ├── MatrixControl.tsx     # Main control interface with state management
│   │                         # - Selection & highlight state
│   │                         # - Status polling (5s interval)
│   │                         # - Bidirectional routing logic
│   │                         # - Selection timeout management
│   │                         # - Background click handling
│   ├── IOButton.tsx          # Input/Output button component
│   │                         # - 8-slot badge grid (2×4)
│   │                         # - Pulse animation on selection
│   │                         # - Badge snap-lock animation
│   │                         # - Drag & drop support
│   ├── SettingsPanel.tsx     # Configuration panel (slide-in)
│   └── DebugPanel.tsx        # Debug panel for raw commands
├── convex/
│   ├── schema.ts             # Database schema
│   │                         # - Device IP, labels (1-8), timeout
│   └── matrixConfig.ts       # Queries and mutations
│                             # - get(), initialize(), update*()
└── lib/
    └── matrixApi.ts          # Matrix device API client
                              # - HTTP POST with Basic Auth
                              # - Cumulative routing (preserves existing connections)
                              # - Status parsing from SWS response
```

## Network Requirements

- Your browser must be on the same network as the matrix switch (192.168.1.x)
- The matrix switch must allow HTTP connections
- CORS may need to be enabled on the device (or run the app from same origin)

## Design Decisions

### Cumulative Routing
The app preserves existing connections when adding new ones. For example:
- Input 1 is already routed to Output 2 and Output 4
- You route Input 1 to Output 7
- Result: Input 1 is now routed to Outputs 2, 4, AND 7

This matches the physical matrix switch behavior and prevents accidentally breaking existing connections.

### Compact Layout Strategy
The layout uses CSS Grid with `auto-rows-fr` to distribute available vertical space equally among buttons, ensuring everything fits without scrolling down to 800px screen height. Labels are fixed size rather than responsive to maintain readability while maximizing space efficiency.

### Selection Timeout Design
After routing, the originally selected button stays active for the configured timeout (default 5s). This enables rapid multi-routing workflows:
- Select Input 1 → tap Output 1, 2, 3, 4 in quick succession
- Select Output 5 → tap Input 2, 4, 6 in quick succession

Background clicks or deselecting the same button cancel the timeout early.

### Visual Feedback Hierarchy
1. **Selection** (highest priority): Pulsing 3px colored border
2. **Highlight**: Semi-transparent colored border (2px) showing related connections
3. **Active Badge**: Brightly colored slot (green for outputs on inputs, blue for input on outputs)
4. **Inactive Badge**: Dimmed gray slot

This creates clear visual distinction between "what I'm working with" (selection/highlight) and "current state" (active badges).

## Future Enhancements

- Scene save/recall functionality (store complete routing configurations)
- Connection health indicator with automatic retry on failure
- Input/output preview thumbnails (if devices support HDMI preview)
- Keyboard shortcuts for power users (number keys + modifiers)
- Multi-device sync for routing state (real-time collaboration)
- Undo/redo for routing changes
- Routing history log with timestamps

## Troubleshooting

**Can't connect to device:**
- Verify device IP in Settings (gear icon)
- Ensure you're on the same network (192.168.1.x)
- Check that device is powered on and responsive
- Try accessing `http://192.168.1.222` directly in browser to verify it's reachable
- Check browser console for network errors

**Labels not saving:**
- Make sure Convex dev server is running (`npx convex dev`)
- Check `.env.local` has valid `NEXT_PUBLIC_CONVEX_URL`
- Look for errors in browser console (F12)
- Try refreshing the page - settings should persist

**Switches not working:**
- Check network tab in browser dev tools (F12 → Network) for failed requests
- Verify Basic Auth credentials are correct (default: admin/admin)
- Ensure device supports the command format (test with Debug Panel)
- Check that status polling is working - should see requests every 5 seconds

**Selection not staying active:**
- Check selection timeout setting (Settings → Selection Timeout)
- Default is 5 seconds - increase if you need more time
- Selection also clears if you click the background

**Layout doesn't fit screen:**
- App is optimized for 800px+ vertical height
- Try rotating device to landscape on mobile/tablet
- Check browser zoom level (should be 100%)
- Hide browser address bar on mobile by scrolling down

**Animations stuttering:**
- Close other tabs to free up browser resources
- Disable browser extensions that might interfere
- Try a different browser (tested on Chrome, Safari, Firefox)

**Badge labels truncated:**
- Keep custom labels concise (8-12 characters recommended)
- Very long labels will be truncated with "..."
- Hover over badges to see full label in tooltip
