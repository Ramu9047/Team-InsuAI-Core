import api from './api';

export const notificationService = {
    getNotifications: async () => {
        try {
            const response = await api.get('/notifications');
            return response.data;
        } catch (error) {
            console.warn('NotificationService: Failed to fetch notifications.');
            return [];
        }
    },

    markAsRead: async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
        } catch (error) {
            console.warn(`NotificationService: Failed to mark notification ${id} as read.`);
        }
    },

    markAllAsRead: async () => {
        try {
            await api.put('/notifications/read-all');
        } catch (error) {
            console.warn('NotificationService: Failed to mark all notifications as read.');
        }
    },


};
