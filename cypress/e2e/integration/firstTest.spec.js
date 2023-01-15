/// <reference types="cypress" />

import { faker } from '@faker-js/faker';


describe('Test with backend', () => {

    beforeEach('login to the app', () => {
        cy.intercept({method: 'Get', path: 'tags'}, {fixture: 'tags.json'})
        cy.loginToApplication()
    })

    // Verify and intercept creating article status code
    it('verify correct request and response', () => {
        
        cy.intercept('POST', 'https://api.realworld.io/api/articles/').as('postArticles')

        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type(`This is a title ${faker.word.noun()}`);
        cy.get('[formcontrolname="description"]').type('This is a description')
        cy.get('[formcontrolname="body"]').type('This is a body of the article')
        cy.contains('Publish Article').click()

        cy.wait('@postArticles').then( xhr => {
            console.log(xhr)
            expect(xhr.response.statusCode).to.equal(200)
            expect(xhr.request.body.article.body).to.equal('This is a body of the article')
            expect(xhr.response.body.article.description).to.equals('This is a description')
        })

    })

    it('intercepting and modifying the request and response', () => {
        
        // This is modification of the request
        cy.intercept('POST', 'https://api.realworld.io/api/articles/', (req) => {
            req.body.article.description = "This is a description 2"
        }).as('postArticles')

        // This is the modification of the response
        cy.intercept('POST', 'https://api.realworld.io/api/articles/', (req) => {
            req.reply( res => {
                expect(res.body.article.description).to.equal('This is a description')
                res.body.article.description = "This is a description 2"
            })
        }).as('postArticles')

        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type(`This is a title ${faker.word.noun()}`);
        cy.get('[formcontrolname="description"]').type('This is a description')
        cy.get('[formcontrolname="body"]').type('This is a body of the article')
        cy.contains('Publish Article').click()

        cy.wait('@postArticles').then( xhr => {
            console.log(xhr)
            expect(xhr.response.statusCode).to.equal(200)
            expect(xhr.request.body.article.body).to.equal('This is a body of the article')
            expect(xhr.response.body.article.description).to.equal('This is a description 2')
        })

    })

    // Verify and intercept api call for tags and replace them with new ones
    it('verify popular tags are displayed', () => {
        cy.get('.tag-list')
        .should('contain', 'cypress')
        .and('contain', 'automation')
        .and('contain', 'testing')
    })

    // Intercept global articles and display only 2 and change the number of likes on them
    it('verify global feed likes count', () => {
        cy.intercept('GET', 'https://api.realworld.io/api/articles/feed*', '{"articles":[],"articlesCount":0}')
        cy.intercept('GET', 'https://api.realworld.io/api/articles*', {fixture: 'articles.json'})

        cy.contains('Global Feed').click()
        cy.get('app-article-list button').then(heartList => {
            expect(heartList[0]).to.contain('1')
            expect(heartList[1]).to.contain('5')
        })

        //If we click on hear like that number changes
        cy.fixture('articles').then(file => {
            const articleLink = file.articles[1].slug
            file.articles[1].favoritesCount = 6
            cy.intercept('POST', 'https://api.realworld.io/api/articles/'+ articleLink +'/favorite', file)
        })

        cy.get('app-article-list button').eq(1).click().should('contain', '6')

    })

    it.only('delete a new article in a global feed', () => {

        cy.intercept(
            "DELETE",
            "https://api.realworld.io/api/articles/*",
            () => {}
        ).as("deleteArticles");

        const bodyRequest = {
            "article": {
                "tagList": [],
                "title": "Request from API 1.1",
                "description": "API testing is easy",
                "body": "Angular is cool"
            }
        }

        // Loging in and posting the new article on global feed
        cy.get('@token').then(token => {

            cy.request({
                url: Cypress.env('apiUrl')+'/api/articles/',
                headers: { 'Authorization': 'Token '+token},
                method: 'POST',
                body: bodyRequest
            }).then( response => {
                expect(response.status).to.equal(200)
            })

            cy.contains('Global Feed').click()
            cy.get('.article-preview').first().click()
            cy.get('.article-actions').contains('Delete Article').click()
            
            cy.wait("@deleteArticles");
            cy.request({
                url: Cypress.env('apiUrl')+'/api/articles?limit=10&offset=0',
                headers: { 'Authorization': 'Token '+token},
                method: 'GET'
            }).its('body').then( body => {
                expect(body.articles[0].title).not.to.equal('Request from API 1.1')
            })

        })

    })

})