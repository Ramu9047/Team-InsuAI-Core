import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

const NotificationContext = createContext();

export function useNotification() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((message, type = "success") => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, message, type }]);
        setTimeout(() => removeNotification(id), 5000);
    }, []);

    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ notify: addNotification }}>
            {children}
            <div style={{
                position: "fixed", bottom: 30, right: 30, zIndex: 9999,
                display: "flex", flexDirection: "column", gap: 15
            }}>
                <AnimatePresence>
                    {notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.9 }}
                            style={{
                                background: "rgba(15, 23, 42, 0.9)",
                                backdropFilter: "blur(12px)",
                                color: "var(--text-main)",
                                padding: "16px 24px",
                                borderRadius: "16px",
                                boxShadow: n.type === "error"
                                    ? "0 0 20px rgba(239, 68, 68, 0.3), inset 0 0 0 1px rgba(239, 68, 68, 0.5)"
                                    : "0 0 20px rgba(16, 185, 129, 0.3), inset 0 0 0 1px rgba(16, 185, 129, 0.5)",
                                minWidth: 300,
                                display: "flex", alignItems: "center", gap: 15,
                                fontSize: "0.95rem",
                                fontWeight: 500,
                                zIndex: 10000
                            }}
                        >
                            <span style={{
                                fontSize: "1.2rem",
                                filter: n.type === "error" ? "drop-shadow(0 0 5px rgba(239,68,68,0.8))" : "drop-shadow(0 0 5px rgba(16,185,129,0.8))"
                            }}>
                                {n.type === "error" ? "⚠️" : "✨"}
                            </span>
                            <div>{n.message}</div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
}
