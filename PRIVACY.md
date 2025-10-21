# Privacy Policy for Lightspeed Tools

**Last Updated:** October 21, 2025

## Overview

Lightspeed Tools is a browser extension designed to enhance productivity when using Lightspeed Retail (R-Series). This privacy policy explains how the extension handles your data.

## Data Collection and Storage

### What We Collect

Lightspeed Tools stores the following data **locally on your device only**:

1. **User Preferences**
   - Feature toggle states (billing tracking, auto-save, auto PIN unlock)
   - Billing rate preferences
   - UI state (collapsed/expanded sections)

2. **Workorder History**
   - Workorder IDs of recently visited pages (last 50)
   - Timestamp of when each workorder was accessed

3. **PIN (Optional)**
   - If you enable Auto PIN Unlock, your Lightspeed PIN is stored
   - This is stored in Chrome's encrypted sync storage
   - Used solely to automatically fill PIN verification prompts

### Where Data Is Stored

All data is stored using **Chrome's built-in storage API**:
- **Sync Storage**: Used for settings and PIN (encrypted by Chrome)
- **Local Storage**: Used for workorder history and temporary data

### Data Transmission

**We do NOT transmit any data to external servers.**

- The extension has no backend servers
- No analytics or tracking
- No data is sent to third parties
- All functionality runs entirely within your browser

## Data Usage

Data stored by this extension is used exclusively for:

1. **Maintaining your preferences** across browser sessions
2. **Auto-filling your PIN** when verification is required (if enabled)
3. **Showing recently visited workorders** for quick access
4. **Tracking billing time** for workorders you're actively working on

## Third-Party Access

- **No third-party services** have access to your data
- **No advertisers** have access to your data
- **No analytics platforms** track your usage
- Only **you and Chrome's sync** (if enabled) have access to stored data

## Data Security

### PIN Security

If you enable Auto PIN Unlock:
- Your PIN is stored using Chrome's encrypted storage
- It is only accessible by this extension
- It is never transmitted over the network
- Manual lock screen (clicking lock button) is still respected

**Recommendation:** Only enable Auto PIN Unlock on trusted, personal devices.

### General Security

- Extension runs only on `https://us.merchantos.com/*`
- Uses Chrome's Content Security Policy
- Follows principle of least privilege for permissions

## Data Retention

- **Settings and PIN**: Retained until you clear Chrome storage or uninstall the extension
- **Workorder History**: Automatically limited to last 50 workorders; can be manually cleared
- **Session Data**: Cleared when browser closes or tab is closed

## Data Deletion

You can delete your data at any time:

1. **Clear All Data**: Uninstall the extension
2. **Clear PIN**: Toggle off Auto PIN Unlock and reinstall
3. **Clear History**: Click "Clear History" in the extension popup
4. **Clear Settings**: Reset Chrome sync data or reinstall extension

## Permissions Explanation

The extension requests the following permissions:

### Required Permissions

- **`activeTab`**: Access the current Lightspeed Retail tab to inject productivity features
- **`tabs`**: Track workorder history and manage page titles
- **`storage`**: Save your preferences, PIN (optional), and workorder history locally
- **`host_permissions` (us.merchantos.com)**: Only works on Lightspeed Retail pages

### Why These Permissions Are Needed

- **Auto-Save**: Requires access to modify workorder forms
- **Billing Tracker**: Needs to read labor costs and inject timer UI
- **PIN Unlock**: Requires detecting and auto-filling PIN modals
- **History Tracking**: Uses URL monitoring to record visited workorders

## Children's Privacy

This extension is designed for business/professional use and is not directed at children under 13. We do not knowingly collect information from children.

## Changes to Privacy Policy

We may update this privacy policy as the extension evolves. Updates will be reflected in:
- The extension's help page
- This document (with updated "Last Updated" date)
- Chrome Web Store listing

## Open Source

This extension's code can be reviewed for transparency. All functionality is visible and auditable.

## Contact

For privacy concerns or questions about data handling, please contact the extension developer or your organization's system administrator.

## Your Rights

You have the right to:
- Access all data stored by the extension (via Chrome DevTools)
- Delete your data at any time
- Disable specific features that store data
- Uninstall the extension completely

## Consent

By installing and using Lightspeed Tools, you consent to this privacy policy. If you do not agree, please do not install or use the extension.

---

**Summary:** This extension stores data **only on your device**. No servers. No tracking. No third parties. Your data stays with you.
