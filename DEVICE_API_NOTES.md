# Matrix Switch Device API Notes

## Important Implementation Detail

The `parseStatusResponse()` function in `lib/matrixApi.ts` currently has **placeholder logic** that needs to be updated once you test with the real device.

## What We Know (From Your Reverse Engineering)

### Commands That Work
```javascript
// Get switch status
matrixdata={"COMMAND":"GETSWS"}

// Switch single input to single output
matrixdata={"COMMAND":"SW 1 2"}  // input 1 → output 2

// Switch single input to multiple outputs
matrixdata={"COMMAND":"SW 5 1 2 3 4"}  // input 5 → outputs 1,2,3,4

// Switch all outputs to one input
matrixdata={"COMMAND":"SWALL 2"}  // all outputs → input 2

// Set input label
matrixdata={"COMMAND":"SETNVRAM","FIELD":"Input4Lab","VALUE":"Studio 4"}

// Scene operations (not yet implemented in UI)
matrixdata={"COMMAND":"SceneCall 1"}  // recall scene 1
matrixdata={"COMMAND":"SceneSave 2"}  // save current as scene 2
```

## What We DON'T Know Yet

### 1. GETSWS Response Format
The app currently assumes a response like:
```javascript
{
  outputs: [1, 2, 3, 4, 5, 6, 7, 8]  // Each index = output, value = input
}
```

But the actual device might return something different like:
```javascript
// Option A: Object with named outputs
{
  "Output1": 1,
  "Output2": 2,
  // ...
}

// Option B: Array in different format
{
  "switches": ["1:1", "2:2", "3:3", ...]
}

// Option C: Status object
{
  "status": "OK",
  "matrix": { /* some structure */ }
}
```

### 2. Error Responses
We don't know what errors look like:
- Invalid command?
- Authentication failure?
- Device busy?

### 3. CORS Headers
Unknown if device sends:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST`
- `Access-Control-Allow-Headers: Authorization, Content-Type`

## How to Fix `parseStatusResponse()`

### Step 1: Test GETSWS Command

Open browser console at http://192.168.1.222 and run:

```javascript
const auth = btoa('admin:admin');
fetch('http://192.168.1.222', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ matrixdata: {"COMMAND":"GETSWS"} })
})
.then(r => r.json())
.then(data => {
  console.log('Response format:', data);
  console.log('Response type:', typeof data);
  console.log('Response keys:', Object.keys(data));
});
```

### Step 2: Update parseStatusResponse()

Based on the actual response, update the function in `lib/matrixApi.ts`:

```typescript
private parseStatusResponse(response: any): MatrixStatus {
  // EXAMPLE: If response is { "Output1": 1, "Output2": 2, ... }
  if (response.Output1 !== undefined) {
    const outputs = [
      response.Output1,
      response.Output2,
      response.Output3,
      response.Output4,
      response.Output5,
      response.Output6,
      response.Output7,
      response.Output8,
    ];
    return { outputs };
  }

  // EXAMPLE: If response is { switches: ["1:1", "2:2", ...] }
  if (response.switches && Array.isArray(response.switches)) {
    const outputs = response.switches.map((sw: string) => {
      const [input, output] = sw.split(':').map(Number);
      return input; // or however the format works
    });
    return { outputs };
  }

  // Fallback: return current implementation
  return { outputs: new Array(8).fill(1) };
}
```

## CORS Workaround (If Needed)

If the browser blocks requests due to CORS, you have two options:

### Option A: Next.js API Route Proxy

Create `app/api/matrix/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const deviceIp = body.deviceIp || '192.168.1.222';
  const command = body.command;

  const auth = Buffer.from('admin:admin').toString('base64');

  try {
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
  } catch (error) {
    return NextResponse.json({ error: 'Device unreachable' }, { status: 500 });
  }
}
```

Then update `lib/matrixApi.ts`:

```typescript
private async sendCommand(command: Record<string, unknown>): Promise<any> {
  try {
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

### Option B: Browser Extension

Install a CORS-unblocking extension (development only):
- [CORS Unblock](https://chromewebstore.google.com/detail/cors-unblock) for Chrome
- Only use for testing, not production

## Testing Checklist

- [ ] Verify device is at 192.168.1.222 (or update IP)
- [ ] Test direct access: http://192.168.1.222 in browser
- [ ] Run GETSWS command in console
- [ ] Document actual response format
- [ ] Update `parseStatusResponse()`
- [ ] Test switching command: `SW 1 2`
- [ ] Verify status updates after switch
- [ ] Test label setting: `SETNVRAM`
- [ ] Check CORS headers in Network tab
- [ ] If CORS blocked, implement API route proxy

## Sample Console Test Session

```javascript
// Test connection
const testMatrix = async () => {
  const auth = btoa('admin:admin');
  const baseUrl = 'http://192.168.1.222';

  // Test 1: Get status
  console.log('Testing GETSWS...');
  let response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ matrixdata: {"COMMAND":"GETSWS"} })
  });
  console.log('Status:', await response.json());

  // Test 2: Switch input 1 to output 1
  console.log('Testing switch...');
  response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ matrixdata: {"COMMAND":"SW 1 1"} })
  });
  console.log('Switch result:', await response.json());

  // Test 3: Get status again
  console.log('Getting status after switch...');
  response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ matrixdata: {"COMMAND":"GETSWS"} })
  });
  console.log('New status:', await response.json());
};

testMatrix();
```

## Questions to Answer

Once you test with the real device, update this document with:

1. What does `GETSWS` actually return?
2. What does a successful `SW` command return?
3. Are CORS headers present?
4. Does authentication work as expected?
5. Are there any rate limits or delays needed?
6. Do labels persist after setting with `SETNVRAM`?

## Updated Response Format (To Be Filled In)

```
Actual GETSWS response:
[Paste here after testing]

Actual SW response:
[Paste here after testing]

CORS headers present:
[ ] Yes [ ] No

Notes:
[Add any observations]
```
