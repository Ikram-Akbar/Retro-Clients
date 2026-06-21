import axios from '../api/axios';

export const getNotifications = (params) => axios.get('/notifications', { params });
export const listNotifications = getNotifications;
export const markNotificationRead = (id) => axios.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => axios.patch('/notifications/read-all');

export default {
  getNotifications,
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
