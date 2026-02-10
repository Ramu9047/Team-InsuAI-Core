import api from './api';

export const notificationService = {
    getNotifications: async () => {
        try {
            const response = await api.get('/notifications');
            return response.data;
        } catch (error) {
            console.warn('NotificationService: Failed to fetch notifications, using mock.');
            throw error;
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
            await api.patch('/notifications/read-all');
        } catch (error) {
            console.warn('NotificationService: Failed to mark all notifications as read.');
        }
    },

    // Mock generator for fallback
    generateMockNotifications: (role) => {
        const baseNotifs = {
            USER: [
                {
                    id: 1,
                    type: 'success',
                    icon: '✅',
                    title: 'Appointment Approved',
                    message: 'Your consultation with Agent Rahul has been approved',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    read: false,
                    action: '/appointments',
                    priority: 'normal'
                },
                {
                    id: 2,
                    type: 'success',
                    icon: '🎉',
                    title: 'Policy Issued',
                    message: 'Your Health Secure Plus policy is now active',
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                    read: false,
                    action: '/policies',
                    priority: 'high'
                },
                {
                    id: 3,
                    type: 'warning',
                    icon: '📄',
                    title: 'Action Required',
                    message: 'Please upload income proof document',
                    timestamp: new Date(Date.now() - 10800000).toISOString(),
                    read: true,
                    action: '/documents',
                    priority: 'urgent'
                }
            ],
            AGENT: [
                {
                    id: 1,
                    type: 'urgent',
                    icon: '⚠️',
                    title: 'High-Risk Consultation',
                    message: 'Review required: Suresh - Vehicle Insurance',
                    timestamp: new Date(Date.now() - 1800000).toISOString(),
                    read: false,
                    action: '/dashboard',
                    priority: 'urgent'
                },
                {
                    id: 2,
                    type: 'info',
                    icon: '📅',
                    title: 'Upcoming Appointment',
                    message: 'Consultation with Arjun in 30 minutes',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    read: false,
                    action: '/appointments',
                    priority: 'high'
                },
                {
                    id: 3,
                    type: 'success',
                    icon: '🏆',
                    title: 'Achievement Unlocked',
                    message: 'You are now Top Agent for January!',
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                    read: true,
                    action: '/dashboard',
                    priority: 'normal'
                }
            ],
            ADMIN: [
                {
                    id: 1,
                    type: 'warning',
                    icon: '🚨',
                    title: 'Fraud Alert',
                    message: 'Suspicious activity detected on Policy #1024',
                    timestamp: new Date(Date.now() - 1800000).toISOString(),
                    read: false,
                    action: '/admin/exceptions',
                    priority: 'urgent'
                },
                {
                    id: 2,
                    type: 'info',
                    icon: '📊',
                    title: 'SLA Breach',
                    message: 'Agent Karthik exceeded decision time limit',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    read: false,
                    action: '/admin/agents',
                    priority: 'high'
                },
                {
                    id: 3,
                    type: 'success',
                    icon: '📈',
                    title: 'Revenue Milestone',
                    message: 'Platform crossed ₹1 crore monthly revenue!',
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                    read: true,
                    action: '/dashboard',
                    priority: 'normal'
                }
            ]
        };
        return baseNotifs[role] || baseNotifs.USER;
    }
};
