import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
	AppBar,
	Box,
	Drawer,
	IconButton,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Toolbar,
	Typography,
	Avatar,
	Menu,
	MenuItem,
	useTheme,
	useMediaQuery,
	Divider,
	Badge
} from '@mui/material';
import {
	Menu as MenuIcon,
	Dashboard as DashboardIcon,
	Add as AddIcon,
	Settings as SettingsIcon,
	Person as PersonIcon,
	ExitToApp as LogoutIcon,
	Notifications as NotificationsIcon,
	AdminPanelSettings as AdminPanelSettingsIcon,
	Help as HelpIcon,
	History as HistoryIcon
} from '@mui/icons-material';
import { logout } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';
import CategorySelectionDialog from '../CategorySelectionDialog';

const drawerWidth = 240;

function Layout() {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const { user } = useSelector(state => state.auth);
	const { categories = [] } = useSelector(state => state.categories || {});

	const [mobileOpen, setMobileOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState(null);
	const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [showSubCategories, setShowSubCategories] = useState(false);

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	const handleProfileMenuOpen = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleProfileMenuClose = () => {
		setAnchorEl(null);
	};

	const handleNewComplaint = () => {
		setCategoryDialogOpen(true);
		setSelectedCategory(null);
		setShowSubCategories(false);
		if (isMobile) setMobileOpen(false);
	};

	const handleCategorySelect = (category) => {
		if (!category.subCategories?.length) {
			// If category has no subcategories, go directly to complaint form
			navigate('/complaints/new', { state: { category: category._id } });
			setCategoryDialogOpen(false);
			return;
		}
		setSelectedCategory(category);
		setShowSubCategories(true);
	};

	const handleSubCategorySelect = (category, subCategory) => {
		navigate('/complaints/new', {
			state: {
				category: category._id,
				subCategory: subCategory._id
			}
		});
		setCategoryDialogOpen(false);
		setShowSubCategories(false);
		setSelectedCategory(null);
	};

	const handleDialogClose = () => {
		setCategoryDialogOpen(false);
		setSelectedCategory(null);
		setShowSubCategories(false);
	};

	const handleLogout = async () => {
		try {
			await dispatch(logout()).unwrap();
			navigate('/login');
			toast.success('Logged out successfully');
		} catch (error) {
			toast.error('Failed to logout');
		}
	};

	const menuItems = [
		{ text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
		{
			text: 'New Complaint',
			icon: <AddIcon />,
			action: handleNewComplaint
		},
		{ text: 'History', icon: <HistoryIcon />, path: '/history' },
		{ text: 'Profile', icon: <PersonIcon />, path: '/profile' },
		{ text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
		...(user?.role !== 'admin' ? [
			{ text: 'FAQs', icon: <HelpIcon />, path: '/faqs' }
		] : []),
		...(user?.role === 'admin' ? [
			{ text: 'User Management', icon: <AdminPanelSettingsIcon />, path: '/admin/users' },
			{ text: 'Manage Categories', icon: <AdminPanelSettingsIcon />, path: '/admin/categories' },
			{ text: 'Manage FAQs', icon: <HelpIcon />, path: '/admin/faqs' }
		] : [])
	];

	const drawer = (
		<Box>
			<Toolbar>
				<Typography variant="h6" noWrap>
					Speak Up
				</Typography>
			</Toolbar>
			<Divider />
			<List>
				{menuItems.map((item) => (
					<ListItem
						button
						key={item.text}
						onClick={() => {
							if (item.action) {
								item.action();
							} else {
								navigate(item.path);
								if (isMobile) setMobileOpen(false);
							}
						}}
						selected={item.path && location.pathname === item.path}
					>
						<ListItemIcon>{item.icon}</ListItemIcon>
						<ListItemText primary={item.text} />
					</ListItem>
				))}
			</List>
		</Box>
	);

	return (
		<Box sx={{ display: 'flex' }}>
			<AppBar
				position="fixed"
				sx={{
					width: { sm: `calc(100% - ${drawerWidth}px)` },
					ml: { sm: `${drawerWidth}px` }
				}}
			>
				<Toolbar>
					<IconButton
						color="inherit"
						edge="start"
						onClick={handleDrawerToggle}
						sx={{ mr: 2, display: { sm: 'none' } }}
					>
						<MenuIcon />
					</IconButton>
					<Box sx={{ flexGrow: 1 }} />
					<IconButton color="inherit">
						<Badge badgeContent={4} color="error">
							<NotificationsIcon />
						</Badge>
					</IconButton>
					<IconButton
						onClick={handleProfileMenuOpen}
						sx={{ ml: 1 }}
					>
						<Avatar
							alt={user?.name}
							src={user?.profilePicture}
							sx={{ width: 32, height: 32 }}
						/>
					</IconButton>
				</Toolbar>
			</AppBar>

			<Box
				component="nav"
				sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
			>
				<Drawer
					variant="temporary"
					open={mobileOpen}
					onClose={handleDrawerToggle}
					ModalProps={{ keepMounted: true }}
					sx={{
						display: { xs: 'block', sm: 'none' },
						'& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
					}}
				>
					{drawer}
				</Drawer>
				<Drawer
					variant="permanent"
					sx={{
						display: { xs: 'none', sm: 'block' },
						'& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
					}}
					open
				>
					{drawer}
				</Drawer>
			</Box>

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					width: { sm: `calc(100% - ${drawerWidth}px)` },
					minHeight: '100vh',
					bgcolor: 'background.default'
				}}
			>
				<Toolbar />
				<Outlet />
			</Box>

			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleProfileMenuClose}
				onClick={handleProfileMenuClose}
			>
				<MenuItem onClick={() => navigate('/profile')}>
					<ListItemIcon>
						<PersonIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Profile</ListItemText>
				</MenuItem>
				<MenuItem onClick={() => navigate('/settings')}>
					<ListItemIcon>
						<SettingsIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Settings</ListItemText>
				</MenuItem>
				<Divider />
				<MenuItem onClick={handleLogout}>
					<ListItemIcon>
						<LogoutIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Logout</ListItemText>
				</MenuItem>
			</Menu>

			<CategorySelectionDialog
				open={categoryDialogOpen}
				onClose={handleDialogClose}
				categories={categories || []}
				selectedCategory={selectedCategory}
				showSubCategories={showSubCategories}
				onCategorySelect={handleCategorySelect}
				onSubCategorySelect={handleSubCategorySelect}
				isNewComplaint={true}
			/>
		</Box>
	);
}

export default Layout;
