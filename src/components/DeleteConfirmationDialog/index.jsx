import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from '@mui/material';
import React from 'react';
import PropTypes from 'prop-types';

function DeleteConfirmationDialog({ loading, onClose, onConfirm, open }) {
    return (
        <Dialog
            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
            maxWidth="xs"
            open={open}
        >
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Box display="flex" justifyContent="center">
                        <CircularProgress />
                    </Box>
                ) : (
                    <Typography>
                        The deletion of items is an irreversible action. Do you
                        want to proceed?
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={onConfirm} data-testid="confirm-button">
                    Yes
                </Button>
            </DialogActions>
        </Dialog>
    );
}

DeleteConfirmationDialog.propTypes = {
    loading: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
};

export default DeleteConfirmationDialog;
