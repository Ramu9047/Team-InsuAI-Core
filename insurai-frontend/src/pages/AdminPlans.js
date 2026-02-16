import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { motion } from "framer-motion";
export default function AdminPlans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPlans = useCallback(() => {
        setLoading(true);
        api.get('/policies')
            .then(res => setPlans(res.data))
            .catch(err => {
                console.error(err);
                // notify removed, using console or simple alert if strictly needed, 
                // or just rely on empty list
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        loadPlans();
    }, [loadPlans]);

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'white' }}>Loading Plans...</div>;

    return (
        <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto', color: 'white' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h1>🛡️ Insurance Plans Management</h1>
                    <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Read-Only View</div>
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <tr>
                                <th style={{ padding: 15, textAlign: 'left' }}>Plan Name</th>
                                <th style={{ padding: 15, textAlign: 'left' }}>Type</th>
                                <th style={{ padding: 15, textAlign: 'left' }}>Premium (₹)</th>
                                <th style={{ padding: 15, textAlign: 'left' }}>Coverage (₹)</th>
                                <th style={{ padding: 15, textAlign: 'left' }}>Eligibility</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map(plan => (
                                <tr key={plan.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: 15 }}>
                                        <div style={{ fontWeight: 'bold' }}>{plan.name}</div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{plan.category}</div>
                                    </td>
                                    <td style={{ padding: 15 }}>{plan.type}</td>
                                    <td style={{ padding: 15 }}>{plan.premium}</td>
                                    <td style={{ padding: 15 }}>{plan.coverage}</td>
                                    <td style={{ padding: 15 }}>
                                        <div style={{ fontSize: '0.8rem' }}>
                                            Age: {plan.minAge}-{plan.maxAge}<br />
                                            Min Income: {plan.minIncome}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
