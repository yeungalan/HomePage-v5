/**
 * /arch renders FlowGraph (ThreeTierInfrastructure) built from
 * INFRASTRUCTURE_CONFIG (17 services) via @xyflow/react, plus the
 * NodeDetailPanel that appears once a node is clicked.
 */
describe('Architecture page (FlowGraph)', () => {
  beforeEach(() => {
    cy.viewport(1400, 1000)
    cy.visit('/arch')
  })

  it('renders the React Flow canvas with every configured service as a node', () => {
    cy.get('.react-flow').should('exist')
    cy.get('.react-flow__node').should('have.length', 17)
  })

  it('renders edges connecting the nodes', () => {
    cy.get('.react-flow__edge').should('have.length.greaterThan', 0)
  })

  it('opens a node detail panel showing the clicked service name when a node is clicked', () => {
    // CustomNode renders the service name (data.title) in a
    // `.text-gray-900.dark:text-gray-100` div; NodeDetailPanel renders the
    // same string as an <h3>, so the two must match after the click.
    cy.get('.react-flow__node')
      .first()
      .find('.text-gray-900')
      .invoke('text')
      .then((serviceName) => {
        cy.get('.react-flow__node').first().click()
        cy.contains('h3', serviceName.trim()).should('exist')
      })
  })
})
