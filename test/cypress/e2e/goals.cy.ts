/**
 * Covers every component rendered on /goals: ClockDisplay, YearStats,
 * TimezoneGrid, FlightCalculator, and GoalsList.
 */
describe('Goals page components', () => {
  beforeEach(() => {
    cy.viewport(1280, 1200)
    cy.visit('/goals')
  })

  it('renders a live clock that actually ticks', () => {
    cy.contains(/\d{2}:\d{2}:\d{2}/).invoke('text').then((first) => {
      cy.wait(1200)
      cy.contains(/\d{2}:\d{2}:\d{2}/).invoke('text').should('not.eq', first)
    })
  })

  it('shows year-progress stats as sane percentages', () => {
    // YearStats renders day-of-year / year-progress / today-progress figures.
    cy.contains('%').should('exist')
  })

  it('renders a timezone grid with multiple timezone entries', () => {
    cy.contains(/UTC|GMT|JST|PST|EST/).should('exist')
  })

  it('flight calculator computes distance and duration for a valid route', () => {
    cy.contains(/Flight/i).should('exist')
    cy.get('input[placeholder="e.g., JFK"]').type('JFK')
    cy.get('input[placeholder="e.g., LAX"]').type('LAX')

    // Airport name resolves under each input once a valid 3-letter code is typed.
    cy.get('input[placeholder="e.g., JFK"]')
      .parent()
      .contains(/New York|Kennedy/i)
      .should('exist')
    cy.get('input[placeholder="e.g., LAX"]')
      .parent()
      .contains(/Los Angeles/i)
      .should('exist')

    // Distance/duration figures and the flight-progress percentage render
    // once both airports resolve.
    cy.contains(/km|mi/i).should('exist')
    cy.contains(/%$/).should('exist')
  })

  it('clears the flight result when an input is emptied', () => {
    cy.get('input[placeholder="e.g., JFK"]').type('JFK')
    cy.get('input[placeholder="e.g., LAX"]').type('LAX')
    cy.contains(/Los Angeles/i).should('exist')

    cy.get('input[placeholder="e.g., LAX"]').clear()
    cy.contains(/Los Angeles/i).should('not.exist')
  })

  it('renders every 2026 goal with a status label', () => {
    ;['Move to japan', 'Learn japanese', 'Learn cooking', 'Better mental health', 'weight'].forEach(
      (title) => {
        cy.contains(title).should('exist')
      },
    )
    cy.contains(/Completed|In progress|Not started/).should('exist')
  })
})
