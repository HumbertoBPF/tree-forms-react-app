import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { addNode, updateNode } from 'utils/tree';
import PropTypes from 'prop-types';

const UPDATE_OPERATION = 'update';
const CREATE_OPERATION = 'create';

function TreeNodeDialog({
    handleClose,
    open,
    operation,
    selectedNode,
    setTree,
    tree,
}) {
    const [label, setLabel] = useState('');

    useEffect(() => {
        setLabel(operation === UPDATE_OPERATION ? selectedNode.label : '');
    }, [open]);

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{
                component: 'form',
                onSubmit: (event) => {
                    event.preventDefault();

                    const selectedItemId = selectedNode.id;

                    if (operation === UPDATE_OPERATION) {
                        const updatedTree = updateNode(
                            selectedItemId,
                            label,
                            tree
                        );
                        setTree([...updatedTree]);
                    } else {
                        const updatedTree = addNode(
                            selectedItemId,
                            label,
                            tree
                        );
                        setTree([...updatedTree]);
                    }

                    handleClose();
                },
            }}
        >
            <DialogTitle>
                {operation === UPDATE_OPERATION ? 'Edit node' : 'Create node'}
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
                    onChange={(event) => setLabel(event.target.value)}
                    multiline
                    rows={8}
                    variant="standard"
                    value={label}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit">Save</Button>
            </DialogActions>
        </Dialog>
    );
}

TreeNodeDialog.propTypes = {
    handleClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    operation: PropTypes.oneOf([UPDATE_OPERATION, CREATE_OPERATION]).isRequired,
    selectedNode: PropTypes.object.isRequired,
    setTree: PropTypes.func.isRequired,
    tree: PropTypes.array.isRequired,
};

export default TreeNodeDialog;
