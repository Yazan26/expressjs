const filmTitle = 'Academy Dinosaur';
const filmTitleRegex = new RegExp(filmTitle, 'i');

const stubCancelConfirm = () => {
  cy.window().then((win) => {
    cy.stub(win, 'confirm').callsFake((message) => {
      expect(message).to.include('Are you sure you want to cancel this rental');
      return true;
    });
  });
};

const removeExistingRentalIfPresent = () => {
  cy.visit('/customer/dashboard');
  stubCancelConfirm();

  cy.get('body').then(($body) => {
    const hasRental = $body.find('table tbody tr').toArray().some((row) =>
      row.innerText.toLowerCase().includes(filmTitle.toLowerCase())
    );

    if (hasRental) {
      cy.contains('table tbody tr', filmTitleRegex)
        .within(() => {
          cy.contains('button', 'Cancel', { matchCase: false }).click();
        });

      cy.contains('table tbody tr', filmTitleRegex, { timeout: 10000 }).should('not.exist');
    }
  });
};

describe('Customer Movie Rental', () => {
  it('searches for Academy Dinosaur, rents it, and cancels the rental', () => {
    // Login as a known customer
    cy.visit('/auth/login');
    cy.get('input[name="username"]').type('eter');
    cy.get('input[name="password"]').type('chipss');
    cy.contains('button', 'Sign In').click();
    cy.url().should('include', '/');

    // Ensure there is no pre-existing rental of the target film
    removeExistingRentalIfPresent();

    // Navigate to films directory
    cy.visit('/films');
    cy.url().should('include', '/films');

    // Use the side-panel search form (not the navbar search)
    cy.get('form[action="/films"]').within(() => {
      cy.get('input[name="q"]').clear().type('academy dinosaur');
      cy.contains('button', 'Search Films').click();
    });

    // Open the Academy Dinosaur detail page
    cy.contains('.film-card', filmTitleRegex)
      .should('exist')
      .within(() => {
        cy.contains('View Details', { matchCase: false }).click();
      });

    cy.url().should('match', /\/films\/\d+/);

    // Rent the movie
    cy.get('#rentButton').should('be.visible').click();

    // Verify redirect to dashboard
    cy.url().should('include', '/customer/dashboard');

    // Cancel the rental from the dashboard and confirm the alert
    stubCancelConfirm();

    cy.contains('table tbody tr', filmTitleRegex, { timeout: 10000 })
      .should('exist')
      .within(() => {
        cy.contains('button', 'Cancel', { matchCase: false }).click();
      });

    cy.contains('table tbody tr', filmTitleRegex, { timeout: 10000 }).should('not.exist');
  });
});
