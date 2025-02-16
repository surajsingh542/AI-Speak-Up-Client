import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
	Container,
	Box,
	Typography,
	TextField,
	Button,
	Link,
	Paper,
	Divider,
	IconButton,
	InputAdornment,
	Grid,
	Alert
} from '@mui/material';
import {
	Google as GoogleIcon,
	Apple as AppleIcon,
	Visibility,
	VisibilityOff
} from '@mui/icons-material';
import { register } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';
import axios from '../../config/axios';

const validationSchema = Yup.object({
	name: Yup.string()
		.required('Name is required')
		.min(2, 'Name should be of minimum 2 characters length'),
	email: Yup.string()
		.email('Enter a valid email')
		.required('Email is required'),
	phone: Yup.string()
		.matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
		.required('Phone number is required'),
	password: Yup.string()
		.min(6, 'Password should be of minimum 6 characters length')
		.matches(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
			'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
		)
		.required('Password is required'),
	confirmPassword: Yup.string()
		.oneOf([Yup.ref('password'), null], 'Passwords must match')
		.required('Confirm Password is required'),
});

function Register() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [registrationSuccess, setRegistrationSuccess] = useState(false);
	const [registeredEmail, setRegisteredEmail] = useState('');

	const formik = useFormik({
		initialValues: {
			name: '',
			email: '',
			phone: '',
			password: '',
			confirmPassword: '',
		},
		validationSchema: validationSchema,
		onSubmit: async (values) => {
			try {
				const response = await axios.post('/auth/register', {
					name: values.name,
					email: values.email,
					phone: values.phone,
					password: values.password
				});
				setRegisteredEmail(values.email);
				setRegistrationSuccess(true);
				toast.success(response.data.message || 'Registration successful! Please check your email for verification.');
			} catch (error) {
				if (error.response?.data?.errors) {
					// Handle validation errors from backend
					const validationErrors = {};
					error.response.data.errors.forEach(err => {
						validationErrors[err.param] = err.msg;
					});
					formik.setErrors(validationErrors);
				}
				toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
			}
		}
	});

	if (registrationSuccess) {
		return (
			<Container component="main" maxWidth="xs">
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
						<Box sx={{ textAlign: 'center', mb: 3 }}>
							<Typography variant="h5" component="h1" gutterBottom>
								Registration Successful!
							</Typography>
							<Typography color="text.secondary" paragraph>
								Thank you for registering with Speak Up.
							</Typography>
						</Box>

						<Alert severity="info" sx={{ mb: 3 }}>
							A verification email has been sent to <strong>{registeredEmail}</strong>.
							Please check your inbox and click the verification link to activate your account.
							The verification link will expire in 24 hours.
						</Alert>

						<Typography variant="body2" paragraph>
							If you don't see the email in your inbox:
						</Typography>
						<ul>
							<Typography component="li" variant="body2">
								Check your spam folder
							</Typography>
							<Typography component="li" variant="body2">
								Wait a few minutes and refresh your inbox
							</Typography>
							<Typography component="li" variant="body2">
								Make sure you entered the correct email address
							</Typography>
						</ul>

						<Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
							<Button
								fullWidth
								variant="contained"
								onClick={() => navigate('/login')}
							>
								Go to Login
							</Button>
							<Button
								fullWidth
								variant="outlined"
								onClick={() => {
									setRegistrationSuccess(false);
									formik.resetForm();
								}}
							>
								Register Another Account
							</Button>
						</Box>
					</Paper>
				</Box>
			</Container>
		);
	}

	return (
		<Container component="main" maxWidth="sm">
			<Box
				sx={{
					marginTop: 8,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					mb: 8
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
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							mb: 3
						}}
					>
						<Typography component="h1" variant="h5" gutterBottom>
							Create your account
						</Typography>
						<Typography variant="body2" color="text.secondary" align="center">
							Join Speak Up to start submitting and tracking your complaints
						</Typography>
					</Box>

					<Box sx={{ mb: 3 }}>
						<Button
							fullWidth
							variant="outlined"
							startIcon={<GoogleIcon />}
							sx={{ mb: 2 }}
							onClick={() => toast.info('Google registration coming soon!')}
						>
							Continue with Google
						</Button>
						<Button
							fullWidth
							variant="outlined"
							startIcon={<AppleIcon />}
							onClick={() => toast.info('Apple registration coming soon!')}
						>
							Continue with Apple
						</Button>
					</Box>

					<Divider sx={{ my: 3 }}>or</Divider>

					<form onSubmit={formik.handleSubmit}>
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<TextField
									fullWidth
									id="name"
									name="name"
									label="Full Name"
									value={formik.values.name}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									error={formik.touched.name && Boolean(formik.errors.name)}
									helperText={formik.touched.name && formik.errors.name}
								/>
							</Grid>
							<Grid item xs={12}>
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
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									fullWidth
									id="phone"
									name="phone"
									label="Phone Number"
									value={formik.values.phone}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									error={formik.touched.phone && Boolean(formik.errors.phone)}
									helperText={formik.touched.phone && formik.errors.phone}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									fullWidth
									id="password"
									name="password"
									label="Password"
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
													aria-label="toggle password visibility"
													onClick={() => setShowPassword(!showPassword)}
													edge="end"
												>
													{showPassword ? <VisibilityOff /> : <Visibility />}
												</IconButton>
											</InputAdornment>
										),
									}}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									fullWidth
									id="confirmPassword"
									name="confirmPassword"
									label="Confirm Password"
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
													aria-label="toggle confirm password visibility"
													onClick={() => setShowConfirmPassword(!showConfirmPassword)}
													edge="end"
												>
													{showConfirmPassword ? <VisibilityOff /> : <Visibility />}
												</IconButton>
											</InputAdornment>
										),
									}}
								/>
							</Grid>
						</Grid>

						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2 }}
							disabled={formik.isSubmitting}
						>
							{formik.isSubmitting ? 'Creating Account...' : 'Create Account'}
						</Button>

						<Box sx={{ textAlign: 'center' }}>
							<Typography variant="body2" color="text.secondary">
								Already have an account?{' '}
								<Link component={RouterLink} to="/login">
									Log in
								</Link>
							</Typography>
						</Box>

						<Box sx={{ mt: 2 }}>
							<Typography variant="body2" color="text.secondary" align="center">
								By creating an account, you agree to our{' '}
								<Link component={RouterLink} to="/terms">
									Terms of Service
								</Link>{' '}
								and{' '}
								<Link component={RouterLink} to="/privacy">
									Privacy Policy
								</Link>
							</Typography>
						</Box>
					</form>
				</Paper>
			</Box>
		</Container>
	);
}

export default Register; 