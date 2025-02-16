import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';

function NotFound() {
	const navigate = useNavigate();

	return (
		<Container maxWidth="sm">
			<Box
				sx={{
					mt: 8,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					textAlign: 'center'
				}}
			>
				<ErrorOutlineIcon sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
				<Typography variant="h1" component="h1" gutterBottom>
					404
				</Typography>
				<Typography variant="h5" component="h2" gutterBottom>
					Page Not Found
				</Typography>
				<Typography color="text.secondary" paragraph>
					The page you are looking for might have been removed, had its name changed,
					or is temporarily unavailable.
				</Typography>
				<Button
					variant="contained"
					startIcon={<HomeIcon />}
					onClick={() => navigate('/')}
					sx={{ mt: 2 }}
				>
					Back to Home
				</Button>
			</Box>
		</Container>
	);
}

export default NotFound; 