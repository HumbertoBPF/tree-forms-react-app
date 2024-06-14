import React from 'react';
import Forms from 'pages/Forms';
import './App.css';
import {
    Route,
    createBrowserRouter,
    createRoutesFromElements,
} from 'react-router-dom';
import Base from 'pages/Base';
import FormTree from 'pages/FormTree';
import Login from 'pages/Login';

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Base />}>
            <Route path="/forms" element={<Forms />} />
            <Route path="/forms/:id" element={<FormTree />} />
            <Route path="/login" element={<Login />} />
        </Route>
    )
);

export default router;
