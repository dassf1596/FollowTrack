/**
 * Parses and sanitizes a raw string input containing usernames.
 * Rules:
 * - Normalizes to lowercase
 * - Trims whitespace
 * - Strips leading '@' if present
 * - Filters by Instagram username constraints (alphanumeric, periods, underscores, 1-30 chars)
 * - Eliminates duplicate names
 */
export function parseUsernames(rawText: string): string[] {
  if (!rawText) return []

  const uniqueUsernames = new Set<string>()
  const instagramUsernameRegex = /^[a-zA-Z0-9._]{1,30}$/

  // Check if the input looks like JSON or DevTools copy-paste containing "username" keys
  if (rawText.toLowerCase().includes('username')) {
    // Regex to match "username": "value", username: "value", or 'username': 'value'
    const jsonUsernameRegex = /["']?username["']?\s*:\s*["']([a-zA-Z0-9._]{1,30})["']/gi
    let match
    while ((match = jsonUsernameRegex.exec(rawText)) !== null) {
      const clean = match[1].trim().toLowerCase()
      if (clean && instagramUsernameRegex.test(clean)) {
        uniqueUsernames.add(clean)
      }
    }
    
    // If we found any usernames via the JSON/preview pattern, return them!
    if (uniqueUsernames.size > 0) {
      return Array.from(uniqueUsernames)
    }
  }

  // Split by newlines, commas, semicolons, or spaces (fallback/original method)
  const tokens = rawText.split(/[\n,;\s]+/)

  for (const token of tokens) {
    let clean = token.trim().toLowerCase()
    
    // Strip leading @ character if users pasted it
    if (clean.startsWith('@')) {
      clean = clean.slice(1)
    }

    if (clean && instagramUsernameRegex.test(clean)) {
      uniqueUsernames.add(clean)
    }
  }

  return Array.from(uniqueUsernames)
}
