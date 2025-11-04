# Display Studio - PWA Installation Guide

Display Studio is now installable as a Progressive Web App (PWA) on iOS, iPad, Android, and desktop platforms.

## Installation Instructions

### iOS / iPadOS (Safari)

1. Open Safari and navigate to your Display Studio URL
2. Tap the **Share** button (square with arrow pointing up)
3. Scroll down and tap **"Add to Home Screen"**
4. Edit the name if desired (default: "Display Studio")
5. Tap **"Add"** in the top right

**Notes:**
- The app will open in fullscreen mode without Safari's UI
- The icon will appear on your home screen like a native app
- Works on iPhone and iPad

### Android (Chrome)

1. Open Chrome and navigate to your Display Studio URL
2. Tap the menu button (three dots) in the top right
3. Tap **"Add to Home screen"** or **"Install app"**
4. Confirm the installation in the prompt

**Alternative method:**
- Look for the install banner that appears automatically
- Tap **"Install"** when prompted

**Notes:**
- The app will open in fullscreen mode
- Icon supports Android adaptive icons (maskable)

### Desktop - Chrome/Edge/Brave

1. Open Chrome/Edge/Brave and navigate to your Display Studio URL
2. Look for the install icon in the address bar (⊕ or computer icon)
3. Click the icon and select **"Install"**

**Alternative method:**
- Click the menu button (three dots)
- Select **"Install Display Studio..."** or **"Apps > Install this site as an app"**

**Notes:**
- App will open in its own window without browser UI
- Works on Windows, Mac, and Linux

### Desktop - Safari (macOS)

1. Open Safari and navigate to your Display Studio URL
2. Click **File** in the menu bar
3. Select **"Add to Dock"**

**Notes:**
- macOS Sonoma or later required for full PWA support
- Earlier versions can still use "Add to Reading List" or bookmark

## Features When Installed

✅ **Fullscreen Mode** - No browser UI, just your app
✅ **Offline Support** - Basic functionality works without internet
✅ **Fast Loading** - Cached assets load instantly
✅ **Native Feel** - Looks and behaves like a native app
✅ **Home Screen Icon** - Easy access from your device

## Requirements

- **iOS**: Safari 11.3 or later
- **Android**: Chrome 76 or later
- **Desktop**: Chrome 73+, Edge 79+, Safari 17+

## Troubleshooting

### Install button doesn't appear

**On iOS:**
- Make sure you're using Safari (not Chrome or other browsers)
- PWA installation only works in Safari on iOS

**On Android/Desktop:**
- The site must be served over HTTPS
- You may need to visit the site a few times before the prompt appears
- Try the manual install method from the browser menu

### App doesn't work offline

- The first time you visit, the app needs to cache resources
- After the initial load, core functionality should work offline
- Real-time features (Convex sync, matrix device control) require internet

### Icon looks wrong on Android

- Android uses "maskable" icons that adapt to different shapes
- Your device may apply its own icon shape/style
- This is normal Android behavior

### App doesn't fill the screen on iOS

- Make sure you installed via "Add to Home Screen" in Safari
- Opening the web link directly won't give you fullscreen mode
- Delete and reinstall if needed

## Uninstalling

### iOS / iPadOS
- Long press the app icon
- Tap "Remove App"
- Select "Delete App"

### Android
- Long press the app icon
- Drag to "Uninstall" or tap "App info" then "Uninstall"

### Desktop
- Right-click the app icon (Chrome/Edge)
- Select "Uninstall" or "Remove from Chrome"
- Or go to Settings > Apps > Display Studio > Uninstall

## Technical Details

- **Display Mode**: Fullscreen
- **Orientation**: All (portrait and landscape)
- **Theme Color**: Navy Blue (#1e3a5f)
- **Background Color**: White (#ffffff)
- **Service Worker**: Enabled for offline support

## Need Help?

If you encounter issues with PWA installation:
1. Ensure you're accessing the site via HTTPS
2. Clear browser cache and try again
3. Make sure your browser is up to date
4. Try accessing from a different browser to test
