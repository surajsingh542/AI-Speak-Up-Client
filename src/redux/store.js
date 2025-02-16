import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import complaintReducer from './slices/complaintSlice';
import categoryReducer from './slices/categorySlice';

export const store = configureStore({
	reducer: {
		auth: authReducer,
		complaints: complaintReducer,
		categories: categoryReducer
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false
		})
});

export default store; 