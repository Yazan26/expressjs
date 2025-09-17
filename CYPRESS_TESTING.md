# Cypress Testing Setup

## Overview
This project now uses a clean, maintainable Cypress testing setup with custom commands, proper configuration, and environment variables.

## Configuration

### Environment Variables
The `.env` file contains Cypress-specific variables:
```env
# Cypress Testing Environment Variables
CYPRESS_BASE_URL=http://localhost:3000

# Test User Credentials
CYPRESS_ADMIN_USERNAME=admin
CYPRESS_ADMIN_PASSWORD=admin123
CYPRESS_STAFF_USERNAME=mike
CYPRESS_STAFF_PASSWORD=staff123
CYPRESS_CUSTOMER_USERNAME=mary.smith@sakilacustomer.org
CYPRESS_CUSTOMER_PASSWORD=customer123
```

### Cypress Configuration
The `cypress.config.js` file is configured with:
- Base URL from environment variables
- Custom timeouts and viewport settings
- Environment-specific test credentials
- Proper file patterns and settings

## Custom Commands

### Authentication Commands
- `cy.login(userType, username, password)` - Login with different user types
- `cy.logout()` - Logout current user
- `cy.checkAuth(shouldBeAuthenticated)` - Verify authentication status

### Navigation Commands
- `cy.navigateTo(section)` - Navigate to specific sections
- `cy.waitForLoad()` - Wait for page to load completely

### Form Commands
- `cy.fillForm(data)` - Fill form fields with data object
- `cy.submitForm(expectedUrl)` - Submit form and wait for response
- `cy.applyFilters(filters)` - Apply filter selections
- `cy.search(searchTerm)` - Search functionality

### Utility Commands
- `cy.checkAlert(type, message)` - Check for alert messages
- `cy.checkContent(selector, expectedContent)` - Verify content exists
- `cy.generateTestData(type)` - Generate test data objects

## Running Tests

### NPM Scripts
```bash
# Open Cypress UI
npm run test:open

# Run all tests headlessly
npm run test

# Run specific test suites
npm run test:auth
npm run test:admin
npm run test:registration
npm run test:home
```

### Direct Cypress Commands
```bash
# Run all tests
npx cypress run

# Run specific test file
npx cypress run --spec "cypress/e2e/tests/auth.cy.js"

# Open Cypress UI
npx cypress open
```

## Test Structure

### Before Refactoring (Problems)
- 400+ line test files
- Repetitive code patterns
- No reusable commands
- Hardcoded values everywhere
- Verbose, unreadable tests

### After Refactoring (Solutions)
- Concise, focused test files
- Reusable custom commands
- Environment-based configuration
- Generated test data
- Clear, maintainable structure

## Example Test Structure

```javascript
describe('Feature Name', () => {
  
  describe('Sub-Feature', () => {
    beforeEach(() => {
      cy.login('admin');
      cy.navigateTo('admin-films');
    });

    it('performs specific action', () => {
      cy.generateTestData('film').then(filmData => {
        cy.fillForm(filmData);
        cy.submitForm('/films');
        cy.checkAlert('success', 'Film created');
      });
    });
  });
});
```

## Benefits of New Structure

1. **Maintainability**: Tests are easier to read and modify
2. **Reusability**: Custom commands eliminate code duplication
3. **Reliability**: Environment variables and proper configuration
4. **Scalability**: Easy to add new tests using existing patterns
5. **Debugging**: Clear structure makes issues easier to identify

## Test Organization

- `cypress/e2e/tests/` - Main test files
- `cypress/support/commands.js` - Custom commands
- `cypress/support/e2e.js` - Support configuration
- `cypress.config.js` - Cypress configuration
- `.env` - Environment variables

## Best Practices Applied

1. **DRY (Don't Repeat Yourself)**: Reusable commands
2. **Clear Naming**: Descriptive test and function names
3. **Environment Separation**: Configuration through env vars
4. **Logical Grouping**: Related tests grouped in describes
5. **Data Generation**: Dynamic test data to avoid conflicts