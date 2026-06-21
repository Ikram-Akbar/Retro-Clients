import axios from '../api/axios';

export const getUsers = (params) => axios.get('/users', { params });
export const getUserById = (id) => axios.get(`/users/${id}`);
export const toggleUserStatus = (id) => axios.patch(`/users/${id}/toggle-status`);
export const makeAdmin = (id) => axios.post(`/users/${id}/make-admin`);
export const promoteUserToAdmin = makeAdmin;
export const makeOwner = (id) => axios.post(`/users/${id}/make-owner`);
export const createUser = (data) => axios.post('/users', data);

export default {
  getUsers,
  getUserById,
  toggleUserStatus,
  makeAdmin,
  promoteUserToAdmin,
  makeOwner,
  createUser,
};
