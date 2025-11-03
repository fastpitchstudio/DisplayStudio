# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER DEVICES                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Desktop  │  │  Tablet  │  │  Phone   │  │  Phone   │   │
│  │ Browser  │  │ Browser  │  │ Browser  │  │ Browser  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌───────────────┐          ┌────────────────┐
│   Convex      │          │  Matrix Switch │
│   Database    │          │    Device      │
│               │          │  192.168.1.222 │
│ - Labels      │          │                │
│ - Device IP   │          │ - 8 Inputs     │
│ - Settings    │          │ - 8 Outputs    │
│               │          │ - HTTP API     │
│ Real-time     │          │ - Basic Auth   │
│ Sync          │          │                │
└───────────────┘          └────────────────┘
```

## Data Flow

### 1. Initial Load
```
User Browser
    │
    ├─→ Load Next.js App
    │
    ├─→ Connect to Convex
    │     └─→ Query matrixConfig
    │           └─→ Get labels & device IP
    │
    └─→ Start polling Matrix Device
          └─→ GET status every 3 seconds
```

### 2. User Switches Input to Output
```
User Action: Tap Input 1, then Output 2
    │
    ▼
MatrixControl Component
    │
    ├─→ Update UI (optimistic)
    │     └─→ Highlight selection
    │     └─→ Show loading state
    │
    ├─→ Send HTTP POST to Device
    │     └─→ matrixdata={"COMMAND":"SW 1 2"}
    │     └─→ Basic Auth: admin/admin
    │
    ├─→ Update local state
    │     └─→ Clear selection
    │     └─→ Update routing map
    │
    └─→ Next poll confirms change
          └─→ Display active state
```

### 3. User Updates Labels
```
User Action: Edit "Input 1" → "Studio 1"
    │
    ▼
SettingsPanel Component
    │
    ├─→ Update local state (immediate)
    │     └─→ Input field shows "Studio 1"
    │
    ├─→ On Save: Call Convex mutation
    │     └─→ updateInputLabel(1, "Studio 1")
    │           └─→ Convex stores in database
    │
    └─→ All connected devices receive update
          └─→ Labels sync in real-time
```

## Component Hierarchy

```
app/
├─ layout.tsx
│  └─ ConvexClientProvider
│     └─ {children}
│
└─ page.tsx
   ├─ useQuery(matrixConfig)     ← Convex
   ├─ useMutation(update...)     ← Convex
   │
   └─ MatrixControl
      ├─ Status Polling Loop
      ├─ Switch Command Handler
      │
      ├─ Input Grid
      │  └─ IOButton × 8
      │     ├─ Drag handlers
      │     ├─ Click handlers
      │     └─ Animations
      │
      ├─ Output Grid
      │  └─ IOButton × 8
      │     ├─ Drop handlers
      │     ├─ Click handlers
      │     └─ Animations
      │
      └─ SettingsPanel
         ├─ Device IP input
         ├─ Input labels (8)
         └─ Output labels (8)
```

## State Management

### React State (Component Level)
```typescript
// MatrixControl.tsx
const [selectedInput, setSelectedInput]   // Currently selected input (1-8 or null)
const [selectedOutput, setSelectedOutput] // Currently selected output (1-8 or null)
const [matrixStatus, setMatrixStatus]     // Current routing state from device
const [showSettings, setShowSettings]     // Settings panel open/closed
const [isLoading, setIsLoading]           // Loading indicator
const [error, setError]                   // Error message
```

### Convex State (Database)
```typescript
// convex/schema.ts
matrixConfig {
  deviceIp: string              // "192.168.1.222"
  input1Label: string           // "Studio 1"
  ...
  input8Label: string           // "Camera 3"
  output1Label: string          // "TV 1"
  ...
  output8Label: string          // "Projector"
  updatedAt: number             // Timestamp
}
```

### Device State (Source of Truth)
```typescript
// lib/matrixApi.ts
MatrixStatus {
  outputs: number[]  // [1, 2, 3, 4, 5, 6, 7, 8]
  // Index = output number (0-7)
  // Value = input number (1-8)
  // Example: outputs[0] = 3 means Output 1 shows Input 3
}
```

## Network Communication

### Convex (WebSocket)
```
Browser ↔ Convex Cloud
    │
    ├─ Query (read)
    │  └─ Real-time subscription
    │     └─ Updates pushed to all clients
    │
    └─ Mutation (write)
       └─ Executed on Convex servers
          └─ Results synced to all clients
```

### Matrix Device (HTTP)
```
Browser → Matrix Device
    │
    ├─ POST http://192.168.1.222
    │  └─ Header: Authorization: Basic [base64]
    │  └─ Body: {"matrixdata": {"COMMAND": "..."}}
    │
    └─ Response: JSON (format unknown)
       └─ Parsed by parseStatusResponse()
```

## Interaction Patterns

### Pattern A: Input → Output(s)
```
1. User taps Input 3
   └─ selectedInput = 3
   └─ Input 3 glows blue

2. User taps Output 1
   └─ Execute: SW 3 1
   └─ selectedInput = null
   └─ Output 1 shows active (connected to Input 3)

3. User taps Output 5 (while Input 3 still selected)
   └─ Execute: SW 3 5
   └─ Output 5 shows active
```

### Pattern B: Output → Input
```
1. User taps Output 2
   └─ selectedOutput = 2
   └─ Output 2 glows green

2. User taps Input 4
   └─ Execute: SW 4 2
   └─ selectedOutput = null
   └─ Output 2 shows active (connected to Input 4)
```

### Pattern C: Drag & Drop
```
1. User starts dragging Input 5
   └─ onDragStart
   └─ selectedInput = 5
   └─ dataTransfer = "input-5"

2. User drags over Output 3
   └─ onDragOver
   └─ Output 3 shows yellow border

3. User drops on Output 3
   └─ onDrop
   └─ Execute: SW 5 3
   └─ Clear selections
```

## Error Handling

### Device Communication Errors
```
try {
  await matrixClient.switchInputToOutputs(1, [2])
} catch (err) {
  ├─ Network error → "Connection error" banner
  ├─ Timeout → "Device not responding"
  ├─ Auth error → "Authentication failed"
  └─ Invalid command → Log to console
}
```

### Convex Errors
```
try {
  await updateInputLabel({ inputNum: 1, label: "Studio 1" })
} catch (err) {
  └─ Show error in settings panel
     └─ "Failed to save settings"
```

## Polling Strategy

```
useEffect(() => {
  const poll = async () => {
    try {
      const status = await matrixClient.getStatus()
      setMatrixStatus(status)  // Update UI
      setError(null)           // Clear errors
    } catch (err) {
      setError("Connection error")
    }
  }

  poll()                        // Immediate poll
  const interval = setInterval(poll, 3000)  // Every 3 seconds

  return () => clearInterval(interval)       // Cleanup
}, [deviceIp])
```

## Responsive Breakpoints

### Mobile Portrait (< 640px)
```
┌──────────────┐
│   Header     │
├──────────────┤
│   INPUTS     │
│ [1][2][3][4] │
│ [5][6][7][8] │
├──────────────┤
│   OUTPUTS    │
│ [1][2][3][4] │
│ [5][6][7][8] │
└──────────────┘
```

### Tablet / Mobile Landscape (640px - 1024px)
```
┌───────────────────────────┐
│         Header            │
├─────────────┬─────────────┤
│   INPUTS    │   OUTPUTS   │
│   [1][2]    │   [1][2]    │
│   [3][4]    │   [3][4]    │
│   [5][6]    │   [5][6]    │
│   [7][8]    │   [7][8]    │
└─────────────┴─────────────┘
```

### Desktop (> 1024px)
```
┌──────────────────────────────────┐
│            Header                │
├──────────────┬───────────────────┤
│   INPUTS     │     OUTPUTS       │
│              │                   │
│    [1][2]    │      [1][2]       │
│    [3][4]    │      [3][4]       │
│    [5][6]    │      [5][6]       │
│    [7][8]    │      [7][8]       │
│              │                   │
└──────────────┴───────────────────┘
```

## Security Considerations

### Current Implementation
- ✅ Basic Auth for device (admin/admin)
- ✅ HTTPS enforced by Convex
- ✅ No sensitive data stored
- ✅ Local network only (by default)

### Production Recommendations
- Consider changing device password if possible
- Use VPN for remote access
- Implement rate limiting on device
- Add audit logging for switches

## Performance Characteristics

### Initial Load
- Next.js hydration: ~500ms
- Convex connection: ~200ms
- First device poll: ~100ms
- **Total: < 1 second**

### Switching Action
- User interaction → UI update: < 16ms (60fps)
- UI update → API call: < 50ms
- API call → device response: ~100-200ms
- **Total perceived latency: ~200ms**

### Status Updates
- Poll interval: 3000ms
- Response time: ~100ms
- **UI refresh: Every 3 seconds**

## Future Architecture Improvements

### If Device Had WebSocket Support
```
Browser ←── WebSocket ──→ Matrix Device
    │
    └─ Real-time bidirectional updates
       └─ No polling needed
       └─ Instant status changes
```

### If Multiple Matrix Devices
```
Convex Database
    │
    ├─ devices: [
    │    { id, ip, name, type },
    │    { id, ip, name, type }
    │  ]
    │
    └─ configs: [
         { deviceId, labels, settings }
       ]
```

### If Scene Management Added
```
Convex Database
    │
    └─ scenes: [
         {
           name: "Default",
           routing: [1,2,3,4,5,6,7,8]
         },
         {
           name: "Presentation Mode",
           routing: [1,1,1,1,5,6,7,8]
         }
       ]
```
