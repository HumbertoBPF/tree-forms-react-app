// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add('getByTestId', (testId) => {
    cy.get(`[data-testid="${testId}"]`);
});

Cypress.Commands.add(
    'findByTestId',
    { prevSubject: true },
    (subject, testId) => {
        return subject.find(`[data-testid="${testId}"]`);
    }
);

Cypress.Commands.add('login', (username, password) => {
    cy.intercept('POST', 'https://cognito-idp.us-east-1.amazonaws.com/', {
        statusCode: 200,
        body: {
            AuthenticationResult: {
                IdToken: 'token',
            },
        },
    });

    cy.visit('/login');

    cy.window().then((window) => {
        cy.stub(window, 'logout', () => {});
    });

    cy.getByTestId('username-input').type(username);
    cy.getByTestId('password-input').type(password);

    cy.getByTestId('submit-button').click();
});

Cypress.Commands.add('assertForm', (form) => {
    cy.getByTestId(form.id)
        .should('be.visible')
        .and('contain', form.name)
        .and('contain', form.description);
});
