# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DisplayStudio is a Next.js web application for controlling an 8x8 video matrix switch device. It provides a responsive, touch-friendly interface for routing video inputs to outputs with real-time status updates and persistent configuration.

**Key Technologies:**
- Next.js 15 (App Router) + TypeScript
- Convex (real-time database for config persistence)
- Framer Motion (animations)
- Tailwind CSS (styling with CSS custom properties)
- Direct HTTP communication with matrix switch device (no intermediary server)

## Development Commands

```bash
# Development
npm run dev              # Start Next.js dev server (uses Turbopack)
npx convex dev          # Start Convex development server (run in separate terminal)

# Building
npm run build           # Deploy Convex functions, then build Next.js
npm run build:next      # Build Next.js only (skips Convex deploy)

# Other
npm run lint            # Run ESLint
npm start               # Start production server
```

**Important:** Always run `npx convex dev` in a separate terminal during development. The Next.js dev server expects Convex to be running.

## Architecture

### Core Data Flow

```
User Browser
    ├─→ Convex (WebSocket)
    │   └─→ Persistent config: labels, device IP, timeout, theme
    │
    └─→ Matrix Device (HTTP via Next.js API route)
        └─→ Real-time control: routing commands, status polling
```

**Two separate data systems:**
1. **Convex**: Stores user preferences (labels, settings) - real-time sync across all clients
2. **Matrix Device**: Source of truth for routing state - polled every 5 seconds

### State Management Strategy

**Component State (React):**
- Selection state (which input/output is selected)
- UI state (loading, connection status)
- Cached device status (optimistic updates)

**Convex State (Database):**
- Device configuration (IP, labels, timeout)
- Theme preferences (mode, name)
- Connection view mode

**Device State (Source of Truth):**
- Current routing matrix (which input → which outputs)
- Polled every 5 seconds to detect external changes

### Connection Management

The app implements robust connection handling with 4 states: `connected`, `connecting`, `disconnected`, `retry`.

**Key behaviors:**
- Detects device unavailability after 60 seconds of failed polls
- Shows non-intrusive reconnection button (top-right, next to settings)
- Auto-retries every 5 minutes (max 3 attempts)
- Graceful error handling - no Next.js error pages (all errors return JSON with 200 status)

**Files involved:**
- `components/MatrixControl.tsx` - Connection state tracking, timeout detection, auto-retry logic
- `lib/matrixApi.ts` - Error handling (returns `{ error, success }` instead of throwing)
- `app/api/matrix/route.ts` - Proxy endpoint, returns 200 status even for errors

### Routing Logic

**Cumulative routing:** The app preserves existing connections when adding new ones. If Input 1 → Outputs 2,4 and you route Input 1 → Output 7, the result is Input 1 → Outputs 2,4,7 (not just 7).

**Implementation:** When switching, the app:
1. Queries current status to find all outputs already connected to the input
2. Adds the new output to the list
3. Sends single command: `SW <input> <output1> <output2> ...`

**Bidirectional workflows:**
- Input-first: Select input, tap multiple outputs
- Output-first: Select output, tap multiple inputs
- Drag & drop: Works in both directions

### Theme System

Themes use CSS custom properties defined in `app/globals.css`. The system supports:
- **Theme modes:** light, dark, system (default)
- **Theme names:** vercel, tangerine, claymorphism, midnight-bloom, fastpitch

**Color naming convention:**
- `--input-*` - Input button colors (blue tones)
- `--output-*` - Output button colors (green tones)
- `--ui-*` - General UI elements
- `--status-*` - Status indicators (success, warning, error)
- `--bg-gradient-*` - Background gradient stops

Tailwind config extends with HSL color variables. Always use semantic color classes (e.g., `bg-input-bg-selected`) rather than arbitrary colors.

### Responsive Design

**Breakpoint strategy:**
- Uses Tailwind's standard breakpoints plus custom `@media(max-height:X)` for vertical constraints
- Critical vertical breakpoints: 768px, 600px
- Layout uses CSS Grid with `auto-rows-fr` to distribute space equally

**Key responsive patterns:**
- Reduce gaps/padding at smaller heights: `gap-3` → `[@media(max-height:768px)]:gap-1.5`
- Reduce font sizes: `text-base` → `[@media(max-height:768px)]:text-sm`
- All three view components must stay in sync: `MatrixControl.tsx`, `InputGroupedView.tsx`, `OutputGroupedView.tsx`

## File Structure

```
app/
├── page.tsx                    # Main page, Convex integration
├── layout.tsx                  # Root layout, Convex provider, theme provider
├── globals.css                 # Theme CSS custom properties
└── api/matrix/route.ts         # Proxy for device HTTP requests (avoids CORS)

components/
├── MatrixControl.tsx           # Main controller: state, polling, routing logic
├── IOButton.tsx                # Input/Output button with 8-slot badge grid
├── InputGroupedView.tsx        # Input-centric view (inputs as cards)
├── OutputGroupedView.tsx       # Output-centric view (outputs as cards)
├── SettingsPanel.tsx           # Slide-in settings panel
├── ThemeControls.tsx           # Theme mode/name switcher
└── DebugPanel.tsx              # Raw device command tester

convex/
├── schema.ts                   # Database schema (matrixConfig table)
└── matrixConfig.ts             # Queries and mutations

lib/
└── matrixApi.ts                # Matrix device HTTP client
```

## Key Implementation Details

### Device API Communication

The matrix switch expects HTTP POST to `/cgi-bin/matrixs.cgi` with Basic Auth (admin/admin):

```typescript
// Request format
body: matrixdata={"COMMAND":"SW 1 2"}

// Common commands
SW <input> <output>         // Switch single
SW <input> <out1> <out2>    // Switch multiple
SWALL <input>               // Switch all outputs to input
GETSWS                      // Get current status
```

**Status response format:**
```json
{"SWS":"1 4 4 4 5 6 7 8"}
```
This means: Output 1→Input 1, Output 2→Input 4, Output 3→Input 4, etc.

### Selection Timeout Pattern

When a button is selected, it stays active for a configurable timeout (default 5 seconds). This enables rapid "tap-tap-tap" workflows.

**Implementation:**
- Store timeout ID in state: `selectionTimeoutId`
- Clear on: background click, deselection, or routing action
- Restart timer after each successful routing

### Animation Patterns

**Framer Motion usage:**
- Pulse effect on selection (infinite scale + opacity loop)
- Snap-lock animation on badge when connection made (scale + rotate)
- Toast entrance/exit (opacity + y-axis slide)
- Button hover/tap feedback (subtle scale changes)

**Animation timing:**
- Keep `duration` under 0.5s for snappy feel
- Use `type: 'spring'` with `stiffness: 400, damping: 25` for button interactions
- Use `ease: 'easeOut'` for one-shot animations

### View Modes

Three view modes stored in Convex `connectionView` field:
- `"both"` (default): Side-by-side inputs and outputs with IOButton components
- `"input"`: Input-centric view using InputGroupedView component
- `"output"`: Output-centric view using OutputGroupedView component

Each view mode has different interaction patterns but achieves the same routing outcomes.

## Common Development Patterns

### Adding a New Setting

1. Add field to `convex/schema.ts` with `v.optional()` for backward compatibility
2. Create mutation in `convex/matrixConfig.ts` (e.g., `updateFieldName`)
3. Add UI in `SettingsPanel.tsx` with local state + save handler
4. Update `MatrixControl.tsx` to use the new setting
5. Test that setting persists across sessions

### Adding a New Theme

1. Add theme entry in `app/globals.css` under `[data-theme-name="..."]`
2. Define all required CSS custom properties (see existing themes for full list)
3. Add theme name to SettingsPanel theme selector
4. Update `convex/schema.ts` if adding new theme structure

### Modifying Connection Logic

Connection management is centralized in `MatrixControl.tsx`. Key functions:
- `attemptReconnection()` - Tries to connect, updates state
- Connection monitoring (useEffect at line ~60)
- Auto-retry logic (useEffect at line ~80)

Always maintain these principles:
- Return structured errors, never throw
- Update `lastSuccessfulConnection` on every successful poll
- Respect `connectionState` when deciding whether to poll

### Adding Responsive Breakpoints

When adding new UI elements that need responsive behavior:
1. Start with base styles
2. Add `[@media(max-height:768px)]:` variants for medium-height screens
3. Add `[@media(max-height:600px)]:` variants for small-height screens
4. Test at 768px and 600px vertical resolutions
5. Apply consistently across all three view modes if applicable

## Deployment

### Environment Variables

**Development (`.env.local`):**
```
NEXT_PUBLIC_CONVEX_URL=https://xxx.convex.cloud
```

**Production (Vercel):**
```
CONVEX_DEPLOY_KEY=prod:deployment-name|key-value
NEXT_PUBLIC_CONVEX_URL=https://xxx.convex.cloud
```

The build script automatically deploys Convex functions before building Next.js: `npx convex deploy && npm run build:next`

### Vercel Configuration

No special configuration needed. Push to connected GitHub repo and Vercel will:
1. Run `npm run build` (which deploys Convex then builds Next.js)
2. Deploy the static/serverless output

## Network Requirements

- Browser must be on same network as matrix switch (default: 192.168.1.x)
- Device must be reachable via HTTP
- CORS handled by Next.js API route proxy (`/api/matrix`)
- Convex connection requires internet (uses WebSocket to Convex cloud)

## Testing Checklist

When making changes to core functionality:

**Connection Management:**
- [ ] Initial load shows connecting toast
- [ ] Toast disappears after connection (or 15 seconds)
- [ ] Device disconnection triggers reconnection button after 60 seconds
- [ ] Manual reconnect works and shows toast
- [ ] Auto-retry attempts every 5 minutes (3x max)

**Routing:**
- [ ] Input → Output routing works
- [ ] Output → Input routing works
- [ ] Drag & drop works in both directions
- [ ] Cumulative routing preserves existing connections
- [ ] Status polling updates UI every 5 seconds

**Responsive:**
- [ ] Layout fits at 768px height without scrolling
- [ ] Layout fits at 600px height without scrolling
- [ ] All three view modes work at both breakpoints

**Theme:**
- [ ] Theme mode toggle works (light/dark/system)
- [ ] Theme name selector updates colors
- [ ] Settings persist after page refresh

## Important Notes

- **Never use `console.error()`** - it triggers Next.js error overlays. Use `console.log()` or `console.warn()`
- **Always handle errors gracefully** - return `{ error, success: false }` instead of throwing
- **Keep label areas consistent** - IOButton, InputGroupedView, and OutputGroupedView should have matching label styling
- **Test cumulative routing** - verify existing connections aren't lost when adding new ones
- **Sync view modes** - responsive changes must apply to all three view components
