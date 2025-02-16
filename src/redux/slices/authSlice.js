import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/axios';

// Async thunks
export const login = createAsyncThunk(
	'auth/login',
	async (credentials, { rejectWithValue }) => {
		try {
			const response = await axios.post('/auth/login', credentials);
			localStorage.setItem('token', response.data.token);
			return response.data;
		} catch (error) {
			// Check if it's a verification error
			if (error.response?.data?.isVerified === false) {
				return rejectWithValue({
					isVerified: false,
					email: error.response.data.email,
					message: error.response.data.message || 'Email not verified'
				});
			}
			// Check if 2FA is required
			if (error.response?.data?.requires2FA) {
				return rejectWithValue({
					requires2FA: true,
					message: error.response.data.message || '2FA token required'
				});
			}
			return rejectWithValue({
				message: error.response?.data?.message || 'Login failed'
			});
		}
	}
);

export const register = createAsyncThunk(
	'auth/register',
	async (userData, { rejectWithValue }) => {
		try {
			const response = await axios.post('/auth/register', userData);
			localStorage.setItem('token', response.data.token);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Registration failed');
		}
	}
);

export const logout = createAsyncThunk(
	'auth/logout',
	async () => {
		localStorage.removeItem('token');
		return null;
	}
);

export const fetchCurrentUser = createAsyncThunk(
	'auth/fetchCurrentUser',
	async (_, { rejectWithValue }) => {
		try {
			const response = await axios.get('/auth/me');
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
		}
	}
);

export const updateProfile = createAsyncThunk(
	'auth/updateProfile',
	async (userData, { rejectWithValue }) => {
		try {
			const response = await axios.put('/users/profile', userData);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
		}
	}
);

export const updateProfilePic = createAsyncThunk(
	'auth/updateProfilePic',
	async (userData, { rejectWithValue }) => {
		try {
			const response = await axios.put('/users/profile/picture', userData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
		}
	}
);

const initialState = {
	user: null,
	token: localStorage.getItem('token'),
	loading: false,
	error: null,
	isAuthenticated: Boolean(localStorage.getItem('token'))
};

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = null;
		},
		setCredentials: (state, action) => {
			state.user = action.payload.user;
			state.token = action.payload.token;
			state.isAuthenticated = true;
		}
	},
	extraReducers: (builder) => {
		builder
			// Login
			.addCase(login.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(login.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload.user;
				state.token = action.payload.token;
				state.isAuthenticated = true;
			})
			.addCase(login.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Register
			.addCase(register.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(register.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload.user;
				state.token = action.payload.token;
				state.isAuthenticated = true;
			})
			.addCase(register.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Logout
			.addCase(logout.fulfilled, (state) => {
				state.user = null;
				state.token = null;
				state.isAuthenticated = false;
			})
			// Fetch Current User
			.addCase(fetchCurrentUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchCurrentUser.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload;
				state.isAuthenticated = true;
			})
			.addCase(fetchCurrentUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
				state.isAuthenticated = false;
			})
			// Update Profile
			.addCase(updateProfile.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateProfile.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload;
			})
			.addCase(updateProfile.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Update Profile Pic
			.addCase(updateProfilePic.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateProfilePic.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload;
			})
			.addCase(updateProfilePic.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	}
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer; 