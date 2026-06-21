import axios from '../api/axios';

export const login = (credentials) => axios.post('/auth/login', credentials);
export const register = (data) => axios.post('/auth/register', data);
export const getProfile = () => axios.get('/auth/me');

export const forgotPassword = (email) => axios.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => axios.post('/auth/reset-password', { token, password });

export const updateProfile = (data) => axios.patch('/auth/profile', data);
export const updatePhoneNumber = (data) => axios.patch('/auth/profile/phone-number', data);
export const uploadAvatar = (formData) => axios.patch('/auth/profile/avatar', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const changePassword = (data) => axios.post('/auth/change-password', data);

export default {
	login,
	register,
	getProfile,
	forgotPassword,
	resetPassword,
	updateProfile,
	updatePhoneNumber,
	uploadAvatar,
	changePassword,
};
