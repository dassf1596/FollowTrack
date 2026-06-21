// content_isolated.js (Runs in the ISOLATED world context of instagram.com)

// Helper to render a nice toast overlay inside the Instagram webpage
function showToastBanner(message, isError = false) {
  const bannerId = 'followtrack-toast-banner';
  let banner = document.getElementById(bannerId);
  if (!banner) {
    banner = document.createElement('div');
    banner.id = bannerId;
    banner.style.position = 'fixed';
    banner.style.bottom = '24px';
    banner.style.right = '24px';
    banner.style.zIndex = '999999';
    banner.style.padding = '14px 20px';
    banner.style.borderRadius = '12px';
    banner.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    banner.style.fontSize = '13px';
    banner.style.fontWeight = '600';
    banner.style.color = '#ffffff';
    banner.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)';
    banner.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    banner.style.opacity = '0';
    banner.style.transform = 'translateY(10px)';
    document.body.appendChild(banner);
  }

  banner.style.background = isError 
    ? 'linear-gradient(135deg, #e11d48, #9f1239)' // Rose
    : 'linear-gradient(135deg, #6366f1, #4338ca)'; // Indigo
  banner.style.border = isError ? '1px solid rgba(225, 29, 72, 0.2)' : '1px solid rgba(99, 102, 241, 0.2)';
  banner.innerText = message;
  
  // Animate in
  setTimeout(() => {
    if (banner) {
      banner.style.opacity = '1';
      banner.style.transform = 'translateY(0)';
    }
  }, 100);

  // Fade out after 4.5 seconds
  if (banner.timeoutId) clearTimeout(banner.timeoutId);
  banner.timeoutId = setTimeout(() => {
    if (banner) {
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(10px)';
    }
  }, 4500);
}

// Initialize the floating auto-scroll button
function initAutoScrollButton() {
  const btnId = 'followtrack-autoscroll-btn';
  let btn = document.getElementById(btnId);
  if (btn) return;

  btn = document.createElement('button');
  btn.id = btnId;
  btn.innerText = '⚡ Auto-Scroll to Bottom';
  btn.style.position = 'fixed';
  btn.style.bottom = '85px'; // Aligned above the toast banner
  btn.style.right = '24px';
  btn.style.zIndex = '999999';
  btn.style.padding = '10px 16px';
  btn.style.borderRadius = '20px';
  btn.style.border = '1px solid rgba(99, 102, 241, 0.3)';
  btn.style.background = 'linear-gradient(135deg, #4f46e5, #4338ca)';
  btn.style.color = '#ffffff';
  btn.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  btn.style.fontSize = '12px';
  btn.style.fontWeight = '700';
  btn.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)';
  btn.style.cursor = 'pointer';
  btn.style.transition = 'all 0.2s ease';
  
  btn.onmouseover = () => {
    btn.style.transform = 'scale(1.04)';
    btn.style.boxShadow = '0 12px 28px -4px rgba(0, 0, 0, 0.5), 0 10px 12px -5px rgba(0, 0, 0, 0.5)';
  };
  btn.onmouseout = () => {
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)';
  };

  function getScrollContainer() {
    const dialog = document.querySelector('div[role="dialog"]');
    if (!dialog) return null;
    
    const allDivs = dialog.querySelectorAll('div');
    for (const div of allDivs) {
      const style = window.getComputedStyle(div);
      if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && div.scrollHeight > div.clientHeight) {
        return div;
      }
    }
    return null;
  }

  let scrollInterval = null;
  btn.onclick = () => {
    const container = getScrollContainer();
    if (!container) {
      showToastBanner('Please open the Followers or Following list popup first!', true);
      return;
    }

    if (scrollInterval) {
      clearInterval(scrollInterval);
      scrollInterval = null;
      btn.innerText = '⚡ Auto-Scroll to Bottom';
      btn.style.background = 'linear-gradient(135deg, #4f46e5, #4338ca)';
      return;
    }

    btn.innerText = '⏳ Auto-Scrolling... (Click to Stop)';
    btn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)'; // Amber yellow
    
    let lastScrollHeight = container.scrollHeight;
    let noChangeCount = 0;

    scrollInterval = setInterval(() => {
      // Scroll to the bottom of the container
      container.scrollTop = container.scrollHeight;

      // Monitor height changes to detect if we loaded more items
      if (container.scrollHeight === lastScrollHeight) {
        noChangeCount++;
        // If height didn't change for 12 ticks (6.0 seconds), we reached the absolute bottom
        if (noChangeCount >= 12) {
          clearInterval(scrollInterval);
          scrollInterval = null;
          btn.innerText = '✅ Sync Completed!';
          btn.style.background = 'linear-gradient(135deg, #10b981, #059669)'; // Emerald
          setTimeout(() => {
            btn.innerText = '⚡ Auto-Scroll to Bottom';
            btn.style.background = 'linear-gradient(135deg, #4f46e5, #4338ca)';
          }, 3000);
        }
      } else {
        noChangeCount = 0;
        lastScrollHeight = container.scrollHeight;
      }
    }, 500);
  };

  document.body.appendChild(btn);
}

// Listen for messages from the MAIN world content script
window.addEventListener('message', (event) => {
  if (event.source !== window || event.data?.type !== 'FOLLOWTRACK_INTERCEPTED') return;

  const { url, endpointType, payload } = event.data;
  console.log('[FollowTrack Isolated] Forwarding captured data to background service worker...');

  // Send message to background service worker
  chrome.runtime.sendMessage({
    action: 'SYNC_SNAPSHOT',
    url,
    type: endpointType,
    payload
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('[FollowTrack Isolated] Background script communication error:', chrome.runtime.lastError);
      showToastBanner('FollowTrack Sync Error: Service worker inactive.', true);
      return;
    }

    if (response && response.success) {
      showToastBanner(`FollowTrack: Synced ${response.followerCount} ${endpointType} usernames to "${response.snapshotName}"`);
    } else {
      showToastBanner(`FollowTrack Sync Failed: ${response?.error || 'Unknown error'}`, true);
    }
  });
});

// Initialize when DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAutoScrollButton);
} else {
  initAutoScrollButton();
}
