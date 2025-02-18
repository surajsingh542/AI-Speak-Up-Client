import React, { useState } from 'react';
import {
	Box,
	Typography,
	Button,
	List,
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	IconButton,
	Collapse,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Avatar,
	Divider,
	Container
} from '@mui/material';
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	ExpandMore as ExpandMoreIcon,
	ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import CategoryForm from './CategoryForm';
import SubCategoryForm from './SubCategoryForm';
import { useDispatch } from 'react-redux';
import {
	createCategory,
	updateCategory,
	deleteCategory,
	addSubCategory,
	updateSubCategory,
	deleteSubCategory
} from '../redux/slices/categorySlice';

function CategoryList({ categories = [] }) {
	const dispatch = useDispatch();
	const [expandedCategories, setExpandedCategories] = useState({});
	const [openCategoryForm, setOpenCategoryForm] = useState(false);
	const [openSubCategoryForm, setOpenSubCategoryForm] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [selectedSubCategory, setSelectedSubCategory] = useState(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState(null);
	const [deleteType, setDeleteType] = useState(null);

	const handleExpandCategory = (categoryId) => {
		setExpandedCategories(prev => ({
			...prev,
			[categoryId]: !prev[categoryId]
		}));
	};

	const handleAddCategory = () => {
		setSelectedCategory(null);
		setOpenCategoryForm(true);
	};

	const handleEditCategory = (category) => {
		setSelectedCategory(category);
		setOpenCategoryForm(true);
	};

	const handleAddSubCategory = (category) => {
		setSelectedCategory(category);
		setSelectedSubCategory(null);
		setOpenSubCategoryForm(true);
	};

	const handleEditSubCategory = (category, subCategory) => {
		setSelectedCategory(category);
		setSelectedSubCategory(subCategory);
		setOpenSubCategoryForm(true);
	};

	const handleDeleteClick = (item, type) => {
		setItemToDelete(item);
		setDeleteType(type);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		try {
			if (deleteType === 'category') {
				await dispatch(deleteCategory(itemToDelete._id)).unwrap();
			} else if (deleteType === 'subcategory') {
				await dispatch(deleteSubCategory({
					categoryId: selectedCategory._id,
					subCategoryId: itemToDelete._id
				})).unwrap();
			}
		} catch (error) {
			console.error('Delete failed:', error);
		}
		setDeleteDialogOpen(false);
		setItemToDelete(null);
		setDeleteType(null);
	};

	const handleCategorySubmit = async (formData) => {
		try {
			if (selectedCategory) {
				await dispatch(updateCategory({
					categoryId: selectedCategory._id,
					formData
				})).unwrap();
			} else {
				await dispatch(createCategory(formData)).unwrap();
			}
			setOpenCategoryForm(false);
			setSelectedCategory(null);
		} catch (error) {
			console.error('Category operation failed:', error);
		}
	};

	const handleSubCategorySubmit = async (formData) => {
		try {
			if (selectedSubCategory) {
				await dispatch(updateSubCategory({
					categoryId: selectedCategory._id,
					subCategoryId: selectedSubCategory._id,
					formData
				})).unwrap();
			} else {
				await dispatch(addSubCategory({
					categoryId: selectedCategory._id,
					formData
				})).unwrap();
			}
			setOpenSubCategoryForm(false);
			setSelectedCategory(null);
			setSelectedSubCategory(null);
		} catch (error) {
			console.error('Subcategory operation failed:', error);
		}
	};

	const renderCategoryItem = (category) => {
		if (!category || typeof category !== 'object') return null;
		const name = typeof category.name === 'string' ? category.name : 'Unnamed Category';
		const description = typeof category.description === 'string' ? category.description : '';
		const isExpanded = expandedCategories[category._id];

		return (
			<React.Fragment key={category._id}>
				<ListItem>
					<Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
						{category.icon ? (
							<Box
								component="img"
								src={category.icon}
								alt={name}
								sx={{ width: 40, height: 40, borderRadius: 1 }}
							/>
						) : (
							<Avatar>{name.charAt(0)}</Avatar>
						)}
					</Box>
					<ListItemText
						primary={name}
						secondary={description}
					/>
					<ListItemSecondaryAction>
						<IconButton onClick={() => handleEditCategory(category)}>
							<EditIcon />
						</IconButton>
						<IconButton onClick={() => handleDeleteClick(category, 'category')}>
							<DeleteIcon />
						</IconButton>
						<IconButton onClick={() => handleExpandCategory(category._id)}>
							{isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
						</IconButton>
					</ListItemSecondaryAction>
				</ListItem>
				<Collapse in={isExpanded} timeout="auto" unmountOnExit>
					<List component="div" disablePadding>
						{Array.isArray(category.subCategories) && category.subCategories.map((subCategory) => {
							if (!subCategory || typeof subCategory !== 'object') return null;
							const subName = typeof subCategory.name === 'string' ? subCategory.name : 'Unnamed Subcategory';
							const subDescription = typeof subCategory.description === 'string' ? subCategory.description : '';

							return (
								<ListItem key={subCategory._id} sx={{ pl: 4 }}>
									<Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
										{subCategory.icon ? (
											<Box
												component="img"
												src={subCategory.icon}
												alt={subName}
												sx={{ width: 32, height: 32, borderRadius: 1 }}
											/>
										) : (
											<Avatar sx={{ width: 32, height: 32 }}>{subName.charAt(0)}</Avatar>
										)}
									</Box>
									<ListItemText
										primary={subName}
										secondary={subDescription}
									/>
									<ListItemSecondaryAction>
										<IconButton onClick={() => handleEditSubCategory(category, subCategory)}>
											<EditIcon />
										</IconButton>
										<IconButton onClick={() => handleDeleteClick(subCategory, 'subcategory')}>
											<DeleteIcon />
										</IconButton>
									</ListItemSecondaryAction>
								</ListItem>
							);
						})}
						<ListItem sx={{ pl: 4 }}>
							<Button
								startIcon={<AddIcon />}
								onClick={() => handleAddSubCategory(category)}
							>
								Add Subcategory
							</Button>
						</ListItem>
					</List>
				</Collapse>
				<Divider />
			</React.Fragment>
		);
	};

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Box>
				<Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Typography variant="h4" component="h1">Categories</Typography>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={handleAddCategory}
					>
						Add Category
					</Button>
				</Box>

				<List>
					{Array.isArray(categories) && categories.map(renderCategoryItem)}
				</List>

				<CategoryForm
					open={openCategoryForm}
					onClose={() => setOpenCategoryForm(false)}
					onSubmit={handleCategorySubmit}
					category={selectedCategory}
				/>

				<SubCategoryForm
					open={openSubCategoryForm}
					onClose={() => setOpenSubCategoryForm(false)}
					onSubmit={handleSubCategorySubmit}
					categoryId={selectedCategory?._id}
					subCategory={selectedSubCategory}
				/>

				<Dialog
					open={deleteDialogOpen}
					onClose={() => setDeleteDialogOpen(false)}
				>
					<DialogTitle>
						Confirm Delete
					</DialogTitle>
					<DialogContent>
						<Typography>
							Are you sure you want to delete this {deleteType}?
							{deleteType === 'category' && ' This will also delete all its subcategories.'}
						</Typography>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
						<Button onClick={handleConfirmDelete} color="error">Delete</Button>
					</DialogActions>
				</Dialog>
			</Box>
		</Container>
	);
}

export default CategoryList; 