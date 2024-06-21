import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from 'pages/Login';
import { initiateAuth } from 'utils/aws';
import { render } from 'utils/tests';
import { fakerEN_US as faker } from '@faker-js/faker';
import { Route } from 'react-router-dom';
import Base from 'pages/Base';

const routes = (
    <Route path="/" element={<Base />}>
        <Route path="/login" element={<Login />} />
        <Route
            path="/forms"
            element={<h1 data-testid="forms-page">Forms page</h1>}
        />
    </Route>
);

jest.mock('utils/aws', () => ({
    initiateAuth: jest.fn(),
}));

it('should submit login form and redirect to /forms', async () => {
    const user = userEvent.setup();

    const username = faker.internet.userName();
    const password = 'str0ng-P@ssw0rd';

    initiateAuth.mockImplementation(() =>
        Promise.resolve({ AuthenticationResult: { IdToken: 'token' } })
    );

    await act(async () => {
        render(routes, { initialEntries: ['/login'] });
    });

    const usernameInput = screen.getByTestId('username-input');
    await user.type(usernameInput, username);

    const passwordInput = screen.getByTestId('password-input');
    await user.type(passwordInput, password);

    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    expect(initiateAuth).toBeCalledTimes(1);
    expect(initiateAuth).toBeCalledWith({ username, password });

    const formsPage = screen.getByTestId('forms-page');
    expect(formsPage).toBeInTheDocument();
});

it('should display snackbar if the login API returns an error', async () => {
    const user = userEvent.setup();

    const username = faker.internet.userName();
    const password = 'str0ng-P@ssw0rd';

    initiateAuth.mockImplementation(() => {
        const error = new Error();
        return Promise.reject(error);
    });

    await act(async () => {
        render(routes, { initialEntries: ['/login'] });
    });

    const usernameInput = screen.getByTestId('username-input');
    await user.type(usernameInput, username);

    const passwordInput = screen.getByTestId('password-input');
    await user.type(passwordInput, password);

    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    expect(initiateAuth).toBeCalledTimes(1);
    expect(initiateAuth).toBeCalledWith({ username, password });

    const snackbar = screen.getByTestId('snackbar');
    expect(snackbar).toBeInTheDocument();
    expect(snackbar).toHaveTextContent('Authentication credentials are wrong.');
});
