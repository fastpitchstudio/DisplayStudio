# Connection Management System

## Overview
The app now includes a robust connection management system that handles device disconnections gracefully without throwing Next.js error pages.

## Features Implemented

### 1. Connection State Tracking
- **States**: `connected`, `connecting`, `disconnected`, `retry`
- Tracks last successful connection timestamp
- Monitors connection health every 5 seconds

### 2. 60-Second Disconnection Detection
- If the device is unreachable for 60+ seconds, the app automatically:
  - Stops polling the device
  - Shows a reconnection overlay
  - Enters "disconnected" state

### 3. Friendly Connecting Toast
- **Appears when**:
  - App is loading for the first time
  - User clicks "Reconnect to Device" button
  - Auto-retry is attempting reconnection
- **Features**:
  - Simple, non-scary message: "Connecting to device..."
  - Subtle spinner animation
  - Auto-hides after 15 seconds if connection takes too long
  - Auto-hides immediately when connection succeeds or fails
  - Positioned at the top center of the screen

### 4. Subtle Reconnection Button
- **Appears when**: Device has been unreachable for 60 seconds
- **Location**: Top-right corner, next to the settings button
- **Features**:
  - Subtle icon button with disconnection icon
  - Destructive-styled (red/error color) to indicate issue
  - Tooltip: "Device disconnected - Click to reconnect"
  - Clicking attempts reconnection immediately
  - Non-intrusive - doesn't block the UI

### 5. Automatic Silent Retry
- **Frequency**: Every 5 minutes
- **Max attempts**: 3 attempts
- **Behavior**:
  - Silently attempts to reconnect in the background
  - Does not interrupt user if they're working
  - Shows retry count on overlay if visible
  - After 3 failed attempts, waits for manual reconnection

### 6. Graceful Error Handling
- No more Next.js error pages for network failures
- Errors are caught at multiple levels:
  - API client level (matrixApi.ts)
  - Component level (MatrixControl.tsx)
  - Network level (fetch timeouts, connection refused, etc.)
- All errors return structured responses instead of throwing

## Technical Details

### Modified Files

1. **components/MatrixControl.tsx**
   - Added connection state management (line 40-44)
   - Added connecting toast with 15-second timeout (line 46-58)
   - Implemented 60-second timeout detection (line 60-75)
   - Added auto-retry logic with 3-attempt limit (line 77-97)
   - Created manual reconnection handler (line 99-106)
   - Added attemptReconnection function (line 108-133)
   - Modified polling to respect connection state (line 135-160)
   - Added subtle reconnection button in header (line 391-416)
   - Added connecting toast UI (line 449-466)

2. **lib/matrixApi.ts**
   - Modified `sendCommand` to return errors instead of throwing (line 16-53)
   - Updated `getStatus` to handle errors gracefully (line 56-68)
   - Updated `switchInputToOutputs` to check for errors (line 77-81)

### Connection Flow

```
Initial Load
    ↓
[connecting] → Poll device every 5s
    ↓
Success? → [connected] → Continue polling
    ↓
Failure? → Track time since last success
    ↓
60s elapsed? → [disconnected] → Show overlay, stop polling
    ↓
Auto-retry (every 5 min, 3x max)
    ↓
[retry] → Attempt connection
    ↓
Success? → [connected] → Resume polling, hide overlay
    ↓
Failed all retries? → Wait for manual reconnection
```

### Error Handling Strategy

**Before:**
```javascript
// Old code - throws errors
throw new Error('fetch failed');
// Result: Next.js error page
```

**After:**
```javascript
// New code - returns structured errors
return { error: 'Network error - device unreachable', success: false };
// Result: Graceful handling, no error page
```

## Testing Scenarios

To test the connection management:

1. **Initial load with connecting toast**:
   - Refresh the page
   - Should see "Connecting to device..." toast at top
   - Toast should disappear once connected (or after 15 seconds)

2. **Normal operation**: Device should connect and poll every 5 seconds

3. **Device disconnection**:
   - Unplug device or change IP in settings to invalid address
   - Wait 60 seconds
   - Reconnection button should appear in top-right corner (red icon)

4. **Manual reconnection with toast**:
   - Click the reconnection button in top-right
   - Should see connecting toast appear
   - Toast should hide when connection succeeds or after 15 seconds
   - Reconnection button should disappear on successful connection

5. **Auto-retry**:
   - Leave device disconnected
   - Wait 5 minutes
   - Should see retry attempt in console (3 times max)

6. **Reconnection**:
   - Reconnect device
   - Click reconnect or wait for auto-retry
   - Should resume normal operation

## Console Messages

The system logs helpful messages:
- `✓ Status synced: 1 4 4 4 5 6 7 8` - Successful status update
- `⚠ Device unreachable for 60 seconds, showing reconnection overlay` - Timeout detected
- `🔄 Auto-retry attempt 1/3` - Auto-retry triggered
- `✓ Reconnected successfully` - Connection restored
- `❌ Reconnection failed:` - Connection attempt failed
- `⚠ Max auto-retry attempts reached, waiting for manual reconnection` - All retries exhausted

## Future Improvements

Potential enhancements:
- Add connection quality indicator
- Implement exponential backoff for retries
- Add notification sound on reconnection
- Show connection latency/ping time
- Add device discovery/scanning feature
