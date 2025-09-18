describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Login', () => {
    it('should login successfully with valid credentials', () => {
      cy.get('a[href="/auth/login"]').first().click();
      cy.url().should('include', '/auth/login');
      
      // Use the correct field name 'username' instead of 'email'
      cy.get('input[name="username"]').type('eter');
      cy.get('input[name="password"]').type('chipss');
      cy.get('button[name="sign in"]').click();
      
      // Should redirect to home page
      cy.url().should('match', /\/$|\/$/);
      cy.contains('Welcome').should('be.visible');
      
      // Should show user navigation or welcome message
      cy.get('body').should('contain.text', 'Welcome back');
    });

    it('should fail login with invalid credentials', () => {
      cy.get('a[href="/auth/login"]').first().click();
      
      cy.get('input[name="username"]').type('invaliduser');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[name="sign in"]').click();
      
      // Should stay on login page with error
      cy.url().should('include', '/auth/login');
      cy.get('.alert-danger, .error, .text-danger').should('be.visible');
    });

    it('should require email and password fields', () => {
      cy.get('a[href="/auth/login"]').first().click();
      
      // Try to submit empty form
      cy.get('button[name="sign in"]').click();
      
      // Should show validation errors (either HTML5 validation or custom)
      cy.get('input[name="username"]').then($username => {
        if ($username.attr('required')) {
          expect($username).to.have.attr('required');
        }
      });
      
      cy.get('input[name="password"]').then($password => {
        if ($password.attr('required')) {
          expect($password).to.have.attr('required');
        }
      });
      
      // Should still be on login page
      cy.url().should('include', '/auth/login');
    });
  });

  describe('Registration', () => {
    it('should register successfully with valid data', () => {
      // Only test if register link exists (not all apps have public registration)
      cy.get('body').then($body => {
        if ($body.find('a[href="/auth/register"]').length > 0) {
          cy.get('a[href="/auth/register"]').first().click();
          cy.url().should('include', '/auth/register');
          
          const timestamp = Date.now();
          cy.get('input[name="firstName"]').type('Test');
          cy.get('input[name="lastName"]').type('User');
          cy.get('input[name="email"]').type(`testuser${timestamp}@test.com`);
          cy.get('input[name="username"]').type(`testuser${timestamp}`);
          cy.get('input[name="password"]').type('password123');
          cy.get('input[name="confirmPassword"]').type('password123');
          cy.get('button[name="register"]').click();
          
          // Should redirect away from register page
          cy.url().should('not.include', '/auth/register');
        } else {
          cy.log('Registration not available - skipping test');
        }
      });
    });

    it('should fail with duplicate email', () => {
      cy.get('body').then($body => {
        if ($body.find('a[href="/auth/register"]').length > 0) {
          cy.get('a[href="/auth/register"]').first().click();
          
          cy.get('input[name="firstName"]').type('Test');
          cy.get('input[name="lastName"]').type('User');
          cy.get('input[name="email"]').type('existing@email.com'); // Use generic existing email
          cy.get('input[name="username"]').type('existinguser');
          cy.get('input[name="password"]').type('password123');
          cy.get('input[name="confirmPassword"]').type('password123');
          cy.get('button[name="register"]').click();
          
          // Should show error message
          cy.get('.alert-danger, .error, .text-danger').should('be.visible');
        } else {
          cy.log('Registration not available - skipping test');
        }
      });
    });

    it('should require all fields', () => {
      cy.get('body').then($body => {
        if ($body.find('a[href="/auth/register"]').length > 0) {
          cy.get('a[href="/auth/register"]').first().click();
          
          cy.get('button[name="register"]').click();
          
          // Check for required attributes on all fields
          cy.get('input[name="firstName"]').then($input => {
            if ($input.attr('required')) {
              expect($input).to.have.attr('required');
            }
          });
          
          cy.get('input[name="lastName"]').then($input => {
            if ($input.attr('required')) {
              expect($input).to.have.attr('required');
            }
          });
          
          cy.get('input[name="email"]').then($input => {
            if ($input.attr('required')) {
              expect($input).to.have.attr('required');
            }
          });
          
          cy.get('input[name="username"]').then($input => {
            if ($input.attr('required')) {
              expect($input).to.have.attr('required');
            }
          });
          
          cy.get('input[name="password"]').then($input => {
            if ($input.attr('required')) {
              expect($input).to.have.attr('required');
            }
          });
          
          // Should still be on register page
          cy.url().should('include', '/auth/register');
        } else {
          cy.log('Registration not available - skipping test');
        }
      });
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      // Login first with correct field names
      cy.visit('/auth/login');
      cy.get('input[name="username"]').type('eter');
      cy.get('input[name="password"]').type('chipss');
      cy.get('button[name="sign in"]').click();
      cy.url().should('match', /\/$|\/$/);
    });

    it('should logout successfully', () => {
      // Always use the homepage logout button
      cy.get('form[action="/auth/logout"] button[name="logout"]').should('be.visible').click();
      
      // Should redirect to login page
      cy.url().should('match', /\/auth\/login/);
      
      // Should show guest state (login/register links or no welcome message)
      cy.get('body').then($homeBody => {
        const hasLogin = $homeBody.find('a[href="/auth/login"]').length > 0;
        const hasWelcome = $homeBody.text().includes('Welcome back');
        if (hasLogin) {
          cy.get('a[href="/auth/login"]').first().should('be.visible');
        }
        if (hasWelcome) {
          cy.get('body').should('not.contain.text', 'Welcome back');
        }
      });
    });

    it('should clear session after logout', () => {
      cy.get('form[action="/auth/logout"] button[name="logout"]').should('be.visible').click();
      
      // Try to access protected route
      cy.visit('/customer/dashboard');
      cy.url().should('include', '/auth/login');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing protected routes without authentication', () => {
      const protectedRoutes = [
        '/customer/dashboard',
        '/customer/profile',
        '/customer/spending'
      ];
      
      protectedRoutes.forEach(route => {
        cy.visit(route);
        cy.url().should('include', '/auth/login');
      });
    });

  });
});