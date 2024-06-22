import { fakerEN_US as faker } from '@faker-js/faker';
import forms from '../fixtures/forms.json';

it('should perform login', () => {
    cy.intercept('GET', '/Prod/form', forms);

    const username = faker.internet.userName();
    const password = 'str0ng-P@ssw0rd';

    cy.login(username, password);

    cy.url().should('contain', '/forms');
});
