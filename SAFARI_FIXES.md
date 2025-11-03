# Safari Compatibility Fixes

## Issue: Request Timeout in Safari (macOS and iOS)

### Root Cause Analysis

**Problem:** Debug panel shows `{"isTimeout": true, "errorType": "AbortError"}` after exactly 10 seconds in Safari, while Chrome completes requests in ~100-200ms.

**Key Finding:** Safari has a **hardcoded 10-second timeout** for network requests that differs from Chrome (300s) and Firefox (90s). This cannot be overridden by the browser.

**Why It's Timing Out:**
The Vercel serverless function is hitting our AbortController's 10-second timeout. This suggests that when Safari makes the request, something in the request chain is causing the Vercel function's fetch to the local device to hang or take too long to even start.

**Critical Difference:** Chrome and Safari send slightly different request headers/properties that may cause Vercel's Node.js fetch implementation to behave differently.

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

### Next Diagnostic Steps

After deploying, use the debug panel to check Vercel logs:

1. **Open Debug Panel in Safari** and run GETSWS command
2. **Check Vercel Function Logs** (Vercel Dashboard → your project → Functions tab)
   - Look for the debug request
   - Check which headers Safari sent vs Chrome
   - See if fetch to local device even starts
   - Check timing: does it hang immediately or after attempting connection?

3. **Compare Request Headers:**
   - In Vercel logs, you'll see "All headers:" JSON output
   - Compare Safari's headers vs Chrome's headers
   - Look for differences in: User-Agent, Accept, Connection, etc.

### Important Notes

- **Local Network Permission:** This only applies to NATIVE iOS/macOS apps, NOT web browsers like Safari
- **Safari has no "Local Network" setting:** This is a common misconception - browsers don't need this permission
- **The issue is server-side:** The timeout happens in Vercel's serverless function, not in Safari itself
- Safari makes the request → Vercel receives it → Vercel tries to fetch local device → times out at 10s

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
