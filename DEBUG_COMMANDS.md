# Debug Matrix Commands

Based on your reverse-engineering, let's test different commands to find the right one for getting status.

## Test These Commands in Browser Console

Open the device's web page (http://192.168.1.222) and test these in the console:

### Test 1: GETSWS (what we're currently using)
```javascript
fetch('/cgi-bin/matrixs.cgi', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ matrixdata: {"COMMAND":"GETSWS"} })
}).then(r => r.json()).then(console.log);
```

### Test 2: Try without "COMMAND" wrapper
```javascript
fetch('/cgi-bin/matrixs.cgi', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ matrixdata: "GETSWS" })
}).then(r => r.json()).then(console.log);
```

### Test 3: Try as plain string
```javascript
fetch('/cgi-bin/matrixs.cgi', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ COMMAND: "GETSWS" })
}).then(r => r.json()).then(console.log);
```

### Test 4: Look at Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Use the device's web interface to view current status
4. Find the request that returns `{"SWS":"1 4 4 4 5 6 7 8"}`
5. Right-click → Copy → Copy as fetch
6. Share that here

## What I Suspect

The device might:
1. Return status data only after a switch command
2. Need a specific "get status" command we haven't found yet
3. Return `{"result":"0"}` for acknowledgment, but need a follow-up request for actual data
4. Have the status embedded in a different field

## Quick Fix Option

If we can't get GETSWS to return SWS data, we can:
1. Store the last known state locally
2. Update it optimistically after each switch command
3. Only poll occasionally to resync

Let me know what command actually returns the `{"SWS":"..."}` data!
