// Lightspeed Tools - Chrome Extension for us.merchantos.com

// Inject stylesheet
(function() {
  const styleURL = chrome.runtime.getURL('styles.css');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = styleURL;
  link.id = 'lightspeed-tools-styles';
  document.head.appendChild(link);
})();

// Sync textarea heights and auto-fit to content
(function() {
  function syncTextareaHeights() {
    const internalNote = document.getElementById('internal_note');
    const noteTextArea = document.getElementById('noteTextArea');

    if (!internalNote || !noteTextArea) return;

    let isUpdating = false;
    const MAX_HEIGHT = 500;

    function autoResize(textarea) {
      if (isUpdating) return;
      isUpdating = true;

      // Reset height to get the real scroll height
      internalNote.style.height = '0px';
      noteTextArea.style.height = '0px';

      // Get scroll height and add a small buffer to account for borders/padding
      const internalHeight = internalNote.scrollHeight + 2;
      const noteHeight = noteTextArea.scrollHeight + 2;
      const maxScroll = Math.max(internalHeight, noteHeight);
      const newHeight = Math.min(maxScroll, MAX_HEIGHT);

      // Set both textareas to the same height
      internalNote.style.height = newHeight + 'px';
      noteTextArea.style.height = newHeight + 'px';

      console.log('Auto-resized to:', newHeight, 'px (scroll heights:', internalHeight, noteHeight + ')');

      isUpdating = false;
    }

    // Listen to input events for auto-resize
    internalNote.addEventListener('input', () => autoResize(internalNote));
    noteTextArea.addEventListener('input', () => autoResize(noteTextArea));

    // Use ResizeObserver for manual resize handle
    const observer = new ResizeObserver((entries) => {
      if (isUpdating) return;

      for (const entry of entries) {
        const target = entry.target;
        const newHeight = Math.min(target.offsetHeight, MAX_HEIGHT);

        isUpdating = true;

        internalNote.style.height = newHeight + 'px';
        noteTextArea.style.height = newHeight + 'px';

        isUpdating = false;
      }
    });

    observer.observe(internalNote);
    observer.observe(noteTextArea);

    // Initial resize to fit content - wait for content to be rendered
    setTimeout(() => autoResize(internalNote), 0);
    setTimeout(() => autoResize(internalNote), 100);
    setTimeout(() => autoResize(internalNote), 500);
    setTimeout(() => autoResize(internalNote), 1000);

    console.log('✅ Synced textarea heights with auto-fit');
  }

  function init() {
    const internalNote = document.getElementById('internal_note');
    const noteTextArea = document.getElementById('noteTextArea');

    if (internalNote && noteTextArea) {
      syncTextareaHeights();
    } else {
      setTimeout(init, 500);
    }
  }

  init();
})();

// Inject billing div into sidebar
(function() {
  function injectBillingDiv() {
    const targetDiv = document.querySelector('body > div.cr-sidebar.no_print > aside > div > div.css-1knbux5');

    if (!targetDiv) {
      setTimeout(injectBillingDiv, 500);
      return;
    }

    // Check if already injected
    if (document.getElementById('billing-info')) return;

    const billingDiv = document.createElement('div');
    billingDiv.id = 'billing-info';
    billingDiv.innerHTML = '<span class="billing-label">Currently Billing: </span>';

    targetDiv.parentNode.insertBefore(billingDiv, targetDiv.nextSibling);

    console.log('✅ Injected billing div');
  }

  injectBillingDiv();
})();

// Calculate and inject allotted time based on labor cost
(function() {
  const DEFAULT_BILLING_RATE = 60;
  let timerInterval = null;

  function getWorkorderId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }

  function getTimerKey() {
    const woId = getWorkorderId();
    return `lightspeed-timer-${woId}`;
  }

  function getTimerState() {
    const woId = getWorkorderId();
    if (!woId) return null;
    const data = localStorage.getItem(getTimerKey());
    return data ? JSON.parse(data) : null;
  }

  function saveTimerState(state) {
    const woId = getWorkorderId();
    if (!woId) return;
    localStorage.setItem(getTimerKey(), JSON.stringify(state));
  }

  function getBillingRate() {
    return parseFloat(localStorage.getItem('lightspeed-billing-rate')) || DEFAULT_BILLING_RATE;
  }

  function setBillingRate(rate) {
    localStorage.setItem('lightspeed-billing-rate', rate);
  }

  function getBillingVisibility() {
    return localStorage.getItem('lightspeed-billing-visible') !== 'false';
  }

  function setBillingVisibility(visible) {
    localStorage.setItem('lightspeed-billing-visible', visible);
  }

  function formatTime(hours) {
    const wholeHours = Math.floor(Math.abs(hours));
    const minutes = Math.round((Math.abs(hours) - wholeHours) * 60);

    const sign = hours < 0 ? '-' : '';

    if (wholeHours === 0) {
      return `${sign}${minutes} min`;
    } else if (minutes === 0) {
      return `${sign}${wholeHours} hr`;
    } else {
      return `${sign}${wholeHours} hr ${minutes} min`;
    }
  }

  function updateAllottedTime() {
    const laborValueElement = document.querySelector('#woTotalsRowLaborValue');
    const totalsContainer = document.querySelector('#workorder_status_view_total');

    if (!laborValueElement || !totalsContainer) {
      setTimeout(updateAllottedTime, 500);
      return;
    }

    // Extract and sanitize labor cost
    const laborText = laborValueElement.textContent.trim();
    const laborValue = parseFloat(laborText.replace(/[$,]/g, ''));

    if (isNaN(laborValue)) {
      console.warn('Could not parse labor value:', laborText);
      return;
    }

    // Calculate allotted time
    const billingRate = getBillingRate();
    const hours = laborValue / billingRate;
    const timeFormatted = formatTime(hours);

    // Check if allotted time element already exists
    let allottedTimeElement = document.getElementById('allotted-time');
    if (!allottedTimeElement) {
      allottedTimeElement = document.createElement('div');
      allottedTimeElement.id = 'allotted-time';
      totalsContainer.appendChild(allottedTimeElement);

      // Set up MutationObserver to watch for labor value changes
      const observer = new MutationObserver(() => {
        updateAllottedTime();
      });

      observer.observe(laborValueElement, {
        childList: true,
        characterData: true,
        subtree: true
      });

    }

    // Get or initialize timer state
    let timerState = getTimerState();
    if (!timerState) {
      timerState = {
        totalSeconds: hours * 3600,
        remainingSeconds: hours * 3600,
        isRunning: false,
        lastUpdate: Date.now()
      };
      saveTimerState(timerState);
    } else if (timerState.isRunning) {
      // Update remaining time based on elapsed time
      const elapsed = (Date.now() - timerState.lastUpdate) / 1000;
      timerState.remainingSeconds -= elapsed;
      timerState.lastUpdate = Date.now();
      saveTimerState(timerState);
    } else {
      // Update total time if billing rate changed
      timerState.totalSeconds = hours * 3600;
      // Recalculate remaining time proportionally
      const elapsedSeconds = (hours * 3600) - timerState.remainingSeconds;
      timerState.remainingSeconds = (hours * 3600) - elapsedSeconds;
      saveTimerState(timerState);
    }

    const remainingHours = timerState.remainingSeconds / 3600;
    const remainingFormatted = formatTime(remainingHours);

    // Calculate current billing rate (labor cost / actual time spent)
    const elapsedSeconds = Math.max(0, timerState.totalSeconds - timerState.remainingSeconds);
    const elapsedHours = elapsedSeconds / 3600;
    const currentBilling = elapsedHours > 0 ? laborValue / elapsedHours : billingRate;

    // Only show billing rate if at least half the time has elapsed
    const showBillingRate = elapsedSeconds >= (timerState.totalSeconds / 2);

    const isVisible = getBillingVisibility();

    allottedTimeElement.innerHTML = `
      <button id="billing-toggle" class="billing-toggle-btn">${isVisible ? 'Hide Billing' : 'Show Billing'}</button>
      <div class="billing-content" style="display: ${isVisible ? 'block' : 'none'}">
        <div>
          <strong>Allotted Time:</strong> <span class="allotted-time-value">${timeFormatted}</span>
        </div>
        <div class="allotted-time-math">($${laborValue.toFixed(2)} / $${billingRate.toFixed(0)}/hr)</div>
        <div class="remaining-time-container">
          <strong>Remaining Time:</strong> <span class="remaining-time-value">${remainingFormatted}</span>
          ${showBillingRate ? `<span class="current-billing">($${Math.round(currentBilling)}/hr)</span>` : ''}
        </div>
        <div class="timer-buttons">
          <button id="timer-toggle" class="timer-toggle-btn ${timerState.isRunning ? 'pause' : 'start'}">${timerState.isRunning ? 'Pause' : 'Start'}</button>
          <button id="timer-done" class="timer-done-btn" ${!timerState.isRunning && timerState.totalSeconds === timerState.remainingSeconds ? 'disabled' : ''}>Done</button>
          <div class="rate-menu-container">
            <button id="rate-menu-btn" class="rate-menu-btn">⚙</button>
            <div id="rate-menu" class="rate-menu" style="display: none;">
              <button id="customize-billing-rate" class="rate-menu-item">Customize Rate</button>
              <button id="reset-timer" class="rate-menu-item">Reset</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Clear existing interval
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    // Add event listener to hide/show toggle
    const billingToggleBtn = document.getElementById('billing-toggle');
    billingToggleBtn.addEventListener('click', () => {
      const currentVisibility = getBillingVisibility();
      setBillingVisibility(!currentVisibility);
      updateAllottedTime();
    });

    // Add event listener to timer toggle button
    const timerToggleBtn = document.getElementById('timer-toggle');
    timerToggleBtn.addEventListener('click', () => {
      let currentState = getTimerState();
      currentState.isRunning = !currentState.isRunning;
      currentState.lastUpdate = Date.now();
      saveTimerState(currentState);
      updateAllottedTime();
    });

    // Start timer if running
    if (timerState.isRunning) {
      timerInterval = setInterval(() => {
        let currentState = getTimerState();
        if (!currentState.isRunning) {
          clearInterval(timerInterval);
          timerInterval = null;
          return;
        }

        const elapsed = (Date.now() - currentState.lastUpdate) / 1000;
        currentState.remainingSeconds = currentState.remainingSeconds - elapsed;
        currentState.lastUpdate = Date.now();
        saveTimerState(currentState);

        // Update display
        const remainingHours = currentState.remainingSeconds / 3600;
        const remainingFormatted = formatTime(remainingHours);
        const remainingTimeValue = document.querySelector('.remaining-time-value');

        // Calculate current billing rate
        const laborValueElement = document.querySelector('#woTotalsRowLaborValue');
        const laborText = laborValueElement ? laborValueElement.textContent.trim() : '0';
        const laborValue = parseFloat(laborText.replace(/[$,]/g, ''));
        const elapsedSeconds = Math.max(0, currentState.totalSeconds - currentState.remainingSeconds);
        const elapsedHours = elapsedSeconds / 3600;
        const currentBilling = elapsedHours > 0 ? laborValue / elapsedHours : getBillingRate();

        // Only show billing rate if at least half the time has elapsed
        const showBillingRate = elapsedSeconds >= (currentState.totalSeconds / 2);
        const currentBillingElement = document.querySelector('.current-billing');

        if (remainingTimeValue) {
          remainingTimeValue.textContent = remainingFormatted;
        }
        if (currentBillingElement && showBillingRate) {
          currentBillingElement.textContent = `($${Math.round(currentBilling)}/hr)`;
        } else if (currentBillingElement && !showBillingRate) {
          currentBillingElement.textContent = '';
        }
      }, 1000);
    }

    // Add event listener to rate menu button
    const rateMenuBtn = document.getElementById('rate-menu-btn');
    const rateMenu = document.getElementById('rate-menu');
    rateMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      rateMenu.style.display = rateMenu.style.display === 'none' ? 'block' : 'none';
    });

    // Close menu when clicking outside
    document.addEventListener('click', () => {
      if (rateMenu) rateMenu.style.display = 'none';
    });

    // Add event listener to customize button
    const customizeBtn = document.getElementById('customize-billing-rate');
    customizeBtn.addEventListener('click', () => {
      rateMenu.style.display = 'none';
      const newRate = prompt(`Enter your billing rate goal ($/hr):`, billingRate);
      if (newRate && !isNaN(parseFloat(newRate))) {
        setBillingRate(parseFloat(newRate));
        updateAllottedTime();
      }
    });

    // Add event listener to reset button
    const resetBtn = document.getElementById('reset-timer');
    resetBtn.addEventListener('click', () => {
      rateMenu.style.display = 'none';
      const laborValueElement = document.querySelector('#woTotalsRowLaborValue');
      const laborText = laborValueElement ? laborValueElement.textContent.trim() : '0';
      const laborValue = parseFloat(laborText.replace(/[$,]/g, ''));
      const hours = laborValue / getBillingRate();

      const newTimerState = {
        totalSeconds: hours * 3600,
        remainingSeconds: hours * 3600,
        isRunning: false,
        lastUpdate: Date.now()
      };
      saveTimerState(newTimerState);
      updateAllottedTime();
    });

    // Add event listener to done button
    const doneBtn = document.getElementById('timer-done');
    doneBtn.addEventListener('click', () => {
      let currentState = getTimerState();
      currentState.isRunning = false;
      saveTimerState(currentState);

      const laborValueElement = document.querySelector('#woTotalsRowLaborValue');
      const laborText = laborValueElement ? laborValueElement.textContent.trim() : '0';
      const laborValue = parseFloat(laborText.replace(/[$,]/g, ''));
      const hours = laborValue / getBillingRate();

      const newTimerState = {
        totalSeconds: hours * 3600,
        remainingSeconds: hours * 3600,
        isRunning: false,
        lastUpdate: Date.now()
      };
      saveTimerState(newTimerState);
      updateAllottedTime();
    });

  }

  updateAllottedTime();
})();

// Auto-save workorder lines - inject script file into page context
(function() {
  // Inject the script file (not inline, to avoid CSP issues)
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('inject.js');
  (document.head || document.documentElement).appendChild(script);

  // Replace Save/Cancel buttons with Close button and auto-save indicator
  function modifyEditUI() {
    const editRows = document.querySelectorAll('tr[id^="line_"][id$="_edit"]');

    editRows.forEach(row => {
      const submitDiv = row.querySelector('.submit');
      if (!submitDiv || submitDiv.dataset.lightspeedModified) return;

      submitDiv.dataset.lightspeedModified = 'true';

      // Extract IDs from the save button
      const saveButton = submitDiv.querySelector('button[onclick*="submitInlineEditLine"]');
      if (!saveButton) return;

      const onclickAttr = saveButton.getAttribute('onclick');
      const match = onclickAttr.match(/submitInlineEditLine\(this,'([^']+)',(\d+),(\d+),\s*'(\d+)'\)/);

      if (!match) return;

      const [, type, woId, lineId, itemId] = match;

      // Hide Cancel button and separators
      const cancelButton = submitDiv.querySelector('button[onclick*="cancelInlineEditLine"]');
      if (cancelButton) cancelButton.style.display = 'none';

      // Hide all separators (|)
      submitDiv.querySelectorAll('span').forEach(span => {
        if (span.textContent.trim() === '|') {
          span.style.display = 'none';
        }
      });

      // Change Save button text to Close (it will still save + close using existing architecture)
      saveButton.textContent = 'Close';

      // Add auto-save indicator
      const indicator = document.createElement('span');
      indicator.className = 'autosave-indicator';
      indicator.textContent = 'Auto Saving with Lightspeed Tools...';

      submitDiv.appendChild(indicator);

      // Set up auto-save on changes
      const fieldset = row.querySelector('fieldset');
      if (!fieldset) return;

      // Trigger auto-save via page context using CustomEvent
      function triggerAutoSave() {
        // Dispatch event to page context
        window.dispatchEvent(new CustomEvent('lightspeed-trigger-autosave', {
          detail: { type, woId, lineId }
        }));
      }

      // Save on every keypress in any input/textarea
      const inputs = fieldset.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('keyup', () => {
          triggerAutoSave();
        });

        // Also save on change (for selects and checkboxes)
        input.addEventListener('change', () => {
          triggerAutoSave();
        });
      });

      // Save on any click within the fieldset
      fieldset.addEventListener('click', (e) => {
        // Don't trigger on submit buttons
        if (!e.target.closest('.submit')) {
          triggerAutoSave();
        }
      });
    });
  }

  // Watch for new edit rows being added
  const observer = new MutationObserver(() => {
    modifyEditUI();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Listen for save completion events from page context
  window.addEventListener('lightspeed-autosave-complete', () => {
    const indicators = document.querySelectorAll('.autosave-indicator');
    indicators.forEach(indicator => {
      indicator.classList.add('saved-flash');
      setTimeout(() => {
        indicator.classList.remove('saved-flash');
      }, 1000);
    });
  });

  // Listen for rate limit events
  window.addEventListener('lightspeed-autosave-rate-limited', (event) => {
    // Silently ignore - rate limiting is working as expected
  });

  // Watch for edit rows and modify UI
  const editRowObserver = new MutationObserver(() => {
    modifyEditUI();
  });

  editRowObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial setup
  setTimeout(modifyEditUI, 1000);
})();

// Track workorder history
(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const workorderId = urlParams.get('id');
  const viewName = urlParams.get('name');

  if (viewName === 'workbench.views.beta_workorder' && workorderId) {
    chrome.storage.local.get(['workorderHistory'], (result) => {
      let history = result.workorderHistory || [];

      // Check if this workorder already exists in history
      const existingIndex = history.findIndex(item => item.id === workorderId);

      if (existingIndex !== -1) {
        // Update timestamp for existing workorder
        history[existingIndex].timestamp = Date.now();
      } else {
        // Add new workorder to history
        history.push({
          id: workorderId,
          timestamp: Date.now()
        });
      }

      // Keep only the last 50 workorders
      if (history.length > 50) {
        history = history.slice(-50);
      }

      chrome.storage.local.set({ workorderHistory: history });
    });
  }
})();

// Update page title with customer name and item name
(function() {
  function updatePageTitle() {
    const customerNameElement = document.querySelector('#view > div > div.main > div > div > div.workorder-customer > hgroup > h2');
    const serialSelectElement = document.getElementById('edit_workorder_serialized_id');

    if (!customerNameElement) {
      setTimeout(updatePageTitle, 500);
      return;
    }

    const customerName = customerNameElement.textContent.trim();
    let itemName = 'New Bike';

    if (serialSelectElement && serialSelectElement.selectedIndex >= 0) {
      const selectedOption = serialSelectElement.options[serialSelectElement.selectedIndex];
      if (selectedOption && selectedOption.text && selectedOption.value !== '0') {
        itemName = selectedOption.text;
      }
    }

    document.title = `${customerName} - ${itemName}`;

    // Watch for changes to the serial select
    if (serialSelectElement) {
      serialSelectElement.addEventListener('change', () => {
        updatePageTitle();
      });
    }
  }

  // Check if we're on a workorder page
  const urlParams = new URLSearchParams(window.location.search);
  const viewName = urlParams.get('name');
  if (viewName === 'workbench.views.beta_workorder') {
    updatePageTitle();
  }
})();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TOGGLE_BILLING') {
    const allottedTimeElement = document.getElementById('allotted-time');
    if (allottedTimeElement) {
      allottedTimeElement.style.display = message.enabled ? 'block' : 'none';
    }
  } else if (message.type === 'TOGGLE_AUTOSAVE') {
    // Auto-save is handled globally, so we can just store the preference
    // The actual implementation would check this setting before triggering saves
    console.log('Auto-save toggled:', message.enabled);
  }
});

// Show tip on PIN modal if auto-unlock is disabled
(function() {
  // Watch for PIN modal to appear and show tip if needed
  function checkForPinModal() {
    const pinModal = document.querySelector('.modal-wrapper.modal-fixed[data-test="pin-lock-modal"]');
    const pinForm = document.getElementById('verify_access_pin_form');
    const loginSection = document.getElementById('login_section');

    if (pinModal && pinForm && loginSection && !document.getElementById('lightspeed-tools-tip')) {
      // Check if auto PIN is enabled
      chrome.storage.sync.get(['autoPinEnabled'], (result) => {
        if (result.autoPinEnabled === false) {
          // Show tip about auto-unlock
          const tipBox = document.createElement('div');
          tipBox.id = 'lightspeed-tools-tip';
          tipBox.style.cssText = 'margin-top: 20px; padding: 15px 15px 0 15px; text-align: center; border-top: 1px solid #e0e0e0;';
          tipBox.innerHTML = `
            <h3 style="margin: 0 0 8px 0; font-size: 0.875rem; color: #333; text-transform: uppercase; font-weight: bold;">⚡ Lightspeed Tools</h3>
            <p style="font-size: 0.75rem; color: #666; margin: 0 0 8px 0; line-height: 1.4;">
              <strong>Tip:</strong> Did you know you can set up auto-unlock to bypass this screen?
            </p>
            <p style="font-size: 0.65rem; color: #999; margin: 0; line-height: 1.3;">
              Click the Lightspeed Tools extension icon to configure.
            </p>
          `;
          pinForm.parentNode.insertBefore(tipBox, pinForm.nextSibling);
        }
      });
    }
  }

  // Use MutationObserver to watch for the modal appearing
  const pinObserver = new MutationObserver(() => {
    checkForPinModal();
  });

  pinObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Also check on page load
  setTimeout(checkForPinModal, 1000);
})();
