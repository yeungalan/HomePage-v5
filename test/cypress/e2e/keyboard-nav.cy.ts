/**
 * Verifies the site-wide keyboard navigation (homepage/src/components/KeyboardNav.tsx):
 *
 *  - ← / → cycle through the header sections, wrapping around, except on post
 *    pages where they keep meaning previous / next post.
 *  - Any key press shows hotkey hint badges on the right edge of every visible
 *    button and link; typing a hint clicks that control.
 *  - The badges stay attached to their element, and mouse / Esc hide them.
 *  - The hero social icons are real links across the whole circle, so both a
 *    mouse click and their hotkey open the profile.
 */

const HINTS = '[data-keyboard-nav-overlay] kbd.absolute'

/** Visit a page and wait until the keyboard handler is registered. */
const visitReady = (path: string) => {
  cy.visit(path)
  cy.get('html[data-keyboard-nav="ready"]')
}

/**
 * Dispatch a raw keydown. cy.type() may click its target first, and a mouse
 * press is exactly what makes the page leave keyboard mode.
 */
const press = (key: string) => cy.get('body').trigger('keydown', { key })

/** Enter keyboard mode (↓ scrolls at most, it never clicks anything). */
const showHints = () => {
  press('ArrowDown')
  cy.get(HINTS).should('have.length.greaterThan', 0)
}

/** Badges sitting on `el`'s right edge, vertically centred (where KeyboardNav anchors them). */
const badgesOn = (el: HTMLElement, badges: HTMLElement[]) => {
  const r = el.getBoundingClientRect()
  const x = Math.min(r.right, el.ownerDocument.defaultView!.innerWidth - 12)
  const y = r.top + r.height / 2
  return badges.filter(
    (b) => Math.abs(parseFloat(b.style.left) - x) <= 2 && Math.abs(parseFloat(b.style.top) - y) <= 2
  )
}

/** The hint badge for `$el`, retried until exactly one sits on it. */
const hintFor = ($el: JQuery<HTMLElement>) =>
  cy
    .get(HINTS)
    .should(($badges) => {
      expect(badgesOn($el[0], [...$badges]), 'hint badge on the element').to.have.length(1)
    })
    .then(($badges) => Cypress.$(badgesOn($el[0], [...$badges])))

describe('Keyboard navigation', () => {
  beforeEach(() => {
    cy.viewport(1280, 800)
  })

  it('cycles through the sections with the arrow keys', () => {
    visitReady('/')

    const forward = ['/world', '/goals', '/posts', '/projects', '/friends', '/arch', '/']
    forward.forEach((path) => {
      press('ArrowRight')
      cy.location('pathname').should('eq', path)
    })

    press('ArrowLeft')
    cy.location('pathname').should('eq', '/arch')
    press('ArrowLeft')
    cy.location('pathname').should('eq', '/friends')
  })

  it('wraps from Home to the last section with ←', () => {
    visitReady('/')
    press('ArrowLeft')
    cy.location('pathname').should('eq', '/arch')
  })

  it('keeps ← / → for previous / next post on post pages', () => {
    visitReady('/posts')
    cy.get('a[href^="/posts/"]').first().invoke('attr', 'href').then((href) => {
      visitReady(href!)
      press('ArrowRight')
      cy.location('pathname').should('match', /^\/posts\/.+/)
      press('ArrowLeft')
      cy.location('pathname').should('match', /^\/posts\/.+/)
    })
  })

  it('shows no hints until the keyboard is used', () => {
    visitReady('/')
    cy.get('[data-keyboard-nav-overlay]').should('not.exist')
    showHints()
    cy.get('[data-keyboard-nav-overlay]').should('contain.text', 'switch section')
  })

  it('numbers the section links and puts each badge on the right edge', () => {
    visitReady('/')
    showHints()

    const sections: Array<[string, string]> = [
      ['/', '1'],
      ['/world', '2'],
      ['/goals', '3'],
      ['/posts', '4'],
    ]
    sections.forEach(([path, label]) => {
      cy.get(`nav a[href="${path}"]`).filter(':visible').first().then(($a) => {
        hintFor($a).should('have.text', label)
      })
    })
  })

  it('gives every other visible control a letter hint', () => {
    visitReady('/')
    showHints()
    cy.get(HINTS).then(($badges) => {
      const labels = [...$badges].map((b) => b.textContent ?? '')
      const letters = labels.filter((l) => /^[a-z]+$/i.test(l))
      expect(letters.length, 'letter hints').to.be.greaterThan(0)
      expect(new Set(letters).size, 'letter hints are unique').to.equal(letters.length)
    })
  })

  it('clicks a section link by its number', () => {
    visitReady('/')
    showHints()
    press('3')
    cy.location('pathname').should('eq', '/goals')
  })

  it('clicks a control by its letter hint', () => {
    visitReady('/')
    showHints()
    cy.get('button[aria-label="Change a new sentence"]').then(($btn) => {
      const clicked = cy.spy().as('quoteClick')
      $btn[0].addEventListener('click', clicked)
      hintFor($btn).invoke('text').then((label) => press(label.toLowerCase()))
    })
    cy.get('@quoteClick').should('have.been.calledOnce')
  })

  it('opens the social profiles from their hotkeys', () => {
    visitReady('/')
    showHints()

    const socials: Array<[string, string]> = [
      ['Github', 'https://github.com/'],
      ['Linkedin', 'https://linkedin.com/in/'],
      ['Instagram', 'https://instagram.com/'],
      ['Twitter', 'https://twitter.com/'],
    ]
    socials.forEach(([name, prefix]) => {
      cy.get(`a[aria-label="${name}"]`).should('be.visible').then(($a) => {
        expect($a.attr('href')).to.match(new RegExp(`^${prefix}`))
        // Swallow the navigation so the new tab does not open during the test.
        const clicked = cy.spy((e: Event) => e.preventDefault()).as(`${name}Click`)
        $a[0].addEventListener('click', clicked)
        hintFor($a).invoke('text').then((label) => press(label.toLowerCase()))
      })
      cy.get(`@${name}Click`).should('have.been.calledOnce')
    })
  })

  it('makes the whole social icon circle a link', () => {
    visitReady('/')
    cy.get('a[aria-label="Github"]').then(($a) => {
      const r = $a[0].getBoundingClientRect()
      expect(r.width, 'circle width').to.be.at.least(36)
      // A point near the edge of the circle, well outside the glyph itself.
      const hit = $a[0].ownerDocument.elementFromPoint(r.left + r.width / 2, r.top + 3)
      expect($a[0].contains(hit), 'edge of the circle belongs to the link').to.equal(true)
      expect($a.attr('target')).to.equal('_blank')
      expect($a.closest('button').length, 'not nested inside a button').to.equal(0)
    })
  })

  it('keeps badges attached while the element moves', () => {
    visitReady('/')
    showHints()
    cy.get('nav a[href="/goals"]').filter(':visible').first().as('goals')
    cy.get<HTMLElement>('@goals').then(($a) => {
      hintFor($a).should('have.text', '3')
    })
    // Move the link; the badge must follow it on the next frames.
    cy.get<HTMLElement>('@goals').invoke('css', 'transform', 'translateY(30px)')
    cy.get<HTMLElement>('@goals').then(($a) => {
      hintFor($a).should('have.text', '3')
    })
    cy.get<HTMLElement>('@goals').invoke('css', 'transform', '')
  })

  it('hides the hints on mouse move and on Esc', () => {
    visitReady('/')
    showHints()
    cy.get('body').trigger('mousemove', { clientX: 100, clientY: 100 })
    cy.get('body').trigger('mousemove', { clientX: 300, clientY: 300 })
    cy.get('[data-keyboard-nav-overlay]').should('not.exist')

    showHints()
    press('Escape')
    cy.get('[data-keyboard-nav-overlay]').should('not.exist')
  })
})
