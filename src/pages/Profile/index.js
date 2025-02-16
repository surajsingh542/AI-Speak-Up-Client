import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
	Container,
	Box,
	Typography,
	TextField,
	Button,
	Paper,
	Grid,
	Avatar,
	IconButton,
	Divider,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	InputAdornment
} from '@mui/material';
import {
	Edit as EditIcon,
	PhotoCamera as PhotoCameraIcon,
	Visibility,
	VisibilityOff
} from '@mui/icons-material';
import { updateProfile, updateProfilePic, fetchCurrentUser } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';
import axiosInstance from '../../config/axios';

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
});

const passwordValidationSchema = Yup.object({
	currentPassword: Yup.string()
		.required('Current password is required'),
	newPassword: Yup.string()
		.min(6, 'Password should be of minimum 6 characters length')
		.matches(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
			'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
		)
		.required('New password is required'),
	confirmPassword: Yup.string()
		.oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
		.required('Confirm password is required'),
});

function Profile() {
	const dispatch = useDispatch();
	const { user, loading } = useSelector(state => state.auth);
	const [isEditMode, setIsEditMode] = useState(false);
	const [showPasswordDialog, setShowPasswordDialog] = useState(false);
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	useEffect(() => {
		if (!user) {
			dispatch(fetchCurrentUser());
		}
	}, [user, dispatch]);

	const formik = useFormik({
		initialValues: {
			name: user?.name || '',
			email: user?.email || '',
			phone: user?.phone || '',
		},
		validationSchema,
		enableReinitialize: true,
		onSubmit: async (values) => {
			try {
				await dispatch(updateProfile(values)).unwrap();
				setIsEditMode(false);
				toast.success('Profile updated successfully');
			} catch (error) {
				toast.error(error.message || 'Failed to update profile');
			}
		},
	});

	const passwordFormik = useFormik({
		initialValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
		validationSchema: passwordValidationSchema,
		onSubmit: async (values, { resetForm }) => {
			try {
				await axiosInstance.put('/users/password', values);
				toast.success('Password changed successfully');
				setShowPasswordDialog(false);
				resetForm();
			} catch (error) {
				toast.error(error.response?.data?.message || 'Failed to change password');
			}
		},
	});

	const handlePhotoUpload = async (event) => {
		const file = event.target.files[0];
		if (!file) return;

		const formData = new FormData();
		formData.append('profilePicture', file);

		try {
			await dispatch(updateProfilePic(formData)).unwrap();
			toast.success('Profile picture updated successfully');
		} catch (error) {
			toast.error(error.message || 'Failed to update profile picture');
		}
	};

	const handleEditClick = () => {
		setIsEditMode(true);
	};

	const handleCancelEdit = () => {
		setIsEditMode(false);
		formik.resetForm();
	};

	return (
		<Container maxWidth="md">
			<Box sx={{ mt: 4, mb: 8 }}>
				<Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
					{/* Header */}
					<Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
						<Box sx={{ position: 'relative' }}>
							<Avatar
								src={user?.profilePicture}
								sx={{ width: 100, height: 100 }}
							/>
							<input
								type="file"
								accept="image/*"
								style={{ display: 'none' }}
								id="photo-upload"
								onChange={handlePhotoUpload}
							/>
							<label htmlFor="photo-upload">
								<IconButton
									component="span"
									sx={{
										position: 'absolute',
										bottom: 0,
										right: 0,
										bgcolor: 'background.paper'
									}}
								>
									<PhotoCameraIcon />
								</IconButton>
							</label>
						</Box>
						<Box sx={{ ml: 3 }}>
							<Typography variant="h5" gutterBottom>
								{user?.name}
							</Typography>
							<Typography color="text.secondary">
								{user?.email}
							</Typography>
						</Box>
					</Box>

					{isEditMode ? (
						<form onSubmit={formik.handleSubmit}>
							<Grid container spacing={3}>
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
										disabled={true}
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
							</Grid>

							<Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
								<Button
									type="submit"
									variant="contained"
									disabled={loading}
								>
									Save Changes
								</Button>
								<Button
									variant="outlined"
									onClick={handleCancelEdit}
								>
									Cancel
								</Button>
							</Box>
						</form>
					) : (
						<>
							<Grid container spacing={3}>
								<Grid item xs={12}>
									<TextField
										fullWidth
										label="Full Name"
										value={user?.name || ''}
										disabled
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										fullWidth
										label="Email Address"
										value={user?.email || ''}
										disabled
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										fullWidth
										label="Phone Number"
										value={user?.phone || ''}
										disabled
									/>
								</Grid>
							</Grid>

							<Box sx={{ mt: 3 }}>
								<Button
									variant="contained"
									startIcon={<EditIcon />}
									onClick={handleEditClick}
								>
									Edit Profile
								</Button>
							</Box>
						</>
					)}

					<Divider sx={{ my: 4 }} />

					<Box>
						<Typography variant="h6" gutterBottom>
							Security
						</Typography>
						<Button
							variant="outlined"
							onClick={() => setShowPasswordDialog(true)}
						>
							Change Password
						</Button>
					</Box>
				</Paper>
			</Box>

			{/* Change Password Dialog */}
			<Dialog
				open={showPasswordDialog}
				onClose={() => setShowPasswordDialog(false)}
				maxWidth="sm"
				fullWidth
			>
				<form onSubmit={passwordFormik.handleSubmit}>
					<DialogTitle>Change Password</DialogTitle>
					<DialogContent>
						<Box sx={{ mt: 2 }}>
							<TextField
								fullWidth
								margin="normal"
								id="currentPassword"
								name="currentPassword"
								label="Current Password"
								type={showCurrentPassword ? 'text' : 'password'}
								value={passwordFormik.values.currentPassword}
								onChange={passwordFormik.handleChange}
								onBlur={passwordFormik.handleBlur}
								error={passwordFormik.touched.currentPassword && Boolean(passwordFormik.errors.currentPassword)}
								helperText={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<IconButton
												onClick={() => setShowCurrentPassword(!showCurrentPassword)}
												edge="end"
											>
												{showCurrentPassword ? <VisibilityOff /> : <Visibility />}
											</IconButton>
										</InputAdornment>
									),
								}}
							/>
							<TextField
								fullWidth
								margin="normal"
								id="newPassword"
								name="newPassword"
								label="New Password"
								type={showNewPassword ? 'text' : 'password'}
								value={passwordFormik.values.newPassword}
								onChange={passwordFormik.handleChange}
								onBlur={passwordFormik.handleBlur}
								error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
								helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<IconButton
												onClick={() => setShowNewPassword(!showNewPassword)}
												edge="end"
											>
												{showNewPassword ? <VisibilityOff /> : <Visibility />}
											</IconButton>
										</InputAdornment>
									),
								}}
							/>
							<TextField
								fullWidth
								margin="normal"
								id="confirmPassword"
								name="confirmPassword"
								label="Confirm New Password"
								type={showConfirmPassword ? 'text' : 'password'}
								value={passwordFormik.values.confirmPassword}
								onChange={passwordFormik.handleChange}
								onBlur={passwordFormik.handleBlur}
								error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
								helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
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
									),
								}}
							/>
						</Box>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setShowPasswordDialog(false)}>
							Cancel
						</Button>
						<Button
							type="submit"
							variant="contained"
							disabled={loading}
						>
							Change Password
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</Container>
	);
}

export default Profile; 