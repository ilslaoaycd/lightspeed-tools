// Load settings and history when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  // Load feature toggles
  const billingToggle = document.getElementById('toggle-billing');
  const autosaveToggle = document.getElementById('toggle-autosave');
  const autoPinToggle = document.getElementById('toggle-auto-pin');
  const pinInput = document.getElementById('pin-input');
  const savePinBtn = document.getElementById('save-pin');
  const pinStatus = document.getElementById('pin-status');

  chrome.storage.sync.get(['billingEnabled', 'autosaveEnabled', 'autoPinEnabled', 'userPin'], (result) => {
    billingToggle.checked = result.billingEnabled !== false;
    autosaveToggle.checked = result.autosaveEnabled !== false;
    autoPinToggle.checked = result.autoPinEnabled !== false;

    if (result.userPin) {
      pinStatus.textContent = 'PIN saved ✓';
      pinStatus.style.color = '#28a745';
    }
  });

  // Save settings when toggles change
  billingToggle.addEventListener('change', () => {
    chrome.storage.sync.set({ billingEnabled: billingToggle.checked });
    // Notify content script of change
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'TOGGLE_BILLING',
          enabled: billingToggle.checked
        });
      }
    });
  });

  autosaveToggle.addEventListener('change', () => {
    chrome.storage.sync.set({ autosaveEnabled: autosaveToggle.checked });
    // Notify content script of change
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'TOGGLE_AUTOSAVE',
          enabled: autosaveToggle.checked
        });
      }
    });
  });

  autoPinToggle.addEventListener('change', () => {
    chrome.storage.sync.set({ autoPinEnabled: autoPinToggle.checked });
    // Show/hide PIN configuration section
    const pinConfigSection = document.getElementById('pin-config-section');
    pinConfigSection.style.display = autoPinToggle.checked ? 'block' : 'none';
  });

  // Set initial visibility of PIN config section
  const pinConfigSection = document.getElementById('pin-config-section');
  chrome.storage.sync.get(['autoPinEnabled'], (result) => {
    pinConfigSection.style.display = result.autoPinEnabled !== false ? 'block' : 'none';
  });

  // Save PIN button
  savePinBtn.addEventListener('click', () => {
    const pin = pinInput.value.trim();
    if (pin) {
      chrome.storage.sync.set({ userPin: pin }, () => {
        pinStatus.textContent = 'PIN saved ✓';
        pinStatus.style.color = '#28a745';
        pinInput.value = '';
        setTimeout(() => {
          pinStatus.textContent = '';
        }, 3000);
      });
    } else {
      pinStatus.textContent = 'Please enter a PIN';
      pinStatus.style.color = '#dc3545';
    }
  });

  // Allow Enter key to save PIN
  pinInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      savePinBtn.click();
    }
  });

  // Load and display workorder history
  loadHistory();

  // Clear history button
  document.getElementById('clear-history').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all workorder history?')) {
      chrome.storage.local.set({ workorderHistory: [] }, () => {
        loadHistory();
      });
    }
  });

  // Help link
  document.getElementById('help-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({
      url: chrome.runtime.getURL('help.html')
    });
  });
});

function loadHistory() {
  chrome.storage.local.get(['workorderHistory'], (result) => {
    const history = result.workorderHistory || [];
    const container = document.getElementById('history-container');

    if (history.length === 0) {
      container.innerHTML = '<div class="empty-history">No workorders visited yet</div>';
      return;
    }

    // Sort by timestamp (most recent first)
    history.sort((a, b) => b.timestamp - a.timestamp);

    container.innerHTML = history.map(item => {
      const date = new Date(item.timestamp);
      const timeAgo = getTimeAgo(date);

      return `
        <div class="history-item" data-id="${item.id}">
          <span class="history-id">WO #${item.id}</span>
          <span class="history-timestamp">${timeAgo}</span>
        </div>
      `;
    }).join('');

    // Add click handlers to open workorders
    container.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        const url = `https://us.merchantos.com/?name=workbench.views.beta_workorder&form_name=view&id=${id}`;
        chrome.tabs.create({ url });
      });
    });
  });
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + 'y ago';

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + 'mo ago';

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + 'd ago';

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + 'h ago';

  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + 'm ago';

  return 'just now';
}
