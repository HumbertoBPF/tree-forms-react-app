import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@mui/material';
import { GridRowModes, GridToolbarContainer } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import DeleteConfirmationDialog from 'components/DeleteConfirmationDialog';
import NotificationSnackbar from 'components/NotificationSnackbar';
import { bulkDeleteForm } from 'api/routes';

function EditToolbar({ maxId, rowSelectionModel, setRows, setRowModesModel }) {
    const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [message, setMessage] = useState(undefined);

    const handleClickAddButton = () => {
        const id = maxId + 1;
        setRows((oldRows) => [
            ...oldRows,
            { id: `${id}`, name: '', description: '', isNew: true },
        ]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
        }));
    };

    const handleClickDeleteButton = () => {
        setOpenConfirmationDialog(true);
    };

    const bulkDelete = () => {
        setIsDeleting(true);

        bulkDeleteForm(rowSelectionModel)
            .then(() => {
                setIsDeleting(false);
                setOpenConfirmationDialog(false);

                setRows((oldRows) =>
                    oldRows.filter(
                        (item) => !rowSelectionModel.includes(item.id)
                    )
                );
            })
            .catch(() => {
                setIsDeleting(false);
                setOpenConfirmationDialog(false);

                setMessage(
                    'An error happened while deleting the forms. Please try again.'
                );
            });
    };

    return (
        <>
            <DeleteConfirmationDialog
                loading={isDeleting}
                onClose={() => setOpenConfirmationDialog(false)}
                onConfirm={bulkDelete}
                open={openConfirmationDialog}
            />
            <GridToolbarContainer>
                <Button
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleClickAddButton}
                    data-testid="add-button"
                >
                    Add record
                </Button>
                <Button
                    color="error"
                    disabled={rowSelectionModel.length === 0}
                    startIcon={<DeleteIcon />}
                    onClick={handleClickDeleteButton}
                    data-testid="bulk-delete-button"
                >
                    Delete selected records
                </Button>
            </GridToolbarContainer>
            <NotificationSnackbar
                message={message}
                severity="error"
                onClose={() => setMessage(undefined)}
            />
        </>
    );
}

EditToolbar.propTypes = {
    maxId: PropTypes.number.isRequired,
    rowSelectionModel: PropTypes.array.isRequired,
    setRows: PropTypes.func.isRequired,
    setRowModesModel: PropTypes.func.isRequired,
};

export default EditToolbar;
