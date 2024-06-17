import React, { useEffect, useState } from 'react';
import {
    DataGrid,
    GridActionsCellItem,
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
import { isAuth } from 'utils/user';
import api from 'api';
import DeleteConfirmationDialog from 'components/DeleteConfirmationDialog';
import NotificationSnackbar from 'components/NotificationSnackbar';

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
        if (isAuth()) {
            api()
                .get('/form')
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
            return;
        }

        navigate('/login');
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

    const deleteForm = () => {
        setIsDeleting(true);
        api()
            .delete(`/form/${deletionId}`)
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
                api()
                    .post('/form', newRow)
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
                api()
                    .put(`/form/${newRow.id}`, newRow)
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

        setMessage('The name of a form must not be empty');
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
                    />,
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        key="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        key="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
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
                onConfirm={deleteForm}
                open={deletionId !== undefined}
            />

            <DataGrid
                autoHeight
                rows={rows}
                // @ts-ignore
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
                slots={{
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
