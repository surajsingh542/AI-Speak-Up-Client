import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CircularProgress, Box } from '@mui/material';

const AdminRoute = ({ children }) => {
	const { isAuthenticated, loading, user } = useSelector(state => state.auth);
	const location = useLocation();

	if (loading) {
		return (
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					minHeight: '100vh'
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (!isAuthenticated || !user) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	if (user.role !== 'admin') {
		return <Navigate to="/" replace />;
	}

	return children;
};

export default AdminRoute;

