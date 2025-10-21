# ⚡ Lightspeed Tools

A Chrome extension that supercharges productivity for Lightspeed Retail (R-Series) users.

## Features

- **⏱️ Billing Time Tracker** - Real-time countdown based on labor costs
- **💾 Auto-Save** - Automatically saves workorder edits every 2 seconds
- **🔓 Auto PIN Unlock** - Eliminates annoying timeout PIN screens
- **📝 Smart Text Fields** - Auto-resizing notes with synced heights
- **📋 Workorder History** - Quick access to recently visited workorders
- **📄 Dynamic Titles** - Browser tabs show customer and item names

## Installation

### From Chrome Web Store
*(Coming soon)*

### Manual Installation (Developer Mode)

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the extension directory

## Usage

1. Navigate to [Lightspeed Retail](https://us.merchantos.com)
2. Open any workorder
3. Features activate automatically!
4. Click the extension icon to configure settings

## Privacy

- **Zero data collection** - no analytics, no tracking
- **No external servers** - everything runs locally
- **Encrypted storage** - secure Chrome storage only
- See [PRIVACY.md](PRIVACY.md) for full details

## Development

Built with:
- Manifest V3
- Vanilla JavaScript
- Chrome Extension APIs
- Content Scripts + Page Context Injection

## Files

- `manifest.json` - Extension configuration
- `script.js` - Content script (isolated context)
- `inject.js` - Page context script (access to window.merchantos)
- `styles.css` - Custom styles
- `popup.html/js` - Extension popup UI
- `background.js` - Background service worker
- `help.html` - User documentation

## License

Custom extension for personal/organizational use.

## Credits

🤖 Co-Authored-By: Claude <noreply@anthropic.com>

Built with [Claude Code](https://claude.com/claude-code)
