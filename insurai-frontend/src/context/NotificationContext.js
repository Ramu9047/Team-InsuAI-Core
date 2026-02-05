import { createContext, useContext, useState, useCallback } from "react";
import { ToastContainer } from "../components/Toast";

const NotificationContext = createContext();

export function useNotification() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const notify = useCallback((message, type = "success", duration = 4000, icon) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type, duration, icon }]);
    }, []);

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
