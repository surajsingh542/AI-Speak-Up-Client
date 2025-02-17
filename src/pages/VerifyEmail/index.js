import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
	Container,
	Box,
	Typography,
	Paper,
	CircularProgress,
	Button
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, Error as ErrorIcon } from '@mui/icons-material';
import axios from '../../config/axios';

function VerifyEmail() {
	const { token } = useParams();
	const navigate = useNavigate();
	const [status, setStatus] = useState('verifying'); // verifying, success, error

	useEffect(() => {
		const verifyEmail = async () => {
			try {
				await axios.get(`/auth/verify/${token}`);
				setStatus('success');
			} catch (error) {
				setStatus('error');
			}
		};

		verifyEmail();
	}, [token]);

	const renderContent = () => {
		switch (status) {
			case 'verifying':
				return (
					<Box sx={{ textAlign: 'center' }}>
						<CircularProgress sx={{ mb: 2 }} />
						<Typography>
							Verifying your email address...
						</Typography>
					</Box>
				);

			case 'error':
				return (
					<Box sx={{ textAlign: 'center' }}>
						<CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
						<Typography variant="h5" gutterBottom>
							Email Verified Successfully!
						</Typography>
						<Typography color="text.secondary" sx={{ mb: 3 }}>
							Your email has been verified. You can now use all features of your account.
						</Typography>
						<Button
							variant="contained"
							onClick={() => navigate('/login')}
						>
							Go to Login
						</Button>
					</Box>
				);

			case 'success':
				return (
					<Box sx={{ textAlign: 'center' }}>
						<ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
						<Typography variant="h5" gutterBottom>
							Verification Failed
						</Typography>
						<Typography color="text.secondary" sx={{ mb: 3 }}>
							The verification link is invalid or has expired.
							Please request a new verification email.
						</Typography>
						<Button
							variant="contained"
							onClick={() => navigate('/login')}
						>
							Go to Login
						</Button>
					</Box>
				);

			default:
				return null;
		}
	};

	return (
		<Container component="main" maxWidth="sm">
			<Box
				sx={{
					marginTop: 8,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
				}}
			>
				<Paper
					elevation={0}
					sx={{
						p: 4,
						width: '100%',
						borderRadius: 2,
						border: '1px solid',
						borderColor: 'divider',
					}}
				>
					{renderContent()}
				</Paper>
			</Box>
		</Container>
	);
}

export default VerifyEmail; 