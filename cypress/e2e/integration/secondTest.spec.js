/// <reference types="cypress" />

describe('Test log out', () => {

    beforeEach('log in to the app', () => {
        cy.loginToApplication()
    })

    it('verify user can log out successfully', {retries: 2}, () => {
        cy.contains('Settings').click()
        cy.contains('Or click here to logout').click()
        cy.get('.navbar-nav').should('contain', 'Sign up1')
    })

})