import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	Box,
	Container,
	Typography,
	Grid,
	Card,
	CardContent,
	Button,
	TextField,
	MenuItem,
	IconButton,
	Chip,
	Pagination,
	CircularProgress,
	useTheme,
	useMediaQuery,
	Paper,
	InputAdornment,
	InputBase,
	Avatar,
	Divider,
	FormControl,
	InputLabel,
	Select
} from '@mui/material';
import {
	Add as AddIcon,
	Search as SearchIcon,
	FilterList as FilterIcon,
	Sort as SortIcon,
	Home as HomeIcon,
	History as HistoryIcon,
	Settings as SettingsIcon,
	Flag as FlagIcon,
	AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchComplaints, setFilters } from '../../redux/slices/complaintSlice';
import { fetchCategories } from '../../redux/slices/categorySlice';
import ComplaintCard from '../../components/ComplaintCard';
import FilterDrawer from '../../components/FilterDrawer';
import { toast } from 'react-toastify';
import useDebounceSearch from '../../hooks/useDebounceSearch';
import axios from 'axios';
import CategorySelectionDialog from '../../components/CategorySelectionDialog';
import { formatDistanceToNow } from 'date-fns';
import { alpha } from '@mui/material/styles';

const statusOptions = [
	{ value: 'all', label: 'All Status' },
	{ value: 'pending', label: 'Pending' },
	{ value: 'in-progress', label: 'In Progress' },
	{ value: 'resolved', label: 'Resolved' },
	{ value: 'rejected', label: 'Rejected' }
];

const sortOptions = [
	{ value: 'newest', label: 'Newest First' },
	{ value: 'oldest', label: 'Oldest First' },
	{ value: 'priority-high', label: 'High Priority' },
	{ value: 'priority-low', label: 'Low Priority' }
];

const categories = [
	{ id: 1, name: 'Health', icon: '🏥' },
	{ id: 2, name: 'Transport', icon: '🚗' },
	{ id: 3, name: 'Education', icon: '🎓' },
	{ id: 4, name: 'Banking', icon: '🏦' },
	{ id: 5, name: 'Finance', icon: '💰' },
	{ id: 6, name: 'Travel', icon: '✈️' },
	{ id: 7, name: 'Medical', icon: '⚕️' },
	{ id: 8, name: 'Government', icon: '🏛️' },
	{ id: 9, name: 'Entertainment', icon: '🎬' }
];

const frequentCategories = categories.slice(0, 3);

function Dashboard() {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { complaints, loading: complaintsLoading, error, filters, totalComplaints, currentPage, totalPages } = useSelector(state => state.complaints);
	const { categories = [], frequentCategories = [], loading: categoriesLoading } = useSelector(state => state.categories || {});
	const { user } = useSelector(state => state.auth);
	const [searchQuery, setSearchQuery] = useState(filters?.search || '');
	const debouncedSearchQuery = useDebounceSearch(searchQuery);
	const [localFilters, setLocalFilters] = useState(filters || {});
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
	const [isNewComplaint, setIsNewComplaint] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [showSubCategories, setShowSubCategories] = useState(false);
	const [page, setPage] = useState(1);
	const [limit] = useState(3);

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

	const fetchComplaintsData = useCallback(async (abortController) => {
		try {
			await dispatch(fetchComplaints({
				page,
				limit,
				filters: {
					...localFilters,
					search: debouncedSearchQuery
				},
				signal: abortController.signal
			})).unwrap();
		} catch (error) {
			if (!axios.isCancel(error)) {
				console.error('Error fetching complaints:', error);
			}
		}
	}, [dispatch, page, limit, localFilters, debouncedSearchQuery]);

	useEffect(() => {
		const abortController = new AbortController();
		dispatch(fetchCategories());
		fetchComplaintsData(abortController);

		return () => {
			abortController.abort();
		};
	}, [dispatch, fetchComplaintsData]);

	useEffect(() => {
		// Update redux filters when debounced search changes
		dispatch(setFilters({ ...filters, search: debouncedSearchQuery }));
	}, [debouncedSearchQuery, dispatch]);

	const handleSearchChange = (event) => {
		setSearchQuery(event.target.value);
	};

	const handleStatusChange = (event) => {
		setLocalFilters(prev => ({
			...prev,
			status: event.target.value
		}));
	};

	const handleSortChange = (event) => {
		setLocalFilters(prev => ({
			...prev,
			sort: event.target.value
		}));
	};

	const handlePageChange = (event, value) => {
		dispatch(setFilters({ ...filters, currentPage: value }));
	};

	const handleNewComplaint = () => {
		setIsNewComplaint(true);
		setCategoryDialogOpen(true);
		setSelectedCategory(null);
		setShowSubCategories(false);
	};

	const handleCategoryClick = (category) => {
		if (!category.subCategories?.length) {
			// If category has no subcategories, go directly to complaint form
			navigate('/complaints/new', { state: { category: category._id } });
			return;
		}
		// If category has subcategories, show them in dialog
		setIsNewComplaint(false);
		setSelectedCategory(category);
		setShowSubCategories(true);
		setCategoryDialogOpen(true);
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
		setIsNewComplaint(false);
	};

	const toggleFilterDrawer = () => {
		setDrawerOpen(!drawerOpen);
	};

	const handleApplyFilters = () => {
		dispatch(setFilters(localFilters));
		setDrawerOpen(false);
	};

	// Add this function to safely get category data
	const getCategoryData = (category) => {
		if (!category || typeof category !== 'object') return null;
		return {
			id: category._id || '',
			name: typeof category.name === 'string' ? category.name : 'Unnamed Category',
			description: typeof category.description === 'string' ? category.description : '',
			icon: typeof category.icon === 'string' ? category.icon : null,
			totalComplaints: typeof category.totalComplaints === 'number' ? category.totalComplaints : 0,
			subCategories: Array.isArray(category.subCategories) ? category.subCategories : []
		};
	};

	if (complaintsLoading || categoriesLoading) {
		return (
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					minHeight: '60vh'
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
				<Typography variant="h4" component="h1">
					My Complaints
				</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={handleNewComplaint}
				>
					New Complaint
				</Button>
			</Box>

			<Box sx={{ display: 'flex', gap: 2, mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
				<Paper
					component="form"
					sx={{
						p: '2px 4px',
						display: 'flex',
						alignItems: 'center',
						flex: 1,
						border: '1px solid',
						borderColor: 'divider'
					}}
				>
					<InputBase
						sx={{ ml: 1, flex: 1 }}
						placeholder="Search complaints..."
						value={searchQuery}
						onChange={handleSearchChange}
					/>
					<IconButton type="button" sx={{ p: '10px' }}>
						<SearchIcon />
					</IconButton>
				</Paper>

				<FormControl sx={{ minWidth: 120 }}>
					<InputLabel>Status</InputLabel>
					<Select
						value={localFilters.status || 'all'}
						label="Status"
						onChange={handleStatusChange}
					>
						<MenuItem value="all">All</MenuItem>
						<MenuItem value="pending">Pending</MenuItem>
						<MenuItem value="in-progress">In Progress</MenuItem>
						<MenuItem value="resolved">Resolved</MenuItem>
						<MenuItem value="rejected">Rejected</MenuItem>
					</Select>
				</FormControl>

				<FormControl sx={{ minWidth: 120 }}>
					<InputLabel>Sort By</InputLabel>
					<Select
						value={localFilters.sort || 'newest'}
						label="Sort By"
						onChange={handleSortChange}
					>
						<MenuItem value="newest">Newest First</MenuItem>
						<MenuItem value="oldest">Oldest First</MenuItem>
						<MenuItem value="priority-high">High Priority</MenuItem>
						<MenuItem value="priority-low">Low Priority</MenuItem>
						<MenuItem value="status">By Status</MenuItem>
					</Select>
				</FormControl>
			</Box>

			{/* Total Complaints Counter */}
			<Box sx={{
				display: 'flex',
				alignItems: 'center',
				gap: 1,
				mb: 3,
				color: 'text.secondary'
			}}>
				<Typography variant="body1">
					Total Complaints:
				</Typography>
				<Typography
					variant="h6"
					color="primary.main"
					sx={{ fontWeight: 600 }}
				>
					{categoriesLoading ?
						<CircularProgress size={20} color="inherit" /> :
						totalComplaints
					}
				</Typography>
			</Box>

			{/* Main Content Section */}
			<Box sx={{ mb: 4 }}>
				{/* Frequently Used Categories */}
				{Array.isArray(frequentCategories) && frequentCategories.length > 0 && (
					<Box sx={{ mb: 4 }}>
						<Typography
							variant="h6"
							gutterBottom
							sx={{
								fontSize: '1.1rem',
								fontWeight: 600,
								color: 'text.primary',
								mb: 2
							}}
						>
							Frequently Used Categories
						</Typography>
						<Grid container spacing={2}>
							{frequentCategories.map((category) => {
								const categoryData = getCategoryData(category);
								if (!categoryData) return null;

								return (
									<Grid item xs={12} sm={4} key={categoryData.id || `temp-${categoryData.name}`}>
										<Paper
											sx={{
												p: 2,
												display: 'flex',
												alignItems: 'center',
												cursor: 'pointer',
												transition: 'all 0.2s',
												'&:hover': {
													bgcolor: 'action.hover',
													transform: 'translateY(-4px)',
													boxShadow: 2
												},
												borderRadius: 2,
												border: '1px solid',
												borderColor: 'divider'
											}}
											onClick={() => handleCategoryClick(category)}
										>
											{categoryData.icon ? (
												<Box
													component="img"
													src={categoryData.icon}
													alt={categoryData.name}
													sx={{
														width: 40,
														height: 40,
														mr: 2,
														borderRadius: 1
													}}
												/>
											) : (
												<Avatar
													sx={{
														width: 40,
														height: 40,
														mr: 2,
														bgcolor: 'primary.light'
													}}
												>
													{categoryData.name.charAt(0)}
												</Avatar>
											)}
											<Box sx={{ flex: 1 }}>
												<Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
													{categoryData.name}
												</Typography>
												{categoryData.totalComplaints > 0 && (
													<Typography variant="caption" color="text.secondary">
														{categoryData.totalComplaints} complaints
													</Typography>
												)}
											</Box>
										</Paper>
									</Grid>
								);
							})}
						</Grid>
					</Box>
				)}

				{/* All Categories */}
				<Box>
					<Typography
						variant="h6"
						gutterBottom
						sx={{
							fontSize: '1.1rem',
							fontWeight: 600,
							color: 'text.primary',
							mb: 2
						}}
					>
						All Categories
					</Typography>
					<Grid container spacing={2}>
						{categories.map((category) => {
							const categoryData = getCategoryData(category);
							if (!categoryData) return null;

							return (
								<Grid item xs={12} sm={6} md={4} key={categoryData.id || `temp-${categoryData.name}`}>
									<Paper
										sx={{
											p: 2,
											height: '100%',
											display: 'flex',
											alignItems: 'center',
											cursor: 'pointer',
											transition: 'all 0.2s',
											'&:hover': {
												bgcolor: 'action.hover',
												transform: 'translateY(-4px)',
												boxShadow: 2
											},
											borderRadius: 2,
											border: '1px solid',
											borderColor: 'divider'
										}}
										onClick={() => handleCategoryClick(category)}
									>
										{categoryData.icon ? (
											<Box
												component="img"
												src={categoryData.icon}
												alt={categoryData.name}
												sx={{
													width: 40,
													height: 40,
													mr: 2,
													borderRadius: 1
												}}
											/>
										) : (
											<Avatar
												sx={{
													width: 40,
													height: 40,
													mr: 2,
													bgcolor: 'primary.light'
												}}
											>
												{categoryData.name.charAt(0)}
											</Avatar>
										)}
										<Box sx={{ flex: 1 }}>
											<Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
												{categoryData.name}
											</Typography>
											{categoryData.description && (
												<Typography
													variant="body2"
													color="text.secondary"
													sx={{
														overflow: 'hidden',
														textOverflow: 'ellipsis',
														display: '-webkit-box',
														WebkitLineClamp: 2,
														WebkitBoxOrient: 'vertical'
													}}
												>
													{categoryData.description}
												</Typography>
											)}
										</Box>
									</Paper>
								</Grid>
							);
						})}
					</Grid>
				</Box>
			</Box>

			{/* Complaints List */}
			<Box>
				<Typography
					variant="h6"
					gutterBottom
					sx={{
						fontSize: '1.1rem',
						fontWeight: 600,
						color: 'text.primary',
						mb: 2
					}}
				>
					Recent Complaints
				</Typography>
				{complaintsLoading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
						<CircularProgress />
					</Box>
				) : complaints.length > 0 ? (
					<Grid container spacing={2}>
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
									<CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
										<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
											<Box sx={{ display: 'flex', alignItems: 'center' }}>
												{complaint.category?.icon ? (
													<Box
														component="img"
														src={complaint.category.icon}
														alt={complaint.category.name}
														sx={{ width: 40, height: 40, mr: 2, borderRadius: 1 }}
													/>
												) : (
													<Avatar sx={{ mr: 2 }}>
														{complaint.category?.name?.charAt(0) || 'C'}
													</Avatar>
												)}
												<Box>
													<Typography variant="subtitle1" noWrap>
														{complaint.category?.name || 'Uncategorized'}
													</Typography>
													{complaint.subCategory && (
														<Typography variant="body2" color="text.secondary" noWrap>
															{complaint.subCategory.name}
														</Typography>
													)}
												</Box>
											</Box>
											<Chip
												label={complaint.status}
												color={getStatusColor(complaint.status)}
												size="small"
											/>
										</Box>

										<Typography variant="h6" gutterBottom noWrap>
											{complaint.title}
										</Typography>

										<Typography
											variant="body2"
											color="text.secondary"
											sx={{
												mb: 2,
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												display: '-webkit-box',
												WebkitLineClamp: 2,
												WebkitBoxOrient: 'vertical'
											}}
										>
											{complaint.description}
										</Typography>

										<Box sx={{ mt: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
											<Box sx={{ display: 'flex', alignItems: 'center' }}>
												<FlagIcon
													fontSize="small"
													sx={{
														mr: 0.5,
														color: getPriorityColor(complaint.priority)
													}}
												/>
												<Typography variant="body2">
													{complaint.priority}
												</Typography>
											</Box>
											<Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
												<AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
												<Typography variant="caption" color="text.secondary">
													{formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}
												</Typography>
											</Box>
										</Box>
									</CardContent>
								</Card>
							</Grid>
						))}
					</Grid>
				) : (
					<Paper
						sx={{
							p: 3,
							textAlign: 'center',
							bgcolor: theme => alpha(theme.palette.background.paper, 0.8)
						}}
					>
						<Typography variant="h6" color="text.secondary" gutterBottom>
							No complaints found
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Create a new complaint to get started
						</Typography>
					</Paper>
				)}
			</Box>

			{/* After the complaints list */}
			{!complaintsLoading && complaints.length > 0 && (
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

			<FilterDrawer
				open={drawerOpen}
				onClose={toggleFilterDrawer}
				filters={localFilters}
				onStatusChange={handleStatusChange}
				onSortChange={handleSortChange}
				onApply={handleApplyFilters}
				statusOptions={statusOptions}
				sortOptions={sortOptions}
			/>

			<CategorySelectionDialog
				open={categoryDialogOpen}
				onClose={handleDialogClose}
				categories={categories || []}
				selectedCategory={selectedCategory}
				showSubCategories={showSubCategories}
				onCategorySelect={handleCategorySelect}
				onSubCategorySelect={handleSubCategorySelect}
				isNewComplaint={isNewComplaint}
			/>

			{/* Bottom Navigation */}
			<Paper
				sx={{
					position: 'fixed',
					bottom: 0,
					left: 0,
					right: 0,
					display: { sm: 'none' },
					zIndex: 1000,
					borderTop: '1px solid',
					borderColor: 'divider'
				}}
			>
				<Box sx={{ display: 'flex', justifyContent: 'space-around', p: 1 }}>
					<IconButton color="primary">
						<HomeIcon />
					</IconButton>
					<IconButton onClick={() => navigate('/history')}>
						<HistoryIcon />
					</IconButton>
					<IconButton onClick={() => navigate('/settings')}>
						<SettingsIcon />
					</IconButton>
				</Box>
			</Paper>
		</Container>
	);
}

export default Dashboard; 