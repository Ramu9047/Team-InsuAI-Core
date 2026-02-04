import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

let stompClient = null;

export const connectWebSocket = (onMessage) => {
    const socket = new SockJS((process.env.REACT_APP_API_URL || 'http://localhost:8080/api').replace('/api', '/ws'));
    stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
        console.log('Connected to WebSocket');

        // Subscribe to public booking alerts (for agents)
        stompClient.subscribe('/topic/bookings', (msg) => {
            onMessage({ type: 'BOOKING_ALERT', content: msg.body });
        });
    }, (err) => {
        console.error('WebSocket Error:', err);
    });
};

export const subscribeUser = (userId, onMessage) => {
    if (stompClient && stompClient.connected) {
        stompClient.subscribe(`/topic/user/${userId}`, (msg) => {
            onMessage({ type: 'USER_ALERT', content: msg.body });
        });
    }
};

export const disconnectWebSocket = () => {
    if (stompClient) {
        stompClient.disconnect();
    }
};
