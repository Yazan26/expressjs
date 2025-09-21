describe('Public Site Experience', () => {
  it('responds to the health check endpoint', () => {
    cy.request('/health').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('status', 'OK');
      expect(response.body).to.have.property('message');
      expect(response.body).to.have.property('timestamp');
    });
  });

  context('Homepage', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('displays the hero content with clear calls to action', () => {
      cy.contains('Your Ultimate Movie Rental Experience').should('be.visible');
      cy.contains('Discover thousands of movies').should('be.visible');
      cy.contains('Get Started').should('be.visible');
      cy.contains('Sign In').should('be.visible');
    });

    it('renders the navigation bar for anonymous visitors', () => {
      cy.get('nav').within(() => {
        cy.contains('Home').should('have.attr', 'href', '/');
        cy.contains('Films').should('have.attr', 'href', '/films');
        cy.contains('About').should('have.attr', 'href', '/about');
        cy.contains('Login').should('have.attr', 'href', '/auth/login');
      });
    });

    it('routes visitors to the login page from the hero button', () => {
      cy.contains('Sign In').click();
      cy.url().should('include', '/auth/login');
      cy.contains('Sakila Video Store Login').should('be.visible');
    });

    it('routes visitors to the registration page from the hero button', () => {
      cy.contains('Get Started').click();
      cy.url().should('include', '/auth/register');
      cy.contains('Register').should('be.visible');
    });
  });

  context('Site navigation', () => {
    it('navigates between About and Home using the navbar brand link', () => {
      cy.visit('/about');
      cy.contains('About Movies Express Rentals').should('be.visible');
      cy.get('a.navbar-brand').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.contains('Your Ultimate Movie Rental Experience').should('be.visible');
    });


  });
});
