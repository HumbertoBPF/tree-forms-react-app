import { Box, Button, Paper, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveUser } from 'features/userSlice';
import { initiateAuth } from 'utils/aws';
import { useNavigate } from 'react-router-dom';
import { isAuth } from 'utils/user';
import ErrorSnackbar from 'components/ErrorSnackbar';

function Login() {
    // @ts-ignore
    const token = useSelector((state) => state.user.token);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState(undefined);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuth(token)) {
            navigate('/forms');
        }
    }, [token]);

    const handleSubmit = () => {
        // Amazon Cognito creates a session which includes the id, access, and refresh tokens of an authenticated user.
        const response = initiateAuth({ username, password });
        response
            .then((response) => {
                const token = response.AuthenticationResult.IdToken;
                dispatch(saveUser({ token }));
            })
            .catch(() => {
                setError('Authentication credentials are wrong.');
            });
    };

    return (
        <>
            <Box display="flex" justifyContent="center">
                <Paper
                    sx={{
                        padding: '16px',
                        width: {
                            xs: '100%',
                            sm: '50%',
                            md: '25%',
                        },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                    component="form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        handleSubmit();
                    }}
                >
                    <TextField
                        fullWidth
                        id="username"
                        label="Username"
                        onChange={(event) => setUsername(event.target.value)}
                        variant="standard"
                        value={username}
                    />
                    <TextField
                        sx={{ marginTop: '16px' }}
                        fullWidth
                        id="password"
                        label="Password"
                        onChange={(event) => setPassword(event.target.value)}
                        type="password"
                        variant="standard"
                        value={password}
                    />
                    <Button sx={{ marginTop: '16px' }} type="submit">
                        Log in
                    </Button>
                </Paper>
            </Box>
            <ErrorSnackbar error={error} onClose={() => setError(undefined)} />
        </>
    );
}

export default Login;
