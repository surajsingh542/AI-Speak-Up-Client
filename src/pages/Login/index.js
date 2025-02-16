import React from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
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
	Alert,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions
} from '@mui/material';
import {
	Google as GoogleIcon,
	Apple as AppleIcon,
	Visibility,
	VisibilityOff
} from '@mui/icons-material';
import { login, fetchCurrentUser } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';
import axios from '../../config/axios';

const validationSchema = Yup.object({
	email: Yup.string()
		.email('Enter a valid email')
		.required('Email is required'),
	password: Yup.string()
		.min(6, 'Password should be of minimum 6 characters length')
		.required('Password is required'),
});

function Login() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const [showPassword, setShowPassword] = React.useState(false);
	const [verificationDialogOpen, setVerificationDialogOpen] = React.useState(false);
	const [twoFactorDialogOpen, setTwoFactorDialogOpen] = React.useState(false);
	const [resendingVerification, setResendingVerification] = React.useState(false);
	const [unverifiedEmail, setUnverifiedEmail] = React.useState('');
	const [verificationError, setVerificationError] = React.useState('');
	const [twoFactorToken, setTwoFactorToken] = React.useState('');
	const [twoFactorError, setTwoFactorError] = React.useState('');
	const [pendingCredentials, setPendingCredentials] = React.useState(null);

	const from = location.state?.from?.pathname || '/';

	// Handle verification status from URL
	React.useEffect(() => {
		const params = new URLSearchParams(location.search);
		const verification = params.get('verification');
		const message = params.get('message');

		if (verification === 'success') {
			toast.success(message || 'Email verified successfully');
		} else if (verification === 'failed') {
			toast.error(message || 'Email verification failed');
		}
	}, [location]);

	const formik = useFormik({
		initialValues: {
			email: '',
			password: '',
		},
		validationSchema: validationSchema,
		onSubmit: async (values) => {
			try {
				const response = await dispatch(login(values)).unwrap();
				// Fetch the current user after successful login
				await dispatch(fetchCurrentUser()).unwrap();
				navigate(from, { replace: true });
			} catch (error) {
				if (error.isVerified === false) {
					setUnverifiedEmail(error.email);
					setVerificationError(error.message);
					setVerificationDialogOpen(true);
				} else if (error.requires2FA) {
					setPendingCredentials(values);
					setTwoFactorError(error.message);
					setTwoFactorDialogOpen(true);
				} else {
					toast.error(error.message);
				}
			}
		},
	});

	const handleResendVerification = async () => {
		try {
			setResendingVerification(true);
			const response = await axios.post('/auth/resend-verification', { email: unverifiedEmail });
			toast.success(response.data.message || 'Verification email sent successfully. Please check your inbox.');
			setVerificationDialogOpen(false);
		} catch (error) {
			toast.error(error.response?.data?.message || 'Failed to resend verification email');
		} finally {
			setResendingVerification(false);
		}
	};

	const handleTwoFactorSubmit = async () => {
		if (!twoFactorToken) {
			setTwoFactorError('Please enter the verification code');
			return;
		}

		try {
			const response = await dispatch(login({
				...pendingCredentials,
				twoFactorToken
			})).unwrap();
			setTwoFactorDialogOpen(false);
			navigate(from, { replace: true });
		} catch (error) {
			if (error.requires2FA) {
				setTwoFactorError(error.message);
			} else {
				toast.error(error.message);
				setTwoFactorDialogOpen(false);
			}
		}
	};

	const handleClickShowPassword = () => {
		setShowPassword(!showPassword);
	};

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
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							mb: 3
						}}
					>
						<Typography component="h1" variant="h5" gutterBottom>
							Welcome to Speak Up!
						</Typography>
						<Typography variant="body2" color="text.secondary" align="center">
							Log in to submit and track your complaints
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
							margin="normal"
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											aria-label="toggle password visibility"
											onClick={handleClickShowPassword}
											edge="end"
										>
											{showPassword ? <VisibilityOff /> : <Visibility />}
										</IconButton>
									</InputAdornment>
								),
							}}
						/>
						<Box sx={{ mt: 1, mb: 2 }}>
							<Link
								component={RouterLink}
								to="/forgot-password"
								variant="body2"
								sx={{ float: 'right' }}
							>
								Forgot password?
							</Link>
						</Box>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 2, mb: 2 }}
							disabled={formik.isSubmitting}
						>
							{formik.isSubmitting ? 'Logging in...' : 'Log In'}
						</Button>
					</form>

					<Divider sx={{ my: 3 }}>or</Divider>

					<Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
						<Button
							fullWidth
							variant="outlined"
							startIcon={<GoogleIcon />}
							onClick={() => toast.info('Google login coming soon!')}
						>
							Google
						</Button>
						<Button
							fullWidth
							variant="outlined"
							startIcon={<AppleIcon />}
							onClick={() => toast.info('Apple login coming soon!')}
						>
							Apple
						</Button>
					</Box>

					<Box sx={{ textAlign: 'center' }}>
						<Typography variant="body2" color="text.secondary">
							Don't have an account?{' '}
							<Link component={RouterLink} to="/register">
								Sign up
							</Link>
						</Typography>
					</Box>
				</Paper>
			</Box>

			{/* Verification Dialog */}
			<Dialog
				open={verificationDialogOpen}
				onClose={() => setVerificationDialogOpen(false)}
			>
				<DialogTitle>Email Verification Required</DialogTitle>
				<DialogContent>
					<Alert severity="warning" sx={{ mb: 2 }}>
						{verificationError || 'Your email address has not been verified.'}
					</Alert>
					<Typography gutterBottom>
						Please check your inbox for the verification email sent to: <strong>{unverifiedEmail}</strong>
					</Typography>
					<Typography variant="body2" color="text.secondary">
						If you haven't received the verification email or if it has expired, you can request a new one.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => setVerificationDialogOpen(false)}
						color="inherit"
					>
						Close
					</Button>
					<Button
						onClick={handleResendVerification}
						variant="contained"
						disabled={resendingVerification}
					>
						{resendingVerification ? 'Sending...' : 'Resend Verification Email'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Two-Factor Authentication Dialog */}
			<Dialog
				open={twoFactorDialogOpen}
				onClose={() => setTwoFactorDialogOpen(false)}
			>
				<DialogTitle>Two-Factor Authentication</DialogTitle>
				<DialogContent>
					<Typography gutterBottom sx={{ mb: 2 }}>
						Please enter the verification code from your authenticator app.
					</Typography>
					<TextField
						fullWidth
						label="Verification Code"
						value={twoFactorToken}
						onChange={(e) => setTwoFactorToken(e.target.value)}
						error={Boolean(twoFactorError)}
						helperText={twoFactorError}
						margin="normal"
						inputProps={{
							maxLength: 6,
							inputMode: 'numeric',
							pattern: '[0-9]*'
						}}
					/>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => setTwoFactorDialogOpen(false)}
						color="inherit"
					>
						Cancel
					</Button>
					<Button
						onClick={handleTwoFactorSubmit}
						variant="contained"
					>
						Verify
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
}

export default Login; 