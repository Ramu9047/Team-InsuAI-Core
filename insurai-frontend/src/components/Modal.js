import { motion, AnimatePresence } from "framer-motion";
import React from 'react';

export default function Modal({ isOpen, onClose, title, children, actions }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{
                position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                background: "rgba(2, 6, 23, 0.8)", backdropFilter: "blur(5px)", zIndex: 9999,
                display: "flex", alignItems: "center", justifyContent: "center"
            }} onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={e => e.stopPropagation()} // Prevent close on click inside
                    style={{
                        background: "rgba(15, 23, 42, 0.95)", // High opacity for readability
                        backdropFilter: "blur(16px)",
                        border: "var(--glass-border)",
                        borderRadius: "24px",
                        padding: "30px",
                        maxWidth: "500px",
                        width: "90%",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.1)", // Subtle purple glow
                        color: "var(--text-main)"
                    }}
                >
                    {title && (
                        <h3 className="text-gradient" style={{
                            fontSize: "1.5rem", marginBottom: "20px", marginTop: 0
                        }}>
                            {title}
                        </h3>
                    )}

                    <div style={{ color: "var(--text-muted)", marginBottom: "30px", lineHeight: "1.6" }}>
                        {children}
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "15px" }}>
                        {actions ? actions : (
                            <button className="primary-btn" onClick={onClose}>Close</button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
