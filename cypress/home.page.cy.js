require('dotenv').config();

describe('Home Page', () => {
    it('should load the home page', () => {
        cy.visit(process.env.BASE_URL);
        cy.contains('Welcome to the Home Page');
        cy.get('h1').should('have.text', 'Home Page');
    });
});
describe('Users Page', () => {
    it('should navigate to the users page', () => {
        cy.get('a[href="/users"]').click();
        cy.url().should('include', '/users');
        cy.contains('Users List');
    });
});

