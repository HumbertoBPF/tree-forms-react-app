import { fakerEN_US as faker } from '@faker-js/faker';
import forms from '../fixtures/forms.json';
import formTree from '../fixtures/form-tree.json';

const username = faker.internet.userName();
const password = 'str0ng-P@ssw0rd';

const { items } = forms;

const firstChild = formTree[0].children[0];
const secondChild = formTree[0].children[1];
const thirdChild = formTree[0].children[2];

const updatedLabel = faker.lorem.sentence();
const newLabel = faker.lorem.sentence();

beforeEach(() => {
    cy.intercept('GET', '/Prod/form', { statusCode: 200, body: forms });
    cy.login(username, password);
});

const editNode = (testId, label) => {
    cy.getByTestId(testId).find('input').first().click();
    cy.getByTestId('edit-node-button').click();
    cy.getByTestId('input-label').clear();
    cy.getByTestId('input-label').type(label);
    cy.getByTestId('save-button').click();
};

const addChild = (testId, label) => {
    cy.getByTestId(testId).find('input').first().click();
    cy.getByTestId('add-child-button').click();
    cy.getByTestId('input-label').type(label);
    cy.getByTestId('save-button').click();
};

it('should update a form tree', () => {
    cy.intercept('GET', `/Prod/form/${items[0].id}`, {
        statusCode: 200,
        body: {
            ...items[0],
            form_tree: formTree,
        },
    });

    cy.intercept('PUT', `/Prod/form/${items[0].id}/form-tree`, {
        statusCode: 204,
        body: undefined,
    });

    cy.getByTestId(items[0].id).findByTestId('access-item').click();

    editNode('root', updatedLabel);

    cy.getByTestId('root').find('input').first().click();

    cy.getByTestId('root').click();
    // Deleting multiple nodes
    cy.getByTestId(firstChild.id).find('input').first().click();
    cy.getByTestId(thirdChild.id).find('input').first().click();

    cy.getByTestId('delete-selected-button').click();

    cy.getByTestId('confirm-button').click();

    addChild('root', newLabel);

    cy.getByTestId('save-form-button').click();

    cy.getByTestId('snackbar').should(
        'have.text',
        'Form tree successfully saved.'
    );

    cy.getByTestId('root').should('be.visible').and('contain', updatedLabel);
    cy.getByTestId(firstChild.id).should('not.exist');
    cy.getByTestId(secondChild.id)
        .should('be.visible')
        .and('contain', secondChild.label);
    cy.getByTestId(thirdChild.id).should('not.exist');
    cy.contains(newLabel).should('be.visible');
});
