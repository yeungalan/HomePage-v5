/**
 * Verifies the Markdown versions of pages for AI agents (the rewrites in
 * homepage/next.config.ts, the route handlers in homepage/src/app/md/ and the
 * renderers in homepage/src/lib/markdown/):
 *
 *  - A request that sends `Accept: text/markdown` gets the page as Markdown,
 *    with `Vary: Accept` and a canonical `Link` header, on every page.
 *  - Browsers asking for the same URLs still get HTML.
 *  - A post comes whole, with its metadata as front matter and links to its
 *    translations, tags and neighbours.
 *  - Unknown URLs, posts and tags answer 404 in Markdown.
 */

const SITE = 'https://alanyeung.co'

/** What agents such as coding assistants send. */
const AGENT = { Accept: 'text/markdown, text/html;q=0.9, */*;q=0.8' }
/** What Chrome sends for a page load. */
const BROWSER = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
}

const PAGES: { path: string; heading: RegExp }[] = [
  { path: '/', heading: /^# Hi, This is Alan\.$/m },
  { path: '/posts', heading: /^# Posts$/m },
  { path: '/posts/cissp_en', heading: /^# After the CISSP Exam: /m },
  { path: '/tags/CISSP', heading: /^# #CISSP$/m },
  { path: '/projects', heading: /^# Projects$/m },
  { path: '/friends', heading: /^# Friends$/m },
  { path: '/goals', heading: /^# \d{4} Goals$/m },
  { path: '/world', heading: /^# Places I visited$/m },
  { path: '/arch', heading: /^# Architecture$/m },
]

/** Header values as one string (repeated headers may arrive as an array). */
const header = (headers: Record<string, string | string[]>, name: string) => [headers[name] ?? []].flat().join(', ')

const requestMarkdown = (url: string) => cy.request({ url, headers: AGENT, failOnStatusCode: false })

describe('Markdown for agents', () => {
  PAGES.forEach(({ path, heading }) => {
    it(`serves ${path} as Markdown to agents`, () => {
      requestMarkdown(path).then(({ status, headers, body }) => {
        expect(status).to.eq(200)
        expect(header(headers, 'content-type')).to.match(/^text\/markdown; ?charset=utf-8$/i)
        expect(header(headers, 'vary')).to.match(/\baccept\b/i)
        expect(header(headers, 'link')).to.eq(`<${SITE}${path}>; rel="canonical"`)
        expect(body).to.match(/^---\ntitle: "/)
        expect(body).to.include(`\nurl: "${SITE}${path}"\n`)
        expect(body).to.match(heading)
        expect(body).not.to.include('<html')
        // Every page ends with the site's navigation.
        expect(body).to.include(`[Posts](${SITE}/posts)`)
      })
    })

    it(`still serves ${path} as HTML to browsers`, () => {
      cy.request({ url: path, headers: BROWSER }).then(({ headers, body }) => {
        expect(header(headers, 'content-type')).to.match(/^text\/html/)
        expect(body).to.match(/^<!DOCTYPE html>/i)
      })
    })
  })

  it('serves a post whole, with its metadata, translations, tags and neighbours', () => {
    cy.readFile('../homepage/public/posts_md/cissp_en.md').then((source: string) => {
      // The post as written, minus its AUTOMATE FIELD block and icons (decoration).
      const text = source
        .replace(/###\s*AUTOMATE FIELD[\s\S]*?###\s*AUTOMATE FIELD END/, '')
        .replace(/<span data-icon="[^"]*"><\/span> /g, '')
        .trim()

      requestMarkdown('/posts/cissp_en').then(({ body }) => {
        expect(body.includes(text), 'the whole post, as written').to.equal(true)
        expect(body).not.to.include('AUTOMATE FIELD')
        expect(body).not.to.include('data-icon')
        expect(body).to.include('\nlanguage: "en"\n')
        expect(body).to.match(/\nsummary: ".+"\n/)
        expect(body).to.include('\npublished: "2026-09-02T00:00:00Z"\n')
        expect(body).to.include(`\ntranslations:\n  zh: "${SITE}/posts/cissp"\n  ja: "${SITE}/posts/cissp_ja"\n`)
        expect(body).to.include(`[#CISSP](${SITE}/tags/CISSP)`)
        expect(body).to.match(/\nPrevious: \[.+\]\(https:\/\/alanyeung\.co\/posts\/[^)]+\)/)
      })
    })
  })

  it('turns embedded maps into links and site-relative links into absolute ones', () => {
    requestMarkdown('/posts/japan-study-00-visa_en').its('body').then((body: string) => {
      expect(body).not.to.include('<iframe')
      expect(body).to.match(/^\[Map\]\(https:\/\/maps\.google\.com\/maps\?q=[^)]+\)$/m)
    })
    requestMarkdown('/posts/homelab-10k-yen-server').its('body').should('include', `](${SITE}/posts/sla_2025)`)
  })

  it('lists every post with its translations', () => {
    requestMarkdown('/posts').its('body').then((body: string) => {
      expect(body).to.match(/^- \d{4}-\d{2}-\d{2} · \[.+\]\(https:\/\/alanyeung\.co\/posts\/cissp\)$/m)
      expect(body).to.match(/^ {2}- English: \[.+\]\(https:\/\/alanyeung\.co\/posts\/cissp_en\)$/m)
      expect(body).to.match(/^ {2}- Japanese: \[.+\]\(https:\/\/alanyeung\.co\/posts\/cissp_ja\)$/m)
    })
  })

  it('serves a non-ASCII tag', () => {
    const tag = '日本留學'
    requestMarkdown(`/tags/${encodeURIComponent(tag)}`).then(({ status, headers, body }) => {
      expect(status).to.eq(200)
      expect(header(headers, 'link')).to.eq(`<${SITE}/tags/${encodeURIComponent(tag)}>; rel="canonical"`)
      expect(body).to.include(`# #${tag}\n`)
      expect(body).to.include(`](${SITE}/posts/japan-study-00-visa)`)
      expect(body).not.to.include(`](${SITE}/posts/cissp)`)
    })
  })

  it('writes out what the client-only widgets show', () => {
    requestMarkdown('/world').its('body').should('include', '| HKG | Hong Kong International Airport | Hong Kong | Hong Kong |')
    requestMarkdown('/goals').its('body').should('match', /^\d+ days left until \d{4}$/m)
    requestMarkdown('/arch').its('body').then((body: string) => {
      expect(body).to.include('## Services')
      expect(body).to.match(/^- \*\*Vercel\*\* \(Vercel Homepage\): (Up|Down|Degraded|Paused|Unknown)$/m)
      expect(body).to.include('- CloudFlare → s01 Load Balancer (15ms)')
    })
  })

  it('answers unknown URLs, posts and tags with a Markdown 404', () => {
    ;['/no/such/page', '/posts/no-such-post-xyz', '/tags/no-such-tag-xyz'].forEach((url) => {
      requestMarkdown(url).then(({ status, headers, body }) => {
        expect(status, url).to.eq(404)
        expect(header(headers, 'content-type')).to.match(/^text\/markdown/)
        expect(body).to.include('# Page not found')
      })
    })
  })

  it('leaves files and API routes alone', () => {
    requestMarkdown('/api/posts').its('headers').its('content-type').should('match', /^application\/json/)
    requestMarkdown('/robots.txt').its('headers').its('content-type').should('match', /^text\/plain/)
    requestMarkdown('/assets/images/profilePic.png').its('headers').its('content-type').should('eq', 'image/png')
  })
})

// A module, so its top-level names don't clash with other specs'.
export {}
