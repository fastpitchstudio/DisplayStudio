# iOS/Safari Compatibility Issues & Fixes

## Issues Identified

### 1. Debug Endpoint Format Mismatch ✅ FIXED
**Problem:** The debug endpoint (`/api/matrix/debug`) was using `Content-Type: application/json` while the main endpoint (`/api/matrix`) uses `Content-Type: application/x-www-form-urlencoded`.

**Impact:** Debug commands would fail or return different results than actual commands.

**Fix:** Updated debug endpoint to match the main endpoint:
```typescript
// OLD (incorrect)
body: JSON.stringify({ matrixdata: command })
headers: { 'Content-Type': 'application/json' }

// NEW (correct)
body: `matrixdata=${encodeURIComponent(JSON.stringify(command))}`
headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
```

### 2. Missing Copy-to-Clipboard ✅ FIXED
**Problem:** No way to copy debug output on iOS/iPad to share error details.

**Fix:** Added copy button with iOS-compatible fallback:
- Primary: Uses `navigator.clipboard.writeText()` (modern browsers)
- Fallback: Uses `document.execCommand('copy')` (iOS Safari)
- Visual feedback: Shows checkmark icon for 2 seconds after successful copy

### 3. Potential iOS Network Issues (Still Investigating)

iOS Safari has known issues with local network requests:

#### Issue A: Local Network Permission (iOS 14+)
**Symptom:** App cannot connect to local device (192.168.1.x) on iOS/iPadOS.

**Cause:** iOS 14+ requires explicit permission for local network access.

**Solution:**
1. App must request local network permission on first use
2. User sees system prompt: "Allow [App] to find and connect to devices on your local network?"
3. This is automatic for web apps - no code changes needed
4. But user MUST approve the permission

**To check on iOS:**
- Settings → Privacy & Security → Local Network
- Find Safari or your browser
- Ensure toggle is ON

#### Issue B: Mixed Content (HTTP in HTTPS context)
**Symptom:** If your Next.js app is served over HTTPS (e.g., via Vercel), it cannot make HTTP requests to local device.

**Cause:** Browsers block "mixed content" - HTTPS pages cannot make HTTP requests for security.

**Solutions:**
1. **Development:** Access app via HTTP: `http://localhost:3000` (not HTTPS)
2. **Production on same network:** Deploy to local server with HTTP
3. **Remote access:** Use VPN or tunnel service

**Current Status:** App uses Next.js API route as proxy, which should work. But if Vercel deployment is HTTPS, it will fail to connect to HTTP device.

#### Issue C: CORS Issues in iOS Safari
**Symptom:** Device rejects requests from iOS Safari but works on desktop.

**Cause:** iOS Safari is stricter about CORS than desktop browsers.

**Solution:** Using Next.js API route (`/api/matrix`) as proxy should bypass this. But verify device allows requests from your domain.

## Testing on iOS

### 1. Use Debug Panel to Diagnose
1. Open app on iOS device
2. Ensure you're on same WiFi as matrix switch
3. Tap "DEBUG" button (bottom-right)
4. Enter command: `GETSWS`
5. Tap "Test Command"
6. Tap copy icon to copy full error output
7. Paste into message app or notes to read/share

### 2. Check for Common Errors

**Error: "Network request failed"**
- Likely cause: iOS local network permission not granted
- Fix: Settings → Privacy → Local Network → Safari → ON

**Error: "Failed to fetch" or "TypeError: Failed to fetch"**
- Likely cause: Mixed content (HTTPS → HTTP)
- Fix: Access app via HTTP, not HTTPS

**Error: "Device request timed out after 10 seconds"**
- Likely cause: Device IP wrong or device unreachable
- Fix: Verify device IP in Settings, ping device from another app

**Error: Contains "CORS" or "Access-Control-Allow-Origin"**
- Likely cause: Device CORS settings
- Fix: This shouldn't happen (API route proxies), but check device settings

## Recommended Next Steps

1. **Test on iOS device with debug panel**
   - Copy full error output using new copy button
   - Share error details to diagnose specific issue

2. **Verify network setup**
   - iOS device and matrix switch on same WiFi
   - Can ping device from iOS (use network utility app)
   - Local network permission granted to Safari

3. **Check app access method**
   - If accessing via Vercel (HTTPS): Won't work for local device
   - Must access via HTTP (localhost during dev, or HTTP deployment)

4. **Consider alternative architectures if needed**
   - Deploy Next.js app to local Raspberry Pi (HTTP)
   - Use VPN for remote access instead of direct HTTPS
   - Add HTTPS support to matrix device (if possible)

## Debug Output Fields

The enhanced debug response now includes:

```json
{
  "success": true/false,
  "status": 200,
  "statusText": "OK",
  "contentType": "application/json",
  "responseTime": "123ms",
  "body": { /* parsed response */ },
  "rawBody": "...",
  "requestDetails": {
    "url": "http://192.168.1.222/cgi-bin/matrixs.cgi",
    "method": "POST",
    "contentType": "application/x-www-form-urlencoded",
    "bodyFormat": "matrixdata=%7B%22COMMAND%22%3A%22GETSWS%22%7D"
  },
  // If error:
  "error": "Error message",
  "errorType": "TypeError",
  "errorCause": "...",
  "isTimeout": false
}
```

This detailed output will help diagnose exactly where iOS Safari is failing.
