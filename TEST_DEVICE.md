# Device Connection Test

## Current Error

You're seeing "Failed to fetch" which means the browser can't connect to the matrix device at `http://192.168.1.222`.

## Quick Diagnostics

### Test 1: Check Your Network
Open Terminal and run:
```bash
# Check your IP address
ipconfig getifaddr en0  # WiFi
# or
ipconfig getifaddr en1  # Ethernet
```

You should see something like `192.168.1.XXX`. If you see a different network (like `10.0.0.X` or `172.16.X.X`), the device IP needs to be updated.

### Test 2: Ping the Device
```bash
ping -c 3 192.168.1.222
```

**Good result:**
```
64 bytes from 192.168.1.222: icmp_seq=0 ttl=64 time=2.123 ms
```

**Bad result:**
```
Request timeout for icmp_seq 0
```
→ Device is not reachable. Check power, network connection, or IP address.

### Test 3: Test HTTP Connection
```bash
curl -v http://192.168.1.222
```

This will show if the device responds to HTTP requests at all.

### Test 4: Test Device API (Browser Console)

1. Open your browser to any page
2. Press F12 to open Developer Console
3. Go to the "Console" tab
4. Paste this code:

```javascript
// Test matrix device API
(async () => {
  const auth = btoa('admin:admin');
  try {
    const response = await fetch('http://192.168.1.222', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ matrixdata: {"COMMAND":"GETSWS"} })
    });

    console.log('✅ Connection successful!');
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    if (err.message.includes('CORS')) {
      console.log('🔧 CORS issue detected - see CORS_FIX.md for solution');
    }
  }
})();
```

## Common Issues & Solutions

### Issue 1: Device Not Found
**Symptoms:** Ping times out, "Failed to fetch"

**Solutions:**
1. Verify device is powered on
2. Check physical network connection
3. Find the actual IP:
   - Check device display/manual
   - Use network scanner: `arp -a | grep -i "192.168.1"`
   - Try common IPs: 192.168.1.1, 192.168.1.100, etc.

### Issue 2: CORS Policy Error
**Symptoms:** Error message mentions "CORS policy" in browser console

**Solution:** The device doesn't allow browser requests. You need to add an API proxy.

Create file `app/api/matrix/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { deviceIp, command } = await request.json();
    const auth = Buffer.from('admin:admin').toString('base64');

    const response = await fetch(`http://${deviceIp}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ matrixdata: command }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Device unreachable' },
      { status: 500 }
    );
  }
}
```

Then update `lib/matrixApi.ts`, change the `sendCommand` method:

```typescript
private async sendCommand(command: Record<string, unknown>): Promise<any> {
  try {
    // Use API route proxy instead of direct connection
    const response = await fetch('/api/matrix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceIp: this.baseUrl.replace('http://', ''),
        command
      }),
    });

    if (!response.ok) {
      throw new Error(`Matrix API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Matrix API request failed:', error);
    throw error;
  }
}
```

### Issue 3: Wrong IP Address
**Symptoms:** Ping fails, connection times out

**Solutions:**
1. Check device manual for default IP
2. Access device's web interface to verify IP
3. Update IP in the app:
   - Click gear icon ⚙️
   - Change "Device IP Address"
   - Click "Save Settings"

### Issue 4: Authentication Failed
**Symptoms:** 401 or 403 error

**Solution:** Credentials might not be admin/admin. Check device manual.

## Step-by-Step Troubleshooting

### Step 1: Find the Device IP

```bash
# List all devices on network
arp -a

# Look for entries like:
# ? (192.168.1.222) at xx:xx:xx:xx:xx:xx on en0 ifscope [ethernet]
```

### Step 2: Test Basic Connectivity

```bash
ping 192.168.1.222
```

If this works, continue. If not, the device isn't reachable.

### Step 3: Test HTTP

```bash
curl -i http://192.168.1.222
```

You should see HTTP headers. If you get "Connection refused", the device might use a different port.

### Step 4: Test with Authentication

```bash
curl -i -X POST \
  -H "Authorization: Basic YWRtaW46YWRtaW4=" \
  -H "Content-Type: application/json" \
  -d '{"matrixdata":{"COMMAND":"GETSWS"}}' \
  http://192.168.1.222
```

### Step 5: Check Response Format

If Step 4 worked, look at the response. It might look like:
```json
{
  "Output1": 1,
  "Output2": 2,
  ...
}
```

Or:
```json
{
  "status": "OK",
  "switches": ["1:1", "2:2", ...]
}
```

Copy the response and update `lib/matrixApi.ts` parseStatusResponse() accordingly.

## Quick Fixes

### Fix 1: Update Device IP

If your device is at a different IP:
1. Click the gear icon ⚙️ in the app
2. Change "Device IP Address" to the correct IP
3. Click "Save Settings"

### Fix 2: Add CORS Proxy (Recommended)

Since CORS is likely the issue, add the API proxy route (code above). This is the cleanest solution.

### Fix 3: Disable CORS in Browser (Development Only)

**For Chrome:**
```bash
# macOS
open -na "Google Chrome" --args --disable-web-security --user-data-dir="/tmp/chrome_dev"
```

**⚠️ WARNING:** Only use this for testing! Don't browse the web with CORS disabled.

## What's the Actual Device IP?

Common matrix switch IPs:
- 192.168.1.222 (default)
- 192.168.1.1 (gateway)
- 192.168.0.222
- 10.0.0.222

Check your device:
- Physical display on device
- Manual/documentation
- Manufacturer's web interface
- Network scan

## Test Results Template

Fill this in after testing:

```
Device IP: _________________
Ping result: [ ] Success [ ] Failed
HTTP accessible: [ ] Yes [ ] No
CORS error: [ ] Yes [ ] No
Response format: _________________

Next action needed: _________________
```

## Once Working

After the device connects successfully:

1. **Check console output** - Look at the actual response from GETSWS
2. **Update parser** - Modify `parseStatusResponse()` in `lib/matrixApi.ts`
3. **Test switching** - Try SW 1 1 command
4. **Verify status updates** - Watch the UI update after switching

## Need More Help?

1. Run all diagnostic commands above
2. Share the results
3. Check browser console (F12) for detailed error messages
4. Look at Network tab in DevTools to see the exact request/response
