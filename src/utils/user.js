import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export const getUsername = () => {
    const token = Cookies.get('token');
    try {
        const payload = jwtDecode(token);
        return payload['cognito:username'];
    } catch (err) {
        return null;
    }
};

export const isAuth = () => {
    return getUsername() !== null;
};
