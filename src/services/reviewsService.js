import axios from '../api/axios';

export const createReview = (data) => axios.post('/reviews', data);
export const getReviews = (params) => axios.get('/reviews', { params });
export const listReviews = getReviews;
export const getVehicleReviews = (vehicleId, params) => axios.get(`/reviews/vehicle/${vehicleId}`, { params });
export const listVehicleReviews = getVehicleReviews;
export const getOwnerReviews = (ownerId, params) => axios.get(`/reviews/owner/${ownerId}`, { params });
export const listOwnerReviews = getOwnerReviews;
export const updateReview = (id, data) => axios.patch(`/reviews/${id}`, data);
export const deleteReview = (id) => axios.delete(`/reviews/${id}`);

export default {
  createReview,
  getReviews,
  listReviews,
  getVehicleReviews,
  listVehicleReviews,
  getOwnerReviews,
  listOwnerReviews,
  updateReview,
  deleteReview,
};
