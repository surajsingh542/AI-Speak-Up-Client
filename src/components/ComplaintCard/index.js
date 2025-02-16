import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
	Card,
	CardContent,
	CardActions,
	Typography,
	Chip,
	IconButton,
	Box,
	Menu,
	MenuItem,
	ListItemIcon,
	ListItemText,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	List,
	ListItem,
	Divider
} from '@mui/material';
import {
	MoreVert as MoreVertIcon,
	Share as ShareIcon,
	Delete as DeleteIcon,
	Edit as EditIcon,
	AccessTime as AccessTimeIcon,
	Flag as FlagIcon,
	Email as EmailIcon,
	Facebook as FacebookIcon,
	Twitter as TwitterIcon,
	LinkedIn as LinkedInIcon,
	WhatsApp as WhatsAppIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { deleteComplaint } from '../../redux/slices/complaintSlice';
import { toast } from 'react-toastify';
import axios from '../../config/axios';

const statusColors = {
	pending: 'warning',
	'in-progress': 'info',
	resolved: 'success',
	rejected: 'error'
};

const priorityIcons = {
	low: '🔵',
	medium: '🟡',
	high: '🔴'
};

function ComplaintCard({ complaint }) {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [anchorEl, setAnchorEl] = useState(null);
	const [shareDialogOpen, setShareDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [shareEmail, setShareEmail] = useState('');
	const [shareMethod, setShareMethod] = useState('email');

	const handleMenuClick = (event) => {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = (event) => {
		event?.stopPropagation();
		setAnchorEl(null);
	};

	const handleCardClick = () => {
		navigate(`/complaints/${complaint._id}`);
	};

	const handleEdit = (event) => {
		event.stopPropagation();
		navigate(`/complaints/${complaint._id}`);
		handleMenuClose();
	};

	const handleShare = (event) => {
		event.stopPropagation();
		setShareDialogOpen(true);
		handleMenuClose();
	};

	const handleShareSubmit = async () => {
		if (shareMethod === 'email') {
			try {
				await axios.post(`/complaints/${complaint._id}/share/email`, { email: shareEmail });
				toast.success('Complaint shared successfully via email');
				setShareDialogOpen(false);
				setShareEmail('');
			} catch (error) {
				toast.error(error.response?.data?.message || 'Failed to share complaint via email');
			}
		}
	};

	const handleSocialShare = (platform) => {
		const complaintUrl = `${window.location.origin}/complaints/${complaint._id}`;
		const text = `Check out this complaint: ${complaint.title}`;
		let shareUrl = '';

		switch (platform) {
			case 'facebook':
				shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(complaintUrl)}`;
				break;
			case 'twitter':
				shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(complaintUrl)}`;
				break;
			case 'linkedin':
				shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(complaintUrl)}`;
				break;
			case 'whatsapp':
				shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + complaintUrl)}`;
				break;
			default:
				return;
		}

		window.open(shareUrl, '_blank', 'width=600,height=400');
		setShareDialogOpen(false);
	};

	const handleDelete = (event) => {
		event.stopPropagation();
		if (complaint.status !== 'pending') {
			toast.error('Only pending complaints can be deleted');
			return;
		}
		setDeleteDialogOpen(true);
		handleMenuClose();
	};

	const handleDeleteConfirm = async () => {
		try {
			await dispatch(deleteComplaint(complaint._id)).unwrap();
			toast.success('Complaint deleted successfully');
			setDeleteDialogOpen(false);
		} catch (error) {
			toast.error(error.message || 'Failed to delete complaint');
		}
	};

	return (
		<>
			<Card
				sx={{
					cursor: 'pointer',
					'&:hover': {
						boxShadow: (theme) => theme.shadows[4],
						transform: 'translateY(-2px)',
						transition: 'all 0.3s ease'
					}
				}}
				onClick={handleCardClick}
			>
				<CardContent>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
						<Chip
							label={complaint.status}
							color={statusColors[complaint.status]}
							size="small"
						/>
						<IconButton
							size="small"
							onClick={handleMenuClick}
							aria-label="complaint actions"
						>
							<MoreVertIcon />
						</IconButton>
					</Box>

					<Typography variant="h6" gutterBottom noWrap>
						{complaint.title}
					</Typography>

					<Typography
						variant="body2"
						color="text.secondary"
						sx={{
							mb: 2,
							display: '-webkit-box',
							WebkitLineClamp: 2,
							WebkitBoxOrient: 'vertical',
							overflow: 'hidden'
						}}
					>
						{complaint.description}
					</Typography>

					<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
						<Box sx={{ display: 'flex', alignItems: 'center' }}>
							<FlagIcon fontSize="small" sx={{ mr: 0.5 }} />
							<Typography variant="body2">
								{priorityIcons[complaint.priority]} {complaint.priority}
							</Typography>
						</Box>
						<Box sx={{ display: 'flex', alignItems: 'center' }}>
							<AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
							<Typography variant="body2">
								{format(new Date(complaint.createdAt), 'MMM d, yyyy')}
							</Typography>
						</Box>
					</Box>

					{complaint.category && (
						<Chip
							label={complaint.category}
							size="small"
							variant="outlined"
							sx={{ mr: 1 }}
						/>
					)}
				</CardContent>

				<Menu
					anchorEl={anchorEl}
					open={Boolean(anchorEl)}
					onClose={handleMenuClose}
					onClick={(e) => e.stopPropagation()}
				>
					<MenuItem onClick={handleEdit}>
						<ListItemIcon>
							<EditIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Edit</ListItemText>
					</MenuItem>
					<MenuItem onClick={handleShare}>
						<ListItemIcon>
							<ShareIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Share</ListItemText>
					</MenuItem>
					<MenuItem
						onClick={handleDelete}
						disabled={complaint.status !== 'pending'}
					>
						<ListItemIcon>
							<DeleteIcon fontSize="small" color={complaint.status === 'pending' ? 'error' : 'disabled'} />
						</ListItemIcon>
						<ListItemText sx={{ color: complaint.status === 'pending' ? 'error.main' : 'text.disabled' }}>
							Delete
						</ListItemText>
					</MenuItem>
				</Menu>
			</Card>

			{/* Updated Share Dialog */}
			<Dialog
				open={shareDialogOpen}
				onClose={() => setShareDialogOpen(false)}
				onClick={(e) => e.stopPropagation()}
				maxWidth="xs"
				fullWidth
			>
				<DialogTitle>Share Complaint</DialogTitle>
				<DialogContent>
					<Box sx={{ mb: 2 }}>
						<Typography variant="subtitle1" gutterBottom>
							Choose how you want to share:
						</Typography>
						<List>
							<ListItem button onClick={() => setShareMethod('email')} selected={shareMethod === 'email'}>
								<ListItemIcon>
									<EmailIcon />
								</ListItemIcon>
								<ListItemText primary="Share via Email" />
							</ListItem>
							<ListItem button onClick={() => setShareMethod('social')} selected={shareMethod === 'social'}>
								<ListItemIcon>
									<ShareIcon />
								</ListItemIcon>
								<ListItemText primary="Share on Social Media" />
							</ListItem>
						</List>
					</Box>

					{shareMethod === 'email' ? (
						<Box>
							<Typography gutterBottom>
								Enter the email address to share this complaint with:
							</Typography>
							<TextField
								fullWidth
								type="email"
								label="Email Address"
								value={shareEmail}
								onChange={(e) => setShareEmail(e.target.value)}
								sx={{ mt: 1 }}
							/>
						</Box>
					) : (
						<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
							<IconButton
								onClick={() => handleSocialShare('facebook')}
								color="primary"
								size="large"
							>
								<FacebookIcon />
							</IconButton>
							<IconButton
								onClick={() => handleSocialShare('twitter')}
								color="primary"
								size="large"
							>
								<TwitterIcon />
							</IconButton>
							<IconButton
								onClick={() => handleSocialShare('linkedin')}
								color="primary"
								size="large"
							>
								<LinkedInIcon />
							</IconButton>
							<IconButton
								onClick={() => handleSocialShare('whatsapp')}
								color="primary"
								size="large"
							>
								<WhatsAppIcon />
							</IconButton>
						</Box>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
					{shareMethod === 'email' && (
						<Button
							onClick={handleShareSubmit}
							variant="contained"
							disabled={!shareEmail}
						>
							Share
						</Button>
					)}
				</DialogActions>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
				onClick={(e) => e.stopPropagation()}
			>
				<DialogTitle>Delete Complaint</DialogTitle>
				<DialogContent>
					<Typography>
						Are you sure you want to delete this complaint? This action cannot be undone.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
					<Button onClick={handleDeleteConfirm} color="error" variant="contained">
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

export default ComplaintCard; 