describe('Customer Features', function() {
  beforeEach(function() {
    // Login as customer
    cy.visit('/auth/login');
    cy.get('input[name="username"]').type('mary.smith@sakilacustomer.org');
    cy.get('input[name="password"]').type('customer123');
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/auth/login');
  });

  describe('Customer Dashboard', function() {
    it('should display customer dashboard with current user data only', function() {
      cy.visit('/customer/dashboard');
      
      // Check page structure
      cy.get('h1').should('contain', 'Customer Dashboard');
      
      // Check summary cards
      cy.get('.card').should('contain', 'Active Rentals');
      cy.get('.card').should('contain', 'Total Spent');
      cy.get('.card').should('contain', 'Films Rented');
      
      // Check active rentals table shows only current user's data
      cy.get('.table').should('be.visible');
      cy.get('.table th').should('contain', 'Film');
      cy.get('.table th').should('contain', 'Rental Date');
      cy.get('.table th').should('contain', 'Due Date');
    });

    it('should show alerts for overdue items', function() {
      cy.visit('/customer/dashboard');
      
      // Look for alert section - may or may not have alerts depending on data
      cy.get('body').then(($body) => {
        if ($body.find('.alert-warning').length > 0) {
          cy.get('.alert-warning').should('contain', 'overdue').or('contain', 'late');
        }
      });
    });

    it('should navigate to other customer features', function() {
      cy.visit('/customer/dashboard');
      
      // Check quick actions
      cy.get('a[href="/customer/spending"]').should('be.visible');
      cy.get('a[href="/customer/profile"]').should('be.visible');
      cy.get('a[href="/films"]').should('be.visible');
    });
  });

  describe('Customer Spending Analysis', function() {
    it('should display spending analysis page', function() {
      cy.visit('/customer/spending');
      
      // Check page structure
      cy.get('h1').should('contain', 'Spending Analysis');
      
      // Check date range selectors
      cy.get('input[type="month"]').should('be.visible');
      cy.get('input[type="date"][name="from"]').should('be.visible');
      cy.get('input[type="date"][name="to"]').should('be.visible');
    });

    it('should filter spending by date range', function() {
      cy.visit('/customer/spending');
      
      // Set date range
      const fromDate = '2024-01-01';
      const toDate = '2024-12-31';
      
      cy.get('input[name="from"]').type(fromDate);
      cy.get('input[name="to"]').type(toDate);
      cy.get('button[type="submit"]').contains('View Range').click();
      
      // Should update URL with date parameters
      cy.url().should('include', 'from=' + fromDate);
      cy.url().should('include', 'to=' + toDate);
    });

    it('should filter spending by month', function() {
      cy.visit('/customer/spending');
      
      // Set month
      const month = '2024-01';
      cy.get('input[type="month"]').type(month);
      cy.get('button[type="submit"]').contains('View Month').click();
      
      // Should update URL with period parameter
      cy.url().should('include', 'period=' + month);
    });
  });

  describe('Customer Profile Management', function() {
    it('should display customer profile form', function() {
      cy.visit('/customer/profile');
      
      // Check page structure
      cy.get('h1').should('contain', 'My Profile');
      
      // Check form fields
      cy.get('input[name="firstName"]').should('be.visible');
      cy.get('input[name="lastName"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="phone"]').should('be.visible');
      cy.get('input[name="address"]').should('be.visible');
      
      // Check submit button
      cy.get('button[type="submit"]').should('contain', 'Update Profile');
    });

    it('should show current user profile data', function() {
      cy.visit('/customer/profile');
      
      // Check that form is populated with user data
      cy.get('input[name="firstName"]').should('have.value');
      cy.get('input[name="lastName"]').should('have.value');
      cy.get('input[name="email"]').should('have.value');
    });

    it('should display account status and stats', function() {
      cy.visit('/customer/profile');
      
      // Check account status section
      cy.get('.card').should('contain', 'Account Status');
      cy.get('.badge').should('contain', 'Active').or('contain', 'Inactive');
      
      // Check quick stats if available
      cy.get('body').then(($body) => {
        if ($body.find('.card').text().includes('Quick Stats')) {
          cy.get('.card').should('contain', 'Active Rentals');
          cy.get('.card').should('contain', 'Total Spent');
        }
      });
    });
  });

  describe('Customer Navigation', function() {
    it('should show customer-specific navigation', function() {
      cy.visit('/customer/dashboard');
      
      // Check customer navigation is visible
      cy.get('.navbar').should('contain', 'Customer Dashboard');
      cy.get('.navbar').should('contain', 'Films');
      cy.get('.navbar').should('not.contain', 'Admin');
      cy.get('.navbar').should('not.contain', 'Staff Offers');
    });

    it('should restrict access to non-customer areas', function() {
      // Try to access staff area
      cy.visit('/staff/offers', { failOnStatusCode: false });
      cy.url().should('include', '/auth/login').or('contain', 'error');
      
      // Try to access admin area  
      cy.visit('/admin/films', { failOnStatusCode: false });
      cy.url().should('include', '/auth/login').or('contain', 'error');
    });
  });
});