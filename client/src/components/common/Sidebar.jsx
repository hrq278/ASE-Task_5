// client/src/components/common/Sidebar.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Divider,
  Collapse,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as ProductIcon,
  ShoppingCart as OrderIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  ExpandLess,
  ExpandMore,
  Storefront as StoreIcon,
  Category as CategoryIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 260;

const Sidebar = ({ mobileOpen, onDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, hasRole } = useAuth();
  
  const [openMenus, setOpenMenus] = useState({});

  const handleMenuToggle = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const handleNavigation = (path) => {
    if (isMobile) {
      onDrawerToggle();
    }
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Menu configuration with role-based access
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['admin', 'manager', 'employee']
    },
    {
      text: 'Products',
      icon: <ProductIcon />,
      path: '/products',
      roles: ['admin', 'manager', 'employee'],
      children: [
        { text: 'All Products', path: '/products', icon: <CategoryIcon /> },
        { text: 'Categories', path: '/products/categories', icon: <CategoryIcon /> },
        { text: 'Suppliers', path: '/products/suppliers', icon: <StoreIcon /> }
      ]
    },
    {
      text: 'Orders',
      icon: <OrderIcon />,
      path: '/orders',
      roles: ['admin', 'manager', 'employee'],
      children: [
        { text: 'All Orders', path: '/orders', icon: <ReceiptIcon /> },
        { text: 'Create Order', path: '/orders/create', icon: <OrderIcon /> },
        { text: 'Shipments', path: '/orders/shipments', icon: <ShippingIcon /> }
      ]
    },
    {
      text: 'Users',
      icon: <PeopleIcon />,
      path: '/users',
      roles: ['admin']
    },
    {
      text: 'Analytics',
      icon: <TrendingUpIcon />,
      path: '/analytics',
      roles: ['admin', 'manager']
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      roles: ['admin', 'manager']
    }
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    return hasRole(item.roles);
  });

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e0e0e0'
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <img
          src="/logo.png"
          alt="Allied Software Engineers"
          style={{
            width: '100%',
            maxWidth: '160px',
            height: 'auto',
            objectFit: 'contain'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{
            mt: 0.5,
            textAlign: 'center',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.3px'
          }}
        >
          Inventory Management System
        </Typography>
      </Box>

      {/* User Info Section */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            bgcolor: '#1976d2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '16px'
          }}
        >
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: user?.role === 'admin' ? '#d32f2f' :
                     user?.role === 'manager' ? '#ed6c02' : '#1976d2',
              textTransform: 'uppercase',
              fontWeight: 600,
              fontSize: '10px',
              letterSpacing: '0.5px'
            }}
          >
            {user?.role || 'Guest'}
          </Typography>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flex: 1, px: 1, pt: 1, overflow: 'auto' }}>
        {filteredMenuItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isItemActive = isActive(item.path);
          const isChildActive = hasChildren && item.children.some(child => isActive(child.path));
          const isOpen = openMenus[item.text] || isChildActive;

          return (
            <React.Fragment key={item.text}>
              {hasChildren ? (
                <>
                  <ListItemButton
                    onClick={() => handleMenuToggle(item.text)}
                    sx={{
                      mb: 0.5,
                      borderRadius: 0,
                      bgcolor: isActive(item.path) || isChildActive ? '#e3f2fd' : 'transparent',
                      borderLeft: isActive(item.path) || isChildActive ? '3px solid #1976d2' : '3px solid transparent',
                      '&:hover': {
                        bgcolor: '#f5f5f5'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive(item.path) || isChildActive ? '#1976d2' : 'inherit' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        '& .MuiTypography-root': {
                          fontWeight: isActive(item.path) || isChildActive ? 600 : 400,
                          fontSize: '14px'
                        }
                      }}
                    />
                    {isOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children.map((child) => (
                        <ListItemButton
                          key={child.text}
                          onClick={() => handleNavigation(child.path)}
                          sx={{
                            pl: 4,
                            mb: 0.5,
                            borderRadius: 0,
                            bgcolor: isActive(child.path) ? '#e3f2fd' : 'transparent',
                            borderLeft: isActive(child.path) ? '3px solid #1976d2' : '3px solid transparent',
                            '&:hover': {
                              bgcolor: '#f5f5f5'
                            }
                          }}
                        >
                          <ListItemIcon sx={{ 
                            color: isActive(child.path) ? '#1976d2' : 'inherit',
                            minWidth: '32px'
                          }}>
                            {child.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={child.text}
                            sx={{
                              '& .MuiTypography-root': {
                                fontSize: '13px',
                                fontWeight: isActive(child.path) ? 500 : 400,
                                color: isActive(child.path) ? '#1976d2' : 'inherit'
                              }
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </>
              ) : (
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    mb: 0.5,
                    borderRadius: 0,
                    bgcolor: isActive(item.path) ? '#e3f2fd' : 'transparent',
                    borderLeft: isActive(item.path) ? '3px solid #1976d2' : '3px solid transparent',
                    '&:hover': {
                      bgcolor: '#f5f5f5'
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: isActive(item.path) ? '#1976d2' : 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      '& .MuiTypography-root': {
                        fontWeight: isActive(item.path) ? 600 : 400,
                        fontSize: '14px',
                        color: isActive(item.path) ? '#1976d2' : 'inherit'
                      }
                    }}
                  />
                </ListItemButton>
              )}
            </React.Fragment>
          );
        })}
      </List>

      {/* Bottom Section */}
      <Box sx={{ borderTop: '1px solid #e0e0e0', p: 2 }}>
        <ListItemButton
          onClick={() => handleNavigation('/help')}
          sx={{
            borderRadius: 0,
            '&:hover': { bgcolor: '#f5f5f5' }
          }}
        >
          <ListItemIcon>
            <HelpIcon />
          </ListItemIcon>
          <ListItemText
            primary="Help & Support"
            sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
          />
        </ListItemButton>
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{
            display: 'block',
            textAlign: 'center',
            mt: 1,
            fontSize: '10px',
            letterSpacing: '0.3px'
          }}
        >
          Allied Software Engineers v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRadius: 0
          }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRadius: 0,
            borderRight: '1px solid #e0e0e0',
            top: 0,
            height: '100vh'
          }
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;