import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Grid,
    Typography,
} from '@mui/material';
import { RichTreeView, useTreeViewApiRef } from '@mui/x-tree-view';
import React, { useEffect, useRef, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import ChecklistIcon from '@mui/icons-material/Checklist';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import SaveIcon from '@mui/icons-material/Save';
import { isAuth } from 'utils/user';
import { useNavigate, useParams } from 'react-router-dom';
import api from 'api';
import { deleteNode } from 'utils/tree';
import TreeNodeDialog from 'components/TreeNodeDialog';
import DeleteConfirmationDialog from 'components/DeleteConfirmationDialog';
import NotificationSnackbar from 'components/NotificationSnackbar';

function FormTree() {
    const apiRef = useTreeViewApiRef();

    const [isLoading, setIsLoading] = useState(true);
    const [form, setForm] = useState(undefined);
    const [tree, setTree] = useState([]);

    const [openTreeNodeDialog, setOpenTreeNodeDialog] = useState(false);

    const [openDeleteConfirmationDialog, setOpenDeleteConfirmationDialog] =
        useState(false);

    const [operation, setOperation] = useState('create');
    const [selectedNode, setSelectedNode] = useState({});
    const [selectedItems, setSelectedItems] = useState([]);
    const toggledItemRef = useRef({});

    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [notification, setNotification] = useState({
        message: undefined,
        severity: 'error',
    });

    const navigate = useNavigate();

    const params = useParams();
    const { id } = params;

    useEffect(() => {
        if (isAuth()) {
            api()
                .get(`/form/${id}`)
                .then((response) => {
                    const item = response.data;
                    setForm(item);
                    setTree(item.form_tree);
                    setIsLoading(false);
                })
                .catch(() => {
                    setIsLoading(false);
                });
        }
    }, []);

    useEffect(() => {
        if (!isAuth()) {
            navigate('/login');
        }
    }, []);

    const getItemDescendantsIds = (item) => {
        const ids = [];

        item.children?.forEach((child) => {
            ids.push(child.id);
            ids.push(...getItemDescendantsIds(child));
        });

        return ids;
    };

    const handleItemSelectionToggle = (event, itemId, isSelected) => {
        toggledItemRef.current[itemId] = isSelected;
    };

    const handleSelectedItemsChange = (event, newSelectedItems) => {
        setSelectedItems(newSelectedItems);
    };

    const handleSelectAllChildren = () => {
        // Select the children of the toggled items
        const itemsToSelect = [];

        Object.entries(toggledItemRef.current).forEach(
            ([itemId, isSelected]) => {
                const item = apiRef.current.getItem(itemId);
                if (isSelected) {
                    itemsToSelect.push(item.id);
                    itemsToSelect.push(...getItemDescendantsIds(item));
                }
            }
        );

        setSelectedItems([...itemsToSelect]);
    };

    const handleDeleteAllSelected = () => {
        if (selectedItems.includes('root')) {
            setNotification({
                message: 'You cannot delete the initial node.',
                severity: 'error',
            });
            return;
        }

        setOpenDeleteConfirmationDialog(true);
    };

    const handleConfirmDeletion = () => {
        setIsDeleting(true);

        let updatedTree = [...tree];

        selectedItems.forEach((selectedItem) => {
            updatedTree = [...deleteNode(selectedItem, updatedTree)];
        });

        setTree(updatedTree);

        setIsDeleting(false);
        setOpenDeleteConfirmationDialog(false);
    };

    const handleOpenNodeDialog = (node) => {
        setOperation(node ? 'update' : 'create');
        setSelectedNode(apiRef.current.getItem(selectedItems[0]));
        setOpenTreeNodeDialog(true);
    };

    const handleCloseNodeDialog = () => {
        setOpenTreeNodeDialog(false);
    };

    const handleSave = () => {
        setIsSaving(true);

        api()
            .put(`/form/${id}/form-tree`, tree)
            .then(() => {
                setIsSaving(false);
                setNotification({
                    message: 'Form tree successfully saved.',
                    severity: 'success',
                });
            })
            .catch(() => {
                setIsSaving(false);
                setNotification({
                    message: 'Error when saving the form tree.',
                    severity: 'error',
                });
            });
    };

    const renderForm = () => (
        <>
            {form === undefined ? (
                <Box display="flex" flexDirection="column" alignItems="center">
                    <Alert
                        sx={{ marginBottom: '8px' }}
                        variant="outlined"
                        severity="warning"
                    >
                        <Typography variant="body2">
                            The requested resource could not be found.
                        </Typography>
                    </Alert>
                    <Box display="flex" justifyContent="center">
                        <Button
                            startIcon={<HomeIcon />}
                            onClick={() => navigate('/forms')}
                        >
                            Go to home
                        </Button>
                    </Box>
                </Box>
            ) : (
                <>
                    <Grid container>
                        <Grid item flexGrow={1}>
                            <Typography marginBottom="8px" variant="h6">
                                {form.name}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Button
                                color="success"
                                disabled={isSaving}
                                onClick={handleSave}
                                startIcon={<SaveIcon />}
                            >
                                Save form
                            </Button>
                        </Grid>
                    </Grid>
                    <Button
                        disabled={selectedItems.length !== 1}
                        onClick={() => handleOpenNodeDialog(null)}
                        startIcon={<AddIcon />}
                    >
                        Add child
                    </Button>
                    <Button
                        disabled={selectedItems.length !== 1}
                        onClick={() =>
                            handleOpenNodeDialog(
                                apiRef.current.getItem(selectedItems[0])
                            )
                        }
                        startIcon={<EditIcon />}
                    >
                        Edit node
                    </Button>
                    <Button
                        disabled={selectedItems.length === 0}
                        onClick={handleSelectAllChildren}
                        startIcon={<ChecklistIcon />}
                    >
                        Select children
                    </Button>
                    <Button
                        disabled={selectedItems.length === 0}
                        color="error"
                        onClick={handleDeleteAllSelected}
                        startIcon={<DeleteIcon />}
                    >
                        Delete selected
                    </Button>
                    <TreeNodeDialog
                        handleClose={handleCloseNodeDialog}
                        open={openTreeNodeDialog}
                        operation={operation}
                        selectedNode={selectedNode}
                        setTree={setTree}
                        tree={tree}
                    />
                    <DeleteConfirmationDialog
                        loading={isDeleting}
                        onClose={() => setOpenDeleteConfirmationDialog(false)}
                        onConfirm={handleConfirmDeletion}
                        open={openDeleteConfirmationDialog}
                    />
                    <Box sx={{ minWidth: 250 }}>
                        <RichTreeView
                            checkboxSelection
                            multiSelect
                            apiRef={apiRef}
                            selectedItems={selectedItems}
                            onSelectedItemsChange={handleSelectedItemsChange}
                            onItemSelectionToggle={handleItemSelectionToggle}
                            items={tree}
                        />
                    </Box>
                    <NotificationSnackbar
                        message={notification.message}
                        onClose={() =>
                            setNotification({
                                ...notification,
                                message: undefined,
                            })
                        }
                        severity={notification.severity}
                    />
                </>
            )}
        </>
    );

    return (
        <>
            {isLoading ? (
                <Box display="flex" justifyContent="center">
                    <CircularProgress />
                </Box>
            ) : (
                renderForm()
            )}
        </>
    );
}

export default FormTree;
