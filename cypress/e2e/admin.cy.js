describe('Admin Features', function() {
  beforeEach(function() {
    // Login as admin user
    cy.visit('/auth/login');
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/auth/login');
  });

  describe('Film Management', function() {
    it('should display admin films page', function() {
      cy.visit('/admin/films');
      
      // Check page structure
      cy.get('h1').should('contain', 'Film Management');
      
      // Check action buttons
      cy.get('a').contains('Add New Film').should('be.visible');
      cy.get('a').contains('Manage Inventory').should('be.visible');
      
      // Check filters
      cy.get('select[name="category"]').should('be.visible');
      cy.get('select[name="availability"]').should('be.visible');
      cy.get('input[name="search"]').should('be.visible');
    });

    it('should filter films by availability', function() {
      cy.visit('/admin/films');
      
      // Filter by available films
      cy.get('select[name="availability"]').select('available');
      cy.get('button[type="submit"]').click();
      
      // Should update URL
      cy.url().should('include', 'availability=available');
    });

    it('should search films by title', function() {
      cy.visit('/admin/films');
      
      // Search for films
      cy.get('input[name="search"]').type('action');
      cy.get('button[type="submit"]').click();
      
      // Should update URL and show results
      cy.url().should('include', 'search=action');
    });

    it('should navigate to add new film page', function() {
      cy.visit('/admin/films');
      
      // Click add new film button
      cy.get('a').contains('Add New Film').click();
      cy.url().should('include', '/admin/films/new');
    });

    it('should show film inventory counts', function() {
      cy.visit('/admin/films');
      
      // Check film cards show inventory information
      cy.get('.card').first().within(() => {
        cy.get('small').should('contain', 'copies');
      });
    });

    it('should allow adding film copies', function() {
      cy.visit('/admin/films');
      
      // Look for add copy buttons
      cy.get('body').then(($body) => {
        const addCopyButtons = $body.find('button:contains("Add Copy")');
        if (addCopyButtons.length > 0) {
          cy.get('button').contains('Add Copy').first().click();
          
          // Should show success message or update count
          cy.get('body').should('contain', 'success').or('contain', 'added');
        }
      });
    });

    it('should show film performance metrics', function() {
      cy.visit('/admin/films');
      
      // Check for performance indicators
      cy.get('.card').first().within(() => {
        cy.get('body').should('contain', 'Rental Rate').or('contain', 'Revenue');
      });
    });
  });

  describe('New Film Creation', function() {
    it('should display new film form', function() {
      cy.visit('/admin/films/new');
      
      // Check form structure
      cy.get('h1').should('contain', 'Add New Film');
      cy.get('form').should('be.visible');
      
      // Check form fields
      cy.get('input[name="title"]').should('be.visible');
      cy.get('textarea[name="description"]').should('be.visible');
      cy.get('input[name="release_year"]').should('be.visible');
      cy.get('select[name="language_id"]').should('be.visible');
      cy.get('select[name="category_id"]').should('be.visible');
      cy.get('input[name="rental_rate"]').should('be.visible');
      cy.get('input[name="rental_duration"]').should('be.visible');
      cy.get('input[name="replacement_cost"]').should('be.visible');
    });

    it('should validate required fields', function() {
      cy.visit('/admin/films/new');
      
      // Try to submit empty form
      cy.get('button[type="submit"]').click();
      
      // Should show validation messages
      cy.get('input[name="title"]').should('have.attr', 'required');
    });

    it('should create new film with valid data', function() {
      cy.visit('/admin/films/new');
      
      // Fill form with valid data
      cy.get('input[name="title"]').type('Test Film ' + Date.now());
      cy.get('textarea[name="description"]').type('A test film for Cypress testing');
      cy.get('input[name="release_year"]').type('2023');
      cy.get('input[name="rental_rate"]').type('4.99');
      cy.get('input[name="rental_duration"]').type('7');
      cy.get('input[name="replacement_cost"]').type('19.99');
      
      // Select category and language
      cy.get('select[name="category_id"] option').then($options => {
        if ($options.length > 1) {
          cy.get('select[name="category_id"]').select($options.eq(1).val());
        }
      });
      
      cy.get('select[name="language_id"] option').then($options => {
        if ($options.length > 1) {
          cy.get('select[name="language_id"]').select($options.eq(1).val());
        }
      });
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should redirect or show success
      cy.url().should('not.include', '/new');
    });
  });

  describe('Staff Management', function() {
    it('should display admin staff page', function() {
      cy.visit('/admin/staff');
      
      // Check page structure
      cy.get('h1').should('contain', 'Staff Management');
      
      // Check action buttons
      cy.get('a').contains('Add New Staff').should('be.visible');
      
      // Check filters
      cy.get('select[name="role"]').should('be.visible');
      cy.get('select[name="status"]').should('be.visible');
    });

    it('should filter staff by role', function() {
      cy.visit('/admin/staff');
      
      // Filter by staff role
      cy.get('select[name="role"]').select('staff');
      cy.get('button[type="submit"]').click();
      
      // Should update URL
      cy.url().should('include', 'role=staff');
    });

    it('should show staff performance metrics', function() {
      cy.visit('/admin/staff');
      
      // Check staff cards show performance data
      cy.get('.card').first().within(() => {
        cy.get('body').should('contain', 'Offers').or('contain', 'Selections');
      });
    });

    it('should navigate to add new staff page', function() {
      cy.visit('/admin/staff');
      
      // Click add new staff button
      cy.get('a').contains('Add New Staff').click();
      cy.url().should('include', '/admin/staff/new');
    });
  });

  describe('New Staff Creation', function() {
    it('should display new staff form', function() {
      cy.visit('/admin/staff/new');
      
      // Check form structure
      cy.get('h1').should('contain', 'Add New Staff Member');
      cy.get('form').should('be.visible');
      
      // Check form fields
      cy.get('input[name="first_name"]').should('be.visible');
      cy.get('input[name="last_name"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('select[name="role"]').should('be.visible');
      cy.get('select[name="store_id"]').should('be.visible');
    });

    it('should validate email format', function() {
      cy.visit('/admin/staff/new');
      
      // Fill form with invalid email
      cy.get('input[name="first_name"]').type('Test');
      cy.get('input[name="last_name"]').type('User');
      cy.get('input[name="email"]').type('invalid-email');
      
      cy.get('button[type="submit"]').click();
      
      // Should show validation message
      cy.get('input[name="email"]:invalid').should('exist');
    });

    it('should create new staff with valid data', function() {
      cy.visit('/admin/staff/new');
      
      const timestamp = Date.now();
      
      // Fill form with valid data
      cy.get('input[name="first_name"]').type('Test');
      cy.get('input[name="last_name"]').type('Staff');
      cy.get('input[name="email"]').type(`test.staff.${timestamp}@moviesexpressrentals.com`);
      
      // Select role and store
      cy.get('select[name="role"] option').then($options => {
        if ($options.length > 1) {
          cy.get('select[name="role"]').select($options.eq(1).val());
        }
      });
      
      cy.get('select[name="store_id"] option').then($options => {
        if ($options.length > 1) {
          cy.get('select[name="store_id"]').select($options.eq(1).val());
        }
      });
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should redirect or show success
      cy.url().should('not.include', '/new');
    });
  });

  describe('Offers Management', function() {
    it('should display admin offers page', function() {
      cy.visit('/admin/offers');
      
      // Check page structure
      cy.get('h1').should('contain', 'Offer Management');
      
      // Check action buttons
      cy.get('a').contains('Create New Offer').should('be.visible');
      
      // Check filters
      cy.get('select[name="category"]').should('be.visible');
      cy.get('select[name="status"]').should('be.visible');
    });

    it('should filter offers by status', function() {
      cy.visit('/admin/offers');
      
      // Filter by active offers
      cy.get('select[name="status"]').select('active');
      cy.get('button[type="submit"]').click();
      
      // Should update URL
      cy.url().should('include', 'status=active');
    });

    it('should show offer performance metrics', function() {
      cy.visit('/admin/offers');
      
      // Check offer cards show metrics
      cy.get('.card').first().within(() => {
        cy.get('body').should('contain', 'Selections').or('contain', 'Discount');
      });
    });

    it('should allow deactivating offers', function() {
      cy.visit('/admin/offers');
      
      // Look for deactivate buttons
      cy.get('body').then(($body) => {
        const deactivateButtons = $body.find('button:contains("Deactivate")');
        if (deactivateButtons.length > 0) {
          cy.get('button').contains('Deactivate').first().click();
          
          // Should show confirmation or success
          cy.get('body').should('contain', 'deactivated').or('contain', 'success');
        }
      });
    });
  });

  describe('Admin Navigation and Access', function() {
    it('should show admin navigation', function() {
      cy.visit('/admin/films');
      
      // Check admin navigation
      cy.get('.navbar').should('contain', 'Admin');
      cy.get('.navbar').should('contain', 'Films');
      cy.get('.navbar').should('contain', 'Reports');
      cy.get('.navbar').should('not.contain', 'Customer Dashboard');
    });

    it('should have access to all areas', function() {
      // Test access to reports
      cy.visit('/reports');
      cy.url().should('include', '/reports');
      
      // Test access to films
      cy.visit('/films');
      cy.url().should('include', '/films');
    });

    it('should show admin-specific content', function() {
      cy.visit('/admin/films');
      
      // Should show admin-only functionality
      cy.get('body').should('contain', 'Add New Film');
      cy.get('body').should('contain', 'Manage Inventory');
    });
  });

  describe('Admin Dashboard Summary', function() {
    it('should display system statistics', function() {
      cy.visit('/admin/films');
      
      // Check for summary cards
      cy.get('.card').should('contain', 'Total Films').or('contain', 'Active Offers');
      cy.get('.card').should('contain', 'Total Staff').or('contain', 'System Stats');
    });

    it('should show quick action buttons', function() {
      cy.visit('/admin/films');
      
      // Check for quick actions
      cy.get('h6').contains('Quick Actions').should('be.visible');
      cy.get('a').contains('View Reports').should('be.visible');
      cy.get('a').contains('Manage Staff').should('be.visible');
    });
  });
});