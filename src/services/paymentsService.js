import axios from '../api/axios';

export const getPayments = (params) => axios.get('/payments', { params });
export const createPayment = (data) => axios.post('/payments', data);
export const verifyPayment = (ref) => axios.get(`/payments/verify/${ref}`);
export const verifyMockPayment = (ref) => axios.post(`/payments/verify-mock/${ref}`);

export default {
  getPayments,
  createPayment,
  verifyPayment,
  verifyMockPayment,
};
