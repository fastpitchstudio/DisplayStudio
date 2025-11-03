# Next Steps - Get Your Matrix Switch App Running

## Step 1: Initialize Convex (5 minutes)

Open a terminal in the project directory and run:

```bash
npx convex dev
```

This will:
1. Open your browser to authenticate with Convex
2. Prompt you to create or select a project (suggest name: "matrix-switch-control")
3. Automatically update `.env.local` with your deployment URL
4. Start the Convex development server

**Keep this terminal window open** - the Convex dev server needs to run continuously.

## Step 2: Start the App (1 minute)

Open a **new terminal window** in the same directory and run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 3: Configure Your Matrix Switch (2 minutes)

1. Click the **gear icon** (⚙️) in the top-right corner
2. Update the **Device IP Address** if it's not 192.168.1.222
3. Customize the input labels (e.g., "Studio 1", "iPad", "Camera 3")
4. Customize the output labels (e.g., "TV 1", "Projector", "Front Display")
5. Click **Save Settings**

## Step 4: Test Basic Functionality (10 minutes)

### Test Connection
1. Make sure your matrix switch is powered on
2. Verify you're on the same network (192.168.1.x)
3. Look for any error messages in the app

### Test Switching
1. **Tap an input** (e.g., Input 1) - it should glow blue
2. **Tap an output** (e.g., Output 1) - switch should execute immediately
3. Watch the matrix switch to verify it switched correctly

### Test Drag & Drop
1. **Drag an input button** and drop it on an output
2. Or drag an output and drop it on an input
3. Verify the switch executes

### Test Status Updates
1. Use the matrix switch's physical controls (if any) or web interface
2. Make a switch manually
3. Wait 3-5 seconds
4. The app should update to reflect the change

## Step 5: Troubleshooting (If Needed)

### If you see "Connection error":

1. **Check the device IP**:
   ```bash
   ping 192.168.1.222
   ```

2. **Test direct access** in your browser:
   ```
   http://192.168.1.222
   ```

3. **Check browser console** (Press F12, look for errors)

4. **Look for CORS errors**:
   - If you see "CORS policy" errors in the console
   - See `DEVICE_API_NOTES.md` for the proxy solution

### If switches don't work:

1. **Open browser console** (F12) and look for API errors

2. **Test the command manually**:
   - Open console at http://192.168.1.222
   - Run the test script from `DEVICE_API_NOTES.md`
   - See what the actual response looks like

3. **Update the parser** if response format is different:
   - Edit `lib/matrixApi.ts`
   - Update the `parseStatusResponse()` function
   - See examples in `DEVICE_API_NOTES.md`

## Step 6: Real-World Testing (30 minutes)

Once basic functionality works:

### Test on Different Devices
1. Find the IP of your development machine (e.g., 192.168.1.100)
2. On your phone, open: `http://192.168.1.100:3000`
3. On your tablet, open: `http://192.168.1.100:3000`
4. Verify labels sync across devices

### Test Interaction Modes
- [ ] Tap input first, then output
- [ ] Tap output first, then input
- [ ] Drag input to output
- [ ] Drag output to input
- [ ] Select input, tap multiple outputs in sequence
- [ ] Change selection mid-operation

### Test Responsive Design
- [ ] Mobile portrait mode
- [ ] Mobile landscape mode
- [ ] Tablet portrait mode
- [ ] Tablet landscape mode
- [ ] Desktop browser

### Test Edge Cases
- [ ] Rapidly switch multiple times
- [ ] Switch while status is updating
- [ ] Change labels while switching
- [ ] Multiple users switching simultaneously
- [ ] What happens when device is unplugged?

## Step 7: Production Deployment (Optional)

If you want to deploy this for permanent use:

### Option A: Local Network Only (Easiest)

1. Deploy on a local server (Raspberry Pi, old laptop, etc.)
2. Run `npm run build` to create production build
3. Run `npm start` to serve the production build
4. Access via local IP from any device on network

### Option B: Cloud Deployment (Access Anywhere)

1. Deploy to Vercel (free):
   ```bash
   npm install -g vercel
   vercel
   ```

2. Set up a VPN or tunnel to your network so the device is reachable

3. Or implement the API proxy (see `DEVICE_API_NOTES.md`)

## Common Questions

**Q: Do I need to run Convex dev forever?**
A: For development, yes. For production, Convex functions are deployed and run in the cloud.

**Q: Can multiple people use this at once?**
A: Yes! Labels sync across devices. However, if two people switch simultaneously, the device will execute commands in the order it receives them.

**Q: What if the device response format is different than expected?**
A: See `DEVICE_API_NOTES.md` for how to test the actual response and update the parser.

**Q: Can I use this without an internet connection?**
A: You need internet for Convex (label storage), but device communication is local. You could implement local storage as a fallback.

**Q: Where are the scene save/recall buttons?**
A: Not implemented yet - was intentionally deferred to keep the initial version simple. The device supports it, so it's easy to add later.

## Quick Reference Commands

```bash
# Initialize Convex (first time only)
npx convex dev

# Start development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Check for TypeScript errors
npx tsc --noEmit

# Run linter
npm run lint
```

## File Structure Quick Reference

- **Edit device IP/labels**: Settings panel (gear icon) in the app
- **Customize colors**: `app/globals.css` and `components/*.tsx`
- **Add features**: `components/MatrixControl.tsx`
- **Fix API parsing**: `lib/matrixApi.ts` → `parseStatusResponse()`
- **Database schema**: `convex/schema.ts`
- **Add CORS proxy**: Create `app/api/matrix/route.ts`

## Getting Help

1. **Check STATUS.md**: Detailed status of what's working/not working
2. **Check DEVICE_API_NOTES.md**: Device communication troubleshooting
3. **Check browser console**: Most issues show errors in console (F12)
4. **Check terminal output**: Both Next.js and Convex terminals show errors

## Success Indicators

You'll know everything is working when:
- ✅ App loads without errors
- ✅ No "Connection error" message
- ✅ Switching executes immediately
- ✅ Status updates reflect device state
- ✅ Labels save and persist
- ✅ Works on mobile without scrolling
- ✅ Animations are smooth
- ✅ Multiple devices stay in sync

---

**Ready to begin?** Start with Step 1 above! 🚀
