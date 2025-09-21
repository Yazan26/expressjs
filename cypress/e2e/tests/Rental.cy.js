describe('Customer Rentals', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('logs in as a customer and navigates to films', () => {
    const customer = { username: 'eter', password: 'chipss' };

    cy.visit('/auth/login');
    cy.get('input[name="username"]').type(customer.username);
    cy.get('input[name="password"]').type(customer.password);
    cy.contains('button', 'Sign In').click();

    cy.location('pathname', { timeout: 10000 }).should('eq', '/');

    cy.visit('/films');
    cy.location('pathname').should('eq', '/films');
  });

  it('searches for and rents Academy Dinosaur', () => {
    const customer = { username: 'eter', password: 'chipss' };
    const academySearchTerm = 'academy';
    const academyTitle = 'ACADEMY DINOSAUR';

    cy.visit('/auth/login');
    cy.get('input[name="username"]').type(customer.username);
    cy.get('input[name="password"]').type(customer.password);
    cy.contains('button', 'Sign In').click();

    cy.location('pathname', { timeout: 10000 }).should('eq', '/');

    cy.visit('/films');
    cy.location('pathname').should('eq', '/films');

    cy.get('#q').clear().type(academySearchTerm);
    cy.contains('button', 'Apply filters').click();

    cy.contains('.mx-card', academyTitle, { timeout: 10000 }).should('be.visible');
    cy.contains('.mx-card', academyTitle).within(() => {
      cy.contains('View details').click();
    });

    cy.location('pathname', { timeout: 10000 }).should('match', /\/films\/(\d+)/);
    cy.contains('button', 'Rent now', { timeout: 10000 }).click();

    cy.location('pathname', { timeout: 10000 }).should('eq', '/customer/dashboard');
    cy.contains('table tbody tr', academyTitle, { timeout: 10000 }).should('exist');
  });

  it('cancels the rental of Academy Dinosaur from the dashboard', () => {
    const customer = { username: 'eter', password: 'chipss' };
    const academyTitle = 'ACADEMY DINOSAUR';

    cy.visit('/auth/login');
    cy.get('input[name="username"]').type(customer.username);
    cy.get('input[name="password"]').type(customer.password);
    cy.contains('button', 'Sign In').click();

    cy.location('pathname', { timeout: 10000 }).should('eq', '/');

    cy.on('window:confirm', (text) => {
      expect(text).to.contain('Are you sure you want to cancel this rental?');
      return true;
    });

    cy.visit('/customer/dashboard');
    cy.contains('table tbody tr', academyTitle, { timeout: 10000 }).within(() => {
      cy.contains('button', 'Cancel').click();
    });

    cy.location('pathname', { timeout: 10000 }).should('eq', '/customer/dashboard');
    cy.get('body', { timeout: 10000 }).should(($body) => {
      expect($body.find(`table tbody tr:contains("${academyTitle}")`).length).to.eq(0);
    });
  });

  it('searches for and rents Ace Goldfinger', () => {
    const customer = { username: 'eter', password: 'chipss' };
    const secondMovieTitle = 'ACE GOLDFINGER';

    cy.visit('/auth/login');
    cy.get('input[name="username"]').type(customer.username);
    cy.get('input[name="password"]').type(customer.password);
    cy.contains('button', 'Sign In').click();

    cy.location('pathname', { timeout: 10000 }).should('eq', '/');

    cy.visit('/customer/dashboard');
    cy.contains('Browse catalog').click();

    cy.location('pathname', { timeout: 10000 }).should('eq', '/customer/movies');
    cy.get('#search').clear().type(secondMovieTitle);
    cy.contains('button', 'Search catalogue').click();

    cy.contains('.mx-card', secondMovieTitle, { timeout: 10000 }).within(() => {
      cy.contains('Rent').click();
    });

    cy.location('pathname', { timeout: 10000 }).should('eq', '/customer/dashboard');
    cy.contains('table tbody tr', secondMovieTitle, { timeout: 10000 }).should('exist');
  });

  it('cancels the rental of Ace Goldfinger from the dashboard', () => {
    const customer = { username: 'eter', password: 'chipss' };
    const secondMovieTitle = 'ACE GOLDFINGER';

    cy.visit('/auth/login');
    cy.get('input[name="username"]').type(customer.username);
    cy.get('input[name="password"]').type(customer.password);
    cy.contains('button', 'Sign In').click();

    cy.location('pathname', { timeout: 10000 }).should('eq', '/');

    cy.on('window:confirm', (text) => {
      expect(text).to.contain('Are you sure you want to cancel this rental?');
      return true;
    });

    cy.visit('/customer/dashboard');
    cy.contains('table tbody tr', secondMovieTitle, { timeout: 10000 }).within(() => {
      cy.contains('button', 'Cancel').click();
    });

    cy.location('pathname', { timeout: 10000 }).should('eq', '/customer/dashboard');
    cy.get('body', { timeout: 10000 }).should(($body) => {
      expect($body.find(`table tbody tr:contains("${secondMovieTitle}")`).length).to.eq(0);
    });
  });
});
