import React, { useState, useEffect } from 'react';
import {
	Box,
	Container,
	Typography,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Alert,
	CircularProgress,
	Chip,
	Pagination
} from '@mui/material';
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	Block as BlockIcon,
	CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import axios from '../../config/axios';
import { toast } from 'react-toastify';

const UserManagement = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [openDialog, setOpenDialog] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		role: 'user',
		status: 'active'
	});
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [limit] = useState(10);

	const roles = [
		{ value: 'user', label: 'User' },
		{ value: 'admin', label: 'Admin' }
	];

	const statuses = [
		{ value: 'active', label: 'Active' },
		{ value: 'inactive', label: 'Inactive' },
		{ value: 'blocked', label: 'Blocked' }
	];

	useEffect(() => {
		fetchUsers();
	}, [page, limit]);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const response = await axios.get(`/admin/users?page=${page}&limit=${limit}`);
			setUsers(response.data.users || []);
			setTotalPages(response.data.totalPages || 1);
			setError(null);
		} catch (err) {
			setError('Failed to load users. Please try again.');
			console.error('Error fetching users:', err);
			setUsers([]);
		} finally {
			setLoading(false);
		}
	};

	const handleOpenDialog = (user = null) => {
		if (user) {
			setSelectedUser(user);
			setFormData({
				name: user.name,
				email: user.email,
				role: user.role,
				status: user.status
			});
		} else {
			setSelectedUser(null);
			setFormData({
				name: '',
				email: '',
				role: 'user',
				status: 'active'
			});
		}
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setSelectedUser(null);
		setFormData({
			name: '',
			email: '',
			role: 'user',
			status: 'active'
		});
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (selectedUser) {
				await axios.put(`/admin/users/${selectedUser._id}`, formData);
				toast.success('User updated successfully');
			} else {
				await axios.post('/admin/users', formData);
				toast.success('User created successfully');
			}
			fetchUsers();
			handleCloseDialog();
		} catch (err) {
			toast.error(err.response?.data?.message || 'Failed to save user');
			console.error('Error saving user:', err);
		}
	};

	const handleDelete = async (id) => {
		if (window.confirm('Are you sure you want to delete this user?')) {
			try {
				await axios.delete(`/admin/users/${id}`);
				toast.success('User deleted successfully');
				fetchUsers();
			} catch (err) {
				toast.error(err.response?.data?.message || 'Failed to delete user');
				console.error('Error deleting user:', err);
			}
		}
	};

	const handleToggleStatus = async (user) => {
		const newStatus = user.status === 'active' ? 'blocked' : 'active';
		try {
			await axios.patch(`/admin/users/${user._id}/status`, { status: newStatus });
			toast.success(`User ${newStatus === 'active' ? 'activated' : 'blocked'} successfully`);
			fetchUsers();
		} catch (err) {
			toast.error(err.response?.data?.message || 'Failed to update user status');
			console.error('Error updating user status:', err);
		}
	};

	if (loading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
				<Typography variant="h4" component="h1">
					User Management
				</Typography>
				<Button
					variant="contained"
					color="primary"
					onClick={() => handleOpenDialog()}
				>
					Add New User
				</Button>
			</Box>

			{error && (
				<Alert severity="error" sx={{ mb: 3 }}>
					{error}
				</Alert>
			)}

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>Email</TableCell>
							<TableCell>Role</TableCell>
							<TableCell>Status</TableCell>
							<TableCell align="right">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{users.map((user) => (
							<TableRow key={user._id}>
								<TableCell>{user.name}</TableCell>
								<TableCell>{user.email}</TableCell>
								<TableCell>
									<Chip
										label={user.role}
										color={user.role === 'admin' ? 'primary' : 'default'}
										size="small"
									/>
								</TableCell>
								<TableCell>
									<Chip
										label={user.status}
										color={user.status === 'active' ? 'success' : 'error'}
										size="small"
									/>
								</TableCell>
								<TableCell align="right">
									<IconButton
										onClick={() => handleToggleStatus(user)}
										color={user.status === 'active' ? 'error' : 'success'}
										size="small"
									>
										{user.status === 'active' ? <BlockIcon /> : <CheckCircleIcon />}
									</IconButton>
									<IconButton
										onClick={() => handleOpenDialog(user)}
										color="primary"
										size="small"
									>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleDelete(user._id)}
										color="error"
										size="small"
									>
										<DeleteIcon />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{users.length > 0 && (
				<Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
					<Pagination
						count={totalPages}
						page={page}
						onChange={(e, newPage) => setPage(newPage)}
						color="primary"
						showFirstButton
						showLastButton
					/>
				</Box>
			)}

			<Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
				<DialogTitle>
					{selectedUser ? 'Edit User' : 'Add New User'}
				</DialogTitle>
				<DialogContent>
					<Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
						<TextField
							fullWidth
							label="Name"
							name="name"
							value={formData.name}
							onChange={handleInputChange}
							required
							sx={{ mb: 2 }}
						/>
						<TextField
							fullWidth
							label="Email"
							name="email"
							type="email"
							value={formData.email}
							onChange={handleInputChange}
							required
							sx={{ mb: 2 }}
						/>
						<FormControl fullWidth sx={{ mb: 2 }}>
							<InputLabel>Role</InputLabel>
							<Select
								name="role"
								value={formData.role}
								onChange={handleInputChange}
								label="Role"
							>
								{roles.map((role) => (
									<MenuItem key={role.value} value={role.value}>
										{role.label}
									</MenuItem>
								))}
							</Select>
						</FormControl>
						<FormControl fullWidth sx={{ mb: 2 }}>
							<InputLabel>Status</InputLabel>
							<Select
								name="status"
								value={formData.status}
								onChange={handleInputChange}
								label="Status"
							>
								{statuses.map((status) => (
									<MenuItem key={status.value} value={status.value}>
										{status.label}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDialog}>Cancel</Button>
					<Button onClick={handleSubmit} variant="contained" color="primary">
						{selectedUser ? 'Update' : 'Create'}
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
};

export default UserManagement; 