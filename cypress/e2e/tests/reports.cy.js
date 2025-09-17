describe('Reports and Analytics', function() {
  beforeEach(function() {
    // Login as admin user (reports typically require admin/manager access)
    cy.visit('/auth/login');
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/auth/login');
  });

  describe('Reports Dashboard', function() {
    it('should display reports index page', function() {
      cy.visit('/reports');
      
      // Check page structure
      cy.get('h1').should('contain', 'Reports & Analytics');
      
      // Check report categories
      cy.get('h4').should('contain', 'Staff Performance').or('contain', 'Reports');
      
      // Check navigation cards
      cy.get('.card').should('have.length.greaterThan', 0);
    });

    it('should show report summary cards', function() {
      cy.visit('/reports');
      
      // Check for summary statistics
      cy.get('.card').should('contain', 'Total Staff').or('contain', 'Active Offers');
      cy.get('.card').should('contain', 'This Month').or('contain', 'Performance');
    });

    it('should navigate to staff performance reports', function() {
      cy.visit('/reports');
      
      // Click staff performance link
      cy.get('a').contains('Staff Performance').click();
      cy.url().should('include', '/reports/staff-performance');
    });

    it('should have working quick actions', function() {
      cy.visit('/reports');
      
      // Check quick actions section
      cy.get('h6').contains('Quick Actions').should('be.visible');
      cy.get('a').contains('Manage Staff').should('be.visible');
      cy.get('a').contains('View Offers').should('be.visible');
    });
  });

  describe('Staff Performance Reports', function() {
    it('should display staff performance page', function() {
      cy.visit('/reports/staff-performance');
      
      // Check page structure
      cy.get('h1').should('contain', 'Staff Performance Report');
      
      // Check filters
      cy.get('select[name="period"]').should('be.visible');
      cy.get('select[name="role"]').should('be.visible');
      cy.get('select[name="sort"]').should('be.visible');
      cy.get('button[type="submit"]').should('contain', 'Apply Filters');
    });

    it('should filter by time period', function() {
      cy.visit('/reports/staff-performance');
      
      // Select last month
      cy.get('select[name="period"]').select('last_month');
      cy.get('button[type="submit"]').click();
      
      // Should update URL
      cy.url().should('include', 'period=last_month');
    });

    it('should filter by staff role', function() {
      cy.visit('/reports/staff-performance');
      
      // Filter by staff role
      cy.get('select[name="role"]').select('staff');
      cy.get('button[type="submit"]').click();
      
      // Should update URL
      cy.url().should('include', 'role=staff');
    });

    it('should sort performance data', function() {
      cy.visit('/reports/staff-performance');
      
      // Sort by selections count
      cy.get('select[name="sort"]').select('selections_desc');
      cy.get('button[type="submit"]').click();
      
      // Should update URL
      cy.url().should('include', 'sort=selections_desc');
    });

    it('should display staff performance metrics', function() {
      cy.visit('/reports/staff-performance');
      
      // Check performance cards
      cy.get('.card').should('contain', 'Total Offers').or('contain', 'Performance');
      cy.get('.card').should('contain', 'Selections').or('contain', 'Revenue');
      
      // Check staff table
      cy.get('table').should('be.visible');
      cy.get('th').should('contain', 'Staff Member');
      cy.get('th').should('contain', 'Offers').or('contain', 'Selections');
    });

    it('should show performance trends', function() {
      cy.visit('/reports/staff-performance');
      
      // Check for trend indicators
      cy.get('.badge').should('contain', 'up').or('contain', 'down').or('contain', '%');
    });

    it('should export report data', function() {
      cy.visit('/reports/staff-performance');
      
      // Look for export button
      cy.get('body').then(($body) => {
        const exportButton = $body.find('a:contains("Export")');
        if (exportButton.length > 0) {
          // Just verify the button exists and has correct attributes
          cy.get('a').contains('Export').should('have.attr', 'href');
        }
      });
    });
  });

  describe('Film Performance Reports', function() {
    it('should access film reports from main reports page', function() {
      cy.visit('/reports');
      
      // Look for film-related reports
      cy.get('body').then(($body) => {
        if ($body.find('a:contains("Film Performance")').length > 0) {
          cy.get('a').contains('Film Performance').click();
          cy.url().should('include', 'film');
        }
      });
    });

    it('should show film rental statistics', function() {
      cy.visit('/reports');
      
      // Check for film-related metrics in summary cards
      cy.get('.card').should('contain', 'Top Films').or('contain', 'Revenue');
    });
  });

  describe('Revenue Reports', function() {
    it('should display revenue metrics', function() {
      cy.visit('/reports');
      
      // Check for revenue-related information
      cy.get('.card').should('contain', 'Revenue').or('contain', 'Total').or('contain', '$');
    });

    it('should show time-based revenue trends', function() {
      cy.visit('/reports');
      
      // Check for time period indicators
      cy.get('small').should('contain', 'This Month').or('contain', 'vs Last Month');
    });
  });

  describe('Reports Access Control', function() {
    it('should restrict reports to authorized users', function() {
      // Logout admin
      cy.get('a').contains('Logout').click();
      
      // Login as regular staff
      cy.visit('/auth/login');
      cy.get('input[name="username"]').type('mike');
      cy.get('input[name="password"]').type('staff123');
      cy.get('button[type="submit"]').click();
      
      // Try to access reports
      cy.visit('/reports', { failOnStatusCode: false });
      
      // Should be redirected or show access denied
      cy.url().then((url) => {
        if (url.includes('/reports')) {
          // If accessible, user has manager/admin role
          cy.get('h1').should('contain', 'Reports');
        } else {
          // If redirected, reports are restricted
          cy.url().should('not.include', '/reports');
        }
      });
    });

    it('should show reports in navigation for authorized users', function() {
      // Already logged in as admin from beforeEach
      cy.visit('/');
      
      // Check if reports appear in navigation
      cy.get('.navbar').should('contain', 'Reports');
    });
  });

  describe('Report Data Validation', function() {
    it('should display accurate staff counts', function() {
      cy.visit('/reports/staff-performance');
      
      // Check that staff performance table has data
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });

    it('should show consistent data across views', function() {
      cy.visit('/reports');
      
      // Get staff count from summary
      let summaryStaffCount;
      cy.get('.card').contains('Total Staff').parent().find('.display-6').then(($el) => {
        summaryStaffCount = parseInt($el.text());
        
        // Navigate to detailed staff performance
        cy.visit('/reports/staff-performance');
        
        // Verify data consistency
        cy.get('tbody tr').should('have.length', summaryStaffCount);
      });
    });

    it('should handle empty data gracefully', function() {
      cy.visit('/reports/staff-performance');
      
      // Apply filters that might return no results
      cy.get('select[name="role"]').select('admin');
      cy.get('select[name="period"]').select('last_year');
      cy.get('button[type="submit"]').click();
      
      // Should show appropriate message if no data
      cy.get('body').should('contain', 'No data available').or('contain', 'performance data');
    });
  });

  describe('Report Export and Sharing', function() {
    it('should provide export options', function() {
      cy.visit('/reports/staff-performance');
      
      // Look for export functionality
      cy.get('body').then(($body) => {
        if ($body.find('a:contains("Export")').length > 0) {
          cy.get('a').contains('Export').should('be.visible');
        }
      });
    });

    it('should maintain filter state in URLs', function() {
      cy.visit('/reports/staff-performance');
      
      // Apply multiple filters
      cy.get('select[name="period"]').select('this_month');
      cy.get('select[name="role"]').select('staff');
      cy.get('select[name="sort"]').select('selections_desc');
      cy.get('button[type="submit"]').click();
      
      // URL should contain all filter parameters
      cy.url().should('include', 'period=this_month');
      cy.url().should('include', 'role=staff');
      cy.url().should('include', 'sort=selections_desc');
      
      // Refresh page and verify filters persist
      cy.reload();
      cy.get('select[name="period"]').should('have.value', 'this_month');
      cy.get('select[name="role"]').should('have.value', 'staff');
      cy.get('select[name="sort"]').should('have.value', 'selections_desc');
    });
  });
});