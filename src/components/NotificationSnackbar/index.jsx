import { Alert, Snackbar } from '@mui/material';
import React from 'react';
import PropTypes from 'prop-types';

function NotificationSnackbar({ message, onClose, severity = 'success' }) {
    return (
        <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            open={message !== undefined}
            onClose={onClose}
        >
            <Alert
                // @ts-ignore
                severity={severity}
                variant="filled"
                sx={{ width: '100%' }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
}

NotificationSnackbar.propTypes = {
    message: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    severity: PropTypes.oneOf(['success', 'error']),
};

export default NotificationSnackbar;
