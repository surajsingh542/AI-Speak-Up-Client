import React, { useState, useEffect } from 'react';
import {
	Container,
	Box,
	Typography,
	Paper,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	ListItemSecondaryAction,
	Switch,
	Divider,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	TextField,
	Alert
} from '@mui/material';
import {
	Notifications as NotificationsIcon,
	Language as LanguageIcon,
	Palette as PaletteIcon,
	Security as SecurityIcon,
	Delete as DeleteIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';
import axios from '../../config/axios';

function Settings() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { user } = useSelector(state => state.auth);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false);
	const [qrCode, setQrCode] = useState('');
	const [verificationCode, setVerificationCode] = useState('');
	const [settings, setSettings] = useState({
		emailNotifications: true,
		pushNotifications: false,
		language: 'en',
		theme: 'light',
		twoFactorAuth: false
	});

	useEffect(() => {
		fetchSettings();
	}, []);

	const fetchSettings = async () => {
		try {
			const response = await axios.get('/settings');
			setSettings(response.data);
		} catch (error) {
			toast.error('Failed to load settings');
		}
	};

	const handleSettingChange = (setting) => async (event) => {
		const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;

		try {
			if (setting === 'twoFactorAuth') {
				if (value) {
					const response = await axios.post('/settings/2fa/enable');
					setQrCode(response.data.qrCode);
					setTwoFactorDialogOpen(true);
				} else {
					await axios.post('/settings/2fa/disable');
					setSettings(prev => ({ ...prev, [setting]: false }));
					toast.success('Two-factor authentication disabled');
				}
				return;
			}

			await axios.patch('/settings/preferences', { [setting]: value });
			setSettings(prev => ({ ...prev, [setting]: value }));
			toast.success(`${setting} updated successfully`);
		} catch (error) {
			toast.error(error.response?.data?.message || 'Failed to update setting');
		}
	};

	const handleVerifyTwoFactor = async () => {
		try {
			await axios.post('/settings/2fa/verify', { token: verificationCode });
			setSettings(prev => ({ ...prev, twoFactorAuth: true }));
			setTwoFactorDialogOpen(false);
			setVerificationCode('');
			toast.success('Two-factor authentication enabled successfully');
		} catch (error) {
			toast.error('Invalid verification code');
		}
	};

	const handleDeleteAccount = async () => {
		try {
			await axios.delete('/users/me');
			toast.success('Account deleted successfully');
			dispatch(logout());
			navigate('/register');
		} catch (error) {
			toast.error(error.response?.data?.message || 'Failed to delete account');
		}
		setDeleteDialogOpen(false);
	};

	return (
		<Container maxWidth="md">
			<Box sx={{ mt: 4, mb: 8 }}>
				<Typography variant="h4" component="h1" gutterBottom>
					Settings
				</Typography>

				<Paper elevation={0} sx={{ mt: 3, border: '1px solid', borderColor: 'divider' }}>
					{/* Notifications */}
					<List>
						<ListItem>
							<ListItemIcon>
								<NotificationsIcon />
							</ListItemIcon>
							<ListItemText
								primary="Notifications"
								secondary="Manage your notification preferences"
							/>
						</ListItem>
						<Divider component="li" />
						<ListItem>
							<ListItemText
								primary="Email Notifications"
								secondary="Receive updates and alerts via email"
							/>
							<ListItemSecondaryAction>
								<Switch
									edge="end"
									checked={settings.emailNotifications}
									onChange={handleSettingChange('emailNotifications')}
								/>
							</ListItemSecondaryAction>
						</ListItem>
						<ListItem>
							<ListItemText
								primary="Push Notifications"
								secondary="Receive updates and alerts on your device"
							/>
							<ListItemSecondaryAction>
								<Switch
									edge="end"
									checked={settings.pushNotifications}
									onChange={handleSettingChange('pushNotifications')}
								/>
							</ListItemSecondaryAction>
						</ListItem>

						{/* Language */}
						<Divider />
						<ListItem>
							<ListItemIcon>
								<LanguageIcon />
							</ListItemIcon>
							<ListItemText
								primary="Language"
								secondary="Choose your preferred language"
							/>
							<ListItemSecondaryAction>
								<FormControl sx={{ minWidth: 120 }}>
									<Select
										value={settings.language}
										onChange={handleSettingChange('language')}
										size="small"
									>
										<MenuItem value="en">English</MenuItem>
										<MenuItem value="es">Español</MenuItem>
										<MenuItem value="fr">Français</MenuItem>
									</Select>
								</FormControl>
							</ListItemSecondaryAction>
						</ListItem>

						{/* Theme */}
						<Divider />
						<ListItem>
							<ListItemIcon>
								<PaletteIcon />
							</ListItemIcon>
							<ListItemText
								primary="Theme"
								secondary="Choose your preferred theme"
							/>
							<ListItemSecondaryAction>
								<FormControl sx={{ minWidth: 120 }}>
									<Select
										value={settings.theme}
										onChange={handleSettingChange('theme')}
										size="small"
									>
										<MenuItem value="light">Light</MenuItem>
										<MenuItem value="dark">Dark</MenuItem>
										<MenuItem value="system">System</MenuItem>
									</Select>
								</FormControl>
							</ListItemSecondaryAction>
						</ListItem>

						{/* Security */}
						<Divider />
						<ListItem>
							<ListItemIcon>
								<SecurityIcon />
							</ListItemIcon>
							<ListItemText
								primary="Security"
								secondary="Manage your security settings"
							/>
						</ListItem>
						<ListItem>
							<ListItemText
								primary="Two-Factor Authentication"
								secondary="Add an extra layer of security to your account"
							/>
							<ListItemSecondaryAction>
								<Switch
									edge="end"
									checked={settings.twoFactorAuth}
									onChange={handleSettingChange('twoFactorAuth')}
								/>
							</ListItemSecondaryAction>
						</ListItem>

						{/* Danger Zone */}
						<Divider />
						<ListItem sx={{ mt: 2 }}>
							<Typography variant="h6" color="error">
								Danger Zone
							</Typography>
						</ListItem>
						<ListItem>
							<ListItemText
								primary="Delete Account"
								secondary="Permanently delete your account and all associated data"
								primaryTypographyProps={{ color: 'error' }}
							/>
							<ListItemSecondaryAction>
								<Button
									variant="outlined"
									color="error"
									startIcon={<DeleteIcon />}
									onClick={() => setDeleteDialogOpen(true)}
								>
									Delete Account
								</Button>
							</ListItemSecondaryAction>
						</ListItem>
					</List>
				</Paper>
			</Box>

			{/* Two Factor Authentication Dialog */}
			<Dialog open={twoFactorDialogOpen} onClose={() => setTwoFactorDialogOpen(false)}>
				<DialogTitle>Enable Two-Factor Authentication</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Scan the QR code with your authenticator app and enter the verification code below.
					</DialogContentText>
					{qrCode && (
						<Box sx={{ my: 2, textAlign: 'center' }}>
							<img src={qrCode} alt="QR Code" />
						</Box>
					)}
					<TextField
						fullWidth
						label="Verification Code"
						value={verificationCode}
						onChange={(e) => setVerificationCode(e.target.value)}
						margin="normal"
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setTwoFactorDialogOpen(false)}>Cancel</Button>
					<Button onClick={handleVerifyTwoFactor} variant="contained">
						Verify
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Account Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
			>
				<DialogTitle>Delete Account</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to delete your account? This action cannot be undone.
						All your data, including complaints and settings, will be permanently deleted.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)}>
						Cancel
					</Button>
					<Button
						onClick={handleDeleteAccount}
						color="error"
						variant="contained"
					>
						Delete Account
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
}

export default Settings; 