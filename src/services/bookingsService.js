import axios from '../api/axios';

export const createBooking = (data) => axios.post('/bookings', data);
export const getBookings = (params) => axios.get('/bookings', { params });
export const listBookings = getBookings;
export const getBookingById = (id) => axios.get(`/bookings/${id}`);
export const getBookingHistory = (id) => axios.get(`/bookings/${id}/history`);
export const approveBooking = (id, data) => axios.patch(`/bookings/${id}/approve`, data);
export const rejectBooking = (id, data) => axios.patch(`/bookings/${id}/reject`, data);
export const cancelBooking = (id, data) => axios.patch(`/bookings/${id}/cancel`, data);
export const completeBooking = (id, data) => axios.patch(`/bookings/${id}/complete`, data);

export default {
  createBooking,
  getBookings,
  listBookings,
  getBookingById,
  getBookingHistory,
  approveBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
};
