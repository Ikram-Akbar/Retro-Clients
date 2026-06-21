import axios from '../api/axios';

export const addToWishlist = (data) => axios.post('/wishlist', data);
export const getWishlist = (params) => axios.get('/wishlist', { params });
export const removeFromWishlist = (vehicleId) => axios.delete(`/wishlist/${vehicleId}`);

export default {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};
