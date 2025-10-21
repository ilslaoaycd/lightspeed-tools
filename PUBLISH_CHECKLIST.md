# Chrome Web Store Publishing Checklist

## ✅ Completed

- [x] Icons (16x16, 48x48, 128x128)
- [x] Manifest description updated
- [x] Privacy policy created
- [x] Store description written
- [x] Help documentation
- [x] README.md
- [x] All features working

## 📋 Before Publishing

### 1. Host Privacy Policy
- [ ] Upload `PRIVACY.md` to a public URL (GitHub, website, Google Docs, etc.)
- [ ] Update privacy policy link in:
  - [ ] `STORE_DESCRIPTION.md`
  - [ ] Store listing

### 2. Create Screenshots
You need **at least 1, up to 5** screenshots (1280x800 or 640x400):

Suggested screenshots:
- [ ] Screenshot 1: Billing tracker in action on a workorder
- [ ] Screenshot 2: Extension popup showing settings
- [ ] Screenshot 3: Auto-save indicator and Close button
- [ ] Screenshot 4: Workorder history panel
- [ ] Screenshot 5: Help page overview

**How to capture:**
1. Open Lightspeed workorder
2. Show extension features
3. Use browser's screenshot tool or Snipping Tool
4. Resize to 1280x800 or 640x400

### 3. Optional Promotional Images
- [ ] Small tile: 440x280
- [ ] Large tile: 920x680
- [ ] Marquee: 1400x560

### 4. Final Testing
- [ ] Test on clean Chrome profile
- [ ] Verify all features work
- [ ] Check console for errors
- [ ] Test with extension disabled/enabled
- [ ] Verify icons display correctly

### 5. Chrome Web Store Developer Account
- [ ] Create developer account ($5 one-time fee)
  - Go to: https://chrome.google.com/webstore/devconsole
  - Pay registration fee
  - Verify email

### 6. Package Extension
- [ ] Create ZIP file of extension folder
- [ ] Include all files EXCEPT:
  - [ ] Remove `STORE_DESCRIPTION.md`
  - [ ] Remove `PUBLISH_CHECKLIST.md`
  - [ ] Remove `README.md` (optional, can keep)
  - [ ] Remove `.git` folder if present

**Files to include in ZIP:**
- manifest.json
- All .js files (script.js, inject.js, popup.js, background.js)
- All .html files (popup.html, help.html)
- All .css files (styles.css)
- All icon files (icon16.png, icon48.png, icon128.png)

### 7. Store Listing Details

**Category:** Productivity

**Language:** English

**Short description (132 chars max):**
```
Productivity toolkit for Lightspeed Retail: auto-save, billing tracker, PIN unlock, and workflow enhancements for service pros.
```

**Detailed description:**
Use content from `STORE_DESCRIPTION.md`

**Privacy policy URL:**
`[Your hosted PRIVACY.md URL]`

**Homepage URL (optional):**
`[GitHub repo or website]`

**Support URL/Email:**
`[Your contact info]`

### 8. Upload to Chrome Web Store

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click "New Item"
3. Upload your ZIP file
4. Fill in store listing:
   - Name: Lightspeed Tools
   - Description: From STORE_DESCRIPTION.md
   - Category: Productivity
   - Language: English
   - Icon: Will be pulled from manifest
   - Screenshots: Upload your screenshots
   - Privacy policy URL: Your hosted URL
5. Fill in "Permission justifications" (from STORE_DESCRIPTION.md)
6. Set pricing (Free)
7. Select regions (Worldwide or specific countries)
8. Save draft

### 9. Submit for Review

- [ ] Review all information
- [ ] Click "Submit for Review"
- [ ] Wait for Google review (typically 1-3 days)
- [ ] Check email for approval/rejection

### 10. After Approval

- [ ] Test installed version from Web Store
- [ ] Share link with users
- [ ] Monitor reviews/ratings
- [ ] Plan for future updates

## 🚨 Common Rejection Reasons

Watch out for:
- [ ] Missing or invalid privacy policy
- [ ] Unclear permission justifications
- [ ] Misleading description
- [ ] Poor quality screenshots
- [ ] Single-purpose policy violations
- [ ] Trademark issues (ensure "Lightspeed" is okay)

## 📝 Notes

**Privacy Policy Hosting Options:**
- GitHub Pages (free, recommended)
- Google Docs (set to "Anyone with link can view")
- Your website
- GitHub Gist

**Estimated Timeline:**
- Preparation: 1-2 hours
- Review: 1-3 days
- Total: 2-4 days

**Cost:**
- Developer account: $5 one-time
- Extension: Free to users
- Hosting privacy policy: Free (GitHub/Google Docs)

## ✨ Current Status

**Ready for:** Screenshot creation and privacy policy hosting

**Blockers:** None - all code complete!

**Next step:** Create screenshots showing extension features
