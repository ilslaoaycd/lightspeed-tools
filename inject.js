// This script runs in the page context (not isolated like content scripts)
// It has access to window.merchantos

(function() {
  let isAutoSave = false;
  let originalReturn = null;
  const saveQueue = new Map(); // Track last save time per workorder line
  const RATE_LIMIT_MS = 2000; // 2 seconds

  function setupAutoSave() {
    if (!window.merchantos?.edit_workorder?.ajaxEditWorkorder_Return ||
        !window.merchantos?.edit_workorder?.saveInlineEditLine) {
      setTimeout(setupAutoSave, 100);
      return;
    }

    // Store original and override
    originalReturn = window.merchantos.edit_workorder.ajaxEditWorkorder_Return;

    window.merchantos.edit_workorder.ajaxEditWorkorder_Return = function(result) {
      if (isAutoSave) {
        isAutoSave = false;
        window.dispatchEvent(new CustomEvent('lightspeed-autosave-complete'));
        return;
      } else {
        return originalReturn.call(this, result);
      }
    };
  }

  // Listen for auto-save trigger from content script
  window.addEventListener('lightspeed-trigger-autosave', (event) => {
    const { type, woId, lineId } = event.detail;
    const lineKey = `${woId}_${lineId}`;
    const now = Date.now();
    const lastSave = saveQueue.get(lineKey) || 0;

    // Rate limit: only save if 5 seconds have passed since last save for this specific line
    if (now - lastSave < RATE_LIMIT_MS) {
      window.dispatchEvent(new CustomEvent('lightspeed-autosave-rate-limited', {
        detail: { timeRemaining: Math.ceil((RATE_LIMIT_MS - (now - lastSave)) / 1000) }
      }));
      return;
    }

    saveQueue.set(lineKey, now);
    isAutoSave = true;

    try {
      window.merchantos.edit_workorder.saveInlineEditLine.call(
        window.merchantos.edit_workorder,
        type,
        woId,
        lineId
      );
    } catch (error) {
      isAutoSave = false;
    }
  });

  setupAutoSave();

  // Prevent auto-lock by disabling the idle timeout mechanism
  function preventAutoLock() {
    console.log('[Lightspeed Tools] Auto-lock prevention activated');

    // Set no_page_timeouts to true and keep it that way
    window.no_page_timeouts = true;

    // Intercept any attempts to set it back to false
    setInterval(() => {
      if (window.no_page_timeouts !== true) {
        window.no_page_timeouts = true;
        console.log('[Lightspeed Tools] Re-enabled no_page_timeouts');
      }
    }, 50);

    // Clear and prevent idle timers
    setInterval(() => {
      if (window.idle_timer) {
        clearTimeout(window.idle_timer);
        window.idle_timer = null;
      }
    }, 100);

    // Override resetIdleTimer to do nothing (if it exists)
    const tryOverrideResetTimer = () => {
      if (window.resetIdleTimer && typeof window.resetIdleTimer === 'function') {
        window.resetIdleTimer = function() {
          // Do nothing - prevents timer from being set
          return;
        };
        console.log('[Lightspeed Tools] Overrode resetIdleTimer');
        return true;
      }
      return false;
    };

    // Store original idleTimeout and override it (if it exists)
    const tryOverrideIdleTimeout = () => {
      if (window.idleTimeout && typeof window.idleTimeout === 'function') {
        window.idleTimeout = function() {
          console.log('[Lightspeed Tools] Blocked idleTimeout call');
          // Do nothing - prevents timeout check from showing PIN modal
          return;
        };
        console.log('[Lightspeed Tools] Overrode idleTimeout');
        return true;
      }
      return false;
    };

    // Try immediately and keep trying
    tryOverrideResetTimer();
    tryOverrideIdleTimeout();

    const overrideInterval = setInterval(() => {
      const reset = tryOverrideResetTimer();
      const idle = tryOverrideIdleTimeout();
      if (reset && idle) {
        clearInterval(overrideInterval);
      }
    }, 100);

    // Remove PIN modal if it appears (for operations that require verification)
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1 && node.matches &&
              node.matches('.modal-wrapper[data-test="pin-lock-modal"]')) {
            const form = node.querySelector('#verify_access_pin_form');
            const pinInput = node.querySelector('input[name="access_pin"]');

            // Handle all PIN modals except manual locks
            if (form && form.dataset.context !== 'manual_lock') {
              console.log('[Lightspeed Tools] PIN verification requested - checking for stored PIN');

              // Get stored PIN from Chrome storage
              chrome.storage.sync.get(['autoPinEnabled', 'userPin'], (result) => {
                if (result.autoPinEnabled !== false && result.userPin && pinInput) {
                  console.log('[Lightspeed Tools] Auto-filling PIN and submitting');

                  // Fill the PIN
                  pinInput.value = result.userPin;

                  // Submit the form
                  setTimeout(() => {
                    if (form.requestSubmit) {
                      form.requestSubmit();
                    } else {
                      form.submit();
                    }
                  }, 100);
                } else {
                  console.log('[Lightspeed Tools] No PIN stored or auto-unlock disabled - leaving modal');
                }
              });
            }
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: false
    });
  }

  // Start prevention immediately - no delay
  preventAutoLock();
})();
