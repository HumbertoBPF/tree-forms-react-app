import { jwtDecode } from 'jwt-decode';

export const getUsername = (token) => {
    try {
        const payload = jwtDecode(token);
        return payload['cognito:username'];
    } catch (err) {
        return null;
    }
};

export const isAuth = (token) => getUsername(token) !== null;
