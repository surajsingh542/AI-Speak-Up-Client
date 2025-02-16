import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from '../../redux/slices/authSlice';

const AuthInitializer = ({ children }) => {
	const dispatch = useDispatch();
	const { token, user } = useSelector(state => state.auth);

	useEffect(() => {
		if (token && !user) {
			dispatch(fetchCurrentUser());
		}
	}, [dispatch, token, user]);

	return children;
};

export default AuthInitializer; 