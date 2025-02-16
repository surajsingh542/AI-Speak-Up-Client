import React from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	Grid,
	Paper,
	Typography,
	Box,
	IconButton,
	Avatar,
	useTheme,
	useMediaQuery
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

function CategorySelectionDialog({
	open,
	onClose,
	categories = [],
	selectedCategory,
	showSubCategories,
	onCategorySelect,
	onSubCategorySelect,
	isNewComplaint
}) {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

	const getCategoryData = (category) => {
		if (!category || typeof category !== 'object') return null;
		return {
			id: category._id || '',
			name: typeof category.name === 'string' ? category.name : 'Unnamed Category',
			description: typeof category.description === 'string' ? category.description : '',
			icon: typeof category.icon === 'string' ? category.icon : null,
			subCategories: Array.isArray(category.subCategories) ? category.subCategories : []
		};
	};

	const renderCategoryItem = (category) => {
		const categoryData = getCategoryData(category);
		if (!categoryData) return null;

		return (
			<Grid item xs={12} sm={6} md={4} key={categoryData.id || `temp-${categoryData.name}`}>
				<Paper
					sx={{
						p: 2,
						cursor: 'pointer',
						transition: 'all 0.2s',
						'&:hover': {
							transform: 'translateY(-2px)',
							boxShadow: 3
						},
						...(selectedCategory?._id === category._id && {
							border: `2px solid ${theme.palette.primary.main}`
						})
					}}
					onClick={() => onCategorySelect(category)}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
						{categoryData.icon ? (
							<Box
								component="img"
								src={categoryData.icon}
								alt={categoryData.name}
								sx={{ width: 40, height: 40, mr: 2, borderRadius: 1 }}
							/>
						) : (
							<Avatar sx={{ mr: 2 }}>{categoryData.name.charAt(0)}</Avatar>
						)}
						<Typography variant="h6">{categoryData.name}</Typography>
					</Box>
					{categoryData.description && (
						<Typography variant="body2" color="text.secondary">
							{categoryData.description}
						</Typography>
					)}
				</Paper>
			</Grid>
		);
	};

	const renderSubCategoryItem = (subCategory) => {
		const subCategoryData = getCategoryData(subCategory);
		if (!subCategoryData) return null;

		return (
			<Grid item xs={12} sm={6} md={4} key={subCategoryData.id || `temp-${subCategoryData.name}`}>
				<Paper
					sx={{
						p: 2,
						cursor: 'pointer',
						transition: 'all 0.2s',
						'&:hover': {
							transform: 'translateY(-2px)',
							boxShadow: 3
						}
					}}
					onClick={() => onSubCategorySelect(selectedCategory, subCategory)}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
						{subCategoryData.icon ? (
							<Box
								component="img"
								src={subCategoryData.icon}
								alt={subCategoryData.name}
								sx={{ width: 32, height: 32, mr: 2, borderRadius: 1 }}
							/>
						) : (
							<Avatar sx={{ width: 32, height: 32, mr: 2 }}>
								{subCategoryData.name.charAt(0)}
							</Avatar>
						)}
						<Typography variant="h6">{subCategoryData.name}</Typography>
					</Box>
					{subCategoryData.description && (
						<Typography variant="body2" color="text.secondary">
							{subCategoryData.description}
						</Typography>
					)}
				</Paper>
			</Grid>
		);
	};

	const selectedCategoryData = getCategoryData(selectedCategory);
	const dialogTitle = showSubCategories && selectedCategoryData
		? `Select a subcategory in ${selectedCategoryData.name}`
		: isNewComplaint
			? 'Select a category for your new complaint'
			: 'Browse Categories';

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullScreen={fullScreen}
			maxWidth="md"
			fullWidth
		>
			<DialogTitle>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Typography variant="h6">{dialogTitle}</Typography>
					<IconButton onClick={onClose} size="small">
						<CloseIcon />
					</IconButton>
				</Box>
			</DialogTitle>
			<DialogContent>
				<Grid container spacing={2}>
					{showSubCategories && selectedCategory ? (
						Array.isArray(selectedCategory.subCategories) && selectedCategory.subCategories.map(renderSubCategoryItem)
					) : (
						Array.isArray(categories) && categories.map(renderCategoryItem)
					)}
				</Grid>
			</DialogContent>
		</Dialog>
	);
}

export default CategorySelectionDialog; 