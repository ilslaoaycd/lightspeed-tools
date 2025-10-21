// Background script to watch for extension reloads
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Lightspeed Tools extension installed/updated');

  // Open help page on install (not on update)
  if (details.reason === 'install') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('help.html')
    });
  }
});

// Listen for extension updates and notify content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXTENSION_UPDATED') {
    // Notify all tabs to reload CSS
    chrome.tabs.query({ url: 'https://us.merchantos.com/*' }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { type: 'RELOAD_CSS' });
      });
    });
  }
});
