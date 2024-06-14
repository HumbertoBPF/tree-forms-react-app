import { Alert, Snackbar } from '@mui/material';
import React from 'react';
import PropTypes from 'prop-types';

function ErrorSnackbar({ error, onClose }) {
    return (
        <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            open={error !== undefined}
            onClose={onClose}
        >
            <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
                {error}
            </Alert>
        </Snackbar>
    );
}

ErrorSnackbar.propTypes = {
    error: PropTypes.string,
    onClose: PropTypes.func.isRequired,
};

export default ErrorSnackbar;
