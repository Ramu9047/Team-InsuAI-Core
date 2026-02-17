import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { motion } from "framer-motion";
import Modal from "../components/Modal";
import { useNotification } from "../context/NotificationContext";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { notify } = useNotification();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({ name: "", email: "", role: "USER", isActive: true, password: "" });

    // Confirmation Modal State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const loadUsers = useCallback(() => {
        api.get('/users')
            .then(res => setUsers(res.data))
            .catch(err => {
                console.error(err);
                notify("Failed to load users", "error");
            })
            .finally(() => setLoading(false));
    }, [notify]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // Updated deletion logic check
    const confirmDelete = (user) => {
        if (user.role === 'ADMIN') {
            notify("Cannot delete Admin users", "error");
            return;
        }
        setUserToDelete(user);
        setIsConfirmOpen(true);
    };

    const executeDelete = async () => {
        if (!userToDelete) return;

        try {
            await api.delete(`/admin/users/${userToDelete.id}`);
            notify("User deleted successfully", "success");
            setUsers(users.filter(u => u.id !== userToDelete.id));
            setIsConfirmOpen(false);
            setUserToDelete(null);
        } catch (err) {
            console.error(err);
            notify("Failed to delete user", "error");
        }
    };

    const openCreateModal = () => {
        setFormData({ name: "", email: "", role: "USER", isActive: true, password: "" });
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setCurrentUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive !== false,
            password: ""
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            if (isEditMode) {
                // Update user details via admin endpoint
                await api.put(`/users/${currentUser.id}/admin`, {
                    name: formData.name,
                    role: formData.role,
                    isActive: formData.isActive
                });

                // Update agent verification status if applicable
                if (currentUser.role === 'AGENT' && currentUser.isActive !== formData.isActive) {
                    await api.put(`/admin/agents/${currentUser.id}/status`, { verified: formData.isActive });
                }
                notify("User updated successfully", "success");
            } else {
                // Create User
                if (!formData.password) {
                    notify("Password is required for new users", "error");
                    return;
                }
                await api.post('/auth/register', {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    password: formData.password
                    // isActive defaults to true/false depending on backend
                });
                notify("User created successfully", "success");
            }

            setIsModalOpen(false);
            loadUsers();
        } catch (err) {
            console.error(err);
            notify(isEditMode ? "Failed to update user" : "Failed to create user", "error");
        }
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'white' }}>Loading Users...</div>;

    return (
        <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto', color: 'white' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h1 style={{ margin: 0 }}>👥 User Management</h1>
                    <button className="primary-btn" onClick={openCreateModal} style={{ background: '#10b981' }}>
                        + Add User
                    </button>
                </div>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <tr>
                                <th style={{ padding: 15, textAlign: 'left' }}>ID</th>
                                <th style={{ padding: 15, textAlign: 'left' }}>Name</th>
                                <th style={{ padding: 15, textAlign: 'left' }}>Email</th>
                                <th style={{ padding: 15, textAlign: 'left' }}>Role</th>
                                <th style={{ padding: 15, textAlign: 'left' }}>Status</th>
                                <th style={{ padding: 15, textAlign: 'right' }}>Actions</th>
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
                                    <td style={{ padding: 15, textAlign: 'right', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => openEditModal(user)}
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
                                        {user.role !== 'ADMIN' && (
                                            <button
                                                onClick={() => confirmDelete(user)}
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
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Edit/Create Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditMode ? "Edit User" : "Create New User"}
                actions={
                    <>
                        <button className="secondary-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button className="primary-btn" onClick={handleSubmit}>
                            {isEditMode ? "Save Changes" : "Create User"}
                        </button>
                    </>
                }
            >
                <div className="form-group">
                    <label className="form-label">Name</label>
                    <input
                        className="form-input"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                        className="form-input"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        disabled={isEditMode}
                        style={isEditMode ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                    />
                </div>

                {!isEditMode && (
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">Role</label>
                    <select
                        className="form-input"
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                    >
                        <option value="USER">User</option>
                        <option value="AGENT">Agent</option>
                        {isEditMode && <option value="ADMIN">Admin</option>}
                    </select>
                </div>

                {isEditMode && (
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                            style={{ width: 'auto' }}
                        />
                        <label>Active Account</label>
                    </div>
                )}
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
                            Delete User
                        </button>
                    </>
                }
            >
                <p>Are you sure you want to delete user <strong>{userToDelete?.name}</strong>?</p>
                <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>This action cannot be undone.</p>
            </Modal>
        </div>
    );
}
