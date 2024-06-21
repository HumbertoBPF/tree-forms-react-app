import { act, screen, within } from '@testing-library/react';
import {
    bulkDeleteForm,
    createForm,
    deleteForm,
    getForms,
    updateForm,
} from 'api/routes';
import Base from 'pages/Base';
import Forms from 'pages/Forms';
import { Route } from 'react-router-dom';
import { mockForm, render } from 'utils/tests';
import { fakerEN_US as faker } from '@faker-js/faker';
import userEvent from '@testing-library/user-event';

jest.mock('api/routes', () => ({
    getForms: jest.fn(),
    createForm: jest.fn(),
    updateForm: jest.fn(),
    deleteForm: jest.fn(),
    bulkDeleteForm: jest.fn(),
}));

const routes = (
    <Route path="/" element={<Base />}>
        <Route path="/forms" element={<Forms />} />
        <Route
            path="/forms/:id"
            element={<h1 data-testid="form-tree-page">Form tree page</h1>}
        />
    </Route>
);

const forms = [mockForm(), mockForm(), mockForm()];

const assertFormRow = async (form) => {
    const formRow = await screen.findByTestId(form.id);
    expect(formRow).toBeInTheDocument();

    const name = within(formRow).getByText(form.name);
    expect(name).toBeInTheDocument();

    const description = within(formRow).getByText(form.description);
    expect(description).toBeInTheDocument();
};

describe('list forms', () => {
    it('should render the forms of the authenticated user', async () => {
        getForms.mockImplementation(() =>
            Promise.resolve({
                data: {
                    items: forms,
                },
            })
        );

        await act(async () => {
            render(routes, { initialEntries: ['/forms'] });
        });

        expect(getForms).toBeCalledTimes(1);

        await assertFormRow(forms[0]);
        await assertFormRow(forms[1]);
        await assertFormRow(forms[2]);
    });

    it('should display error snackbar when failing to get the forms of the authenticated user', async () => {
        getForms.mockImplementation(() => {
            const error = new Error();
            return Promise.reject(error);
        });

        await act(async () => {
            render(routes, { initialEntries: ['/forms'] });
        });

        expect(getForms).toBeCalledTimes(1);

        const snackbar = screen.getByTestId('snackbar');
        expect(snackbar).toBeInTheDocument();
        expect(snackbar).toHaveTextContent(
            'An error happened while loading your forms. Please try again.'
        );
    });
});

describe('delete form', () => {
    beforeEach(() => {
        getForms.mockImplementation(() =>
            Promise.resolve({
                data: {
                    items: forms,
                },
            })
        );
    });

    it('should delete a form', async () => {
        const user = userEvent.setup();

        deleteForm.mockImplementation(() =>
            Promise.resolve({ data: undefined })
        );

        await act(async () => {
            render(routes, { initialEntries: ['/forms'] });
        });

        const formRow0 = screen.getByTestId(forms[0].id);
        const deleteItem = within(formRow0).getByTestId('delete-item');
        await user.click(deleteItem);

        const confirmButton = screen.getByTestId('confirm-button');
        await user.click(confirmButton);

        expect(deleteForm).toBeCalledTimes(1);
        expect(deleteForm).toBeCalledWith(forms[0].id);

        const form0 = screen.queryByTestId(forms[0].id);
        expect(form0).not.toBeInTheDocument();

        const form1 = screen.getByTestId(forms[1].id);
        expect(form1).toBeInTheDocument();

        const form2 = screen.getByTestId(forms[2].id);
        expect(form2).toBeInTheDocument();
    });

    it('should display error snackbar when failing to delete a form', async () => {
        const user = userEvent.setup();

        deleteForm.mockImplementation(() => {
            const error = new Error();
            return Promise.reject(error);
        });

        await act(async () => {
            render(routes, { initialEntries: ['/forms'] });
        });

        const formRow0 = screen.getByTestId(forms[0].id);
        const deleteItem = within(formRow0).getByTestId('delete-item');
        await user.click(deleteItem);

        const confirmButton = screen.getByTestId('confirm-button');
        await user.click(confirmButton);

        expect(deleteForm).toBeCalledTimes(1);
        expect(deleteForm).toBeCalledWith(forms[0].id);

        const snackbar = screen.getByTestId('snackbar');

        expect(snackbar).toBeInTheDocument();
        expect(snackbar).toHaveTextContent(
            'An error happened while deleting the form. Please try again.'
        );
    });
});

describe('create form', () => {
    beforeEach(() => {
        getForms.mockImplementation(() =>
            Promise.resolve({
                data: {
                    items: forms,
                },
            })
        );
    });

    it('should create a form', async () => {
        const user = userEvent.setup();

        const name = faker.lorem.word();
        const description = faker.lorem.sentence();

        const newForm = {
            ...mockForm(),
            name,
            description,
        };

        createForm.mockImplementation(() => Promise.resolve({ data: newForm }));

        await act(async () => {
            render(routes, { initialEntries: ['/forms'] });
        });

        const addButton = screen.getByTestId('add-button');
        await user.click(addButton);

        const newFormRow = screen.getByTestId('4');
        const newFormInputs = within(newFormRow).getAllByRole('gridcell');

        const nameInput = newFormInputs[1].firstChild.firstChild;
        const descriptionInput = newFormInputs[2].firstChild.firstChild;

        await user.type(nameInput, name);
        await user.type(descriptionInput, description);

        const saveItem = within(newFormRow).getByTestId('save-item');
        await user.click(saveItem);

        expect(createForm).toBeCalledTimes(1);
        expect(createForm).toBeCalledWith({
            name,
            description,
        });

        await assertFormRow(newForm);
    });

    it('should require a non-empty name', async () => {
        const user = userEvent.setup();

        const description = faker.lorem.sentence();

        await act(async () => {
            render(routes, { initialEntries: ['/forms'] });
        });

        const addButton = screen.getByTestId('add-button');
        await user.click(addButton);

        const newForm = screen.getByTestId('4');
        const newFormInputs = within(newForm).getAllByRole('gridcell');

        await user.type(newFormInputs[2].firstChild.firstChild, description);

        const saveItem = within(newForm).getByTestId('save-item');
        await user.click(saveItem);

        expect(createForm).toBeCalledTimes(0);

        const snackbar = screen.getByTestId('snackbar');
        expect(snackbar).toBeInTheDocument();
        expect(snackbar).toHaveTextContent(
            'The name of a form must not be empty'
        );
    });

    it('should display snackbar when the API returns an error', async () => {
        const user = userEvent.setup();

        const name = faker.lorem.word();
        const description = faker.lorem.sentence();

        createForm.mockImplementation(() => {
            const error = new Error();
            return Promise.reject(error);
        });

        await act(async () => {
            render(routes, { initialEntries: ['/forms'] });
        });

        const addButton = screen.getByTestId('add-button');
        await user.click(addButton);

        const newForm = screen.getByTestId('4');
        const newFormInputs = within(newForm).getAllByRole('gridcell');

        const nameInput = newFormInputs[1].firstChild.firstChild;
        const descriptionInput = newFormInputs[2].firstChild.firstChild;

        await user.type(nameInput, name);
        await user.type(descriptionInput, description);

        const saveItem = within(newForm).getByTestId('save-item');
        await user.click(saveItem);

        expect(createForm).toBeCalledTimes(1);
        expect(createForm).toBeCalledWith({
            name,
            description,
        });

        const snackbar = screen.getByTestId('snackbar');
        expect(snackbar).toBeInTheDocument();
        expect(snackbar).toHaveTextContent(
            'An error happened while creating the form. Please try again.'
        );
    });
});

describe('update form', () => {
    beforeEach(() => {
        getForms.mockImplementation(() =>
            Promise.resolve({
                data: {
                    items: forms,
                },
            })
        );
    });

    it('should update a form', async () => {
        const user = userEvent.setup();

        const name = faker.lorem.word();
        const description = faker.lorem.sentence();

        const updatedForm = {
            ...mockForm(),
            name,
            description,
        };

        updateForm.mockImplementation(() =>
            Promise.resolve({ data: updatedForm })
        );

        await act(async () => {
            render(routes, { initialEntries: ['/forms'] });
        });

        const form0 = screen.getByTestId(forms[0].id);
        const updateItem = within(form0).getByTestId('update-item');
        await user.click(updateItem);

        const newFormInputs = within(form0).getAllByRole('gridcell');

        const nameInput = newFormInputs[1].firstChild.firstChild;
        const descriptionInput = newFormInputs[2].firstChild.firstChild;

        await user.clear(nameInput);
        await user.type(nameInput, name);

        await user.clear(descriptionInput);
        await user.type(descriptionInput, description);

        const saveItem = within(form0).getByTestId('save-item');
        await user.click(saveItem);

        expect(updateForm).toBeCalledTimes(1);
        expect(updateForm).toBeCalledWith(forms[0].id, { name, description });

        await assertFormRow(updatedForm);
    });

    it('should require a non-empty name', async () => {
        const user = userEvent.setup();

        const description = faker.lorem.sentence();

        await act(async () => {
            render(routes, { initialEntries: ['/forms'] });
        });

        const form0 = screen.getByTestId(forms[0].id);
        const updateItem = within(form0).getByTestId('update-item');
        await user.click(updateItem);

        const newFormInputs = within(form0).getAllByRole('gridcell');

        const nameInput = newFormInputs[1].firstChild.firstChild;
        const descriptionInput = newFormInputs[2].firstChild.firstChild;

        await user.clear(nameInput);

        await user.clear(descriptionInput);
        await user.type(descriptionInput, description);

        const saveItem = within(form0).getByTestId('save-item');
        await user.click(saveItem);

        expect(updateForm).toBeCalledTimes(0);

        const snackbar = screen.getByTestId('snackbar');
        expect(snackbar).toBeInTheDocument();
        expect(snackbar).toHaveTextContent(
            'The name of a form must not be empty'
        );
    });

    it('should display snackbar when the API returns an error', async () => {
        const user = userEvent.setup();

        const name = faker.lorem.word();
        const description = faker.lorem.sentence();

        updateForm.mockImplementation(() => {
            const error = new Error();
            return Promise.reject(error);
        });

        await act(async () => {
            render(routes, { initialEntries: ['/forms'] });
        });

        const form0 = screen.getByTestId(forms[0].id);
        const updateItem = within(form0).getByTestId('update-item');
        await user.click(updateItem);

        const newFormInputs = within(form0).getAllByRole('gridcell');

        const nameInput = newFormInputs[1].firstChild.firstChild;
        const descriptionInput = newFormInputs[2].firstChild.firstChild;

        await user.clear(nameInput);
        await user.type(nameInput, name);

        await user.clear(descriptionInput);
        await user.type(descriptionInput, description);

        const saveItem = within(form0).getByTestId('save-item');
        await user.click(saveItem);

        expect(updateForm).toBeCalledTimes(1);
        expect(updateForm).toBeCalledWith(forms[0].id, { name, description });

        const snackbar = screen.getByTestId('snackbar');
        expect(snackbar).toBeInTheDocument();
        expect(snackbar).toHaveTextContent(
            'An error happened while updating the form. Please try again.'
        );
    });
});

describe('bulk delete', () => {
    beforeEach(() => {
        getForms.mockImplementation(() =>
            Promise.resolve({
                data: {
                    items: forms,
                },
            })
        );
    });

    it('should delete the selected items', async () => {
        const user = userEvent.setup();

        bulkDeleteForm.mockImplementation(() =>
            Promise.resolve({ data: undefined })
        );

        await act(async () => {
            render(routes, { initialEntries: ['/forms'] });
        });

        const form0 = screen.getByTestId(forms[0].id);
        await user.click(form0);

        const form1 = screen.getByTestId(forms[1].id);
        await user.click(form1);

        const bulkDeleteButton = screen.getByTestId('bulk-delete-button');
        await user.click(bulkDeleteButton);

        const confirmButton = screen.getByTestId('confirm-button');
        await user.click(confirmButton);

        expect(bulkDeleteForm).toBeCalledTimes(1);
        expect(bulkDeleteForm).toBeCalledWith([forms[0].id, forms[1].id]);

        expect(form0).not.toBeInTheDocument();
        expect(form1).not.toBeInTheDocument();
    });

    it('should display snackbar when the API returns an error', async () => {
        const user = userEvent.setup();

        bulkDeleteForm.mockImplementation(() => {
            const error = new Error();
            return Promise.reject(error);
        });

        await act(async () => {
            render(routes, { initialEntries: ['/forms'] });
        });

        const form0 = screen.getByTestId(forms[0].id);
        await user.click(form0);

        const form1 = screen.getByTestId(forms[1].id);
        await user.click(form1);

        const bulkDeleteButton = screen.getByTestId('bulk-delete-button');
        await user.click(bulkDeleteButton);

        const confirmButton = screen.getByTestId('confirm-button');
        await user.click(confirmButton);

        expect(bulkDeleteForm).toBeCalledTimes(1);
        expect(bulkDeleteForm).toBeCalledWith([forms[0].id, forms[1].id]);

        const snackbar = screen.getByTestId('snackbar');
        expect(snackbar).toBeInTheDocument();
        expect(snackbar).toHaveTextContent(
            'An error happened while deleting the forms. Please try again.'
        );
    });
});

it('should redirect to the form tree page when clicking on an item', async () => {
    const user = userEvent.setup();

    getForms.mockImplementation(() =>
        Promise.resolve({
            data: {
                items: forms,
            },
        })
    );

    await act(async () => {
        render(routes, { initialEntries: ['/forms'] });
    });

    const form0 = screen.getByTestId(forms[0].id);
    const form0AccessItem = within(form0).getByTestId('access-item');
    await user.click(form0AccessItem);

    const formTreePage = screen.getByTestId('form-tree-page');
    expect(formTreePage).toBeInTheDocument();
});
