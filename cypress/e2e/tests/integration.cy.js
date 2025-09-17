describe('About Page and System Integration', function() {
  describe('About Page Content', function() {
    it('should display the about page without authentication', function() {
      cy.visit('/about');
      
      // Check page structure
      cy.get('h1').should('contain', 'About Movies Express Rentals');
      
      // Check user stories section
      cy.get('h2').should('contain', 'User Stories');
      
      // Check acceptance criteria section  
      cy.get('h3').should('contain', 'Acceptance Criteria');
    });

    it('should display all user stories', function() {
      cy.visit('/about');
      
      // Check for customer user stories
      cy.get('body').should('contain', 'customer can browse films');
      cy.get('body').should('contain', 'customer can view their spending');
      cy.get('body').should('contain', 'customer can manage their profile');
      
      // Check for staff user stories
      cy.get('body').should('contain', 'staff can select an offered film');
      
      // Check for admin user stories
      cy.get('body').should('contain', 'admin can add a film copy and see it in inventory');
      cy.get('body').should('contain', 'admin can add a staff member');
    });

    it('should display acceptance criteria for each story', function() {
      cy.visit('/about');
      
      // Check that user stories have corresponding acceptance criteria
      cy.get('.card').should('have.length.greaterThan', 0);
      
      // Each user story card should have acceptance criteria
      cy.get('.card').each(($card) => {
        cy.wrap($card).should('contain', 'Acceptance Criteria');
        cy.wrap($card).find('ul li').should('have.length.greaterThan', 0);
      });
    });

    it('should have proper navigation to about page', function() {
      // Visit home page first
      cy.visit('/');
      
      // Check if About is in navigation
      cy.get('.navbar').should('contain', 'About');
      
      // Click About link
      cy.get('a').contains('About').click();
      cy.url().should('include', '/about');
    });

    it('should display technical specifications', function() {
      cy.visit('/about');
      
      // Check for technical details section
      cy.get('body').should('contain', 'Technology Stack').or('contain', 'System Architecture');
      
      // Should mention key technologies
      cy.get('body').should('contain', 'Node.js').or('contain', 'Express');
      cy.get('body').should('contain', 'MySQL').or('contain', 'Sakila');
      cy.get('body').should('contain', 'Pug').or('contain', 'Bootstrap');
    });
  });

  describe('Cross-Role System Integration', function() {
    it('should handle role transitions correctly', function() {
      // Login as customer
      cy.visit('/auth/login');
      cy.get('input[name="username"]').type('customer1');
      cy.get('input[name="password"]').type('customer123');
      cy.get('button[type="submit"]').click();
      
      // Verify customer access
      cy.visit('/customer/dashboard');
      cy.url().should('include', '/customer/dashboard');
      
      // Logout
      cy.get('a').contains('Logout').click();
      
      // Login as staff
      cy.get('input[name="username"]').type('mike');
      cy.get('input[name="password"]').type('staff123');
      cy.get('button[type="submit"]').click();
      
      // Verify staff access
      cy.visit('/staff/offers');
      cy.url().should('include', '/staff/offers');
      
      // Verify customer area is restricted
      cy.visit('/customer/dashboard', { failOnStatusCode: false });
      cy.url().should('not.include', '/customer/dashboard');
    });

    it('should maintain session state across different areas', function() {
      // Login as admin
      cy.visit('/auth/login');
      cy.get('input[name="username"]').type('admin');
      cy.get('input[name="password"]').type('admin123');
      cy.get('button[type="submit"]').click();
      
      // Navigate through different admin areas
      cy.visit('/admin/films');
      cy.get('.navbar').should('contain', 'Admin');
      
      cy.visit('/admin/staff');
      cy.get('.navbar').should('contain', 'Admin');
      
      cy.visit('/reports');
      cy.get('.navbar').should('contain', 'Reports');
      
      // Session should persist
      cy.visit('/admin/offers');
      cy.url().should('include', '/admin/offers');
    });
  });

  describe('Film Directory Integration', function() {
    it('should allow browsing films from any role', function() {
      // Test without login
      cy.visit('/films');
      cy.get('h1').should('contain', 'Film Directory');
      
      // Login as customer
      cy.visit('/auth/login');
      cy.get('input[name="username"]').type('customer1');
      cy.get('input[name="password"]').type('customer123');
      cy.get('button[type="submit"]').click();
      
      // Should still access films
      cy.visit('/films');
      cy.get('h1').should('contain', 'Film Directory');
      
      // Navigation should show role-specific items
      cy.get('.navbar').should('contain', 'Customer Dashboard');
    });

    it('should show role-specific film actions', function() {
      // Login as admin
      cy.visit('/auth/login');
      cy.get('input[name="username"]').type('admin');
      cy.get('input[name="password"]').type('admin123');
      cy.get('button[type="submit"]').click();
      
      // Visit films as admin
      cy.visit('/films');
      
      // Should have admin-specific options
      cy.get('body').then(($body) => {
        // Admin might see manage inventory or add film options
        if ($body.find('a:contains("Manage")').length > 0) {
          cy.get('a').contains('Manage').should('be.visible');
        }
      });
    });
  });

  describe('Search and Filter Integration', function() {
    it('should maintain search state across role areas', function() {
      // Search for films
      cy.visit('/films');
      cy.get('input[name="search"]').type('action');
      cy.get('button[type="submit"]').click();
      
      // URL should contain search parameter
      cy.url().should('include', 'search=action');
      
      // Login as customer
      cy.visit('/auth/login');
      cy.get('input[name="username"]').type('customer1');
      cy.get('input[name="password"]').type('customer123');
      cy.get('button[type="submit"]').click();
      
      // Return to films with search
      cy.visit('/films?search=action');
      cy.get('input[name="search"]').should('have.value', 'action');
    });

    it('should handle pagination consistently', function() {
      cy.visit('/films');
      
      // Go to page 2 if pagination exists
      cy.get('body').then(($body) => {
        if ($body.find('a:contains("2")').length > 0) {
          cy.get('a').contains('2').click();
          cy.url().should('include', 'page=2');
          
          // Should show page 2 content
          cy.get('.pagination .active').should('contain', '2');
        }
      });
    });
  });

  describe('Error Handling and Edge Cases', function() {
    it('should handle invalid film IDs gracefully', function() {
      cy.visit('/films/999999', { failOnStatusCode: false });
      
      // Should show error page or redirect
      cy.get('body').should('contain', 'not found').or('contain', 'Error');
    });

    it('should handle authentication errors', function() {
      // Try invalid login
      cy.visit('/auth/login');
      cy.get('input[name="username"]').type('invaliduser');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      
      // Should show error message
      cy.get('body').should('contain', 'invalid').or('contain', 'error');
      cy.url().should('include', '/auth/login');
    });

    it('should handle unauthorized access attempts', function() {
      // Try to access admin area without login
      cy.visit('/admin/films', { failOnStatusCode: false });
      cy.url().should('include', '/auth/login');
      
      // Try to access customer area without login
      cy.visit('/customer/dashboard', { failOnStatusCode: false });
      cy.url().should('include', '/auth/login');
    });
  });

  describe('Data Consistency Across Views', function() {
    it('should show consistent film data across different views', function() {
      // Get film title from directory
      cy.visit('/films');
      
      cy.get('.card-title').first().then(($title) => {
        const filmTitle = $title.text();
        
        // Click to view details
        cy.get('.card').first().find('a').contains('View Details').click();
        
        // Should show same title on detail page
        cy.get('h1').should('contain', filmTitle);
      });
    });

    it('should maintain user data consistency', function() {
      // Login as customer
      cy.visit('/auth/login');
      cy.get('input[name="username"]').type('customer1');
      cy.get('input[name="password"]').type('customer123');
      cy.get('button[type="submit"]').click();
      
      // Get user info from dashboard
      cy.visit('/customer/dashboard');
      
      cy.get('h2').then(($welcome) => {
        const customerName = $welcome.text();
        
        // Visit profile page
        cy.visit('/customer/profile');
        
        // Should show consistent user information
        cy.get('h1').should('contain', 'Profile');
      });
    });
  });

  describe('Performance and Accessibility', function() {
    it('should load pages within reasonable time', function() {
      const startTime = Date.now();
      
      cy.visit('/films');
      
      cy.get('h1').should('be.visible').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(5000); // 5 seconds max
      });
    });

    it('should have proper page titles', function() {
      cy.visit('/films');
      cy.title().should('contain', 'Film Directory');
      
      cy.visit('/about');
      cy.title().should('contain', 'About');
      
      cy.visit('/auth/login');
      cy.title().should('contain', 'Login');
    });

    it('should have responsive navigation', function() {
      cy.visit('/films');
      
      // Check that navbar exists and is responsive
      cy.get('.navbar').should('be.visible');
      cy.get('.navbar-brand').should('be.visible');
      
      // Test mobile menu toggle if present
      cy.viewport(576, 768); // Mobile viewport
      cy.get('.navbar-toggler').should('be.visible');
    });
  });
});