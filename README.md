# HomePage-v5

Source for Alan Yeung's personal website, [alanyeung.co](https://alanyeung.co): a home page, a multilingual blog, a globe of places visited, yearly goals, an infrastructure diagram, and project and friend links.

It is a [Next.js](https://nextjs.org) 16 app (App Router, React 19, Tailwind CSS 4, TypeScript), deployed on Vercel.

## Repository layout

```
.
├── homepage/                 The Next.js app (this is what Vercel deploys)
│   ├── public/
│   │   ├── posts_md/         Blog posts, one Markdown file per language
│   │   └── assets/images/    Images used by pages and posts
│   └── src/
│       ├── app/              Routes (App Router), sitemap.ts, robots.ts
│       ├── components/       UI components (Post/ renders blog posts)
│       ├── constants/        Site config, animation presets, globe settings
│       ├── data/             Page content kept as TypeScript (projects, friends, goals, …)
│       ├── i18n/             UI translations (en-US, zh-HK, ja-JP)
│       └── lib/              Post loading, tags, dates, globe helpers
├── test/                     Cypress end-to-end tests (a separate npm package)
├── .github/workflows/        CI: build the app and run Cypress on every push and PR
└── CLAUDE.md                 Writing rules for the site (no emoji, AI summaries)
```

The tests live in their own package so their dependencies never touch the app.

## Running locally

Requires Node.js 22.12 or newer.

```sh
cd homepage
npm ci
npm run dev        # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Development server with Turbopack |
| `npm run build` | Production build (pages are pre-rendered at build time) |
| `npm run start` | Serve the production build on port 3000 |
| `npm run lint` | ESLint (Next.js core-web-vitals and TypeScript rules) |

A plain `npm ci` / `npm install` works. Don't add `--legacy-peer-deps`; if an install hits a peer-dependency conflict, fix the dependency instead.

## Pages

| Route | Content |
|---|---|
| `/` | Home: greeting, social links, avatar, recent activity |
| `/posts` | All posts, newest first |
| `/posts/[slug]` | A single post, with a language switcher when translations exist |
| `/tags/[slug]` | Posts with a given tag |
| `/world` | 3D globe of flights, train routes and visited places |
| `/goals` | This year's goals, stats and a flight-distance widget |
| `/arch` | Diagram of the infrastructure behind the site |
| `/projects`, `/friends` | Project and friend links |
| `/api/posts` | All post metadata as JSON |
| `/testComponent/*` | Component playgrounds used during development |

## Writing a post

Each post is a Markdown file in `homepage/public/posts_md/`. The file name is the URL slug, so `cissp.md` becomes `/posts/cissp`.

### Languages

Translations of one post share a base name:

- `aboutme.md` is the default-language version (usually Traditional Chinese)
- `aboutme_en.md` is English
- `aboutme_ja.md` is Japanese

Files with the same base name are grouped into one entry in the post list, and the post page shows a switcher between them. The suffix is any two-letter language code after an underscore.

### Metadata block

Every post starts with an `AUTOMATE FIELD` block, which the site reads to build lists, tags, SEO tags and the summary:

```
### AUTOMATE FIELD
Topic=My 10,000 Yen Homelab: It Is Not a Raspberry Pi
ID=homelab-10k-yen-server
CREATED_DATE=2026-09-28T00:00:00Z
EDITED_DATE=2026-09-28T00:00:00Z
TAG=homelab,NEC Mate,Debian,Docker,Frigate
CATEGORY=Homelab
CATEGORY_CAPTION=Homelab
AI_SUMMARY=Alan introduces his homelab server in Japan, ...
### AUTOMATE FIELD END
```

| Field | Use |
|---|---|
| `Topic` | Post title |
| `ID` | Post identifier (same as the base slug) |
| `CREATED_DATE` / `EDITED_DATE` | ISO dates; the list is sorted by `CREATED_DATE` |
| `TAG` | Comma-separated tags; each one gets a `/tags/...` page |
| `CATEGORY` / `CATEGORY_CAPTION` | Category and its display caption |
| `AI_SUMMARY` | A 100–150 word, one-line, third-person summary shown under the title (see `CLAUDE.md`) |

### What Markdown supports

- GitHub-flavoured Markdown: tables, task lists, strikethrough, autolinked headings
- Code blocks with syntax highlighting
- LaTeX: `$inline$`, `$$display$$` and fenced `math` blocks, rendered with KaTeX
- Charts: a fenced `chart` block with a JSON body (`"type"` of `line`, `pie` or `map`)
- Icons: `<span data-icon="mingcute:link-line"></span>` renders a MingCute icon
- Raw HTML

```chart
{
  "type": "line",
  "title": "Daily Study Minutes",
  "labels": ["Mon", "Tue", "Wed"],
  "series": [{ "name": "Minutes", "values": [45, 60, 30] }]
}
```

`public/posts_md/test.md` (`/posts/test`) shows working examples of every chart type and the LaTeX features.

The site never uses emoji; use MingCute icons instead. `CLAUDE.md` has the full rules and a command that finds emoji in posts.

Posts are read when the site is built, so a new or edited post goes live on the next deploy.

## Other content

Most non-post content is plain TypeScript data, so updating the site usually means editing a file in `homepage/src/data/`:

| File | Drives |
|---|---|
| `projects.ts`, `friends.ts` | `/projects` and `/friends` |
| `goals.ts` | `/goals` |
| `routes.ts`, `train.ts`, `airports.ts`, `worldAirports.ts` | Flights and train routes on the `/world` globe |
| `infrastructure.ts` | The `/arch` diagram |
| `experiences.ts`, `awards.ts` | Experience timeline and awards on the home page |
| `quotes.ts` | Quotes in the home page hero, one list per interface language |
| `social.ts`, `navigation.ts`, `footer.ts` | Social links, header menu, footer links |

Site-wide settings (URL, author, Google Analytics ID) are in `homepage/src/constants/site.ts`.

## Interface languages

The interface (menus, headings, buttons) is translated into English, Traditional Chinese (Hong Kong) and Japanese. Translations live in `homepage/src/i18n/messages/`. The language is chosen client-side: a saved choice from the footer switcher wins, otherwise the browser's language is used. There are no per-locale URLs.

This is separate from post translations, which are separate Markdown files as described above.

## Icons

Icons come from [MingCute](https://www.mingcute.com) through Iconify: `<Icon icon="mingcute:link-line" />` from `@iconify/react`. `src/components/IconifyConfig.tsx` registers the whole MingCute set from `@iconify-json/mingcute`, so those icons load without calling the Iconify API. Icon names are listed in `homepage/node_modules/@iconify-json/mingcute/icons.json`. A few menu icons use other Iconify sets (such as `mdi:` and `mage:`), which are fetched from the Iconify API.

## Tests

The Cypress suite in `test/` checks that the site renders in every interface language and that its interactive controls work. The specs cover the page background, buttons, keyboard navigation, language switching, LaTeX rendering and tag pages.

```sh
cd homepage && npm ci && npm run build
cd ../test && npm ci && npm run e2e     # starts the app, then runs Cypress headless
```

Use `npm run cypress:open` in `test/` (with the app running) to debug tests interactively.

## CI and deployment

- **GitHub Actions** (`.github/workflows/cypress.yml`) runs on every push to `main` and on every pull request. It runs `npm ci`, builds the app, then runs the Cypress suite in Chrome. Failure screenshots are uploaded as an artifact.
- **Vercel** deploys `main` to production at alanyeung.co, and other branches as preview deployments.

Environment variables:

| Variable | Effect |
|---|---|
| `STAGE` | Set to `dev` or `nonprod` to flag a non-production build in the footer |
| `NEXT_PUBLIC_BUILD_DATE` | Set automatically at build time; shown in the footer |

Analytics: Vercel Analytics, Vercel Speed Insights and Google Analytics.

## Dependency notes

Dependencies are on their latest majors except these, which can't move yet:

- **ESLint 9**: `eslint-config-next` depends on `eslint-plugin-react`, `eslint-plugin-import` and `eslint-plugin-jsx-a11y`, which don't support ESLint 10 yet.
- **TypeScript 6**: `typescript-eslint` requires TypeScript below 6.1, and Next.js type-checks with the JavaScript compiler API that TypeScript 7 removed.
- **`@types/node` 22**: kept in line with the Node.js 22 runtime.

`eslint.config.mjs` reports the React Compiler lint rules (`react-hooks/set-state-in-effect`, `refs`, `immutability`, `purity`) as warnings, because the site doesn't use the React Compiler.
