import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Box,
	IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

function CategoryForm({ open, onClose, onSubmit, category }) {
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		icon: null
	});
	const [previewUrl, setPreviewUrl] = useState('');
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (category) {
			setFormData({
				name: category.name || '',
				description: category.description || '',
				icon: category.icon || null
			});
			setPreviewUrl(category.icon || '');
		} else if (open) {
			// Only reset form when opening a new category form
			setFormData({
				name: '',
				description: '',
				icon: null
			});
			setPreviewUrl('');
		}
		setErrors({});
		setIsSubmitting(false);
	}, [category, open]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
		// Clear error when user starts typing
		if (errors[name]) {
			setErrors(prev => ({
				...prev,
				[name]: ''
			}));
		}
	};

	const handleIconChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64String = reader.result;
				// Check if base64 string size exceeds 50KB (51200 bytes)
				if (base64String.length > 68267) { // ~50KB in base64
					setErrors(prev => ({
						...prev,
						icon: 'Image size must not exceed 50KB'
					}));
					return;
				}

				setFormData(prev => ({
					...prev,
					icon: base64String
				}));
				setPreviewUrl(base64String);
				if (errors.icon) {
					setErrors(prev => ({
						...prev,
						icon: ''
					}));
				}
			};
			reader.readAsDataURL(file);
		}
	};

	const compressImage = (base64String, maxSizeKB = 50) => {
		return new Promise((resolve) => {
			const img = new Image();
			img.src = base64String;
			img.onload = () => {
				const canvas = document.createElement('canvas');
				let width = img.width;
				let height = img.height;

				// Calculate new dimensions while maintaining aspect ratio
				const maxDimension = 800;
				if (width > height && width > maxDimension) {
					height = (height * maxDimension) / width;
					width = maxDimension;
				} else if (height > maxDimension) {
					width = (width * maxDimension) / height;
					height = maxDimension;
				}

				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0, width, height);

				// Start with high quality
				let quality = 0.9;
				let result = canvas.toDataURL('image/jpeg', quality);

				// Reduce quality until size is under maxSizeKB
				while (result.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) {
					quality -= 0.1;
					result = canvas.toDataURL('image/jpeg', quality);
				}

				resolve(result);
			};
		});
	};

	const validateForm = () => {
		const newErrors = {};
		if (!formData.name.trim()) {
			newErrors.name = 'Name is required';
		}
		if (!formData.description.trim()) {
			newErrors.description = 'Description is required';
		} else if (formData.description.length < 10) {
			newErrors.description = 'Description must be at least 10 characters';
		} else if (formData.description.length > 500) {
			newErrors.description = 'Description must not exceed 500 characters';
		}
		if (!category && !formData.icon) {
			newErrors.icon = 'Icon is required';
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (validateForm()) {
			setIsSubmitting(true);
			let iconData = formData.icon;

			try {
				// Compress image if it exists and is new
				if (iconData && (!category || iconData !== category.icon)) {
					try {
						iconData = await compressImage(iconData);
					} catch (error) {
						setErrors(prev => ({
							...prev,
							icon: 'Failed to process image. Please try again.'
						}));
						setIsSubmitting(false);
						return;
					}
				}

				const submitData = {
					name: formData.name.trim(),
					description: formData.description.trim(),
					icon: iconData || category?.icon
				};

				await onSubmit(submitData);
				// Only close the form if submission was successful
				onClose();
			} catch (error) {
				// If there's an API error, maintain form state and show error
				setErrors(prev => ({
					...prev,
					submit: error.response?.data?.message || 'Failed to create category'
				}));
				setIsSubmitting(false);
			}
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>
				{category ? 'Edit Category' : 'Add Category'}
				<IconButton
					aria-label="close"
					onClick={onClose}
					sx={{
						position: 'absolute',
						right: 8,
						top: 8
					}}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<form onSubmit={handleSubmit}>
				<DialogContent>
					{errors.submit && (
						<Box sx={{ mb: 2, color: 'error.main', fontSize: '0.875rem' }}>
							{errors.submit}
						</Box>
					)}
					<TextField
						autoFocus
						margin="dense"
						name="name"
						label="Category Name"
						type="text"
						fullWidth
						value={formData.name}
						onChange={handleChange}
						error={!!errors.name}
						helperText={errors.name}
						sx={{ mb: 2 }}
					/>
					<TextField
						margin="dense"
						name="description"
						label="Description"
						multiline
						rows={4}
						fullWidth
						value={formData.description}
						onChange={handleChange}
						error={!!errors.description}
						helperText={errors.description}
						sx={{ mb: 2 }}
					/>
					<Box sx={{ mb: 2 }}>
						<input
							accept="image/*"
							style={{ display: 'none' }}
							id="icon-file"
							type="file"
							onChange={handleIconChange}
						/>
						<label htmlFor="icon-file">
							<Button variant="outlined" component="span">
								{category ? 'Change Icon' : 'Upload Icon'}
							</Button>
						</label>
						{errors.icon && (
							<Box sx={{ color: 'error.main', mt: 1, fontSize: '0.75rem' }}>
								{errors.icon}
							</Box>
						)}
						{previewUrl && (
							<Box sx={{ mt: 2 }}>
								<img
									src={previewUrl}
									alt="Category icon preview"
									style={{ width: 100, height: 100, objectFit: 'cover' }}
								/>
							</Box>
						)}
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose} disabled={isSubmitting}>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="contained"
						disabled={isSubmitting}
					>
						{isSubmitting
							? (category ? 'Updating...' : 'Creating...')
							: (category ? 'Update' : 'Create')
						}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}

export default CategoryForm; 