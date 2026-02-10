import { useState, useEffect } from "react";
import api from "../services/api";
import { motion } from "framer-motion";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/users')
            .then(res => setUsers(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'white' }}>Loading Users...</div>;

    return (
        <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto', color: 'white' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ marginBottom: 20 }}>👥 User Management</h1>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <tr>
                                <th style={{ padding: 15, textAlign: 'left' }}>ID</th>
                                <th style={{ padding: 15, textAlign: 'left' }}>Name</th>
                                <th style={{ padding: 15, textAlign: 'left' }}>Email</th>
                                <th style={{ padding: 15, textAlign: 'left' }}>Role</th>
                                <th style={{ padding: 15, textAlign: 'left' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: 15 }}>{user.id}</td>
                                    <td style={{ padding: 15 }}>{user.name}</td>
                                    <td style={{ padding: 15 }}>{user.email}</td>
                                    <td style={{ padding: 15 }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: 4,
                                            background: user.role === 'ADMIN' ? '#ef4444' : user.role === 'AGENT' ? '#f59e0b' : '#3b82f6',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: 15 }}>{user.isActive !== false ? 'Active' : 'Inactive'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
