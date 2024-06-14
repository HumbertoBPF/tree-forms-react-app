import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
} from '@mui/material';
import { RichTreeView, useTreeViewApiRef } from '@mui/x-tree-view';
import React, { useEffect, useRef, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import ChecklistIcon from '@mui/icons-material/Checklist';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import { isAuth } from 'utils/user';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from 'api';

function buildNode(id, label, children = []) {
    return {
        id,
        label,
        children,
    };
}

const FORM_TREE = [
    buildNode('age', 'How old are you?', [
        buildNode('lower_18', 'Younger than 18 years old', [
            buildNode('school', 'Are you at school?', [
                buildNode('yes_school', 'Yes', [
                    buildNode('school_grade', 'What grade?', [
                        buildNode('elementary_school', 'Elementary school'),
                        buildNode('high_school', 'High school'),
                    ]),
                ]),
                buildNode('no_school', 'No'),
            ]),
        ]),
        buildNode('between_18_and_65', 'Between 18 and 65', [
            buildNode('profession', "What's your profession?", [
                buildNode('engineer_profession', 'Engineer', [
                    buildNode(
                        'driver_license',
                        'Do you have a driver license?',
                        [
                            buildNode('yes_driver_license', 'Yes'),
                            buildNode('no_driver_license', 'No'),
                        ]
                    ),
                ]),
                buildNode('doctor_profession', 'Doctor'),
                buildNode('lawyer_profession', 'Lawyer'),
                buildNode('educator_profession', 'Educator'),
            ]),
        ]),
        buildNode('plus_65', 'Older than 65 years old'),
    ]),
];

function FormTree() {
    // @ts-ignore
    const token = useSelector((state) => state.user.token);

    const apiRef = useTreeViewApiRef();

    const [isLoading, setIsLoading] = useState(true);
    const [form, setForm] = useState(undefined);

    const [label, setLabel] = useState('');
    const [openNodeDialog, setOpenNodeDialog] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const toggledItemRef = useRef({});

    const navigate = useNavigate();

    const params = useParams();
    const { id } = params;

    useEffect(() => {
        if (isAuth(token)) {
            api.get(`/form/${id}`)
                .then((response) => {
                    const item = response.data;
                    setForm(item);
                    setIsLoading(false);
                })
                .catch(() => {
                    setIsLoading(false);
                });
        }
    }, []);

    useEffect(() => {
        if (!isAuth(token)) {
            navigate('/login');
        }
    }, [token]);

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

    const handleOpenNodeDialog = (node) => {
        console.log(node);
        setSelectedNode(node);
        setLabel(node ? node.label : '');
        setOpenNodeDialog(true);
    };

    const handleCloseNodeDialog = () => {
        setOpenNodeDialog(false);
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
                    <Typography marginBottom="8px" variant="h6">
                        {form.name}
                    </Typography>
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
                        Select all children
                    </Button>
                    <Button
                        disabled={selectedItems.length === 0}
                        color="error"
                        startIcon={<DeleteIcon />}
                    >
                        Delete all selected
                    </Button>
                    <Dialog
                        open={openNodeDialog}
                        onClose={handleCloseNodeDialog}
                        PaperProps={{
                            component: 'form',
                            onSubmit: (event) => {
                                event.preventDefault();
                                console.log(selectedNode);
                                handleCloseNodeDialog();
                            },
                        }}
                    >
                        <DialogTitle>
                            {selectedNode ? 'Edit node' : 'Create node'}
                        </DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                required
                                margin="dense"
                                id="label"
                                name="label"
                                label="Label"
                                fullWidth
                                onChange={(event) =>
                                    setLabel(event.target.value)
                                }
                                multiline
                                rows={8}
                                variant="standard"
                                value={label}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseNodeDialog}>
                                Cancel
                            </Button>
                            <Button type="submit">Save</Button>
                        </DialogActions>
                    </Dialog>
                    <Box sx={{ minWidth: 250 }}>
                        <RichTreeView
                            checkboxSelection
                            multiSelect
                            apiRef={apiRef}
                            selectedItems={selectedItems}
                            onSelectedItemsChange={handleSelectedItemsChange}
                            onItemSelectionToggle={handleItemSelectionToggle}
                            items={FORM_TREE}
                        />
                    </Box>
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
