// background.js (Runs in the extension's service worker context)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SYNC_SNAPSHOT') {
    handleSync(request)
      .then((res) => sendResponse(res))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // Keeps the message channel open for asynchronous reply
  }
});

async function handleSync(request) {
  const { url, type, payload } = request;

  // 1. Fetch the Supabase auth cookie from localhost
  const cookies = await new Promise((resolve) => {
    chrome.cookies.getAll({ domain: 'localhost' }, (cookiesList) => {
      resolve(cookiesList || []);
    });
  });

  // Find all cookies matching Supabase SSR format: sb-<project-ref>-auth-token or sb-<project-ref>-auth-token.x
  const supabaseCookies = cookies.filter(c => c.name.startsWith('sb-') && c.name.includes('-auth-token'));
  
  if (supabaseCookies.length === 0) {
    throw new Error('Unauthorized. Please log in to your FollowTrack dashboard at localhost:3000.');
  }

  // Group cookies by their base name (reconstructing chunked cookies if necessary)
  const groups = {};
  for (const cookie of supabaseCookies) {
    const parts = cookie.name.split('.');
    const isChunk = parts.length > 1 && !isNaN(parts[parts.length - 1]);
    const baseName = isChunk ? parts.slice(0, -1).join('.') : cookie.name;
    const chunkIndex = isChunk ? parseInt(parts[parts.length - 1], 10) : -1;

    if (!groups[baseName]) {
      groups[baseName] = [];
    }
    groups[baseName].push({ chunkIndex, value: cookie.value });
  }

  // Retrieve the first session group found
  const baseNames = Object.keys(groups);
  if (baseNames.length === 0) {
    throw new Error('No active session cookie found. Please log in.');
  }

  const selectedBaseName = baseNames[0];
  const chunks = groups[selectedBaseName];

  // Sort chunks by index order (0, 1, 2...)
  chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);

  // Combine full serialized session string
  const fullSerializedSession = chunks.map(c => c.value).join('');

  // Parse access token (JWT) from reconstructed session value
  let token = '';
  try {
    let sessionStr = fullSerializedSession;
    
    // Check if the cookie value is base64-encoded by Supabase SSR
    if (sessionStr.startsWith('base64-')) {
      const base64Data = sessionStr.substring(7);
      sessionStr = atob(base64Data); // Decode base64 to raw JSON string
    }

    const decoded = decodeURIComponent(sessionStr);
    const parsed = JSON.parse(decoded);
    
    if (Array.isArray(parsed) && parsed.length > 0) {
      token = parsed[0]; // JWT token is typically the first element in Supabase SSR array
    } else if (parsed && parsed.access_token) {
      token = parsed.access_token;
    } else {
      token = decoded;
    }
  } catch (e) {
    console.error('[FollowTrack Background] Error parsing session token:', e);
    token = fullSerializedSession;
  }

  if (!token) {
    throw new Error('Session invalid. Please re-login to your dashboard.');
  }

  // 2. Send request to localhost:3000 from service worker context (exempt from Mixed Content block)
  console.log('[FollowTrack Background] Forwarding intercepted data with token...');
  const res = await fetch('http://localhost:3000/api/auto-snapshot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      url,
      type,
      payload
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status} error from server.`);
  }

  return await res.json();
}
