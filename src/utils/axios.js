import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/slices/authSlice';

const instance = axios.create({
	baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
	headers: {
		'Content-Type': 'application/json'
	}
});

// Add a request interceptor
instance.interceptors.request.use(
	(config) => {
		const token = store.getState().auth.token;
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Add a response interceptor
instance.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			store.dispatch(logout());
		}
		return Promise.reject(error);
	}
);

export default instance; 