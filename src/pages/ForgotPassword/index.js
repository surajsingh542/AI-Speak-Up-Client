import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
	Container,
	Box,
	Typography,
	TextField,
	Button,
	Link,
	Paper
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import axios from '../../config/axios';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
	email: Yup.string()
		.email('Enter a valid email')
		.required('Email is required')
});

function ForgotPassword() {
	const formik = useFormik({
		initialValues: {
			email: ''
		},
		validationSchema,
		onSubmit: async (values) => {
			try {
				await axios.post('/auth/forgot-password', values);
				toast.success('Password reset instructions sent to your email');
			} catch (error) {
				toast.error(error.response?.data?.message || 'Failed to send reset instructions');
			}
		}
	});

	return (
		<Container component="main" maxWidth="xs">
			<Box
				sx={{
					marginTop: 8,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center'
				}}
			>
				<Paper
					elevation={0}
					sx={{
						p: 4,
						width: '100%',
						borderRadius: 2,
						border: '1px solid',
						borderColor: 'divider'
					}}
				>
					<Box sx={{ mb: 3, textAlign: 'center' }}>
						<Typography component="h1" variant="h5" gutterBottom>
							Forgot Password
						</Typography>
						<Typography color="text.secondary">
							Enter your email address and we'll send you instructions to reset your password
						</Typography>
					</Box>

					<form onSubmit={formik.handleSubmit}>
						<TextField
							fullWidth
							id="email"
							name="email"
							label="Email Address"
							value={formik.values.email}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							error={formik.touched.email && Boolean(formik.errors.email)}
							helperText={formik.touched.email && formik.errors.email}
							margin="normal"
						/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2 }}
							disabled={formik.isSubmitting}
						>
							{formik.isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
						</Button>
					</form>

					<Box sx={{ textAlign: 'center' }}>
						<Link
							component={RouterLink}
							to="/login"
							variant="body2"
							sx={{ display: 'inline-flex', alignItems: 'center' }}
						>
							<ArrowBackIcon sx={{ mr: 0.5 }} fontSize="small" />
							Back to Login
						</Link>
					</Box>
				</Paper>
			</Box>
		</Container>
	);
}

export default ForgotPassword; 