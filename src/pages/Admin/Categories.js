import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress, Alert } from '@mui/material';
import { fetchCategories } from '../../redux/slices/categorySlice';
import CategoryList from '../../components/CategoryList';

function Categories() {
	const dispatch = useDispatch();
	const { categories, loading, error } = useSelector(state => state.categories);

	useEffect(() => {
		dispatch(fetchCategories());
	}, [dispatch]);

	if (loading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Alert severity="error" sx={{ mb: 2 }}>
				{error}
			</Alert>
		);
	}

	return (
		<Box>
			<CategoryList categories={categories} />
		</Box>
	);
}

export default Categories; 