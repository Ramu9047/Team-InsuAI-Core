import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { motion } from "framer-motion";
import Modal from "../components/Modal";
import { useNotification } from "../context/NotificationContext";

export default function AdminPlans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const { notify } = useNotification();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentPlanId, setCurrentPlanId] = useState(null);

    // Form State
    const initialForm = {
        name: "",
        category: "Personal", // Personal, Business
        type: "Health", // Health, Life, Motor
        description: "",
        premium: "",
        coverage: "",
        minAge: "",
        maxAge: "",
        minIncome: "",
        tenure: "1",
        claimSettlementRatio: "95.0",
        documentUrl: ""
    };
    const [formData, setFormData] = useState(initialForm);

    // Confirmation Modal State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [planToDelete, setPlanToDelete] = useState(null);

    const loadPlans = useCallback(() => {
        setLoading(true);
        api.get('/policies')
            .then(res => setPlans(res.data))
            .catch(err => {
                console.error(err);
                notify("Failed to load plans", "error");
            })
            .finally(() => setLoading(false));
    }, [notify]);

    useEffect(() => {
        loadPlans();
    }, [loadPlans]);


    const confirmDelete = (plan) => {
        setPlanToDelete(plan);
        setIsConfirmOpen(true);
    };

    const executeDelete = async () => {
        if (!planToDelete) return;
        try {
            await api.delete(`/policies/${planToDelete.id}`);
            notify("Plan deleted successfully", "success");
            setPlans(plans.filter(p => p.id !== planToDelete.id));
            setIsConfirmOpen(false);
            setPlanToDelete(null);
        } catch (err) {
            console.error(err);
            notify("Failed to delete plan", "error");
        }
    };

    const openEditModal = (plan) => {
        setFormData({
            name: plan.name || "",
            category: plan.category || "Personal",
            type: plan.type || "Health",
            description: plan.description || "",
            premium: plan.premium || "",
            coverage: plan.coverage || "",
            minAge: plan.minAge || "",
            maxAge: plan.maxAge || "",
            minIncome: plan.minIncome || "",
            tenure: plan.tenure || "1",
            claimSettlementRatio: plan.claimSettlementRatio || "",
            documentUrl: plan.documentUrl || ""
        });
        setCurrentPlanId(plan.id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                ...formData,
                premium: parseFloat(formData.premium),
                coverage: parseFloat(formData.coverage),
                minAge: formData.minAge ? parseInt(formData.minAge) : null,
                maxAge: formData.maxAge ? parseInt(formData.maxAge) : null,
                minIncome: formData.minIncome ? parseFloat(formData.minIncome) : null,
                tenure: parseInt(formData.tenure),
                claimSettlementRatio: parseFloat(formData.claimSettlementRatio)
            };

            if (isEditMode) {
                await api.put(`/policies/${currentPlanId}`, payload);
                notify("Plan updated successfully", "success");
            }

            setIsModalOpen(false);
            loadPlans();
        } catch (err) {
            console.error(err);
            notify("Failed to save plan", "error");
        }
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'white' }}>Loading Plans...</div>;

    return (
        <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto', color: 'white' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h1>🛡️ Insurance Plans Management</h1>
                    {/* Create Button Removed as per requirement */}
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <tr>
                                <th style={{ padding: 15, textAlign: 'left' }}>Plan Name</th>
                                <th style={{ padding: 15, textAlign: 'left' }}>Type</th>
                                <th style={{ padding: 15, textAlign: 'left' }}>Premium (₹)</th>
                                <th style={{ padding: 15, textAlign: 'left' }}>Coverage (₹)</th>
                                <th style={{ padding: 15, textAlign: 'right' }}>Actions</th>
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
                                    <td style={{ padding: 15, textAlign: 'right', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => openEditModal(plan)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: 4,
                                                border: 'none',
                                                background: '#3b82f6',
                                                color: 'white',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(plan)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: 4,
                                                border: 'none',
                                                background: '#ef4444',
                                                color: 'white',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Edit Modal (Create removed) */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Edit Plan"
                actions={
                    <>
                        <button className="secondary-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button className="primary-btn" onClick={handleSubmit}>
                            Update Plan
                        </button>
                    </>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Plan Name</label>
                        <input
                            className="form-input"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Gold Family Health Plus"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select
                            className="form-input"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="Personal">Personal</option>
                            <option value="Business">Business</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Type</label>
                        <select
                            className="form-input"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="Health">Health</option>
                            <option value="Life">Life</option>
                            <option value="Motor">Motor</option>
                            <option value="Term">Term Insurance</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Premium (Monthly ₹)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.premium}
                            onChange={e => setFormData({ ...formData, premium: e.target.value })}
                            placeholder="e.g. 500"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Coverage Amount (₹)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.coverage}
                            onChange={e => setFormData({ ...formData, coverage: e.target.value })}
                            placeholder="e.g. 500000"
                        />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-input"
                            rows="3"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Key benefits and features..."
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Min Age</label>
                        <input type="number" className="form-input" value={formData.minAge} onChange={e => setFormData({ ...formData, minAge: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Max Age</label>
                        <input type="number" className="form-input" value={formData.maxAge} onChange={e => setFormData({ ...formData, maxAge: e.target.value })} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Min Income Req</label>
                        <input type="number" className="form-input" value={formData.minIncome} onChange={e => setFormData({ ...formData, minIncome: e.target.value })} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Claim Ratio (%)</label>
                        <input type="number" step="0.1" className="form-input" value={formData.claimSettlementRatio} onChange={e => setFormData({ ...formData, claimSettlementRatio: e.target.value })} />
                    </div>
                </div>
            </Modal>

            {/* Confirmation Modal */}
            <Modal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                title="Confirm Deletion"
                actions={
                    <>
                        <button className="secondary-btn" onClick={() => setIsConfirmOpen(false)}>Cancel</button>
                        <button className="primary-btn" style={{ background: '#ef4444' }} onClick={executeDelete}>
                            Delete Plan
                        </button>
                    </>
                }
            >
                <p>Are you sure you want to delete plan <strong>{planToDelete?.name}</strong>?</p>
                <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>This action cannot be undone.</p>
            </Modal>
        </div>
    );
}
