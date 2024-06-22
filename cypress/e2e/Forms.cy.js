import { fakerEN_US as faker } from '@faker-js/faker';
import forms from '../fixtures/forms.json';

const username = faker.internet.userName();
const password = 'str0ng-P@ssw0rd';

const { items } = forms;

beforeEach(() => {
    cy.intercept('GET', '/Prod/form', { statusCode: 200, body: forms });
    cy.login(username, password);
});

it('should list all forms of the authenticated user', () => {
    cy.assertForm(items[0]);
    cy.assertForm(items[1]);
    cy.assertForm(items[2]);
});

it('should create form', () => {
    const newForm = {
        ...items[0],
        id: faker.string.uuid(),
        name: faker.lorem.word(),
        description: faker.lorem.sentence(),
    };

    cy.intercept('POST', '/Prod/form', { statusCode: 201, body: newForm });

    cy.assertForm(items[0]);
    cy.assertForm(items[1]);
    cy.assertForm(items[2]);

    cy.getByTestId('add-button').click();

    cy.getByTestId('4').find('input').eq(1).type(newForm.name);
    cy.getByTestId('4').find('input').eq(2).type(newForm.description);

    cy.getByTestId('4').findByTestId('save-item').click();

    cy.assertForm(newForm);
});

it('should update a form', () => {
    const updatedForm = {
        ...items[0],
        name: faker.lorem.word(),
        description: faker.lorem.sentence(),
    };

    cy.intercept('PUT', `/Prod/form/${items[0].id}`, {
        statusCode: 200,
        body: updatedForm,
    });

    cy.getByTestId(items[0].id).findByTestId('update-item').click();

    cy.getByTestId(items[0].id).find('input').eq(1).clear();
    cy.getByTestId(items[0].id).find('input').eq(1).type(updatedForm.name);

    cy.getByTestId(items[0].id).find('input').eq(2).clear();
    cy.getByTestId(items[0].id)
        .find('input')
        .eq(2)
        .type(updatedForm.description);

    cy.getByTestId(items[0].id).findByTestId('save-item').click();

    cy.assertForm(updatedForm);
});

it('should delete a form', () => {
    cy.intercept('DELETE', `/Prod/form/${items[0].id}`, {
        statusCode: 204,
        body: undefined,
    });

    cy.getByTestId(items[0].id).findByTestId('delete-item').click();

    cy.getByTestId('confirm-button').click();

    cy.getByTestId(items[0].id).should('not.exist');
});

it('should delete multiple forms', () => {
    cy.intercept('DELETE', '/Prod/form', {
        statusCode: 204,
        body: undefined,
    });

    cy.getByTestId(items[0].id).find('input').eq(0).click();
    cy.getByTestId(items[2].id).find('input').eq(0).click();

    cy.getByTestId('bulk-delete-button').click();

    cy.getByTestId('confirm-button').click();

    cy.getByTestId(items[0].id).should('not.exist');
    cy.getByTestId(items[2].id).should('not.exist');
});
