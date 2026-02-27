import { useState, useEffect } from "react";
import api from "../services/api";
import { motion } from "framer-motion";
import { useNotification } from "../context/NotificationContext";

export default function AdminPolicies() {
    const { refreshSignal } = useNotification();
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/policies/issued')
            .then(res => {
                setPolicies(res.data);
                setError(null);
            })
            .catch(err => {
                console.error(err);
                setError("Failed to fetch policies. Please ensure backend is running and you are logged in as Admin.");
            })
            .finally(() => setLoading(false));
    }, [refreshSignal]);

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'white' }}>Loading Policies...</div>;
    if (error) return <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>{error}</div>;

    return (
        <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto', color: 'white' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ marginBottom: 20 }}>📄 Issued Policies</h1>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <tr>
                                <th style={{ padding: 15, textAlign: 'left' }}>ID</th>
                                <th style={{ padding: 15, textAlign: 'left' }}>User</th>
                                <th style={{ padding: 15, textAlign: 'left' }}>Policy Name</th>
                                <th style={{ padding: 15, textAlign: 'left' }}>Status</th>
                                <th style={{ padding: 15, textAlign: 'left' }}>Start Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {policies.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: 15 }}>{p.id}</td>
                                    <td style={{ padding: 15 }}>{p.user?.name || 'Unknown'}</td>
                                    <td style={{ padding: 15 }}>{p.policy?.name}</td>
                                    <td style={{ padding: 15 }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: 4,
                                            background: p.status === 'ACTIVE' ? '#10b981' : '#f59e0b',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: 15 }}>{p.startDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
