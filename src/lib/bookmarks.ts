export type Bookmark = { url: string; slug: string };

export function normalizeUrl(input: string): string | null {
  const value = input.trim();
  if (!value || /\s/.test(value)) return null;
  // A host:port is a bare URL, not an arbitrary URI scheme.
  const hostPort = /^[\w.-]+:\d+(?:[/?#]|$)/.test(value);
  if (/^[a-z][a-z\d+.-]*:/i.test(value) && !/^https?:\/\//i.test(value) && !hostPort) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    if (!['https:', 'http:'].includes(url.protocol) || !url.hostname || url.username || url.password) return null;
    return url.href;
  } catch { return null; }
}

export function loadBookmarks(raw: string | null): Bookmark[] {
  try {
    const data: unknown = JSON.parse(raw ?? '[]');
    if (!Array.isArray(data)) return [];
    const seen = new Set<string>();
    const bookmarks: Bookmark[] = [];
    for (const item of data) {
      if (!item || typeof item !== 'object' || typeof item.url !== 'string' || typeof item.slug !== 'string') continue;
      const url = normalizeUrl(item.url);
      if (!url || !/^mona-[0-9a-zA-Z]+$/.test(item.slug) || seen.has(item.slug)) continue;
      seen.add(item.slug);
      bookmarks.push({ url, slug: item.slug });
    }
    return bookmarks;
  } catch { return []; }
}

export function nextSlug(bookmarks: Bookmark[]): string {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const used = new Set(bookmarks.map(bookmark => bookmark.slug));
  // There are at most bookmarks.length occupied slots, so one of the next
  // bookmarks.length + 1 candidates must be free, even for legacy slugs.
  for (let counter = 1; counter <= bookmarks.length + 1; counter++) {
    let number = counter;
    let encoded = '';
    do {
      encoded = alphabet[number % 62] + encoded;
      number = Math.floor(number / 62);
    } while (number > 0);
    const slug = `mona-${encoded}`;
    if (!used.has(slug)) return slug;
  }
  throw new Error('Could not allocate a bookmark slug.');
}

export function formatBookmark(bookmark: Bookmark): string {
  return `${bookmark.url} :: ${bookmark.slug}`;
}
