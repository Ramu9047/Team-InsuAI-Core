import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import { motion } from "framer-motion";

import { useNotification } from "../context/NotificationContext";

export default function Profile() {
    const { user } = useAuth();
    const { notify } = useNotification();
    const [form, setForm] = useState({
        name: "", email: "", phone: "", age: "", income: "", dependents: "", healthInfo: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            api.get(`/users/${user.id}`).then(res => {
                setForm(prev => ({ ...prev, ...res.data }));
            }).catch(console.error);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/users/${user.id}`, form);
            notify("Profile updated successfully! ✅", "success");
        } catch (err) {
            console.error(err);
            notify("Failed to update profile.", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div style={{ padding: 40 }}>Please login to view profile.</div>;

    return (
        <div style={{ maxWidth: 600, margin: "40px auto" }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card title="My Profile">
                    <p style={{ marginBottom: 20, opacity: 0.7 }}>Update your details to get better policy recommendations.</p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                className="form-input"
                                value={form.name || ""}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                className="form-input"
                                value={form.email || ""}
                                disabled
                                style={{ background: "rgba(0,0,0,0.05)", cursor: "not-allowed" }}
                            />
                        </div>

                        <div style={{ display: "flex", gap: 15 }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">Age</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={form.age || ""}
                                    placeholder="e.g. 30"
                                    onChange={e => setForm({ ...form, age: e.target.value })}
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">Phone</label>
                                <input
                                    className="form-input"
                                    value={form.phone || ""}
                                    placeholder="+91 98765 43210"
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 15 }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">Annual Income (₹)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={form.income || ""}
                                    placeholder="e.g. 500000"
                                    onChange={e => setForm({ ...form, income: e.target.value })}
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">Dependents</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={form.dependents || ""}
                                    placeholder="e.g. 2"
                                    onChange={e => setForm({ ...form, dependents: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Health Conditions (Optional)</label>
                            <textarea
                                className="form-input"
                                rows="3"
                                value={form.healthInfo || ""}
                                placeholder="Any existing medical conditions, allergies, or smoking habits..."
                                onChange={e => setForm({ ...form, healthInfo: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            className="primary-btn"
                            style={{ width: "100%", marginTop: 10 }}
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
}
