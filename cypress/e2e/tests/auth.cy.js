describe('Authentication', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('rejects invalid login attempts', () => {
    cy.visit('/auth/login');
    cy.get('input[name="username"]').type('not-a-real-user');
    cy.get('input[name="password"]').type('bad-password');
    cy.contains('button', 'Sign In').click();

    cy.location('pathname').should('eq', '/auth/login');
    cy.get('.alert-danger').should('be.visible').and('contain', 'Invalid username or password');
  });

  it('allows a user to login with valid credentials', () => {
    cy.visit('/auth/login');
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('admin123');
    cy.contains('button', 'Sign In').click();

    cy.location('pathname', { timeout: 10000 }).should('eq', '/');
    cy.contains('a', 'My Dashboard', { timeout: 10000 }).should('be.visible');
    cy.contains('footer', 'Signed in as admin (admin)').should('be.visible');
  });

  it('registers a new customer account and logs them in', () => {
    const uniqueSuffix = Date.now();
    const firstName = `Cypress${uniqueSuffix}`;
    const lastName = 'User';
    const email = `cypress+${uniqueSuffix}@example.com`;
    const username = `cypress_user_${uniqueSuffix}`;
    const password = 'Password123!';

    cy.visit('/auth/register');
    cy.get('input[name="firstName"]').type(firstName);
    cy.get('input[name="lastName"]').type(lastName);
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="confirmPassword"]').type(password);
    cy.contains('button', 'Create account').click();

    cy.location('pathname', { timeout: 10000 }).should('eq', '/');
    cy.contains('footer', `Signed in as ${username} (customer)`, { timeout: 10000 }).should('be.visible');
  });
});
describe('Customer Rentals', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('allows a customer to rent and cancel movies from the catalogue and dashboard', () => {
    const customer = { username: 'eter', password: 'chipss' };
    const academySearchTerm = 'academy';
    const academyTitle = 'Academy Dinosaur';
    const secondMovieTitle = 'Ace Goldfinger';

    cy.visit('/auth/login');
    cy.get('input[name="username"]').type(customer.username);
    cy.get('input[name="password"]').type(customer.password);
    cy.contains('button', 'Sign In').click();

    cy.location('pathname', { timeout: 10000 }).should('eq', '/');

    cy.on('window:confirm', (text) => {
      expect(text).to.contain('Are you sure you want to cancel this rental?');
      return true;
    });

    cy.visit('/films');
    cy.location('pathname').should('eq', '/films');

    cy.get('#q').clear().type(academySearchTerm);
    cy.get('#category').select('Documentary');
    cy.get('#rating').select('PG');
    cy.get('#sort').select('Discount (High to Low)');
    cy.contains('button', 'Apply filters').click();

    cy.contains('.mx-card', academyTitle, { timeout: 10000 }).should('be.visible');
    cy.contains('.mx-card', academyTitle).within(() => {
      cy.contains('View details').click();
    });

    cy.location('pathname', { timeout: 10000 }).should('match', /\/films\/(\d+)/);
    cy.contains('button', 'Rent now', { timeout: 10000 }).click();

    cy.location('pathname', { timeout: 10000 }).should('eq', '/customer/dashboard');
    cy.contains('table tbody tr', academyTitle, { timeout: 10000 }).within(() => {
      cy.contains('button', 'Cancel').click();
    });

    cy.location('pathname', { timeout: 10000 }).should('eq', '/customer/dashboard');
    cy.get('body', { timeout: 10000 }).should(($body) => {
      expect($body.find(`table tbody tr:contains("${academyTitle}")`).length).to.eq(0);
    });

    cy.get('body').then(($body) => {
      const browseMoviesLink = $body.find('a').filter((_, el) => el.textContent.includes('Browse movies'));
      if (browseMoviesLink.length) {
        cy.wrap(browseMoviesLink.first()).click();
      } else {
        cy.contains('a', 'Browse catalog').click();
      }
    });

    cy.location('pathname', { timeout: 10000 }).should('eq', '/customer/movies');
    cy.get('#search').clear().type(secondMovieTitle);
    cy.contains('button', 'Search catalogue').click();

    cy.contains('.mx-card', secondMovieTitle, { timeout: 10000 }).within(() => {
      cy.contains('button', 'Rent').click();
    });

    cy.location('pathname', { timeout: 10000 }).should('eq', '/customer/dashboard');
    cy.contains('table tbody tr', secondMovieTitle, { timeout: 10000 }).within(() => {
      cy.contains('button', 'Cancel').click();
    });

    cy.location('pathname', { timeout: 10000 }).should('eq', '/customer/dashboard');
    cy.get('body', { timeout: 10000 }).should(($body) => {
      expect($body.find(`table tbody tr:contains("${secondMovieTitle}")`).length).to.eq(0);
    });
  });
});
