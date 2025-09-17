describe('Staff Features', function() {
  beforeEach(function() {
    // Login as staff member
    cy.visit('/auth/login');
    cy.get('input[name="username"]').type('mike');
    cy.get('input[name="password"]').type('staff123');
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/auth/login');
  });

  describe('Staff Offers', function() {
    it('should display staff offers page', function() {
      cy.visit('/staff/offers');
      
      // Check page structure
      cy.get('h1').should('contain', 'Staff Film Offers');
      
      // Check filters
      cy.get('select[name="category"]').should('be.visible');
      cy.get('select[name="status"]').should('be.visible');
      cy.get('select[name="sort"]').should('be.visible');
      cy.get('button[type="submit"]').should('contain', 'Apply Filters');
    });

    it('should filter offers by status', function() {
      cy.visit('/staff/offers');
      
      // Filter by active status
      cy.get('select[name="status"]').select('active');
      cy.get('button[type="submit"]').click();
      
      // Should update URL with status parameter
      cy.url().should('include', 'status=active');
    });

    it('should filter offers by category', function() {
      cy.visit('/staff/offers');
      
      // Get first available category option and select it
      cy.get('select[name="category"] option').then($options => {
        if ($options.length > 1) {
          const categoryValue = $options.eq(1).val();
          cy.get('select[name="category"]').select(categoryValue);
          cy.get('button[type="submit"]').click();
          
          // Should update URL with category parameter
          cy.url().should('include', 'category=');
        }
      });
    });

    it('should allow staff to select an offered film', function() {
      cy.visit('/staff/offers');
      
      // Look for active offers with select buttons
      cy.get('body').then(($body) => {
        const selectButtons = $body.find('button:contains("Select Offer")');
        if (selectButtons.length > 0) {
          cy.get('button').contains('Select Offer').first().click();
          
          // Should show success message or redirect
          cy.get('body').should('contain', 'success').or('contain', 'selected');
        }
      });
    });

    it('should show staff member selected offers', function() {
      cy.visit('/staff/offers');
      
      // Check if there's a "My Selected Offers" section
      cy.get('body').then(($body) => {
        if ($body.find('h5:contains("My Selected Offers")').length > 0) {
          cy.get('h5').contains('My Selected Offers').should('be.visible');
          cy.get('.badge').contains('Selected').should('be.visible');
        }
      });
    });

    it('should display offer details correctly', function() {
      cy.visit('/staff/offers');
      
      // Check offer cards have required information
      cy.get('.card').first().within(() => {
        cy.get('.card-title').should('be.visible');
        cy.get('.badge').should('be.visible'); // Status or discount badge
      });
    });
  });

  describe('Staff Selections Management', function() {
    it('should display staff selections page', function() {
      cy.visit('/staff/selections');
      
      // Check page structure
      cy.get('h1').should('contain', 'My Film Selections');
      
      // Check filter options
      cy.get('select[name="status"]').should('be.visible');
      cy.get('select[name="sort"]').should('be.visible');
    });

    it('should show selection statistics', function() {
      cy.visit('/staff/selections');
      
      // Check summary cards
      cy.get('.card').should('contain', 'Total Selections').or('contain', 'Active Offers');
      cy.get('.card').should('contain', 'Total Savings').or('contain', 'Expiring Soon');
    });

    it('should filter selections by status', function() {
      cy.visit('/staff/selections');
      
      // Filter by active status
      cy.get('select[name="status"]').select('active');
      cy.get('button[type="submit"]').click();
      
      // Should update URL
      cy.url().should('include', 'status=active');
    });

    it('should allow removing selections', function() {
      cy.visit('/staff/selections');
      
      // Look for remove buttons
      cy.get('body').then(($body) => {
        const removeButtons = $body.find('button:contains("Remove")');
        if (removeButtons.length > 0) {
          cy.get('button').contains('Remove').first().click();
          
          // Should show success message
          cy.get('body').should('contain', 'removed').or('contain', 'success');
        }
      });
    });
  });

  describe('Staff Navigation and Access', function() {
    it('should show staff-specific navigation', function() {
      cy.visit('/staff/offers');
      
      // Check staff navigation
      cy.get('.navbar').should('contain', 'Staff Offers');
      cy.get('.navbar').should('contain', 'Films');
      cy.get('.navbar').should('not.contain', 'Customer Dashboard');
      cy.get('.navbar').should('not.contain', 'Admin');
    });

    it('should have access to reports if manager', function() {
      // Note: This test depends on the user being a manager
      // Staff members might not have report access
      cy.visit('/reports', { failOnStatusCode: false });
      
      // If redirected, that's expected for regular staff
      // If accessible, should show reports page
      cy.url().then((url) => {
        if (!url.includes('/auth/login')) {
          cy.get('h1').should('contain', 'Reports');
        }
      });
    });

    it('should restrict access to admin areas', function() {
      // Try to access admin area
      cy.visit('/admin/films', { failOnStatusCode: false });
      cy.url().should('include', '/auth/login').or('not.include', '/admin');
      
      // Try to access admin staff management
      cy.visit('/admin/staff', { failOnStatusCode: false });
      cy.url().should('include', '/auth/login').or('not.include', '/admin');
    });

    it('should restrict access to customer areas', function() {
      // Try to access customer dashboard
      cy.visit('/customer/dashboard', { failOnStatusCode: false });
      cy.url().should('include', '/auth/login').or('not.include', '/customer');
    });
  });

  describe('Staff Quick Actions', function() {
    it('should have quick action buttons', function() {
      cy.visit('/staff/offers');
      
      // Check for quick actions section
      cy.get('h6').contains('Quick Actions').should('be.visible');
      cy.get('a').contains('Browse Films').should('be.visible');
      cy.get('a').contains('View Reports').should('be.visible').or('not.exist');
    });

    it('should navigate to films from quick actions', function() {
      cy.visit('/staff/offers');
      
      // Click browse films
      cy.get('a').contains('Browse Films').click();
      cy.url().should('include', '/films');
    });
  });
});