import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
	Box,
	Container,
	Typography,
	Paper,
	InputBase,
	IconButton,
	Avatar,
	Chip,
	Divider,
	CircularProgress,
	Menu,
	MenuItem,
	FormControl,
	InputLabel,
	Select,
	Button,
	Pagination,
	Grid,
	Card,
	CardContent,
	useTheme,
	alpha
} from '@mui/material';
import {
	Search as SearchIcon,
	FilterList as FilterListIcon,
	MoreVert as MoreVertIcon,
	AccessTime as AccessTimeIcon,
	Flag as FlagIcon,
	Category as CategoryIcon
} from '@mui/icons-material';
import { fetchComplaints, updateComplaintStatus } from '../../redux/slices/complaintSlice';
import useDebounceSearch from '../../hooks/useDebounceSearch';
import { format } from 'date-fns';
import ComplaintStatusDialog from '../../components/ComplaintStatusDialog';
import { toast } from 'react-toastify';

function History() {
	const theme = useTheme();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [sortBy, setSortBy] = useState('newest');
	const debouncedSearchQuery = useDebounceSearch(searchQuery);
	const { complaints, loading, totalComplaints, totalPages } = useSelector(state => state.complaints);
	const { user } = useSelector(state => state.auth);
	const [selectedComplaint, setSelectedComplaint] = useState(null);
	const [statusDialogOpen, setStatusDialogOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState(null);
	const [page, setPage] = useState(1);
	const [limit] = useState(10);

	useEffect(() => {
		const fetchData = async () => {
			const abortController = new AbortController();
			try {
				await dispatch(fetchComplaints({
					page,
					limit,
					filters: {
						search: debouncedSearchQuery,
						status: statusFilter,
						sort: sortBy
					},
					signal: abortController.signal
				})).unwrap();
			} catch (error) {
				if (!error.name === 'AbortError') {
					console.error('Error fetching complaints:', error);
				}
			}
			return () => abortController.abort();
		};

		fetchData();
	}, [dispatch, debouncedSearchQuery, statusFilter, sortBy, page, limit]);

	const handleStatusUpdate = async (updateData) => {
		try {
			await dispatch(updateComplaintStatus({
				complaintId: selectedComplaint._id,
				...updateData
			})).unwrap();
			toast.success('Complaint status updated successfully');
		} catch (error) {
			toast.error(error.message || 'Failed to update status');
		}
	};

	const handleMenuClick = (event, complaint) => {
		setAnchorEl(event.currentTarget);
		setSelectedComplaint(complaint);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleStatusDialogOpen = () => {
		setStatusDialogOpen(true);
		handleMenuClose();
	};

	const getStatusColor = (status) => {
		switch (status) {
			case 'resolved':
				return 'success';
			case 'in-progress':
				return 'warning';
			case 'rejected':
				return 'error';
			default:
				return 'default';
		}
	};

	const getPriorityColor = (priority) => {
		switch (priority) {
			case 'high':
				return theme.palette.error.main;
			case 'medium':
				return theme.palette.warning.main;
			case 'low':
				return theme.palette.success.main;
			default:
				return theme.palette.text.secondary;
		}
	};

	const groupComplaintsByDate = (complaints) => {
		const groups = {};
		complaints.forEach(complaint => {
			const date = new Date(complaint.createdAt);
			const today = new Date();
			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);

			let dateKey;
			if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
				dateKey = 'Today';
			} else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
				dateKey = 'Yesterday';
			} else {
				dateKey = format(date, 'dd/MM/yyyy');
			}

			if (!groups[dateKey]) {
				groups[dateKey] = [];
			}
			groups[dateKey].push(complaint);
		});
		return groups;
	};

	const handlePageChange = (event, newPage) => {
		setPage(newPage);
	};

	if (loading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
			{/* Header Section */}
			<Box sx={{ mb: 4 }}>
				<Typography variant="h4" component="h1" gutterBottom>
					Complaint History
				</Typography>
				<Typography variant="body1" color="text.secondary" gutterBottom>
					Track and manage your previous complaints
				</Typography>
			</Box>

			{/* Filters and Search Section */}
			<Paper
				elevation={0}
				sx={{
					p: 2,
					mb: 4,
					border: '1px solid',
					borderColor: 'divider',
					borderRadius: 2,
					bgcolor: alpha(theme.palette.background.paper, 0.8)
				}}
			>
				<Grid container spacing={2} alignItems="center">
					<Grid item xs={12} md={5}>
						<Paper
							component="form"
							sx={{
								p: '2px 4px',
								display: 'flex',
								alignItems: 'center',
								border: '1px solid',
								borderColor: 'divider'
							}}
						>
							<InputBase
								sx={{ ml: 1, flex: 1 }}
								placeholder="Search complaints..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
							<IconButton type="button" sx={{ p: '10px' }}>
								<SearchIcon />
							</IconButton>
						</Paper>
					</Grid>
					<Grid item xs={12} sm={6} md={3.5}>
						<FormControl fullWidth size="small">
							<InputLabel>Status</InputLabel>
							<Select
								value={statusFilter}
								label="Status"
								onChange={(e) => setStatusFilter(e.target.value)}
							>
								<MenuItem value="all">All</MenuItem>
								<MenuItem value="pending">Pending</MenuItem>
								<MenuItem value="in-progress">In Progress</MenuItem>
								<MenuItem value="resolved">Resolved</MenuItem>
								<MenuItem value="rejected">Rejected</MenuItem>
							</Select>
						</FormControl>
					</Grid>
					<Grid item xs={12} sm={6} md={3.5}>
						<FormControl fullWidth size="small">
							<InputLabel>Sort By</InputLabel>
							<Select
								value={sortBy}
								label="Sort By"
								onChange={(e) => setSortBy(e.target.value)}
							>
								<MenuItem value="newest">Newest First</MenuItem>
								<MenuItem value="oldest">Oldest First</MenuItem>
								<MenuItem value="priority-high">High Priority</MenuItem>
								<MenuItem value="priority-low">Low Priority</MenuItem>
								<MenuItem value="status">By Status</MenuItem>
							</Select>
						</FormControl>
					</Grid>
				</Grid>
			</Paper>

			{/* Complaints List Section */}
			{complaints.length === 0 && !loading ? (
				<Paper
					sx={{
						p: 4,
						textAlign: 'center',
						borderRadius: 2,
						bgcolor: alpha(theme.palette.background.paper, 0.8)
					}}
				>
					<Typography variant="h6" color="text.secondary" gutterBottom>
						No complaints found
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Try adjusting your search or filter criteria
					</Typography>
				</Paper>
			) : (
				<>
					{Object.entries(groupComplaintsByDate(complaints)).map(([date, complaints]) => (
						<Box key={date} sx={{ mb: 4 }}>
							<Typography
								variant="h6"
								gutterBottom
								sx={{
									px: 2,
									py: 1,
									borderRadius: 1,
									bgcolor: alpha(theme.palette.primary.main, 0.1),
									color: theme.palette.primary.main,
									display: 'inline-block'
								}}
							>
								{date}
							</Typography>
							<Grid container spacing={2} sx={{ mt: 1 }}>
								{complaints.map((complaint) => (
									<Grid item xs={12} sm={6} md={4} key={complaint._id}>
										<Card
											sx={{
												height: '100%',
												display: 'flex',
												flexDirection: 'column',
												cursor: 'pointer',
												transition: 'all 0.2s',
												'&:hover': {
													transform: 'translateY(-4px)',
													boxShadow: 4
												}
											}}
											onClick={() => navigate(`/complaints/${complaint._id}`)}
										>
											<CardContent>
												<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
													<Chip
														label={complaint.status}
														color={getStatusColor(complaint.status)}
														size="small"
													/>
													{user && user.role === 'admin' && (
														<IconButton
															size="small"
															onClick={(e) => {
																e.stopPropagation();
																handleMenuClick(e, complaint);
															}}
														>
															<MoreVertIcon />
														</IconButton>
													)}
												</Box>

												<Typography variant="h6" gutterBottom noWrap>
													{complaint.title}
												</Typography>

												<Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
													<Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
														<CategoryIcon sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
														<Typography variant="body2" color="text.secondary">
															{complaint.category?.name}
														</Typography>
													</Box>
													<Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
														<FlagIcon
															sx={{
																fontSize: 18,
																mr: 0.5,
																color: getPriorityColor(complaint.priority)
															}}
														/>
														<Typography
															variant="body2"
															sx={{ color: getPriorityColor(complaint.priority) }}
														>
															{complaint.priority}
														</Typography>
													</Box>
													<Box sx={{ display: 'flex', alignItems: 'center' }}>
														<AccessTimeIcon sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
														<Typography variant="body2" color="text.secondary">
															{format(new Date(complaint.createdAt), 'h:mm a')}
														</Typography>
													</Box>
												</Box>
											</CardContent>
										</Card>
									</Grid>
								))}
							</Grid>
						</Box>
					))}
				</>
			)}

			{/* Pagination Section */}
			{!loading && complaints.length > 0 && (
				<Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
					<Pagination
						count={totalPages}
						page={page}
						onChange={handlePageChange}
						color="primary"
						showFirstButton
						showLastButton
						size="large"
					/>
				</Box>
			)}

			{/* Status Update Menu */}
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
			>
				<MenuItem onClick={handleStatusDialogOpen}>Update Status</MenuItem>
			</Menu>

			{/* Status Update Dialog */}
			<ComplaintStatusDialog
				open={statusDialogOpen}
				onClose={() => setStatusDialogOpen(false)}
				complaint={selectedComplaint}
				onUpdateStatus={handleStatusUpdate}
			/>
		</Container>
	);
}

export default History; 