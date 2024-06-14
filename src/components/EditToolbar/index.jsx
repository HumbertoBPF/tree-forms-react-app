import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@mui/material';
import { GridRowModes, GridToolbarContainer } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import DeleteConfirmationDialog from 'components/DeleteConfirmationDialog';
import api from 'api';
import ErrorSnackbar from 'components/ErrorSnackbar';

function EditToolbar({ maxId, rowSelectionModel, setRows, setRowModesModel }) {
    const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(undefined);

    const handleClickAddButton = () => {
        const id = maxId + 1;
        setRows((oldRows) => [
            ...oldRows,
            { id, name: '', description: '', isNew: true },
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

        api.delete('/form', {
            data: {
                form_ids: rowSelectionModel,
            },
        })
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

                setError(
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
                >
                    Add record
                </Button>
                <Button
                    color="error"
                    disabled={rowSelectionModel.length === 0}
                    startIcon={<DeleteIcon />}
                    onClick={handleClickDeleteButton}
                >
                    Delete selected records
                </Button>
            </GridToolbarContainer>
            <ErrorSnackbar error={error} onClose={() => setError(undefined)} />
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
