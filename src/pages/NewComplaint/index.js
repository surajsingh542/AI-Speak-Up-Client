import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
	Container,
	Box,
	Typography,
	TextField,
	Button,
	Paper,
	Grid,
	MenuItem,
	IconButton,
	FormHelperText,
	CircularProgress
} from '@mui/material';
import {
	CloudUpload as CloudUploadIcon,
	Close as CloseIcon
} from '@mui/icons-material';
import { createComplaint } from '../../redux/slices/complaintSlice';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
	title: Yup.string()
		.required('Title is required')
		.min(5, 'Title should be at least 5 characters')
		.max(100, 'Title should not exceed 100 characters'),
	description: Yup.string()
		.required('Description is required')
		.min(10, 'Description should be at least 10 characters')
		.max(1000, 'Description should not exceed 1000 characters'),
	category: Yup.string()
		.required('Category is required'),
	subCategory: Yup.string()
		.required('Subcategory is required'),
	priority: Yup.string()
		.required('Priority is required')
});

const priorities = [
	{ value: 'low', label: 'Low Priority' },
	{ value: 'medium', label: 'Medium Priority' },
	{ value: 'high', label: 'High Priority' }
];

function NewComplaint() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const [files, setFiles] = useState([]);
	const [uploading, setUploading] = useState(false);
	const { categories } = useSelector(state => state.categories);
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [subCategories, setSubCategories] = useState([]);

	useEffect(() => {
		if (location.state?.category && categories) {
			const category = categories.find(cat => cat._id === location.state.category);
			if (category) {
				setSelectedCategory(category);
				setSubCategories(category.subCategories || []);
			}
		}
	}, [location.state, categories]);

	const formik = useFormik({
		initialValues: {
			title: '',
			description: '',
			category: location.state?.category || '',
			subCategory: location.state?.subCategory || '',
			priority: 'medium'
		},
		validationSchema,
		onSubmit: async (values) => {
			try {
				setUploading(true);
				const formData = new FormData();
				Object.keys(values).forEach(key => {
					formData.append(key, values[key]);
				});
				files.forEach(file => {
					formData.append('attachments', file);
				});

				await dispatch(createComplaint(formData)).unwrap();
				toast.success('Complaint submitted successfully');
				navigate('/');
			} catch (error) {
				toast.error(error.message || 'Failed to submit complaint');
			} finally {
				setUploading(false);
			}
		}
	});

	const handleCategoryChange = (event) => {
		const categoryId = event.target.value;
		const category = categories.find(cat => cat._id === categoryId);
		setSelectedCategory(category);
		setSubCategories(category?.subCategories || []);
		formik.setFieldValue('category', categoryId);
		formik.setFieldValue('subCategory', '');
	};

	const handleFileChange = (event) => {
		const newFiles = Array.from(event.target.files);
		const validFiles = newFiles.filter(file => {
			const isValid = file.size <= 5 * 1024 * 1024; // 5MB limit
			if (!isValid) {
				toast.error(`File ${file.name} is too large. Maximum size is 5MB`);
			}
			return isValid;
		});
		setFiles(prev => [...prev, ...validFiles]);
	};

	const handleRemoveFile = (index) => {
		setFiles(prev => prev.filter((_, i) => i !== index));
	};

	return (
		<Container maxWidth="md">
			<Box sx={{ mt: 4, mb: 8 }}>
				<Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
					<Typography variant="h4" component="h1" gutterBottom>
						Submit New Complaint
					</Typography>
					<Typography color="text.secondary" sx={{ mb: 4 }}>
						Please provide detailed information about your complaint
					</Typography>

					<form onSubmit={formik.handleSubmit}>
						<Grid container spacing={3}>
							<Grid item xs={12}>
								<TextField
									fullWidth
									id="title"
									name="title"
									label="Title"
									placeholder="Brief summary of your complaint"
									value={formik.values.title}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									error={formik.touched.title && Boolean(formik.errors.title)}
									helperText={formik.touched.title && formik.errors.title}
								/>
							</Grid>

							<Grid item xs={12} sm={6}>
								<TextField
									fullWidth
									select
									id="category"
									name="category"
									label="Category"
									value={formik.values.category}
									onChange={handleCategoryChange}
									onBlur={formik.handleBlur}
									error={formik.touched.category && Boolean(formik.errors.category)}
									helperText={formik.touched.category && formik.errors.category}
								>
									{categories.map(category => (
										<MenuItem key={category._id} value={category._id}>
											{category.name}
										</MenuItem>
									))}
								</TextField>
							</Grid>

							<Grid item xs={12} sm={6}>
								<TextField
									fullWidth
									select
									id="subCategory"
									name="subCategory"
									label="Subcategory"
									value={formik.values.subCategory}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									error={formik.touched.subCategory && Boolean(formik.errors.subCategory)}
									helperText={formik.touched.subCategory && formik.errors.subCategory}
									disabled={!selectedCategory}
								>
									{subCategories.map(subCategory => (
										<MenuItem key={subCategory._id} value={subCategory._id}>
											{subCategory.name}
										</MenuItem>
									))}
								</TextField>
							</Grid>

							<Grid item xs={12} sm={6}>
								<TextField
									fullWidth
									select
									id="priority"
									name="priority"
									label="Priority"
									value={formik.values.priority}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									error={formik.touched.priority && Boolean(formik.errors.priority)}
									helperText={formik.touched.priority && formik.errors.priority}
								>
									{priorities.map(priority => (
										<MenuItem key={priority.value} value={priority.value}>
											{priority.label}
										</MenuItem>
									))}
								</TextField>
							</Grid>

							<Grid item xs={12}>
								<TextField
									fullWidth
									multiline
									rows={6}
									id="description"
									name="description"
									label="Description"
									placeholder="Provide detailed information about your complaint"
									value={formik.values.description}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									error={formik.touched.description && Boolean(formik.errors.description)}
									helperText={formik.touched.description && formik.errors.description}
								/>
							</Grid>

							<Grid item xs={12}>
								<Box
									sx={{
										border: '2px dashed',
										borderColor: 'divider',
										borderRadius: 1,
										p: 3,
										textAlign: 'center',
										cursor: 'pointer',
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										gap: 1,
										'&:hover': {
											borderColor: 'primary.main',
											bgcolor: 'action.hover'
										}
									}}
									component="label"
								>
									<input
										type="file"
										multiple
										accept="image/jpeg,image/png,application/pdf"
										onChange={handleFileChange}
										style={{ display: 'none' }}
									/>
									<CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
									<Box>
										<Typography variant="body1" gutterBottom>
											Drag and drop files here or click to browse
										</Typography>
										<Typography variant="body2" color="text.secondary">
											Supported formats: JPEG, PNG, PDF (max 5MB each)
										</Typography>
									</Box>
								</Box>

								{files.length > 0 && (
									<Box sx={{ mt: 2 }}>
										<Typography variant="subtitle2" gutterBottom>
											Attached Files:
										</Typography>
										{files.map((file, index) => (
											<Box
												key={index}
												sx={{
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'space-between',
													p: 1,
													mb: 1,
													border: '1px solid',
													borderColor: 'divider',
													borderRadius: 1,
													bgcolor: 'background.paper'
												}}
											>
												<Typography variant="body2" noWrap sx={{ flex: 1, mr: 2 }}>
													{file.name}
												</Typography>
												<IconButton
													size="small"
													onClick={() => handleRemoveFile(index)}
													sx={{ color: 'error.main' }}
												>
													<CloseIcon fontSize="small" />
												</IconButton>
											</Box>
										))}
									</Box>
								)}
							</Grid>

							<Grid item xs={12} sx={{ mt: 2 }}>
								<Box sx={{ display: 'flex', gap: 2 }}>
									<Button
										variant="contained"
										type="submit"
										disabled={formik.isSubmitting || uploading}
										startIcon={uploading && <CircularProgress size={20} />}
									>
										{uploading ? 'Submitting...' : 'Submit Complaint'}
									</Button>
									<Button
										variant="outlined"
										onClick={() => navigate('/')}
									>
										Cancel
									</Button>
								</Box>
							</Grid>
						</Grid>
					</form>
				</Paper>
			</Box>
		</Container>
	);
}

export default NewComplaint; 