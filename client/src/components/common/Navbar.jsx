// client/src/components/common/Navbar.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Badge,
  Divider,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onMenuClick, toggleTheme, themeMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    handleMenuClose();
    navigate(path);
  };

  // Get page title based on current path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/products') return 'Products';
    if (path === '/orders') return 'Orders';
    if (path === '/orders/create') return 'Create Order';
    if (path.startsWith('/orders/')) return 'Order Details';
    if (path === '/users') return 'Users';
    if (path === '/profile') return 'Profile';
    if (path === '/settings') return 'Settings';
    return 'Inventory Management';
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  // Get user full name
  const getFullName = () => {
    if (!user) return 'User';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  };

  // Get user role badge color
  const getRoleColor = () => {
    if (!user) return '#757575';
    switch (user.role) {
      case 'admin': return '#d32f2f';
      case 'manager': return '#ed6c02';
      case 'employee': return '#1976d2';
      default: return '#757575';
    }
  };

  // Mock notifications (replace with real data later)
  const notifications = [
    { id: 1, message: 'Low stock alert: Product A', time: '5 min ago', type: 'warning' },
    { id: 2, message: 'New order #ORD-001', time: '1 hour ago', type: 'info' },
    { id: 3, message: 'Product B out of stock', time: '2 hours ago', type: 'error' }
  ];

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: '#ffffff',
        color: '#1a1a1a',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        borderBottom: '1px solid #e0e0e0',
        zIndex: theme.zIndex.drawer + 1,
        height: '64px'
      }}
    >
      <Toolbar sx={{ height: '64px', minHeight: '64px !important', px: { xs: 2, sm: 3 } }}>
        {/* Left section - Menu button and title */}
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{ 
              mr: 2,
              display: { md: 'none' },
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              color: '#1a1a1a',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap'
            }}
          >
            {getPageTitle()}
          </Typography>
        </Box>

        {/* Right section - Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
          {/* Theme Toggle */}
          <Tooltip title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton
              onClick={toggleTheme}
              color="inherit"
              sx={{
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
              }}
            >
              {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={handleNotificationOpen}
              sx={{
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
              }}
            >
              <Badge badgeContent={notifications.length} color="error" variant="dot">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: { xs: 0.5, sm: 1 } }}>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{
                  p: 0,
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
                  borderRadius: 0
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: '#1976d2',
                    borderRadius: 0,
                    fontSize: '14px',
                    fontWeight: 600,
                    border: '2px solid #e0e0e0'
                  }}
                >
                  {getUserInitials()}
                </Avatar>
              </IconButton>
            </Tooltip>

            {!isMobile && (
              <Box sx={{ ml: 1.5, display: 'flex', flexDirection: 'column' }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#1a1a1a',
                    lineHeight: 1.2
                  }}
                >
                  {getFullName()}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: getRoleColor(),
                    textTransform: 'uppercase',
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.5px'
                  }}
                >
                  {user?.role || 'Guest'}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* User Menu Dropdown */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              borderRadius: 0,
              minWidth: 220,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              mt: 1,
              '& .MuiMenuItem-root': {
                py: 1.5,
                px: 2,
                '&:hover': {
                  backgroundColor: '#f5f5f5'
                }
              }
            }
          }}
        >
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="body2" fontWeight={600}>
              {getFullName()}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {user?.email || ''}
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <Typography
                variant="caption"
                sx={{
                  color: getRoleColor(),
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  fontSize: '10px'
                }}
              >
                {user?.role || 'Guest'}
              </Typography>
            </Box>
          </Box>

          <MenuItem onClick={() => handleNavigate('/profile')}>
            <AccountCircleIcon sx={{ mr: 1.5, fontSize: 20 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={() => handleNavigate('/settings')}>
            <SettingsIcon sx={{ mr: 1.5, fontSize: 20 }} />
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f !important' }}>
            <LogoutIcon sx={{ mr: 1.5, fontSize: 20, color: '#d32f2f' }} />
            Logout
          </MenuItem>
        </Menu>

        {/* Notifications Dropdown */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              borderRadius: 0,
              minWidth: 320,
              maxWidth: 400,
              maxHeight: 400,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              mt: 1,
              overflow: 'auto'
            }
          }}
        >
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Notifications
            </Typography>
          </Box>

          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                No new notifications
              </Typography>
            </Box>
          ) : (
            notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={handleNotificationClose}
                sx={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  py: 1.5,
                  px: 2,
                  borderBottom: '1px solid #f5f5f5',
                  '&:last-child': { borderBottom: 'none' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      minWidth: 8,
                      mt: 1,
                      mr: 1.5,
                      bgcolor: notification.type === 'error' ? '#d32f2f' :
                               notification.type === 'warning' ? '#ed6c02' : '#1976d2'
                    }}
                  />
                  <Box flex={1}>
                    <Typography variant="body2">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {notification.time}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))
          )}

          <Box sx={{ px: 2, py: 1, borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
            <Typography
              variant="caption"
              color="primary"
              sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              View all notifications
            </Typography>
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;