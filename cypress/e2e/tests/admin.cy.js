describe('Admin Features', () => {
  beforeEach(() => {
    cy.login('admin');
  });

  describe('Film Management', () => {
    beforeEach(() => {
      cy.navigateTo('admin-films');
    });

    it('displays film management page with proper structure', () => {
      cy.get('h1').should('contain', 'Film Management');
      cy.checkContent('body', 'Add New Film');
      cy.checkContent('body', 'Manage Inventory');
      
      // Check filters are available
      cy.get('select[name="category"]').should('be.visible');
      cy.get('select[name="availability"]').should('be.visible');
      cy.get('input[name="search"]').should('be.visible');
    });

    it('filters films by availability', () => {
      cy.applyFilters({ availability: 'available' });
      cy.url().should('include', 'availability=available');
    });

    it('searches films by title', () => {
      cy.search('action');
    });

    it('navigates to new film creation', () => {
      cy.get('a').contains('Add New Film').click();
      cy.url().should('include', '/admin/films/new');
    });

    it('shows film inventory information', () => {
      cy.get('.card').first().within(() => {
        cy.checkContent('small', 'copies');
      });
    });
  });

  describe('Film Creation', () => {
    beforeEach(() => {
      cy.visit('/admin/films/new');
    });

    it('displays new film form with required fields', () => {
      cy.get('h1').should('contain', 'Add New Film');
      
      const requiredFields = [
        'input[name="title"]',
        'textarea[name="description"]',
        'input[name="release_year"]',
        'select[name="language_id"]',
        'select[name="category_id"]',
        'input[name="rental_rate"]',
        'input[name="rental_duration"]',
        'input[name="replacement_cost"]'
      ];

      requiredFields.forEach(field => {
        cy.get(field).should('be.visible');
      });
    });

    it('validates required fields', () => {
      cy.submitForm();
      cy.get('input[name="title"]').should('have.attr', 'required');
    });

    it('creates new film with valid data', () => {
      cy.generateTestData('film').then(filmData => {
        cy.fillForm(filmData);
        
        // Select dropdowns
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
        
        cy.submitForm();
        cy.url().should('not.include', '/new');
      });
    });
  });

  describe('Staff Management', () => {
    beforeEach(() => {
      cy.navigateTo('admin-staff');
    });

    it('displays staff management interface', () => {
      cy.get('h1').should('contain', 'Staff Management');
      cy.checkContent('body', 'Add New Staff');
      
      // Check filters
      cy.get('select[name="role"]').should('be.visible');
      cy.get('select[name="status"]').should('be.visible');
    });

    it('filters staff by role', () => {
      cy.applyFilters({ role: 'staff' });
      cy.url().should('include', 'role=staff');
    });

    it('navigates to new staff creation', () => {
      cy.get('a').contains('Add New Staff').click();
      cy.url().should('include', '/admin/staff/new');
    });
  });

  describe('Staff Creation', () => {
    beforeEach(() => {
      cy.visit('/admin/staff/new');
    });

    it('displays new staff form', () => {
      cy.get('h1').should('contain', 'Add New Staff Member');
      
      const requiredFields = [
        'input[name="first_name"]',
        'input[name="last_name"]',
        'input[name="email"]',
        'select[name="role"]',
        'select[name="store_id"]'
      ];

      requiredFields.forEach(field => {
        cy.get(field).should('be.visible');
      });
    });

    it('validates email format', () => {
      cy.fillForm({
        first_name: 'Test',
        last_name: 'User',
        email: 'invalid-email'
      });
      
      cy.submitForm();
      cy.get('input[name="email"]:invalid').should('exist');
    });

    it('creates new staff with valid data', () => {
      cy.generateTestData('staff').then(staffData => {
        cy.fillForm(staffData);
        
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
        
        cy.submitForm();
        cy.url().should('not.include', '/new');
      });
    });
  });

  describe('Offers Management', () => {
    beforeEach(() => {
      cy.navigateTo('admin-offers');
    });

    it('displays offers management interface', () => {
      cy.get('h1').should('contain', 'Offer Management');
      cy.checkContent('body', 'Create New Offer');
      
      cy.get('select[name="category"]').should('be.visible');
      cy.get('select[name="status"]').should('be.visible');
    });

    it('filters offers by status', () => {
      cy.applyFilters({ status: 'active' });
      cy.url().should('include', 'status=active');
    });
  });

  describe('Admin Access and Navigation', () => {
    it('shows admin navigation and access', () => {
      cy.navigateTo('admin-films');
      
      cy.get('.navbar')
        .should('contain', 'Admin')
        .and('contain', 'Films')
        .and('contain', 'Reports')
        .and('not.contain', 'Customer Dashboard');
    });

    it('has access to all admin areas', () => {
      const adminRoutes = ['reports', 'films'];
      
      adminRoutes.forEach(route => {
        cy.navigateTo(route);
      });
    });

    it('displays admin-specific functionality', () => {
      cy.navigateTo('admin-films');
      cy.checkContent('body', 'Add New Film');
      cy.checkContent('body', 'Manage Inventory');
    });
  });

  describe('Dashboard and Statistics', () => {
    it('displays system statistics and quick actions', () => {
      cy.navigateTo('admin-films');
      
      // Check for summary information
      cy.get('.card').should('exist');
      
      // Quick actions should be available
      cy.get('body').then($body => {
        if ($body.find('h6:contains("Quick Actions")').length) {
          cy.checkContent('body', 'View Reports');
          cy.checkContent('body', 'Manage Staff');
        }
      });
    });
  });
});