import axios from '../api/axios';

export const getVehicles = (params) => axios.get('/vehicles', { params });
export const getVehicle = (id) => axios.get(`/vehicles/${id}`);
export const createVehicle = (data) => axios.post('/vehicles', data);
export const updateVehicle = (id, data) => axios.patch(`/vehicles/${id}`, data);
export const deleteVehicle = (id) => axios.delete(`/vehicles/${id}`);
export const getVehicleAvailability = (id, params) => axios.get(`/vehicles/${id}/availability`, { params });
export const approveVehicle = (id) => axios.patch(`/vehicles/${id}/approve`);
export const rejectVehicle = (id) => axios.patch(`/vehicles/${id}/reject`);
export const uploadVehicleImages = (id, formData) => axios.post(`/vehicles/${id}/images`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteVehicleImages = (id, payload) => axios.delete(`/vehicles/${id}/images`, { data: payload });
export const replaceVehicleImage = (id, payload) => axios.patch(`/vehicles/${id}/images`, payload);

export default {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleAvailability,
  approveVehicle,
  rejectVehicle,
  uploadVehicleImages,
  deleteVehicleImages,
  replaceVehicleImage,
};
