import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axios';

const initialState = {
	categories: [],
	frequentCategories: [],
	totalComplaints: 0,
	loading: false,
	error: null
};

// Async thunks
export const fetchCategories = createAsyncThunk(
	'categories/fetchCategories',
	async (_, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.get('/categories');
			// console.log('Fetched categories response:', response.data);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
		}
	}
);

export const createCategory = createAsyncThunk(
	'categories/createCategory',
	async (formData, { rejectWithValue }) => {
		try {
			// console.log('Creating category with data:', formData);
			const response = await axiosInstance.post('/categories', formData, {
				headers: {
					'Content-Type': 'application/json'
				}
			});
			// console.log('Create category response:', response.data);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to create category');
		}
	}
);

export const updateCategory = createAsyncThunk(
	'categories/updateCategory',
	async ({ id, formData }, { rejectWithValue }) => {
		try {
			// console.log('Updating category with data:', formData);
			const response = await axiosInstance.put(`/categories/${id}`, formData, {
				headers: {
					'Content-Type': 'application/json'
				}
			});
			// console.log('Update category response:', response.data);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to update category');
		}
	}
);

export const deleteCategory = createAsyncThunk(
	'categories/deleteCategory',
	async (id, { rejectWithValue }) => {
		try {
			await axiosInstance.delete(`/categories/${id}`);
			return id;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
		}
	}
);

export const addSubCategory = createAsyncThunk(
	'categories/addSubCategory',
	async ({ categoryId, formData }, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.post(`/categories/${categoryId}/subcategories`, formData);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to add subcategory');
		}
	}
);

export const updateSubCategory = createAsyncThunk(
	'categories/updateSubCategory',
	async ({ categoryId, subCategoryId, formData }, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.put(
				`/categories/${categoryId}/subcategories/${subCategoryId}`,
				formData
			);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to update subcategory');
		}
	}
);

export const deleteSubCategory = createAsyncThunk(
	'categories/deleteSubCategory',
	async ({ categoryId, subCategoryId }, { rejectWithValue }) => {
		try {
			await axiosInstance.delete(`/categories/${categoryId}/subcategories/${subCategoryId}`);
			return { categoryId, subCategoryId };
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to delete subcategory');
		}
	}
);

const categorySlice = createSlice({
	name: 'categories',
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = null;
		}
	},
	extraReducers: (builder) => {
		builder
			// Fetch Categories
			.addCase(fetchCategories.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchCategories.fulfilled, (state, action) => {
				state.loading = false;
				state.categories = action.payload.categories;
				state.frequentCategories = action.payload.frequentCategories;
				state.totalComplaints = action.payload.totalComplaints;
			})
			.addCase(fetchCategories.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Create Category
			.addCase(createCategory.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(createCategory.fulfilled, (state, action) => {
				state.loading = false;
				state.categories.push(action.payload);
				if (action.payload.isFrequentlyUsed) {
					state.frequentCategories.push(action.payload);
				}
			})
			.addCase(createCategory.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Update Category
			.addCase(updateCategory.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateCategory.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.categories.findIndex(cat => cat._id === action.payload._id);
				if (index !== -1) {
					state.categories[index] = action.payload;
				}
				state.frequentCategories = state.categories.filter(cat => cat.isFrequentlyUsed);
			})
			.addCase(updateCategory.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Delete Category
			.addCase(deleteCategory.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(deleteCategory.fulfilled, (state, action) => {
				state.loading = false;
				state.categories = state.categories.filter(cat => cat._id !== action.payload);
				state.frequentCategories = state.frequentCategories.filter(cat => cat._id !== action.payload);
			})
			.addCase(deleteCategory.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Add Subcategory
			.addCase(addSubCategory.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(addSubCategory.fulfilled, (state, action) => {
				state.loading = false;
				const categoryIndex = state.categories.findIndex(cat => cat._id === action.payload._id);
				if (categoryIndex !== -1) {
					state.categories[categoryIndex] = action.payload;
				}
			})
			.addCase(addSubCategory.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Update Subcategory
			.addCase(updateSubCategory.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateSubCategory.fulfilled, (state, action) => {
				state.loading = false;
				const categoryIndex = state.categories.findIndex(cat => cat._id === action.payload._id);
				if (categoryIndex !== -1) {
					state.categories[categoryIndex] = action.payload;
				}
			})
			.addCase(updateSubCategory.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Delete Subcategory
			.addCase(deleteSubCategory.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(deleteSubCategory.fulfilled, (state, action) => {
				state.loading = false;
				const categoryIndex = state.categories.findIndex(cat => cat._id === action.payload.categoryId);
				if (categoryIndex !== -1) {
					state.categories[categoryIndex].subCategories = state.categories[categoryIndex].subCategories
						.filter(sub => sub._id !== action.payload.subCategoryId);
				}
			})
			.addCase(deleteSubCategory.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	}
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer; 