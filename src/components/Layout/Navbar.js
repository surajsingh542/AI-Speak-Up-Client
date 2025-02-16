import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
	AppBar,
	Box,
	Toolbar,
	IconButton,
	Typography,
	Menu,
	Container,
	Avatar,
	Button,
	Tooltip,
	MenuItem,
	Link
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import HelpIcon from '@mui/icons-material/Help';
import { logout } from '../../redux/slices/authSlice';

const pages = [
	{
		title: 'Dashboard',
		path: '/dashboard',
		icon: <DashboardIcon />,
		auth: true
	},
	{
		title: 'FAQs',
		path: '/faqs',
		icon: <HelpIcon />,
		public: true
	}
];

const adminPages = [
	{
		title: 'User Management',
		path: '/admin/users',
		icon: <AdminPanelSettingsIcon />
	},
	{
		title: 'Manage Categories',
		path: '/admin/categories',
		icon: <AdminPanelSettingsIcon />
	},
	{
		title: 'Manage FAQs',
		path: '/admin/faqs',
		icon: <HelpIcon />
	}
];

const settings = [
	{
		title: 'Profile',
		path: '/profile',
		icon: <PersonIcon />
	},
	{
		title: 'Logout',
		path: '/logout',
		icon: <LogoutIcon />
	}
];

// ... rest of the existing code ...