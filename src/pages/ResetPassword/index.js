import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
	Container,
	Box,
	Typography,
	TextField,
	Button,
	Paper,
	InputAdornment,
	IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from '../../config/axios';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
	password: Yup.string()
		.min(6, 'Password should be of minimum 6 characters length')
		.matches(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
			'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
		)
		.required('Password is required'),
	confirmPassword: Yup.string()
		.oneOf([Yup.ref('password'), null], 'Passwords must match')
		.required('Confirm Password is required')
});

function ResetPassword() {
	const { token } = useParams();
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const formik = useFormik({
		initialValues: {
			password: '',
			confirmPassword: ''
		},
		validationSchema,
		onSubmit: async (values) => {
			try {
				await axios.post(`/auth/reset-password/${token}`, {
					password: values.password
				});
				toast.success('Password reset successful');
				navigate('/login');
			} catch (error) {
				toast.error(error.response?.data?.message || 'Failed to reset password');
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
							Reset Password
						</Typography>
						<Typography color="text.secondary">
							Enter your new password
						</Typography>
					</Box>

					<form onSubmit={formik.handleSubmit}>
						<TextField
							fullWidth
							margin="normal"
							id="password"
							name="password"
							label="New Password"
							type={showPassword ? 'text' : 'password'}
							value={formik.values.password}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							error={formik.touched.password && Boolean(formik.errors.password)}
							helperText={formik.touched.password && formik.errors.password}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											onClick={() => setShowPassword(!showPassword)}
											edge="end"
										>
											{showPassword ? <VisibilityOff /> : <Visibility />}
										</IconButton>
									</InputAdornment>
								)
							}}
						/>
						<TextField
							fullWidth
							margin="normal"
							id="confirmPassword"
							name="confirmPassword"
							label="Confirm New Password"
							type={showConfirmPassword ? 'text' : 'password'}
							value={formik.values.confirmPassword}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
							helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
											edge="end"
										>
											{showConfirmPassword ? <VisibilityOff /> : <Visibility />}
										</IconButton>
									</InputAdornment>
								)
							}}
						/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2 }}
							disabled={formik.isSubmitting}
						>
							{formik.isSubmitting ? 'Resetting...' : 'Reset Password'}
						</Button>
					</form>
				</Paper>
			</Box>
		</Container>
	);
}

export default ResetPassword; 