// ***********************************************
// Custom Cypress Commands
// ***********************************************

/**
 * Login command - supports different user types
 * @param {string} email - user email
 * @param {string} password - user password
 */
Cypress.Commands.add('login', (email = 'MARY.SMITH@sakilacustomer.org', password = 'password123') => {
  cy.visit('/auth/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  
  // Wait for redirect to complete
  cy.url().should('not.include', '/auth/login');
});

/**
 * Quick login for customer testing
 */
Cypress.Commands.add('loginAsCustomer', () => {
  cy.login('MARY.SMITH@sakilacustomer.org', 'password123');
});

/**
 * Register new user
 * @param {Object} userData - user registration data
 */
Cypress.Commands.add('register', (userData) => {
  const defaultData = {
    firstName: `Test${Date.now()}`,
    lastName: 'User',
    email: `test${Date.now()}@test.com`,
    password: 'password123'
  };
  
  const data = { ...defaultData, ...userData };
  
  cy.visit('/auth/register');
  cy.get('input[name="firstName"]').type(data.firstName);
  cy.get('input[name="lastName"]').type(data.lastName);
  cy.get('input[name="email"]').type(data.email);
  cy.get('input[name="password"]').type(data.password);
  cy.get('button[type="submit"]').click();
  
  return cy.wrap(data);
});

/**
 * Logout command
 */
Cypress.Commands.add('logout', () => {
  cy.get('a[href="/auth/logout"]').click();
  cy.url().should('include', '/auth/login');
});

/**
 * Check authentication status
 * @param {boolean} shouldBeAuthenticated - expected auth state
 */
Cypress.Commands.add('checkAuth', (shouldBeAuthenticated = true) => {
  if (shouldBeAuthenticated) {
    cy.get('.navbar').should('contain', 'Logout');
  } else {
    cy.visit('/auth/login');
    cy.url().should('include', '/auth/login');
  }
});

/**
 * Navigate to specific section
 * @param {string} section - 'users', 'films', 'reports', etc.
 */
Cypress.Commands.add('navigateTo', (section) => {
  const routes = {
    home: '/',
    users: '/users',
    films: '/films',
    reports: '/reports',
    admin: '/admin',
    'admin-films': '/admin/films',
    'admin-staff': '/admin/staff',
    'admin-offers': '/admin/offers'
  };

  const route = routes[section] || `/${section}`;
  cy.visit(route);
  cy.url().should('include', route);
});

/**
 * Fill form fields with data object
 * @param {Object} data - form field data
 */
Cypress.Commands.add('fillForm', (data) => {
  Object.entries(data).forEach(([field, value]) => {
    if (typeof value === 'string') {
      cy.get(`[name="${field}"]`).clear().type(value);
    } else if (typeof value === 'object' && value.select) {
      cy.get(`select[name="${field}"]`).select(value.select);
    }
  });
});

/**
 * Submit form and wait for response
 * @param {string} expectedUrl - URL to expect after submission
 */
Cypress.Commands.add('submitForm', (expectedUrl) => {
  cy.get('button[type="submit"]').click();
  if (expectedUrl) {
    cy.url().should('include', expectedUrl);
  }
});

/**
 * Check for alert messages
 * @param {string} type - 'success', 'error', 'warning', 'info'
 * @param {string} message - expected message content
 */
Cypress.Commands.add('checkAlert', (type, message) => {
  const alertClass = `.alert-${type === 'error' ? 'danger' : type}`;
  cy.get(alertClass).should('be.visible').and('contain', message);
});

/**
 * Search functionality
 * @param {string} searchTerm - term to search for
 * @param {string} searchField - CSS selector for search input (optional)
 */
Cypress.Commands.add('search', (searchTerm, searchField = 'input[name="search"]') => {
  cy.get(searchField).clear().type(searchTerm);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', `search=${encodeURIComponent(searchTerm)}`);
});

/**
 * Apply filters
 * @param {Object} filters - filter field-value pairs
 */
Cypress.Commands.add('applyFilters', (filters) => {
  Object.entries(filters).forEach(([field, value]) => {
    cy.get(`select[name="${field}"]`).select(value);
  });
  cy.get('button[type="submit"]').click();
});

/**
 * Check table or card data
 * @param {string} selector - CSS selector for container
 * @param {string} expectedContent - content that should exist
 */
Cypress.Commands.add('checkContent', (selector, expectedContent) => {
  cy.get(selector).should('contain', expectedContent);
});

/**
 * Wait for page to load completely
 */
Cypress.Commands.add('waitForLoad', () => {
  cy.get('body').should('be.visible');
  cy.get('.loading, .spinner').should('not.exist');
});

/**
 * Generate test data
 * @param {string} type - 'user', 'film', etc.
 * @returns {Object} test data object
 */
Cypress.Commands.add('generateTestData', (type) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);

  const testData = {
    user: {
      first_name: `Test${random}`,
      last_name: `User${random}`,
      email: `test.user.${timestamp}@example.com`,
      username: `testuser${random}`
    },
    film: {
      title: `Test Film ${timestamp}`,
      description: `A test film created by Cypress at ${new Date().toISOString()}`,
      release_year: '2023',
      rental_rate: '4.99',
      rental_duration: '7',
      replacement_cost: '19.99'
    },
    staff: {
      first_name: `Staff${random}`,
      last_name: `Member${random}`,
      email: `staff.${timestamp}@example.com`
    }
  };

  return cy.wrap(testData[type]);
});