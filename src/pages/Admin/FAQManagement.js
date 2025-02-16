import React, { useState, useEffect } from 'react';
import {
	Box,
	Container,
	Typography,
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
	IconButton,
	List,
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	Alert,
	CircularProgress,
	Pagination
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import axios from '../../config/axios';

const FAQManagement = () => {
	const [faqs, setFaqs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [openDialog, setOpenDialog] = useState(false);
	const [selectedFAQ, setSelectedFAQ] = useState(null);
	const [formData, setFormData] = useState({
		question: '',
		answer: '',
		category: 'general',
		order: 0
	});
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [limit] = useState(10);

	const categories = [
		{ value: 'general', label: 'General' },
		{ value: 'account', label: 'Account' },
		{ value: 'complaints', label: 'Complaints' },
		{ value: 'technical', label: 'Technical' },
		{ value: 'security', label: 'Security' }
	];

	useEffect(() => {
		fetchFAQs();
	}, [page, limit]);

	const fetchFAQs = async () => {
		try {
			setLoading(true);
			const response = await axios.get(`/admin/faqs?page=${page}&limit=${limit}`);
			setFaqs(response.data.faqs || []);
			setTotalPages(response.data.totalPages || 1);
			setError(null);
		} catch (err) {
			setError('Failed to load FAQs. Please try again.');
			console.error('Error fetching FAQs:', err);
			setFaqs([]);
		} finally {
			setLoading(false);
		}
	};

	const handleOpenDialog = (faq = null) => {
		if (faq) {
			setSelectedFAQ(faq);
			setFormData({
				question: faq.question,
				answer: faq.answer,
				category: faq.category,
				order: faq.order || 0
			});
		} else {
			setSelectedFAQ(null);
			setFormData({
				question: '',
				answer: '',
				category: 'general',
				order: (faqs || []).length
			});
		}
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setSelectedFAQ(null);
		setFormData({
			question: '',
			answer: '',
			category: 'general',
			order: 0
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
			if (selectedFAQ) {
				await axios.put(`/faqs/${selectedFAQ._id}`, formData);
			} else {
				await axios.post('/faqs', formData);
			}
			fetchFAQs();
			handleCloseDialog();
		} catch (err) {
			setError('Failed to save FAQ. Please try again.');
			console.error('Error saving FAQ:', err);
		}
	};

	const handleDelete = async (id) => {
		if (window.confirm('Are you sure you want to delete this FAQ?')) {
			try {
				await axios.delete(`/faqs/${id}`);
				fetchFAQs();
			} catch (err) {
				setError('Failed to delete FAQ. Please try again.');
				console.error('Error deleting FAQ:', err);
			}
		}
	};

	const handleDragEnd = async (result) => {
		if (!result.destination) return;

		const items = Array.from(faqs);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);

		const updatedItems = items.map((item, index) => ({
			...item,
			order: index
		}));

		setFaqs(updatedItems);

		try {
			await axios.post('/faqs/reorder', {
				orders: updatedItems.map((item, index) => ({
					id: item._id,
					order: index
				}))
			});
		} catch (err) {
			setError('Failed to reorder FAQs. Please try again.');
			console.error('Error reordering FAQs:', err);
			fetchFAQs();
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
		<Container maxWidth="md" sx={{ py: 4 }}>
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
				<Typography variant="h4" component="h1">
					Manage FAQs
				</Typography>
				<Button
					variant="contained"
					color="primary"
					onClick={() => handleOpenDialog()}
				>
					Add New FAQ
				</Button>
			</Box>

			{error && (
				<Alert severity="error" sx={{ mb: 3 }}>
					{error}
				</Alert>
			)}

			<DragDropContext onDragEnd={handleDragEnd}>
				<Droppable droppableId="faqs">
					{(provided) => (
						<List {...provided.droppableProps} ref={provided.innerRef}>
							{faqs.map((faq, index) => (
								<Draggable
									key={faq._id}
									draggableId={faq._id}
									index={index}
								>
									{(provided) => (
										<ListItem
											ref={provided.innerRef}
											{...provided.draggableProps}
											sx={{ bgcolor: 'background.paper', mb: 1 }}
										>
											<Box {...provided.dragHandleProps} sx={{ mr: 2 }}>
												<DragHandleIcon />
											</Box>
											<ListItemText
												primary={faq.question}
												secondary={`Category: ${faq.category}`}
											/>
											<ListItemSecondaryAction>
												<IconButton
													edge="end"
													aria-label="edit"
													onClick={() => handleOpenDialog(faq)}
													sx={{ mr: 1 }}
												>
													<EditIcon />
												</IconButton>
												<IconButton
													edge="end"
													aria-label="delete"
													onClick={() => handleDelete(faq._id)}
												>
													<DeleteIcon />
												</IconButton>
											</ListItemSecondaryAction>
										</ListItem>
									)}
								</Draggable>
							))}
							{provided.placeholder}
						</List>
					)}
				</Droppable>
			</DragDropContext>

			{faqs.length > 0 && (
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

			<Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
				<DialogTitle>
					{selectedFAQ ? 'Edit FAQ' : 'Add New FAQ'}
				</DialogTitle>
				<DialogContent>
					<Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
						<TextField
							fullWidth
							label="Question"
							name="question"
							value={formData.question}
							onChange={handleInputChange}
							required
							sx={{ mb: 2 }}
						/>
						<TextField
							fullWidth
							label="Answer"
							name="answer"
							value={formData.answer}
							onChange={handleInputChange}
							required
							multiline
							rows={4}
							sx={{ mb: 2 }}
						/>
						<FormControl fullWidth sx={{ mb: 2 }}>
							<InputLabel>Category</InputLabel>
							<Select
								name="category"
								value={formData.category}
								onChange={handleInputChange}
								label="Category"
							>
								{categories.map((cat) => (
									<MenuItem key={cat.value} value={cat.value}>
										{cat.label}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDialog}>Cancel</Button>
					<Button onClick={handleSubmit} variant="contained" color="primary">
						{selectedFAQ ? 'Update' : 'Create'}
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
};

export default FAQManagement; 