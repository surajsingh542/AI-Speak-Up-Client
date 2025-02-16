import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
	Container,
	Box,
	Typography,
	Paper,
	Grid,
	Chip,
	Button,
	TextField,
	IconButton,
	Menu,
	MenuItem,
	ListItemIcon,
	ListItemText,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	CircularProgress,
	Divider,
	List,
	ListItem
} from '@mui/material';
import {
	Edit as EditIcon,
	Share as ShareIcon,
	Delete as DeleteIcon,
	MoreVert as MoreVertIcon,
	Send as SendIcon,
	AttachFile as AttachFileIcon,
	AccessTime as AccessTimeIcon,
	Flag as FlagIcon,
	Email as EmailIcon,
	Facebook as FacebookIcon,
	Twitter as TwitterIcon,
	LinkedIn as LinkedInIcon,
	WhatsApp as WhatsAppIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import {
	fetchComplaintDetails,
	addComment,
	deleteComplaint,
	updateComplaintStatus
} from '../../redux/slices/complaintSlice';
import axios from 'axios';

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

function ComplaintDetails() {
	const { id } = useParams();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { complaint, loading, error } = useSelector(state => state.complaints);

	const [anchorEl, setAnchorEl] = useState(null);
	const [comment, setComment] = useState('');
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [shareDialogOpen, setShareDialogOpen] = useState(false);
	const [shareEmail, setShareEmail] = useState('');
	const [shareMethod, setShareMethod] = useState('email');
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		dispatch(fetchComplaintDetails(id));
	}, [dispatch, id]);

	const handleMenuClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleEdit = () => {
		navigate(`/complaints/${id}/edit`);
		handleMenuClose();
	};

	const handleShare = () => {
		setShareDialogOpen(true);
		handleMenuClose();
	};

	const handleDelete = () => {
		setDeleteDialogOpen(true);
		handleMenuClose();
	};

	const handleDeleteConfirm = async () => {
		try {
			await dispatch(deleteComplaint(id)).unwrap();
			toast.success('Complaint deleted successfully');
			navigate('/');
		} catch (error) {
			toast.error(error.message || 'Failed to delete complaint');
		}
		setDeleteDialogOpen(false);
	};

	const handleShareSubmit = async (e) => {
		e?.preventDefault();
		if (shareMethod === 'email' && !shareEmail) return;

		setSubmitting(true);
		try {
			await axios.post(`/complaints/${id}/share/email`, { email: shareEmail });
			toast.success('Complaint shared successfully via email');
			setShareDialogOpen(false);
			setShareEmail('');
		} catch (error) {
			toast.error(error.response?.data?.message || 'Failed to share complaint');
		}
		setSubmitting(false);
	};

	const handleSocialShare = (platform) => {
		const complaintUrl = `${window.location.origin}/complaints/${id}`;
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

	const handleCommentSubmit = async (e) => {
		e.preventDefault();
		if (!comment.trim()) return;

		try {
			await dispatch(addComment({ complaintId: id, text: comment })).unwrap();
			setComment('');
			toast.success('Comment added successfully');
		} catch (error) {
			toast.error(error.message || 'Failed to add comment');
		}
	};

	if (loading) {
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

	if (error) {
		return (
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					minHeight: '60vh'
				}}
			>
				<Typography color="error">
					Error loading complaint. Please try again later.
				</Typography>
			</Box>
		);
	}

	if (!complaint) {
		return (
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					minHeight: '60vh'
				}}
			>
				<Typography>Complaint not found</Typography>
			</Box>
		);
	}

	return (
		<Container maxWidth="lg">
			<Box sx={{ mt: 4, mb: 8 }}>
				{/* Header */}
				<Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
					<Box>
						<Typography variant="h4" component="h1" gutterBottom>
							{complaint.title}
						</Typography>
						<Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
							<Chip
								label={complaint.status}
								color={statusColors[complaint.status]}
								size="small"
							/>
							<Chip
								label={complaint.category?.name}
								variant="outlined"
								size="small"
							/>
							<Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
								<AccessTimeIcon fontSize="small" />
								{format(new Date(complaint.createdAt), 'MMM d, yyyy')}
							</Typography>
							<Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
								{/* <FlagIcon fontSize="small" /> */}
								{priorityIcons[complaint.priority]} {complaint.priority}
							</Typography>
						</Box>
					</Box>
					<IconButton onClick={handleMenuClick}>
						<MoreVertIcon />
					</IconButton>
				</Box>

				<Grid container spacing={3}>
					{/* Main Content */}
					<Grid item xs={12} md={8}>
						<Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
							<Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
								{complaint.description}
							</Typography>

							{complaint.attachments?.length > 0 && (
								<>
									<Divider sx={{ my: 3 }} />
									<Typography variant="subtitle2" gutterBottom>
										Attachments:
									</Typography>
									<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
										{complaint.attachments.map((attachment, index) => (
											<Chip
												key={index}
												label={`File ${index + 1}`}
												icon={<AttachFileIcon />}
												variant="outlined"
												onClick={() => window.open(attachment, '_blank')}
											/>
										))}
									</Box>
								</>
							)}

							{complaint.resolution && (
								<>
									<Divider sx={{ my: 3 }} />
									<Typography variant="subtitle2" gutterBottom>
										Resolution Note:
									</Typography>
									<Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
										<Typography variant="body2" color="text.secondary" gutterBottom>
											{complaint.resolution.note}
										</Typography>
										<Typography variant="caption" color="text.secondary">
											Updated by {complaint.resolution.by?.name} on {format(new Date(complaint.resolution.date), 'MMM d, yyyy h:mm a')}
										</Typography>
									</Box>
								</>
							)}

							{complaint.aiResponse && (
								<>
									<Divider sx={{ my: 3 }} />
									<Typography variant="subtitle2" gutterBottom>
										AI Suggestion:
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{complaint.aiResponse.suggestion}
									</Typography>
								</>
							)}
						</Paper>

						{/* Comments Section */}
						<Box sx={{ mt: 3 }}>
							<Typography variant="h6" gutterBottom>
								Comments
							</Typography>
							<Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
								{['resolved', 'rejected'].includes(complaint.status) ? (
									<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
										Comments are disabled for {complaint.status} complaints.
									</Typography>
								) : (
									<form onSubmit={handleCommentSubmit}>
										<TextField
											fullWidth
											multiline
											rows={3}
											placeholder="Add a comment..."
											value={comment}
											onChange={(e) => setComment(e.target.value)}
											sx={{ mb: 2 }}
										/>
										<Button
											variant="contained"
											type="submit"
											disabled={!comment.trim()}
											startIcon={<SendIcon />}
										>
											Add Comment
										</Button>
									</form>
								)}

								<Box sx={{ mt: 3 }}>
									{complaint.comments?.map((comment, index) => (
										<Box
											key={index}
											sx={{
												py: 2,
												borderBottom: index !== complaint.comments.length - 1 ? '1px solid' : 'none',
												borderColor: 'divider'
											}}
										>
											<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
												<Typography variant="subtitle2">
													{comment.user.name}
												</Typography>
												<Typography variant="caption" color="text.secondary">
													{format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
												</Typography>
											</Box>
											<Typography variant="body2">
												{comment.text}
											</Typography>
										</Box>
									))}
								</Box>
							</Paper>
						</Box>
					</Grid>

					{/* Sidebar */}
					<Grid item xs={12} md={4}>
						<Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
							<Typography variant="h6" gutterBottom>
								Status Updates
							</Typography>
							<Box sx={{ mt: 2 }}>
								{/* Current Status */}
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
									<Typography variant="subtitle2">Current Status:</Typography>
									<Chip
										label={complaint.status}
										color={statusColors[complaint.status]}
										size="small"
									/>
								</Box>

								{/* Resolution Note */}
								{complaint.resolution && (
									<Box sx={{
										mt: 2,
										p: 2,
										bgcolor: 'background.default',
										borderRadius: 1,
										border: '1px solid',
										borderColor: 'divider'
									}}>
										<Typography variant="subtitle2" gutterBottom>
											Latest Update
										</Typography>
										<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
											{complaint.resolution.text}
										</Typography>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
											<Typography variant="caption" color="text.secondary">
												By {complaint.resolution.by?.name}
											</Typography>
											<Typography variant="caption" color="text.secondary">•</Typography>
											<Typography variant="caption" color="text.secondary">
												{format(new Date(complaint.resolution.date), 'MMM d, yyyy h:mm a')}
											</Typography>
										</Box>
									</Box>
								)}

								{/* Initial Status */}
								<Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
									<Typography variant="body2" color="text.secondary">
										Complaint Created
									</Typography>
									<Typography variant="caption" color="text.secondary" display="block">
										Initial Status: <Chip label="pending" size="small" sx={{ ml: 1 }} />
									</Typography>
									<Typography variant="caption" color="text.secondary">
										{format(new Date(complaint.createdAt), 'MMM d, yyyy h:mm a')}
									</Typography>
								</Box>
							</Box>
						</Paper>
					</Grid>
				</Grid>
			</Box>

			{/* Menus and Dialogs */}
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
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
				<MenuItem onClick={handleDelete}>
					<ListItemIcon>
						<DeleteIcon fontSize="small" color="error" />
					</ListItemIcon>
					<ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
				</MenuItem>
			</Menu>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
			>
				<DialogTitle>Delete Complaint</DialogTitle>
				<DialogContent>
					<Typography>
						Are you sure you want to delete this complaint? This action cannot be undone.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={handleDeleteConfirm}
						color="error"
						variant="contained"
					>
						Delete
					</Button>
				</DialogActions>
			</Dialog>

			{/* Share Dialog */}
			<Dialog
				open={shareDialogOpen}
				onClose={() => setShareDialogOpen(false)}
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
							disabled={!shareEmail || submitting}
						>
							{submitting ? 'Sharing...' : 'Share'}
						</Button>
					)}
				</DialogActions>
			</Dialog>
		</Container>
	);
}

export default ComplaintDetails; 