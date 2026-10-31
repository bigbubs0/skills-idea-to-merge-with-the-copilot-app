# Mona's Bookmark Manager - Roadmap

Next steps for finding, organizing, and protecting the links saved in this browser.

| Area | Item | Type | Priority |
| --- | --- | --- | --- |
| Features | Search and filter bookmarks | 🚀 | High |
| Features | Import and export bookmarks | 🚀 | High |
| Features | Edit a saved bookmark | 🚀 | Medium |
| Features | Tags or folders | 🚀 | Medium |
| Bugs and risks | Browser data clearing removes bookmarks | 🐞 | High |
| Bugs and risks | Simultaneous writes from multiple tabs | 🐞 | Medium |
| Bugs and risks | Storage limits and private browsing | 🐞 | Medium |

## 🚀 Planned features

- 🔎 Search and filter bookmarks - priority: high; match URL or slug without changing saved data.
- 📦 Import and export bookmarks - priority: high; download a JSON backup and validate imports before merging them.
- ✏️ Edit a saved bookmark - priority: medium; update its URL while preserving its existing slug.
- 🗂️ Tags or folders - priority: medium; group links locally without introducing accounts or a backend.

## 🐞 Known bugs & risks

- 💾 Browser data clearing removes bookmarks - priority: high; there is no backup or recovery until export is available.
- 🔄 Simultaneous writes from multiple tabs - priority: medium; storage events refresh the list, but concurrent read-modify-write operations can still overwrite each other.
- 📵 Storage limits and private browsing - priority: medium; failed saves are retained only in the current tab and can be lost on reload, as the app warns.

The current release already rejects unsafe URLs, recovers from malformed stored values, prevents duplicate slugs in the saved list, and keeps unsaved additions visible after storage failures. These safeguards remain acceptance criteria for future work.
