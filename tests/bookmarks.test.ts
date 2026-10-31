import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeUrl, loadBookmarks, nextSlug, formatBookmark } from '../src/lib/bookmarks.ts';

test('bare and HTTPS URLs normalize to the same saved value', () => {
  assert.equal(normalizeUrl(' example.com/path '), 'https://example.com/path');
  assert.equal(normalizeUrl('https://example.com/path'), 'https://example.com/path');
  assert.equal(normalizeUrl('http://example.com'), 'http://example.com/');
  assert.equal(normalizeUrl('localhost:4321'), 'https://localhost:4321/');
});

test('invalid and unsafe URLs cannot become bookmark links', () => {
  for (const input of ['', '   ', 'not a url', 'javascript:alert(1)', 'data:text/html,hi', 'ftp://example.com', 'https://user:secret@example.com']) {
    assert.equal(normalizeUrl(input), null, input);
  }
});

test('empty, corrupted, legacy and non-array storage recover without throwing', () => {
  for (const raw of [null, '', '{broken', '{}', 'null', '42', '"text"', '["https://example.com"]']) {
    assert.deepEqual(loadBookmarks(raw), [], String(raw));
  }
});

test('storage keeps only safe valid bookmarks and drops duplicate slugs', () => {
  assert.deepEqual(loadBookmarks(JSON.stringify([
    {url:'example.com',slug:'mona-1'},
    {url:'https://github.com',slug:'mona-1'},
    {url:'javascript:alert(1)',slug:'mona-2'},
    {url:'https://github.com',slug:'<script>'},
    {url:'https://github.com',slug:'mona-3',extra:true},
    null, {url:25,slug:'mona-4'}, {url:'https://example.org'}
  ])), [{url:'https://example.com/',slug:'mona-1'}, {url:'https://github.com/',slug:'mona-3'}]);
});

test('generated slugs use base62 and do not collide with saved slugs', () => {
  assert.equal(nextSlug([]), 'mona-1');
  assert.equal(nextSlug([{url:'https://example.com/',slug:'mona-1'}]), 'mona-2');
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const saved = [...alphabet.slice(1)].map(c => ({url:'https://example.com/',slug:`mona-${c}`}));
  assert.equal(nextSlug(saved), 'mona-10');
});

test('bookmark display uses the exact URL :: slug separator', () => {
  assert.equal(formatBookmark({url:'https://example.com/',slug:'mona-7fk2'}), 'https://example.com/ :: mona-7fk2');
});
