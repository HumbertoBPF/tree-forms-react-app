import React, { useState } from 'react';
import {
    AppBar,
    Box,
    Button,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { Outlet, useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import { getUsername } from 'utils/user';
import Cookies from 'js-cookie';

function Base() {
    const username = getUsername();

    const [anchorEl, setAnchorEl] = useState(null);

    const navigate = useNavigate();

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        Cookies.remove('token');
        handleClose();
        navigate('/login');
    };

    return (
        <>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            onClick={() => navigate('/forms')}
                            sx={{ mr: 2 }}
                        >
                            <AccountTreeIcon />
                        </IconButton>
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{ flexGrow: 1 }}
                        >
                            Tree Forms
                        </Typography>
                        {username ? (
                            <div>
                                <Button
                                    size="large"
                                    aria-label="account of current user"
                                    aria-controls="menu-appbar"
                                    aria-haspopup="true"
                                    startIcon={<AccountCircle />}
                                    onClick={handleMenu}
                                    color="inherit"
                                >
                                    <Typography variant="body1">
                                        {username}
                                    </Typography>
                                </Button>
                                <Menu
                                    id="menu-appbar"
                                    anchorEl={anchorEl}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                >
                                    <MenuItem onClick={handleLogout}>
                                        <ListItemIcon>
                                            <LogoutIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Logout</ListItemText>
                                    </MenuItem>
                                </Menu>
                            </div>
                        ) : (
                            <Button
                                color="inherit"
                                onClick={() => navigate('/login')}
                            >
                                Login
                            </Button>
                        )}
                    </Toolbar>
                </AppBar>
            </Box>
            <Box padding="16px">
                <Outlet />
            </Box>
        </>
    );
}

export default Base;
