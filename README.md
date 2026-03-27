# Inoreader Star Opener

A Chrome extension that opens your Inoreader starred articles in background tabs with a simple keyboard shortcut.

## Features

- Open multiple starred articles in background tabs with a single keypress
- Automatically unstar articles after opening them
- Configurable number of tabs to open (1-20)
- Simple keyboard shortcut: Press `w` on the Inoreader starred page
- No API key required - works by parsing the page DOM

## Installation

### From Source

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension is now installed!

## Usage

1. Go to your Inoreader Starred page: https://www.inoreader.com/starred
2. Press the `w` key to open starred articles
3. By default, 8 articles will open in background tabs
4. You can change the number of tabs in the extension options

## Configuration

1. Right-click the extension icon and select "Options"
2. Or go to `chrome://extensions/`, find "Inoreader Star Opener", and click "Details" → "Extension options"
3. Set your desired number of tabs to open (1-20)
4. Click "Save Settings"

## Important Notes

### Page Structure Detection

This extension works by detecting article links on the Inoreader page. If it's not working correctly:

1. **Enable Debug Mode**:
   - Open `js/contentscripts.js`
   - Change `var DEBUG = false;` to `var DEBUG = true;`
   - Reload the extension in Chrome
   - Open the browser console (F12) on the Inoreader starred page
   - Press `w` to see debug information

2. **Check the Console Output**:
   - The debug messages will show what selectors are being tried
   - If no articles are found, you'll see a list of sample links from the page
   - This information can help identify the correct CSS selectors

3. **Update Selectors if Needed**:
   - Inoreader may update their page structure
   - If the default selectors don't work, you may need to update the `possibleSelectors` array in `js/contentscripts.js`
   - Look at the console output to identify the correct class names or CSS selectors

### Keyboard Shortcut

- The extension listens for the `w` key
- It will NOT trigger if you're typing in an input field or text area
- It will NOT trigger if you're holding Shift, Ctrl, Alt, or Meta (Command) keys

## Development

### File Structure

```
/
├── manifest.json          # Extension manifest (Manifest V3)
├── background.js          # Background service worker
├── js/
│   ├── contentscripts.js  # Content script injected into Inoreader pages
│   └── options.js         # Options page logic
├── html/
│   └── options.html       # Options page UI
├── css/
│   └── options.css        # Options page styles
└── img/                   # Extension icons
```

### Building

No build process is required. The extension can be loaded directly into Chrome as an unpacked extension.

## Troubleshooting

### Articles not opening?

1. Make sure you're on the Inoreader starred page (`https://www.inoreader.com/starred`)
2. Check the browser console for error messages (F12)
3. Enable debug mode (see "Page Structure Detection" section above)
4. Verify that there are starred articles visible on the page

### Wrong articles being opened?

The extension tries multiple CSS selectors to find article links. If it's selecting the wrong elements:

1. Enable debug mode to see which selector is being used
2. Update the `possibleSelectors` array in `js/contentscripts.js` to match the current Inoreader page structure

## Credits

This extension is based on [feedly-star-opener-ext](https://github.com/src256/feedly-star-opener-ext) by src256.

## License

MIT License - feel free to use and modify as needed.
