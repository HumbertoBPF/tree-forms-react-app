import {
    RouterProvider,
    createMemoryRouter,
    createRoutesFromElements,
} from 'react-router-dom';
import { render as rtlRender } from '@testing-library/react';
import { fakerEN_US as faker } from '@faker-js/faker';

export const render = (routes, props = { initialEntries: [] }) => {
    const router = createMemoryRouter(createRoutesFromElements(routes), props);
    return rtlRender(<RouterProvider router={router} />);
};

export const mockForm = () => {
    const userId = faker.string.uuid();
    const formId = faker.string.uuid();
    const name = faker.lorem.word();
    const description = faker.lorem.sentence();

    return {
        filename: `${formId}.json`,
        owner: userId,
        description,
        id: formId,
        name,
    };
};

export const mockFormTreeNode = (isRoot = false, children = []) => {
    const id = isRoot ? 'root' : faker.string.uuid();
    const label = faker.lorem.word();

    return {
        id,
        label,
        children,
    };
};

export const mockFormTree = () => {
    return [
        mockFormTreeNode(true, [
            mockFormTreeNode(false),
            mockFormTreeNode(false),
            mockFormTreeNode(false),
        ]),
    ];
};
