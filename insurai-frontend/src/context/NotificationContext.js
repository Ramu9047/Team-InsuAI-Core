import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ToastContainer } from "../components/Toast";
import { useAuth } from "./AuthContext";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const NotificationContext = createContext();

export function useNotification() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const { user } = useAuth() || {};

    const notify = useCallback((message, type = "success", duration = 4000, icon) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type, duration, icon }]);
    }, []);

    useEffect(() => {
        if (!user || (!user.id && !user.companyId)) return;

        const socketUrl = "http://localhost:8080/ws";
        const client = new Client({
            webSocketFactory: () => new SockJS(socketUrl),
            reconnectDelay: 5000,
            onConnect: () => {
                const topic = (user.role === 'COMPANY' || user.role === 'COMPANY_ADMIN') && user.companyId
                    ? `/topic/company/${user.companyId}`
                    : `/topic/user/${user.id}`;

                client.subscribe(topic, (message) => {
                    const data = JSON.parse(message.body);
                    notify(data.message || 'New update available', data.type?.toLowerCase() || 'info');
                });
            },
            onStompError: (frame) => {
                console.error("Broker reported error:", frame.headers['message']);
                console.error("Additional details:", frame.body);
            }
        });

        client.activate();

        return () => {
            if (client) client.deactivate();
        };
    }, [user, notify]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </NotificationContext.Provider>
    );
}
