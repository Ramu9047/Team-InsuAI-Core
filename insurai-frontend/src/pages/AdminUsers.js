import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "../components/Modal";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";

export default function AdminUsers() {
    const { user: authUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { notify, refreshSignal } = useNotification();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({ name: "", email: "", role: "USER", isActive: true, password: "", companyId: "" });
    const [showPassword, setShowPassword] = useState(false);

    // Confirmation Modal State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // Companies for Super Admin assignment
    const [companies, setCompanies] = useState([]);

    const loadUsers = useCallback(() => {
        const endpoint = (authUser?.role === 'COMPANY_ADMIN' || authUser?.role === 'COMPANY')
            ? '/company-admin/users-list'
            : '/admin/users'; // Assuming admin controller handles /api/admin/users or falling back to /users

        api.get(endpoint)
            .then(res => setUsers(res.data))
            .catch(err => {
                // If endpoint fails, try fallback
                if (endpoint !== '/users') {
                    api.get('/users').then(r => setUsers(r.data)).catch(e => {
                        console.error(e);
                        notify("Failed to load users", "error");
                    });
                } else {
                    console.error(err);
                    notify("Failed to load users", "error");
                }
            })
            .finally(() => setLoading(false));
    }, [notify, authUser]);

    useEffect(() => {
        if (authUser) loadUsers();
    }, [loadUsers, authUser, refreshSignal]);

    useEffect(() => {
        if (authUser?.role === 'SUPER_ADMIN') {
            api.get('/super-admin/companies')
                .then(res => setCompanies(res.data))
                .catch(err => console.error("Failed to load companies", err));
        }
    }, [authUser]);

    const getRoleLabel = (role) => {
        switch (role) {
            case 'AGENT': return 'Agent';
            case 'COMPANY_ADMIN': return 'Company Admin';
            case 'SUPER_ADMIN': return 'Super Admin';
            case 'COMPANY': return 'Company';
            default: return 'User';
        }
    };

    // Updated deletion logic check
    const confirmDelete = (user) => {
        if (user.role === 'SUPER_ADMIN') {
            notify("Cannot delete Super Admin users", "error");
            return;
        }
        setUserToDelete(user);
        setIsConfirmOpen(true);
    };

    const executeDelete = async () => {
        if (!userToDelete) return;

        try {
            await api.delete(`/admin/users/${userToDelete.id}`);
            const roleLabel = getRoleLabel(userToDelete.role);
            notify(`${roleLabel} deleted successfully`, "success");
            setUsers(users.filter(u => u.id !== userToDelete.id));
            setIsConfirmOpen(false);
            setUserToDelete(null);
        } catch (err) {
            console.error(err);
            const roleLabel = getRoleLabel(userToDelete.role);
            notify(`Failed to delete ${roleLabel.toLowerCase()}`, "error");
        }
    };

    const openCreateModal = () => {
        setFormData({ name: "", email: "", role: "USER", isActive: true, password: "", companyId: "" });
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
            password: "",
            companyId: user.company?.id || ""
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const roleLabel = getRoleLabel(formData.role);
            if (isEditMode) {
                // Update user details via admin endpoint
                await api.put(`/users/${currentUser.id}/admin`, {
                    name: formData.name,
                    role: formData.role,
                    isActive: formData.isActive,
                    companyId: formData.companyId
                });

                // Update agent verification status if applicable
                if (currentUser.role === 'AGENT' && currentUser.isActive !== formData.isActive) {
                    await api.put(`/admin/agents/${currentUser.id}/status`, { verified: formData.isActive });
                }
                notify(`${roleLabel} updated successfully`, "success");
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
                    password: formData.password,
                    companyId: formData.companyId
                });
                notify(`${roleLabel} created successfully`, "success");
            }

            setIsModalOpen(false);
            loadUsers();
        } catch (err) {
            console.error(err);
            const roleLabel = getRoleLabel(formData.role);
            notify(isEditMode ? `Failed to update ${roleLabel.toLowerCase()}` : `Failed to create ${roleLabel.toLowerCase()}`, "error");
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
                                {(authUser?.role === 'COMPANY_ADMIN' || authUser?.role === 'COMPANY') ? (
                                    <>
                                        <th style={{ padding: 15, textAlign: 'left' }}>Policy</th>
                                        <th style={{ padding: 15, textAlign: 'left' }}>Status</th>
                                        <th style={{ padding: 15, textAlign: 'left' }}>Date</th>
                                    </>
                                ) : (
                                    <>
                                        <th style={{ padding: 15, textAlign: 'left' }}>Role</th>
                                        <th style={{ padding: 15, textAlign: 'left' }}>Status</th>
                                        <th style={{ padding: 15, textAlign: 'right' }}>Actions</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.userId || user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: 15 }}>{user.userId || user.id}</td>
                                    <td style={{ padding: 15 }}>{user.userName || user.name}</td>
                                    <td style={{ padding: 15 }}>{user.email}</td>

                                    {(authUser?.role === 'COMPANY_ADMIN' || authUser?.role === 'COMPANY') ? (
                                        <>
                                            <td style={{ padding: 15 }}>{user.policyName || '-'}</td>
                                            <td style={{ padding: 15 }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: 4,
                                                    background: user.mapStatus === 'ACTIVE' ? '#10b981' : '#ef4444',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {user.mapStatus || 'Inactive'}
                                                </span>
                                            </td>
                                            <td style={{ padding: 15 }}>{user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : '-'}</td>
                                        </>
                                    ) : (
                                        <>
                                            <td style={{ padding: 15 }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: 4,
                                                    background: user.role === 'SUPER_ADMIN' ? '#ef4444' : user.role === 'COMPANY_ADMIN' ? '#db2777' : user.role === 'AGENT' ? '#f59e0b' : '#3b82f6',
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
                                                {user.role !== 'SUPER_ADMIN' && (
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
                                        </>
                                    )}
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
                title={isEditMode ? `Edit ${getRoleLabel(formData.role)}` : `Create New ${getRoleLabel(formData.role)}`}
                actions={
                    <>
                        <button className="secondary-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button className="primary-btn" onClick={handleSubmit}>
                            {isEditMode ? "Save Changes" : `Create ${getRoleLabel(formData.role)}`}
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
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-input"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                className="input-icon-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    {showPassword ? (
                                        <motion.svg
                                            key="hide"
                                            initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
                                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                            exit={{ opacity: 0, scale: 0.8, rotate: 20 }}
                                            transition={{ duration: 0.2 }}
                                            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        >
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </motion.svg>
                                    ) : (
                                        <motion.svg
                                            key="show"
                                            initial={{ opacity: 0, scale: 0.8, rotate: 20 }}
                                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                            exit={{ opacity: 0, scale: 0.8, rotate: -20 }}
                                            transition={{ duration: 0.2 }}
                                            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        >
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </motion.svg>
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>
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
                        {isEditMode && <option value="SUPER_ADMIN">Super Admin</option>}
                        {isEditMode && <option value="COMPANY_ADMIN">Company Admin</option>}
                    </select>
                </div>

                {formData.role === 'AGENT' && authUser?.role === 'SUPER_ADMIN' && (
                    <div className="form-group">
                        <label className="form-label">Assign Company</label>
                        <select
                            className="form-input"
                            value={formData.companyId}
                            onChange={e => setFormData({ ...formData, companyId: e.target.value })}
                        >
                            <option value="">-- No Company --</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                )}

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
                title={`Confirm Deleting ${getRoleLabel(userToDelete?.role)}`}
                actions={
                    <>
                        <button className="secondary-btn" onClick={() => setIsConfirmOpen(false)}>Cancel</button>
                        <button className="primary-btn" style={{ background: '#ef4444' }} onClick={executeDelete}>
                            Delete {getRoleLabel(userToDelete?.role)}
                        </button>
                    </>
                }
            >
                <p>Are you sure you want to delete this {getRoleLabel(userToDelete?.role).toLowerCase()} <strong>{userToDelete?.name}</strong>?</p>
                <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>This action cannot be undone.</p>
            </Modal>
        </div>
    );
}
