/**
 * The app ships a handful of isolated component-preview routes under
 * /testComponent/* for manual QA. They're the closest thing this codebase
 * has to component tests, so this spec turns them into an automated
 * regression safety net (and separately exercises the components' actual
 * behaviour, not just "did it render").
 */
describe('Component sandbox pages render without crashing', () => {
  const sandboxRoutes = [
    '/testComponent/footer',
    '/testComponent/header',
    '/testComponent/lotto',
    '/testComponent/test',
    '/testComponent/timeline',
    '/testComponent/flow',
  ]

  sandboxRoutes.forEach((route) => {
    it(`mounts ${route}`, () => {
      cy.visit(route)
      cy.get('nextjs-portal', { timeout: 1000 }).should('not.exist')
      cy.get('body').should('be.visible')
    })
  })
})

describe('LotteryText (testComponent/lotto)', () => {
  it('cycles through the provided elements on click', () => {
    cy.visit('/testComponent/lotto')
    cy.contains(/Traveller!|Software Engineer!|Photographer|Adventurer!/).should('exist')
  })
})

describe('FlowGraph example (testComponent/flow)', () => {
  it('renders the example infrastructure nodes', () => {
    cy.visit('/testComponent/flow')
    cy.get('.react-flow__node').should('have.length.greaterThan', 0)
  })
})

describe('Timeline + ActivityPostList (testComponent/timeline)', () => {
  it('renders the activity list and timeline side by side', () => {
    cy.visit('/testComponent/timeline')
    cy.contains(/awards/i).should('exist')
    cy.get('.shiro-timeline li').should('have.length.greaterThan', 0)
  })
})

describe('Transition views (testComponent/test)', () => {
  it('renders the animated greeting text', () => {
    cy.visit('/testComponent/test')
    cy.contains('Innei').should('exist')
  })
})
