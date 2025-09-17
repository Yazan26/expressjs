describe('User Registration System', () => {
  
  beforeEach(() => {
    // Visit the registration page before each test
    cy.visit('/auth/register');
  });

  /**
   * Test registration form display and basic elements
   */
  it('should display registration form with all required fields', () => {
    cy.get('h3').should('contain', 'Create Your Account');
    
    // Check all form fields are present
    cy.get('input[name="firstName"]').should('be.visible');
    cy.get('input[name="lastName"]').should('be.visible'); 
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="username"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('input[name="confirmPassword"]').should('be.visible');
    cy.get('input[name="agreeTerms"]').should('be.visible');
    
    // Check submit button
    cy.get('button[type="submit"]').should('contain', 'Create Account');
    
    // Check link to login page
    cy.get('a[href="/auth/login"]').should('contain', 'Sign In Here');
  });

  /**
   * Test successful customer registration
   */
  it('should successfully register a new customer', () => {
    const timestamp = Date.now();
    const testUser = {
      firstName: 'John',
      lastName: 'Doe', 
      email: `john.doe.${timestamp}@test.com`,
      username: `johndoe${timestamp}`,
      password: 'testpass123'
    };

    // Fill in the registration form
    cy.get('input[name="firstName"]').type(testUser.firstName);
    cy.get('input[name="lastName"]').type(testUser.lastName);
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="username"]').type(testUser.username);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('input[name="confirmPassword"]').type(testUser.password);
    cy.get('input[name="agreeTerms"]').check();
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Should redirect to customer dashboard with success message
    cy.url().should('include', '/customer/dashboard');
    cy.get('.alert-success').should('contain', 'Registration successful');
    
    // Should be logged in with customer role
    cy.get('.navbar').should('contain', 'John Doe');
    cy.get('.navbar .badge').should('contain', 'customer');
  });

  /**
   * Test registration form validation
   */
  it('should show validation errors for empty required fields', () => {
    // Try to submit empty form
    cy.get('button[type="submit"]').click();
    
    // Should show validation errors and stay on registration page
    cy.url().should('include', '/auth/register');
    
    // Check HTML5 validation is working
    cy.get('input[name="firstName"]').should('have.attr', 'required');
    cy.get('input[name="lastName"]').should('have.attr', 'required');
    cy.get('input[name="email"]').should('have.attr', 'required');
    cy.get('input[name="username"]').should('have.attr', 'required');
    cy.get('input[name="password"]').should('have.attr', 'required');
    cy.get('input[name="confirmPassword"]').should('have.attr', 'required');
  });

  /**
   * Test password mismatch validation
   */
  it('should show error when passwords do not match', () => {
    const timestamp = Date.now();
    
    // Fill form with mismatched passwords
    cy.get('input[name="firstName"]').type('Jane');
    cy.get('input[name="lastName"]').type('Smith');
    cy.get('input[name="email"]').type(`jane.smith.${timestamp}@test.com`);
    cy.get('input[name="username"]').type(`janesmith${timestamp}`);
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('differentpassword');
    cy.get('input[name="agreeTerms"]').check();
    
    cy.get('button[type="submit"]').click();
    
    // Should show password mismatch error
    cy.url().should('include', '/auth/register');
    cy.get('.alert-danger').should('contain', 'Passwords do not match');
  });

  /**
   * Test duplicate username handling
   */
  it('should prevent registration with existing username', () => {
    // Try to register with existing staff username
    cy.get('input[name="firstName"]').type('Test');
    cy.get('input[name="lastName"]').type('User');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="username"]').type('mike'); // Existing staff username
    cy.get('input[name="password"]').type('testpass123');
    cy.get('input[name="confirmPassword"]').type('testpass123');
    cy.get('input[name="agreeTerms"]').check();
    
    cy.get('button[type="submit"]').click();
    
    // Should show username taken error
    cy.url().should('include', '/auth/register');
    cy.get('.alert-danger').should('contain', 'Username is already taken');
  });

  /**
   * Test email format validation
   */
  it('should validate email format', () => {
    const timestamp = Date.now();
    
    cy.get('input[name="firstName"]').type('Test');
    cy.get('input[name="lastName"]').type('User');
    cy.get('input[name="email"]').type('invalid-email-format'); // Invalid email
    cy.get('input[name="username"]').type(`testuser${timestamp}`);
    cy.get('input[name="password"]').type('testpass123');
    cy.get('input[name="confirmPassword"]').type('testpass123');
    cy.get('input[name="agreeTerms"]').check();
    
    cy.get('button[type="submit"]').click();
    
    // Should show validation error (HTML5 or server-side)
    cy.url().should('include', '/auth/register');
  });

  /**
   * Test username format validation
   */
  it('should validate username format requirements', () => {
    const timestamp = Date.now();
    
    // Test username with invalid characters
    cy.get('input[name="firstName"]').type('Test');
    cy.get('input[name="lastName"]').type('User');
    cy.get('input[name="email"]').type(`test${timestamp}@example.com`);
    cy.get('input[name="username"]').type('invalid@username!'); // Invalid characters
    cy.get('input[name="password"]').type('testpass123');
    cy.get('input[name="confirmPassword"]').type('testpass123');
    cy.get('input[name="agreeTerms"]').check();
    
    cy.get('button[type="submit"]').click();
    
    // Should show username format error
    cy.url().should('include', '/auth/register');
    cy.get('.alert-danger').should('contain', 'Username must be 3-20 characters');
  });

  /**
   * Test password strength validation
   */
  it('should enforce minimum password length', () => {
    const timestamp = Date.now();
    
    cy.get('input[name="firstName"]').type('Test');
    cy.get('input[name="lastName"]').type('User');
    cy.get('input[name="email"]').type(`test${timestamp}@example.com`);
    cy.get('input[name="username"]').type(`testuser${timestamp}`);
    cy.get('input[name="password"]').type('123'); // Too short
    cy.get('input[name="confirmPassword"]').type('123');
    cy.get('input[name="agreeTerms"]').check();
    
    cy.get('button[type="submit"]').click();
    
    // Should show password length error
    cy.url().should('include', '/auth/register');
    cy.get('.alert-danger').should('contain', 'Password must be at least 6 characters');
  });

  /**
   * Test terms and conditions requirement
   */
  it('should require agreement to terms and conditions', () => {
    const timestamp = Date.now();
    
    // Fill form but don't check terms agreement
    cy.get('input[name="firstName"]').type('Test');
    cy.get('input[name="lastName"]').type('User');
    cy.get('input[name="email"]').type(`test${timestamp}@example.com`);
    cy.get('input[name="username"]').type(`testuser${timestamp}`);
    cy.get('input[name="password"]').type('testpass123');
    cy.get('input[name="confirmPassword"]').type('testpass123');
    // Don't check agreeTerms
    
    cy.get('button[type="submit"]').click();
    
    // Should not submit due to HTML5 validation
    cy.url().should('include', '/auth/register');
  });

  /**
   * Test terms and privacy policy modals
   */
  it('should display terms of service and privacy policy modals', () => {
    // Click Terms of Service link
    cy.get('a[data-bs-target="#termsModal"]').click();
    cy.get('#termsModal').should('be.visible');
    cy.get('#termsModal').should('contain', 'Terms of Service');
    cy.get('button[data-bs-dismiss="modal"]').first().click();
    
    // Click Privacy Policy link
    cy.get('a[data-bs-target="#privacyModal"]').click();
    cy.get('#privacyModal').should('be.visible');
    cy.get('#privacyModal').should('contain', 'Privacy Policy');
    cy.get('button[data-bs-dismiss="modal"]').last().click();
  });

  /**
   * Test real-time username availability checking (if implemented)
   */
  it('should show username availability feedback', () => {
    // Type existing username
    cy.get('input[name="username"]').type('mike');
    
    // Wait for AJAX check and look for feedback
    cy.get('#usernameHelp', { timeout: 2000 }).should('contain', 'already taken');
    
    // Clear and type available username
    const timestamp = Date.now();
    cy.get('input[name="username"]').clear().type(`available${timestamp}`);
    
    // Should show available feedback
    cy.get('#usernameHelp', { timeout: 2000 }).should('contain', 'available');
  });

  /**
   * Test navigation between login and registration
   */
  it('should navigate between login and registration pages', () => {
    // Should be on registration page
    cy.url().should('include', '/auth/register');
    
    // Click link to login page
    cy.get('a[href="/auth/login"]').click();
    cy.url().should('include', '/auth/login');
    
    // Should show link back to registration
    cy.get('a[href="/auth/register"]').should('be.visible');
  });

  /**
   * Test that authenticated users are redirected away from registration
   */
  it('should redirect authenticated users away from registration page', () => {
    // First login as existing user
    cy.visit('/auth/login');
    cy.get('input[name="username"]').type('mike');
    cy.get('input[name="password"]').type('staff123');
    cy.get('button[type="submit"]').click();
    
    // Should be logged in
    cy.get('.navbar').should('contain', 'Mike');
    
    // Now try to visit registration page
    cy.visit('/auth/register');
    
    // Should be redirected away from registration page
    cy.url().should('not.include', '/auth/register');
  });

  /**
   * Test registration and immediate login integration
   */
  it('should automatically log in user after successful registration', () => {
    const timestamp = Date.now();
    const testUser = {
      firstName: 'Auto',
      lastName: 'Login',
      email: `auto.login.${timestamp}@test.com`,
      username: `autologin${timestamp}`,
      password: 'autopass123'
    };

    // Register new user
    cy.get('input[name="firstName"]').type(testUser.firstName);
    cy.get('input[name="lastName"]').type(testUser.lastName);
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="username"]').type(testUser.username);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('input[name="confirmPassword"]').type(testUser.password);
    cy.get('input[name="agreeTerms"]').check();
    cy.get('button[type="submit"]').click();
    
    // Should be automatically logged in
    cy.url().should('include', '/customer/dashboard');
    cy.get('.navbar').should('contain', 'Auto Login');
    cy.get('.navbar .badge').should('contain', 'customer');
    
    // Should be able to logout
    cy.get('.dropdown-toggle').click();
    cy.get('form button[type="submit"]').contains('Logout').click();
    cy.url().should('include', '/auth/login');
    
    // Should be able to log back in with the same credentials
    cy.get('input[name="username"]').type(testUser.username);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/customer/dashboard');
  });

});