# CORS Workaround for Browser→Device Connection

## The Issue

The app makes direct requests from your browser to the local matrix switch device (192.168.x.x). Browsers block these requests due to CORS (Cross-Origin Resource Sharing) when:

- The app is served over HTTPS (like Vercel)
- The device is HTTP
- The device doesn't send CORS headers

## Solutions (Pick One)

### Option 1: Use Chrome with CORS Disabled (Easiest)

**On Mac:**
```bash
open -na "Google Chrome" --args --disable-web-security --user-data-dir="/tmp/chrome-cors-disabled"
```

**On Windows:**
```
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C:\tmp\chrome-cors-disabled"
```

**On Linux:**
```bash
google-chrome --disable-web-security --user-data-dir="/tmp/chrome-cors-disabled"
```

Then visit your Vercel app URL in this Chrome window.

### Option 2: Install CORS Extension

**Chrome/Edge:**
1. Install "Allow CORS: Access-Control-Allow-Origin"
2. Click the extension icon to enable it
3. Refresh the app

### Option 3: Safari Private Browsing + Developer Mode

Safari is more lenient with CORS in certain configurations:

1. Enable Develop menu: Safari → Settings → Advanced → Show Develop menu
2. Develop → Disable Cross-Origin Restrictions
3. Use the app

### Option 4: Use HTTP Vercel Preview (If Available)

Some Vercel deployments can use HTTP instead of HTTPS. Check your Vercel settings.

## Why This Happens

Your browser is running the app from `https://your-app.vercel.app`, but it's trying to connect to `http://192.168.1.222`. Browsers see this as a security risk and block it unless CORS headers allow it.

The matrix switch device likely doesn't send CORS headers (most embedded devices don't).

## Recommended Approach

**For daily use:**
- Create a desktop shortcut that launches Chrome with CORS disabled
- Use this dedicated browser instance only for the matrix control app
- Keep using regular Chrome for everything else

**Desktop Shortcut (Mac):**
Create a file called "Matrix Control.command":
```bash
#!/bin/bash
open -na "Google Chrome" --args --disable-web-security --user-data-dir="/tmp/chrome-cors-disabled" --app="https://your-app.vercel.app"
```

Make it executable: `chmod +x "Matrix Control.command"`

**Windows Shortcut:**
Create shortcut with target:
```
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C:\tmp\chrome-cors-disabled" --app="https://your-app.vercel.app"
```

## Security Note

Disabling CORS is safe when:
- You only use that browser instance for this specific app
- You trust the Vercel-hosted app (it's your code)
- You don't visit other websites in that browser window

The `--user-data-dir` flag ensures this CORS-disabled browser runs separately from your main browser.
