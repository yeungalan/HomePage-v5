# HomePage-v5

## No emojis — use MingCute glyph icons

Never use emoji characters (🔗 ⚠️ 💡 ✈️ 👋 …) anywhere in the site: code, i18n strings or posts. Use MingCute icons via Iconify instead (names: `node_modules/@iconify-json/mingcute/icons.json`). Plain text symbols such as → ↔ ♪ ✕ are fine.

- **React components:** `<Icon icon="mingcute:link-line" />` from `@iconify/react`.
- **Raw HTML strings** (e.g. globe tooltips in `homepage/src/components/World.tsx`): use the `tooltipIcon('mingcute:…')` helper there.
- **Posts** (`homepage/public/posts_md/*.md`): write `<span data-icon="mingcute:link-line"></span>`; `SimpleMarkdown.tsx` renders it as an icon.
- **alert() / Notification text:** icons can't render there, so just leave the emoji out.

Icons used so far: 🔗 `link-line`, 📄 `file-line`, 📋 `clipboard-line`, 📝 `notebook-line`, 🌍 `earth-line`, ⚠️ `warning-line`, 💡 `bulb-line`, 👋 `wave-hand-line`, 🚀 `rocket-line`, ✈️ `airplane-line`, 🚂 `train-line`, 📍 `location-line`.

When adding or editing a post, check for emojis before committing (the existing ♪ and ✕ also match; leave them):

```sh
grep -nP '[\x{1F000}-\x{1FAFF}\x{2600}-\x{27BF}\x{FE0F}]' homepage/public/posts_md/*.md
```

## Publishing

Work on `main` and push to `origin main` when done — Vercel deploys from `main`, and the Cypress E2E workflow runs on every push.
