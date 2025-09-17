describe('User Registration System', () => {
  
  beforeEach(() => {
    cy.visit('/auth/register');
  });

  describe('Registration Form', () => {
    it('displays all required fields and elements', () => {
      cy.get('h3').should('contain', 'Create Your Account');
      
      const requiredFields = [
        'input[name="firstName"]',
        'input[name="lastName"]', 
        'input[name="email"]',
        'input[name="username"]',
        'input[name="password"]',
        'input[name="confirmPassword"]',
        'input[name="agreeTerms"]'
      ];

      requiredFields.forEach(field => {
        cy.get(field).should('be.visible');
      });
      
      cy.get('button[type="submit"]').should('contain', 'Create Account');
      cy.get('a[href="/auth/login"]').should('contain', 'Sign In Here');
    });

    it('validates empty required fields', () => {
      cy.submitForm();
      cy.url().should('include', '/auth/register');
      
      // Check HTML5 validation attributes
      cy.get('input[name="firstName"]').should('have.attr', 'required');
      cy.get('input[name="email"]').should('have.attr', 'required');
    });
  });

  describe('Registration Validation', () => {
    it('prevents registration with password mismatch', () => {
      cy.generateTestData('user').then(userData => {
        cy.fillForm({
          ...userData,
          password: 'password123',
          confirmPassword: 'differentpassword',
          agreeTerms: true
        });
        
        cy.get('input[name="agreeTerms"]').check();
        cy.submitForm();
        
        cy.url().should('include', '/auth/register');
        cy.checkAlert('error', 'Passwords do not match');
      });
    });

    it('prevents duplicate username registration', () => {
      cy.fillForm({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'mike', // Existing staff username
        password: 'testpass123',
        confirmPassword: 'testpass123'
      });
      
      cy.get('input[name="agreeTerms"]').check();
      cy.submitForm();
      
      cy.url().should('include', '/auth/register');
      cy.checkAlert('error', 'Username is already taken');
    });

    it('validates email format', () => {
      cy.generateTestData('user').then(userData => {
        cy.fillForm({
          ...userData,
          email: 'invalid-email-format',
          password: 'testpass123',
          confirmPassword: 'testpass123'
        });
        
        cy.get('input[name="agreeTerms"]').check();
        cy.submitForm();
        
        cy.url().should('include', '/auth/register');
      });
    });

    it('enforces password length requirements', () => {
      cy.generateTestData('user').then(userData => {
        cy.fillForm({
          ...userData,
          password: '123', // Too short
          confirmPassword: '123'
        });
        
        cy.get('input[name="agreeTerms"]').check();
        cy.submitForm();
        
        cy.url().should('include', '/auth/register');
        cy.checkAlert('error', 'Password must be at least 6 characters');
      });
    });

    it('requires terms and conditions agreement', () => {
      cy.generateTestData('user').then(userData => {
        cy.fillForm({
          ...userData,
          password: 'testpass123',
          confirmPassword: 'testpass123'
        });
        
        // Don't check terms agreement
        cy.submitForm();
        cy.url().should('include', '/auth/register');
      });
    });
  });

  describe('Successful Registration', () => {
    it('creates new customer account and logs in automatically', () => {
      cy.generateTestData('user').then(userData => {
        cy.fillForm({
          ...userData,
          password: 'testpass123',
          confirmPassword: 'testpass123'
        });
        
        cy.get('input[name="agreeTerms"]').check();
        cy.submitForm('/customer/dashboard');
        
        // Should be logged in as customer
        cy.checkAlert('success', 'Registration successful');
        cy.get('.navbar').should('contain', userData.first_name);
        cy.get('.navbar .badge').should('contain', 'customer');
      });
    });

    it('allows logout and re-login after registration', () => {
      cy.generateTestData('user').then(userData => {
        const password = 'testpass123';
        
        // Register user
        cy.fillForm({
          ...userData,
          password,
          confirmPassword: password
        });
        
        cy.get('input[name="agreeTerms"]').check();
        cy.submitForm('/customer/dashboard');
        
        // Logout
        cy.logout();
        
        // Login again with same credentials
        cy.login('customer', userData.username, password);
        cy.url().should('include', '/customer/dashboard');
      });
    });
  });

  describe('Modal Functionality', () => {
    it('displays terms of service and privacy policy modals', () => {
      // Terms of Service
      cy.get('a[data-bs-target="#termsModal"]').click();
      cy.get('#termsModal').should('be.visible').and('contain', 'Terms of Service');
      cy.get('button[data-bs-dismiss="modal"]').first().click();
      
      // Privacy Policy
      cy.get('a[data-bs-target="#privacyModal"]').click();
      cy.get('#privacyModal').should('be.visible').and('contain', 'Privacy Policy');
      cy.get('button[data-bs-dismiss="modal"]').last().click();
    });
  });

  describe('Navigation and Access', () => {
    it('navigates between login and registration pages', () => {
      cy.url().should('include', '/auth/register');
      
      cy.get('a[href="/auth/login"]').click();
      cy.url().should('include', '/auth/login');
      
      cy.get('a[href="/auth/register"]').should('be.visible');
    });

    it('redirects authenticated users away from registration', () => {
      cy.login('staff');
      cy.visit('/auth/register');
      cy.url().should('not.include', '/auth/register');
    });
  });

  describe('Real-time Validation', () => {
    it('shows username availability feedback', () => {
      // Test existing username
      cy.get('input[name="username"]').type('mike');
      cy.get('#usernameHelp', { timeout: 2000 }).should('contain', 'already taken');
      
      // Test available username
      cy.generateTestData('user').then(userData => {
        cy.get('input[name="username"]').clear().type(userData.username);
        cy.get('#usernameHelp', { timeout: 2000 }).should('contain', 'available');
      });
    });
  });
});