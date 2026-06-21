// content_main.js (Runs in the MAIN world context of instagram.com)
(function() {
  if (window.__followtrack_main_injected) return;
  window.__followtrack_main_injected = true;

  console.log('[FollowTrack Helper] Interceptor active in page.');

  // Intercept Fetch API
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const response = await originalFetch(...args);
    const url = args[0] ? (typeof args[0] === 'string' ? args[0] : args[0].url) : '';
    
    if (url.includes('/friendships/') && (url.includes('/following') || url.includes('/followers'))) {
      try {
        const clone = response.clone();
        const data = await clone.json();
        const endpointType = url.includes('/following') ? 'following' : 'followers';
        
        // Post message to the ISOLATED world content script
        window.postMessage({
          type: 'FOLLOWTRACK_INTERCEPTED',
          url,
          endpointType,
          payload: data
        }, '*');
      } catch (e) {
        console.error('[FollowTrack Helper] Fetch interception error:', e);
      }
    }
    return response;
  };

  // Intercept XMLHttpRequest (XHR) API
  const originalXHR = window.XMLHttpRequest.prototype.open;
  window.XMLHttpRequest.prototype.open = function(method, url, ...args) {
    this.addEventListener('load', function() {
      if (typeof url === 'string' && url.includes('/friendships/') && (url.includes('/following') || url.includes('/followers'))) {
        try {
          const data = JSON.parse(this.responseText);
          const endpointType = url.includes('/following') ? 'following' : 'followers';
          
          // Post message to the ISOLATED world content script
          window.postMessage({
            type: 'FOLLOWTRACK_INTERCEPTED',
            url,
            endpointType,
            payload: data
          }, '*');
        } catch (e) {
          console.error('[FollowTrack Helper] XHR interception error:', e);
        }
      }
    });
    return originalXHR.apply(this, [method, url, ...args]);
  };
})();
