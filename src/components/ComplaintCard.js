import React from 'react';
import {
	Card,
	CardContent,
	Typography,
	Box,
	Chip,
	IconButton,
	Avatar,
	Menu,
	MenuItem,
	Divider
} from '@mui/material';
import {
	MoreVert as MoreVertIcon,
	Edit as EditIcon,
	Delete as DeleteIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const statusColors = {
	pending: 'warning',
	'in-progress': 'info',
	resolved: 'success',
	rejected: 'error'
};

const priorityColors = {
	low: 'success',
	medium: 'warning',
	high: 'error'
};

function ComplaintCard({ complaint }) {
	const [anchorEl, setAnchorEl] = React.useState(null);
	const navigate = useNavigate();

	const handleMenuClick = (event) => {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = (event) => {
		event.stopPropagation();
		setAnchorEl(null);
	};

	const handleEdit = (event) => {
		event.stopPropagation();
		setAnchorEl(null);
		navigate(`/complaints/edit/${complaint._id}`);
	};

	const handleDelete = (event) => {
		event.stopPropagation();
		setAnchorEl(null);
		// Implement delete functionality
	};

	const handleCardClick = () => {
		navigate(`/complaints/${complaint._id}`);
	};

	if (!complaint || typeof complaint !== 'object') return null;

	const getCategoryData = (category) => {
		if (!category || typeof category !== 'object') return null;
		return {
			id: category._id || '',
			name: typeof category.name === 'string' ? category.name : 'Unnamed Category',
			description: typeof category.description === 'string' ? category.description : '',
			icon: typeof category.icon === 'string' ? category.icon : null
		};
	};

	const categoryData = getCategoryData(complaint.category);
	const subCategoryData = getCategoryData(complaint.subCategory);
	const title = typeof complaint.title === 'string' ? complaint.title : 'Untitled Complaint';
	const description = typeof complaint.description === 'string' ? complaint.description : '';
	const status = typeof complaint.status === 'string' ? complaint.status.toLowerCase() : 'pending';
	const priority = typeof complaint.priority === 'string' ? complaint.priority.toLowerCase() : 'medium';
	const createdAt = complaint.createdAt ? new Date(complaint.createdAt) : new Date();

	return (
		<Card
			sx={{
				cursor: 'pointer',
				'&:hover': { boxShadow: 3 },
				height: '100%',
				display: 'flex',
				flexDirection: 'column'
			}}
			onClick={handleCardClick}
		>
			<CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						{categoryData?.icon ? (
							<Box
								component="img"
								src={categoryData.icon}
								alt={categoryData.name}
								sx={{ width: 40, height: 40, mr: 2, borderRadius: 1 }}
							/>
						) : (
							<Avatar sx={{ mr: 2 }}>
								{categoryData?.name?.charAt(0) || 'C'}
							</Avatar>
						)}
						<Box>
							<Typography variant="subtitle1" noWrap>
								{categoryData?.name || 'Uncategorized'}
							</Typography>
							{subCategoryData && (
								<Typography variant="body2" color="text.secondary" noWrap>
									{subCategoryData.name}
								</Typography>
							)}
						</Box>
					</Box>
					<IconButton
						size="small"
						onClick={handleMenuClick}
						sx={{ ml: 1 }}
					>
						<MoreVertIcon />
					</IconButton>
				</Box>

				<Typography variant="h6" gutterBottom noWrap>
					{title}
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
					{description}
				</Typography>

				<Box sx={{ mt: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
					<Chip
						label={status.charAt(0).toUpperCase() + status.slice(1)}
						color={statusColors[status] || 'default'}
						size="small"
					/>
					<Chip
						label={priority.charAt(0).toUpperCase() + priority.slice(1)}
						color={priorityColors[priority] || 'default'}
						size="small"
					/>
					<Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
						{formatDistanceToNow(createdAt, { addSuffix: true })}
					</Typography>
				</Box>
			</CardContent>

			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
				onClick={(e) => e.stopPropagation()}
			>
				<MenuItem onClick={handleEdit}>
					<EditIcon fontSize="small" sx={{ mr: 1 }} />
					Edit
				</MenuItem>
				<Divider />
				<MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
					<DeleteIcon fontSize="small" sx={{ mr: 1 }} />
					Delete
				</MenuItem>
			</Menu>
		</Card>
	);
}

export default ComplaintCard; 