import axios from '../api/axios';

export const getDashboardOverview = () => axios.get('/dashboard/overview');
export const getOwnerOverview = () => axios.get('/dashboard/owner-overview');
export const getRenterOverview = () => axios.get('/dashboard/renter');

export default {
  getDashboardOverview,
  getOwnerOverview,
  getRenterOverview,
};
