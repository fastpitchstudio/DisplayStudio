# Safari Compatibility Fixes

## Issue: "fetch failed" in Safari (macOS and iOS)

### Root Cause
Safari's fetch implementation in Vercel's serverless environment is stricter than Chrome. The error "fetch failed" occurs when Safari's fetch doesn't receive all required headers or has connection issues.

### Applied Fixes

#### 1. Added Required Headers
```typescript
headers: {
  'Authorization': `Basic ${auth}`,
  'Content-Type': 'application/x-www-form-urlencoded',
  'Accept': '*/*',              // NEW: Explicitly accept any response type
  'User-Agent': 'DisplayStudio/1.0',  // NEW: Identify the client
}
```

#### 2. Added Fetch Options for Safari
```typescript
{
  cache: 'no-store',      // Disable caching (Safari can be aggressive with cache)
  keepalive: false,       // Don't reuse connections (may help with Safari)
}
```

### Files Modified
- `app/api/matrix/route.ts` - Main proxy endpoint
- `app/api/matrix/debug/route.ts` - Debug endpoint

### Testing Required
After deploying these changes to Vercel:

1. **Test in Safari (macOS)**
   - Open https://your-app.vercel.app
   - Try routing an input to output
   - Use debug panel to test GETSWS command
   - Copy error output if it still fails

2. **Test in Safari (iOS/iPadOS)**
   - Ensure device is on same network as matrix switch
   - Check: Settings → Privacy → Local Network → Safari → ON
   - Open app and test routing
   - Use debug panel if issues persist

## Theme Issue in Safari

The theme system uses:
1. `localStorage` to store preferences
2. Inline `<script>` in `<head>` to apply theme before React hydration
3. CSS custom properties defined in `globals.css`
4. Class-based theme switching: `.theme-vercel`, `.dark`, etc.

### Diagnostic Steps for Theme Issue

1. **Open Safari Developer Console** (Option+Command+C or Develop → Show JavaScript Console)

2. **Look for theme script logs:**
   ```
   [Theme Script] Applied classes: theme-vercel dark
   [Theme Script] Mode: system | Theme: vercel | isDark: true
   [Theme Script] CSS Variable --background: 0 0% 100%
   ```

3. **Check Applied Classes**
   - In console, run: `document.documentElement.className`
   - Should show: `"theme-vercel"` or `"theme-vercel dark"`

4. **Check CSS Variables**
   - In console, run:
     ```javascript
     const styles = getComputedStyle(document.documentElement);
     console.log('--background:', styles.getPropertyValue('--background'));
     console.log('--input-bg-selected:', styles.getPropertyValue('--input-bg-selected'));
     ```
   - Should return HSL values like: `222.2 84% 4.9%`

5. **Check localStorage**
   - In console, run:
     ```javascript
     console.log('theme-mode:', localStorage.getItem('theme-mode'));
     console.log('theme-name:', localStorage.getItem('theme-name'));
     ```

### Possible Safari-Specific Theme Issues

1. **localStorage disabled** - Check Safari → Settings → Privacy → Cookies and Website Data → Allow
2. **CSS custom properties not loading** - Check Network tab for `globals.css`
3. **Script blocked** - Check console for Content Security Policy errors
4. **Class not applied** - Timing issue with hydration

## Next Steps

1. **Deploy to Vercel** with fetch improvements
2. **Test in Safari** - both fetch and themes
3. **Share console logs** if issues persist:
   - Theme script logs
   - Any error messages
   - Debug panel output (use copy button)

## Alternative Solutions if Still Failing

### For Fetch Issues:
- Consider using `node-fetch` library instead of native fetch
- Add retry logic with exponential backoff
- Implement WebSocket connection as alternative

### For Theme Issues:
- Add fallback inline styles
- Use cookie-based theme storage instead of localStorage
- Implement server-side theme detection
