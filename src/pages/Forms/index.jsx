import React, { useEffect, useState } from 'react';
import {
    DataGrid,
    GridActionsCellItem,
    GridRow,
    GridRowEditStopReasons,
    GridRowModes,
} from '@mui/x-data-grid';
import SchemaIcon from '@mui/icons-material/Schema';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import EditToolbar from 'components/EditToolbar';
import { useNavigate } from 'react-router-dom';
import DeleteConfirmationDialog from 'components/DeleteConfirmationDialog';
import NotificationSnackbar from 'components/NotificationSnackbar';
import { createForm, deleteForm, getForms, updateForm } from 'api/routes';
import PropTypes from 'prop-types';

const CustomGridRow = (props) => (
    <GridRow {...props} data-testid={props.rowId} />
);

CustomGridRow.propTypes = {
    rowId: PropTypes.string.isRequired,
};

function Forms() {
    const [rows, setRows] = useState([]);
    const [rowModesModel, setRowModesModel] = useState({});
    const [rowSelectionModel, setRowSelectionModel] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState(undefined);

    const [deletionId, setDeletionId] = useState(undefined);
    const [isDeleting, setIsDeleting] = useState(false);

    const navigate = useNavigate();

    const maxId = rows.length;

    useEffect(() => {
        getForms()
            .then((response) => {
                const { items } = response.data;
                setRows(items);
                setIsLoading(false);
            })
            .catch(() => {
                setMessage(
                    'An error happened while loading your forms. Please try again.'
                );
                setIsLoading(false);
            });
    }, []);

    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.Edit },
        });
    };

    const handleSaveClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View },
        });
    };

    const handleDeleteClick = (id) => () => {
        setDeletionId(id);
    };

    const handleConfirmDeletion = () => {
        setIsDeleting(true);
        deleteForm(deletionId)
            .then(() => {
                setRows(rows.filter((row) => row.id !== deletionId));
                setIsDeleting(false);
                setDeletionId(undefined);
            })
            .catch(() => {
                setIsDeleting(false);
                setDeletionId(undefined);

                setMessage(
                    'An error happened while deleting the form. Please try again.'
                );
            });
    };

    const handleCancelClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });

        const editedRow = rows.find((row) => row.id === id);
        if (editedRow.isNew) {
            setRows(rows.filter((row) => row.id !== id));
        }
    };

    const isFormValid = (form) => form.name;

    const processRowUpdate = (newRow, originalRow) => {
        if (isFormValid(newRow)) {
            if (originalRow.isNew) {
                createForm({
                    name: newRow.name,
                    description: newRow.description,
                })
                    .then((response) => {
                        const item = response.data;
                        setRows(
                            rows.map((row) =>
                                row.id === newRow.id ? item : row
                            )
                        );
                    })
                    .catch(() => {
                        setMessage(
                            'An error happened while creating the form. Please try again.'
                        );
                        setRows(rows.filter((row) => row.id !== newRow.id));
                    });
            } else {
                updateForm(newRow.id, {
                    name: newRow.name,
                    description: newRow.description,
                })
                    .then((response) => {
                        const item = response.data;
                        setRows(
                            rows.map((row) =>
                                row.id === newRow.id ? item : row
                            )
                        );
                    })
                    .catch(() => {
                        setMessage(
                            'An error happened while updating the form. Please try again.'
                        );
                        setRows(
                            rows.map((row) =>
                                row.id === newRow.id ? originalRow : row
                            )
                        );
                    });
            }
            const updatedRow = { ...newRow, isNew: false };
            setRows(
                rows.map((row) => (row.id === newRow.id ? updatedRow : row))
            );
            return updatedRow;
        }

        throw new Error('The name of a form must not be empty');
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const columns = [
        { field: 'name', headerName: 'Name', width: 130, editable: true },
        {
            field: 'description',
            headerName: 'Description',
            width: 390,
            editable: true,
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 150,
            cellClassName: 'actions',
            getActions: ({ id }) => {
                const isInEditMode =
                    rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            key="Save"
                            sx={{
                                color: 'primary.main',
                            }}
                            onClick={handleSaveClick(id)}
                            data-testid="save-item"
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            key="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<SchemaIcon />}
                        label="Access"
                        key="Access"
                        className="textPrimary"
                        onClick={() => navigate(`/forms/${id}`)}
                        color="inherit"
                        data-testid="access-item"
                    />,
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        key="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                        data-testid="update-item"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        key="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                        data-testid="delete-item"
                    />,
                ];
            },
        },
    ];

    return (
        <>
            <DeleteConfirmationDialog
                loading={isDeleting}
                onClose={() => setDeletionId(undefined)}
                onConfirm={handleConfirmDeletion}
                open={deletionId !== undefined}
            />

            <DataGrid
                autoHeight
                rows={rows}
                columns={columns}
                loading={isLoading}
                checkboxSelection
                onRowSelectionModelChange={(newRowSelectionModel) => {
                    setRowSelectionModel(newRowSelectionModel);
                }}
                rowSelectionModel={rowSelectionModel}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowModesModelChange={handleRowModesModelChange}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                onProcessRowUpdateError={(error) => setMessage(error.message)}
                slots={{
                    row: CustomGridRow,
                    toolbar: EditToolbar,
                }}
                slotProps={{
                    toolbar: {
                        maxId,
                        rowSelectionModel,
                        setRows,
                        setRowModesModel,
                    },
                }}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                    },
                }}
                pageSizeOptions={[10]}
            />

            <NotificationSnackbar
                message={message}
                severity="error"
                onClose={() => setMessage(undefined)}
            />
        </>
    );
}

export default Forms;
