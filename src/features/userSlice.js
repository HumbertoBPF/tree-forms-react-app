import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const initialState = {
    token: Cookies.get('token'),
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        saveUser: (state, action) => {
            const { payload } = action;
            state.token = payload.token;
            Cookies.set('token', payload.token);
        },
        clearUser: () => {
            Cookies.remove('token');
            return initialState;
        },
    },
});

export const { saveUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
