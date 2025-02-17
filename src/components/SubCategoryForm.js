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

function SubCategoryForm({ open, onClose, onSubmit, categoryId, subCategory }) {
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		icon: null
	});
	const [previewUrl, setPreviewUrl] = useState('');
	const [errors, setErrors] = useState({});

	useEffect(() => {
		if (subCategory) {
			setFormData({
				name: subCategory.name || '',
				description: subCategory.description || '',
				icon: null
			});
			setPreviewUrl(subCategory.icon ? `${subCategory.icon}` : '');
		} else {
			setFormData({
				name: '',
				description: '',
				icon: null
			});
			setPreviewUrl('');
		}
		setErrors({});
	}, [subCategory, open]);

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
				setFormData(prev => ({
					...prev,
					icon: reader.result
				}));
				setPreviewUrl(reader.result);
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
		if (!subCategory && !formData.icon) {
			newErrors.icon = 'Icon is required';
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (validateForm()) {
			const submitData = {
				name: formData.name.trim(),
				description: formData.description.trim(),
				icon: formData.icon
			};
			onSubmit(submitData);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>
				{subCategory ? 'Edit Subcategory' : 'Add Subcategory'}
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
					<TextField
						autoFocus
						margin="dense"
						name="name"
						label="Subcategory Name"
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
								{subCategory ? 'Change Icon' : 'Upload Icon'}
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
									alt="Subcategory icon preview"
									style={{ width: 100, height: 100, objectFit: 'cover' }}
								/>
							</Box>
						)}
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>Cancel</Button>
					<Button type="submit" variant="contained">
						{subCategory ? 'Update' : 'Create'}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}

export default SubCategoryForm; 