import axios from 'axios';
import Cookies from 'js-cookie';
import { InvalidTokenError, jwtDecode } from 'jwt-decode';

const logout = () => {
    Cookies.remove('token');
    window.location.replace('/login');
};

window.logout = logout;

const tokenInterceptor = (config) => {
    const token = Cookies.get('token');

    if (token === undefined) {
        window.logout();
    }

    try {
        const payload = jwtDecode(token);

        const expiration = payload.exp;

        const date = new Date();
        const now = date.getTime() / 1000;

        if (expiration && expiration < now) {
            window.logout();
        }
    } catch (e) {
        if (e instanceof InvalidTokenError) {
            window.logout();
        }
    }

    return config;
};

const api = () => {
    const token = Cookies.get('token');

    const instance = axios.create({
        baseURL: process.env.REACT_APP_API_URL,
        headers: { Authorization: `Bearer ${token}` },
    });
    instance.interceptors.request.use(tokenInterceptor);

    return instance;
};

export default api;
