import { fakerEN_US as faker } from '@faker-js/faker';
import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getForm, updateFormTree } from 'api/routes';
import Base from 'pages/Base';
import FormTree from 'pages/FormTree';
import { Route } from 'react-router-dom';
import { mockForm, mockFormTree, render } from 'utils/tests';

const routes = (
    <Route path="/" element={<Base />}>
        <Route path="/forms/:id" element={<FormTree />} />
    </Route>
);

const form = {
    ...mockForm(),
    form_tree: mockFormTree(),
};

jest.mock('api/routes', () => ({
    getForm: jest.fn(),
    updateFormTree: jest.fn(),
}));

const isNodeChecked = (nodeId) => {
    const nodeItem = screen.getByTestId(nodeId);
    const checkboxNodeItem = within(nodeItem).getByTestId('checkbox');
    expect(checkboxNodeItem.firstChild).toBeChecked();
};

const toggleNode = async (nodeId, user) => {
    const nodeItem = screen.getByTestId(nodeId);
    const checkboxNodeItem = within(nodeItem).getByTestId('checkbox');
    await user.click(checkboxNodeItem.firstChild);
};

const addChild = async (node, label, user) => {
    await toggleNode(node.id, user);

    const addChildButton = screen.getByTestId('add-child-button');
    await user.click(addChildButton);

    const inputLabel = screen.getByTestId('input-label');
    await user.type(inputLabel, label);

    const saveButton = screen.getByTestId('save-button');
    await user.click(saveButton);
};

const editNode = async (node, newLabel, user) => {
    await toggleNode(node.id, user);

    const editNodeButton = screen.getByTestId('edit-node-button');
    await user.click(editNodeButton);

    const inputLabel = screen.getByTestId('input-label');
    await user.clear(inputLabel);
    await user.type(inputLabel, newLabel);

    const saveButton = screen.getByTestId('save-button');
    await user.click(saveButton);
};

it('should display form tree data', async () => {
    const user = userEvent.setup();

    const rootNode = form.form_tree[0];
    const child0 = rootNode.children[0];
    const child1 = rootNode.children[1];
    const child2 = rootNode.children[2];

    getForm.mockImplementation(() => Promise.resolve({ data: form }));

    await act(async () => {
        render(routes, { initialEntries: [`/forms/${form.id}`] });
    });

    expect(getForm).toBeCalledTimes(1);
    expect(getForm).toBeCalledWith(form.id);

    const rootItem = screen.getByTestId('root');
    expect(rootItem).toBeInTheDocument();
    expect(rootItem).toHaveTextContent(rootNode.label);
    // Collapsing root node
    await user.click(rootItem.firstChild);

    const childItem0 = screen.getByTestId(child0.id);
    expect(childItem0).toBeInTheDocument();
    expect(childItem0).toHaveTextContent(child0.label);

    const childItem1 = screen.getByTestId(child1.id);
    expect(childItem1).toBeInTheDocument();
    expect(childItem1).toHaveTextContent(child1.label);

    const childItem2 = screen.getByTestId(child2.id);
    expect(childItem2).toBeInTheDocument();
    expect(childItem2).toHaveTextContent(child2.label);
});

it('should add a child to the selected node', async () => {
    const user = userEvent.setup();

    const rootNode = form.form_tree[0];
    const child0 = rootNode.children[0];

    const label = faker.lorem.sentence();

    getForm.mockImplementation(() => Promise.resolve({ data: form }));

    await act(async () => {
        render(routes, { initialEntries: [`/forms/${form.id}`] });
    });

    const rootItem = screen.getByTestId('root');
    // Collapsing root node
    await user.click(rootItem.firstChild);

    await addChild(child0, label, user);
    // Collapsing selected node
    const childItem = screen.getByTestId(child0.id);
    await user.click(childItem.firstChild);

    const newChildItem = within(childItem).getByText(label);
    expect(newChildItem).toBeInTheDocument();
});

it('should update the label of a form tree node', async () => {
    const user = userEvent.setup();

    const rootNode = form.form_tree[0];
    const child0 = rootNode.children[0];

    const newLabel = faker.lorem.sentence();

    getForm.mockImplementation(() => Promise.resolve({ data: form }));

    await act(async () => {
        render(routes, { initialEntries: [`/forms/${form.id}`] });
    });

    const rootItem = screen.getByTestId('root');
    // Collapsing root node
    await user.click(rootItem.firstChild);

    await editNode(child0, newLabel, user);

    const childItem = screen.getByTestId(child0.id);
    expect(childItem).toHaveTextContent(newLabel);
});

it('should mark all the children of the selected nodes', async () => {
    const user = userEvent.setup();

    const rootNode = form.form_tree[0];
    const child0 = rootNode.children[0];
    const child1 = rootNode.children[1];
    const child2 = rootNode.children[2];

    getForm.mockImplementation(() => Promise.resolve({ data: form }));

    await act(async () => {
        render(routes, { initialEntries: [`/forms/${form.id}`] });
    });

    const rootItem = screen.getByTestId('root');

    await toggleNode('root', user);

    const selectChildrenButton = screen.getByTestId('select-children-button');
    await user.click(selectChildrenButton);

    isNodeChecked('root');

    await user.click(rootItem.firstChild);

    isNodeChecked(child0.id);
    isNodeChecked(child1.id);
    isNodeChecked(child2.id);
});

describe('deleting nodes', () => {
    it('should delete the selected nodes', async () => {
        const user = userEvent.setup();

        const rootNode = form.form_tree[0];
        const child0 = rootNode.children[0];
        const child1 = rootNode.children[1];

        getForm.mockImplementation(() => Promise.resolve({ data: form }));

        await act(async () => {
            render(routes, { initialEntries: [`/forms/${form.id}`] });
        });
        // Collapsing root node
        const rootItem = screen.getByTestId('root');

        await user.click(rootItem.firstChild);

        await toggleNode(child0.id, user);
        await toggleNode(child1.id, user);

        const deleteSelectedButton = screen.getByTestId(
            'delete-selected-button'
        );
        await user.click(deleteSelectedButton);

        const confirmButton = screen.getByTestId('confirm-button');
        await user.click(confirmButton);

        const childItem0 = within(rootItem).queryByTestId(child0.id);
        expect(childItem0).not.toBeInTheDocument();

        const childItem1 = within(rootItem).queryByTestId(child1.id);
        expect(childItem1).not.toBeInTheDocument();
    });

    it('should not allow to delete the initial node', async () => {
        const user = userEvent.setup();

        getForm.mockImplementation(() => Promise.resolve({ data: form }));

        await act(async () => {
            render(routes, { initialEntries: [`/forms/${form.id}`] });
        });

        await toggleNode('root', user);

        const deleteSelectedButton = screen.getByTestId(
            'delete-selected-button'
        );
        await user.click(deleteSelectedButton);

        const snackbar = screen.getByTestId('snackbar');
        expect(snackbar).toBeInTheDocument();
        expect(snackbar).toHaveTextContent(
            'You cannot delete the initial node.'
        );
    });
});

it('should display not found page when the /form/:id endpoint returns 404', async () => {
    getForm.mockImplementation(() => Promise.resolve({ statusCode: 404 }));

    await act(async () => {
        render(routes, { initialEntries: [`/forms/${form.id}`] });
    });

    const notFoundAlert = screen.getByTestId('not-found-alert');
    expect(notFoundAlert).toBeInTheDocument();
});

describe('update tree form', () => {
    const form = {
        ...mockForm(),
        form_tree: mockFormTree(),
    };

    beforeEach(() => {
        getForm.mockImplementation(() => Promise.resolve({ data: form }));
    });

    it('should update the tree form', async () => {
        const user = userEvent.setup();

        const rootNode = form.form_tree[0];
        const child0 = rootNode.children[0];
        const child1 = rootNode.children[1];
        const child2 = rootNode.children[2];

        const newLabel = faker.lorem.sentence();

        updateFormTree.mockImplementation(() =>
            Promise.resolve({ statusCode: 204 })
        );

        await act(async () => {
            render(routes, { initialEntries: [`/forms/${form.id}`] });
        });

        const rootItem = screen.getByTestId('root');
        // Collapsing root node
        await user.click(rootItem.firstChild);
        // Deleting all children of the root node
        await toggleNode(child0.id, user);
        await toggleNode(child1.id, user);
        await toggleNode(child2.id, user);

        const deleteSelectedButton = screen.getByTestId(
            'delete-selected-button'
        );
        await user.click(deleteSelectedButton);

        const confirmButton = screen.getByTestId('confirm-button');
        await user.click(confirmButton);
        // Editing label of the root node
        await editNode(rootNode, newLabel, user);

        const saveFormButton = screen.getByTestId('save-form-button');
        await user.click(saveFormButton);

        expect(updateFormTree).toBeCalledTimes(1);
        expect(updateFormTree).toBeCalledWith(form.id, [
            {
                id: rootNode.id,
                label: newLabel,
                children: [],
            },
        ]);

        const snackbar = screen.getByTestId('snackbar');
        expect(snackbar).toBeInTheDocument();
        expect(snackbar).toHaveTextContent('Form tree successfully saved.');
    });

    it('should display snackbar when the endpoint /form/:id/form-tree returns an error', async () => {
        const user = userEvent.setup();

        updateFormTree.mockImplementation(() => {
            const error = new Error();
            return Promise.reject(error);
        });

        await act(async () => {
            render(routes, { initialEntries: [`/forms/${form.id}`] });
        });

        const saveFormButton = screen.getByTestId('save-form-button');
        await user.click(saveFormButton);

        expect(updateFormTree).toBeCalledTimes(1);
        expect(updateFormTree).toBeCalledWith(form.id, form.form_tree);

        const snackbar = screen.getByTestId('snackbar');
        expect(snackbar).toBeInTheDocument();
        expect(snackbar).toHaveTextContent('Error when saving the form tree.');
    });
});
