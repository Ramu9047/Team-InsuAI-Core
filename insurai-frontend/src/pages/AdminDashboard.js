import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import { useNotification } from "../context/NotificationContext";
import Modal from "../components/Modal";
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

export default function AdminDashboard() {
    const { user } = useAuth();
    const { notify } = useNotification();
    const [modal, setModal] = useState({ isOpen: false, title: "", content: "", onConfirm: null });

    // Data State
    const [stats, setStats] = useState({ users: 0, agents: 0, bookings: 0 });
    const [users, setUsers] = useState([]);
    const [agents, setAgents] = useState([]);
    const [claims, setClaims] = useState([]);
    const [plans, setPlans] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [bookings, setBookings] = useState([]);

    // UI State
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);

    // New Plan Form State


    useEffect(() => {
        if (user && user.role === 'ADMIN') {
            loadAllData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const [sRes, uRes, agRes, cRes, pRes, alRes, bRes] = await Promise.all([
                api.get("/admin/stats").catch(() => ({ data: {} })),
                api.get("/admin/users").catch(() => ({ data: [] })),
                api.get("/agents").catch(() => ({ data: [] })),
                api.get("/claims").catch(() => ({ data: [] })),
                api.get("/policies").catch(() => ({ data: [] })),
                api.get("/admin/audit-logs").catch(() => ({ data: [] })),
                api.get("/bookings").catch(() => ({ data: [] }))
            ]);

            setStats(sRes.data);
            setUsers(uRes.data);
            setAgents(agRes.data);
            setClaims(cRes.data);
            setPlans(pRes.data);
            setAuditLogs(alRes.data);
            setBookings(bRes.data);
        } catch (e) {
            console.error(e);
            notify("Failed to load some data", "error");
        } finally {
            setLoading(false);
        }
    };

    // --- Actions ---

    const toggleAgentStatus = async (agent) => {
        try {
            const newStatus = !agent.available;
            await api.patch(`/agents/${agent.id}/availability`, { available: newStatus });
            notify(`Agent status updated`, "success");

            // Update local state directly to avoid flicker and ensure UI reflects change
            setAgents(prev => prev.map(a =>
                a.id === agent.id ? { ...a, available: newStatus } : a
            ));
        } catch (e) {
            notify("Failed to update status", "error");
        }
    };

    const toggleAgentActivation = async (agent) => {
        try {
            const currentActive = agent.isActive !== false;
            const newActive = !currentActive;
            await api.patch(`/agents/${agent.id}/activation`, { active: newActive });
            notify(`Agent account ${newActive ? 'activated' : 'deactivated'}`, "success");

            // Update local state directly
            setAgents(prev => prev.map(a =>
                a.id === agent.id ? { ...a, isActive: newActive, available: newActive ? true : false } : a
            ));
        } catch (e) {
            notify("Failed to update account status", "error");
        }
    };

    // ... (keep toggleAgentStatus)

    const deleteUser = async (id) => {
        setModal({
            isOpen: true,
            title: "Delete User",
            content: "Are you sure you want to delete this user? This cannot be undone.",
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/users/${id}`);
                    notify("User deleted", "success");
                    setUsers(users.filter(u => u.id !== id));
                    setModal(prev => ({ ...prev, isOpen: false }));
                } catch (err) {
                    notify("Failed to delete user", "error");
                }
            }
        });
    }

    // --- Renderers ---

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const renderOverview = () => {
        // --- Data Processing ---------------------------------

        // 1. Booking Status
        const bookingCounts = bookings.reduce((acc, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1;
            return acc;
        }, {});
        const bookingData = Object.keys(bookingCounts).map(k => ({ name: k, value: bookingCounts[k] }));

        // 2. Claim Status
        const claimCounts = claims.reduce((acc, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1;
            return acc;
        }, {});
        const claimData = Object.keys(claimCounts).map(k => ({ name: k, count: claimCounts[k] }));

        // 3. Top Agents (by # of bookings)
        const agentPerf = bookings.reduce((acc, b) => {
            const name = b.agent ? b.agent.name.split(' ')[0] : "Unknown"; // First name for brevity
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});
        const agentData = Object.keys(agentPerf)
            .map(k => ({ name: k, bookings: agentPerf[k] }))
            .sort((a, b) => b.bookings - a.bookings)
            .slice(0, 5);

        // 4. Plan Popularity (by bookings linked)
        const planPerf = bookings.reduce((acc, b) => {
            const name = b.policy ? b.policy.name : "General Inquiry";
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});
        const planData = Object.keys(planPerf).map(k => ({ name: k, value: planPerf[k] }));

        // Colors for Plan Chart (variant)
        const PLAN_COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

        return (
            <div>
                {/* Stats Cards */}
                <div className="grid" style={{ marginBottom: 40 }}>
                    {[
                        { title: "Total Users", val: stats.users, color: "#4f46e5", tab: "users" },
                        { title: "Active Agents", val: stats.agents, color: "#22c55e", tab: "agents" },
                        { title: "Total Bookings", val: stats.bookings, color: "#eab308", tab: "bookings" },
                        { title: "Pending Claims", val: claims.filter(c => c.status === 'PENDING').length, color: "#ef4444", tab: "claims" }
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="card"
                            style={{
                                borderLeft: `4px solid ${item.color}`,
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                            onClick={() => setActiveTab(item.tab)}
                        >
                            <h4 style={{ margin: 0, opacity: 0.8, fontSize: "0.9rem", textTransform: "uppercase", color: "var(--text-muted)" }}>{item.title}</h4>
                            <p style={{ fontSize: "2.5rem", fontWeight: 700, margin: "10px 0", color: "var(--text-main)" }}>{item.val}</p>
                            <span style={{ fontSize: "0.8rem", color: item.color, textDecoration: "underline" }}>View Details →</span>
                        </div>
                    ))}
                </div>

                {/* Admin Governance Quick Access */}
                <div style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>🔐 Admin Governance</h2>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                        <div
                            className="card"
                            style={{
                                borderLeft: '4px solid #3b82f6',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onClick={() => window.location.href = '/admin/analytics'}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📊</div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Analytics Dashboard</h3>
                            <p style={{ margin: '10px 0', opacity: 0.7, fontSize: '0.9rem' }}>
                                Full lifecycle visibility with funnel metrics and drop-off analysis
                            </p>
                            <span style={{ fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'underline' }}>
                                View Analytics →
                            </span>
                        </div>

                        <div
                            className="card"
                            style={{
                                borderLeft: '4px solid #22c55e',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onClick={() => window.location.href = '/admin/agents'}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>👥</div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Agent Governance</h3>
                            <p style={{ margin: '10px 0', opacity: 0.7, fontSize: '0.9rem' }}>
                                Manage agent assignments, regions, and compliance monitoring
                            </p>
                            <span style={{ fontSize: '0.8rem', color: '#22c55e', textDecoration: 'underline' }}>
                                Manage Agents →
                            </span>
                        </div>

                        <div
                            className="card"
                            style={{
                                borderLeft: '4px solid #ef4444',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onClick={() => window.location.href = '/admin/exceptions'}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>⚖️</div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Exception Handling</h3>
                            <p style={{ margin: '10px 0', opacity: 0.7, fontSize: '0.9rem' }}>
                                Handle escalations, disputes, and agent misconduct cases
                            </p>
                            <span style={{ fontSize: '0.8rem', color: '#ef4444', textDecoration: 'underline' }}>
                                View Cases →
                            </span>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: "1100px", margin: "0 auto" }}>

                    {/* 1. Appointment Status (Pie) */}
                    <Card style={{ margin: 0, maxWidth: "100%" }}>
                        <h3 style={{ marginBottom: 20 }}>📊 Appointment Status</h3>
                        {bookings.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={bookingData} cx="50%" cy="50%"
                                        innerRadius={60} outerRadius={70}
                                        fill="#8884d8" paddingAngle={5} dataKey="value" label
                                    >
                                        {bookingData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--card-border)', color: 'var(--text-main)' }} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ padding: 40, textAlign: "center", opacity: 0.6 }}>No data available</div>
                        )}
                    </Card>

                    {/* 2. Plan Popularity (Pie) */}
                    <Card style={{ margin: 0, maxWidth: "100%" }}>
                        <h3 style={{ marginBottom: 20 }}>🛡️ Policy Interest</h3>
                        {bookings.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={planData} cx="50%" cy="50%"
                                        outerRadius={70}
                                        fill="#8884d8" dataKey="value"
                                        label
                                    >
                                        {planData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PLAN_COLORS[index % PLAN_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--card-border)', color: 'var(--text-main)' }} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ padding: 40, textAlign: "center", opacity: 0.6 }}>No data available</div>
                        )}
                    </Card>

                    {/* 3. Top Agents (Bar) */}
                    <Card style={{ margin: 0, maxWidth: "100%" }}>
                        <h3 style={{ marginBottom: 20 }}>🏆 Top Performing Agents</h3>
                        {bookings.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={agentData} layout="vertical" margin={{ left: 10, right: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} stroke="var(--text-main)" fontSize={12} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--card-border)', color: 'var(--text-main)' }} />
                                    <Bar dataKey="bookings" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20}>
                                        {agentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PLAN_COLORS[index % PLAN_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ padding: 40, textAlign: "center", opacity: 0.6 }}>No data available</div>
                        )}
                    </Card>

                    {/* 4. Claims Overview (Bar) */}
                    <Card style={{ margin: 0, maxWidth: "100%" }}>
                        <h3 style={{ marginBottom: 20 }}>📉 Claims Overview</h3>
                        {claims.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={claimData}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                                    <YAxis allowDecimals={false} stroke="var(--text-muted)" fontSize={12} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--card-border)', color: 'var(--text-main)' }} />
                                    <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ padding: 40, textAlign: "center", opacity: 0.6 }}>No claims data available</div>
                        )}
                    </Card>

                </div>
            </div>
        );
    };

    const renderUsers = () => (
        <div className="card-custom" style={{ padding: 0, overflow: "hidden", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "20px 30px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}>
                <h3 style={{ margin: 0, fontSize: "1.5rem" }}>👥 User Directory ({users.length})</h3>
                <p style={{ margin: "5px 0 0 0", opacity: 0.8 }}>Manage all registered users and their roles.</p>
            </div>
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", color: "var(--text-main)" }}>
                    <thead style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <tr>
                            <th style={{ padding: "16px 30px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>User</th>
                            <th style={{ padding: "16px 30px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Role</th>
                            <th style={{ padding: "16px 30px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Email</th>
                            <th style={{ padding: "16px 30px", textAlign: "right", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u, i) => (
                            <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.2s" }} className="hover-row">
                                <td style={{ padding: "16px 30px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: "50%",
                                            background: `hsl(${i * 60}, 70%, 20%)`, color: `hsl(${i * 60}, 70%, 80%)`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontWeight: "bold", fontSize: "1.1rem"
                                        }}>
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{u.name}</div>
                                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>ID: #{u.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: "16px 30px" }}>
                                    <span style={{
                                        padding: "6px 12px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.5px",
                                        background: u.role === 'ADMIN' ? 'linear-gradient(90deg, #fee2e2, #fecaca)' : u.role === 'AGENT' ? 'linear-gradient(90deg, #e0e7ff, #c7d2fe)' : '#f1f5f9',
                                        color: u.role === 'ADMIN' ? '#991b1b' : u.role === 'AGENT' ? '#3730a3' : '#475569',
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                                    }}>{u.role}</span>
                                </td>
                                <td style={{ padding: "16px 30px", color: "var(--text-muted)" }}>{u.email}</td>
                                <td style={{ padding: "16px 30px", textAlign: "right" }}>
                                    {u.id !== user.id && (
                                        <button
                                            className="secondary-btn"
                                            onClick={() => deleteUser(u.id)}
                                            style={{
                                                padding: "8px 16px", fontSize: "0.8rem",
                                                color: "#ef4444", borderColor: "#ef4444", background: "rgba(239, 68, 68, 0.1)",
                                                borderRadius: 8
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
        </div>
    );

    const renderAgents = () => (
        <div>
            <div style={{ padding: "20px 30px", margin: "-20px -30px 20px -30px", background: "linear-gradient(135deg, #10b981, #059669)", borderRadius: "12px 12px 0 0", color: "white", marginBottom: 30 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: "1.5rem" }}>🕵️ Agent Force</h3>
                        <p style={{ margin: "5px 0 0 0", opacity: 0.9 }}>Monitor and manage agent availability and activation.</p>
                    </div>
                </div>
            </div>

            <div className="grid">
                {agents.map(a => (
                    <Card key={a.id} style={{ maxWidth: "100%", margin: 0, borderTop: a.available ? "4px solid #10b981" : "4px solid #ef4444" }}>
                        {/* ... Header ... */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 15 }}>
                            <div style={{ display: "flex", gap: 12 }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 12,
                                    background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "1.5rem"
                                }}>
                                    🧑‍💼
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-main)" }}>{a.name}</h4>
                                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{a.specialization || "General Specialist"}</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{
                                    padding: "4px 10px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase",
                                    background: a.available ? "#dcfce7" : "#fee2e2",
                                    color: a.available ? "#15803d" : "#b91c1c",
                                    display: 'block', marginBottom: 5
                                }}>
                                    {a.available ? "Online" : "Offline"}
                                </span>
                                <span style={{
                                    padding: "4px 10px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase",
                                    background: a.isActive !== false ? "#dbeafe" : "#f3f4f6", // Blue or Gray
                                    color: a.isActive !== false ? "#1d4ed8" : "#9ca3af"
                                }}>
                                    {a.isActive !== false ? "Active" : "Deactivated"}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                            <button
                                style={{
                                    flex: 1, padding: "10px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600,
                                    background: a.available ? "#fee2e2" : "#dcfce7",
                                    color: a.available ? "#b91c1c" : "#15803d",
                                    transition: "all 0.2s"
                                }}
                                onClick={() => toggleAgentStatus(a)}
                                disabled={a.isActive === false} // Cannot toggle availability if deactivated
                            >
                                {a.available ? "Go Offline" : "Go Online"}
                            </button>
                            <button
                                style={{
                                    flex: 1, padding: "10px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600,
                                    background: a.isActive !== false ? "#fca5a5" : "#93c5fd",
                                    color: a.isActive !== false ? "#7f1d1d" : "#1e3a8a",
                                    transition: "all 0.2s"
                                }}
                                onClick={() => toggleAgentActivation(a)}
                            >
                                {a.isActive !== false ? "Deactivate" : "Activate"}
                            </button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderPlans = () => (
        <div>
            <div style={{ padding: "20px 30px", margin: "-20px -30px 20px -30px", background: "linear-gradient(135deg, #8b5cf6, #d946ef)", borderRadius: "12px 12px 0 0", color: "white", marginBottom: 30 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: "1.5rem" }}>🛡️ Insurance Plans</h3>
                        <p style={{ margin: "5px 0 0 0", opacity: 0.9 }}>View deployed insurance products.</p>
                    </div>
                </div>
            </div>

            {/* Creation Form Removed - "Policy providing company must deploy" */}
            <div style={{ marginBottom: 20, padding: 15, background: "rgba(255,255,255,0.05)", borderRadius: 8, fontSize: "0.9rem", color: "var(--text-muted)" }}>
                ℹ️ Note: Policy creation is restricted to the Policy Provider Portal. Admins can only view active plans.
            </div>

            <div className="grid">
                {plans.map(p => (
                    <Card key={p.id} style={{ maxWidth: "100%", margin: 0, borderTop: "4px solid #8b5cf6" }}>
                        {/* ... Plan Card Content (Keep as is) ... */}
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                            <strong style={{ fontSize: "1.1rem", color: "var(--text-main)" }}>{p.name}</strong>
                            <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.1)", padding: "4px 8px", borderRadius: 4, color: "var(--text-muted)", fontWeight: 600 }}>{p.category || p.type}</span>
                        </div>
                        <p style={{ margin: "10px 0", fontSize: "0.9rem", color: "var(--text-muted)", minHeight: 40 }}>{p.description}</p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingTop: 15, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                            <div style={{ fontWeight: 700, color: "#8b5cf6", fontSize: "1.1rem" }}>₹{p.premium}<span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 400 }}>/mo</span></div>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Cover: <strong style={{ color: "var(--text-main)" }}>₹{p.coverage}</strong></div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderClaims = () => (
        <div className="card-custom" style={{ padding: 0, overflow: "hidden", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "20px 30px", background: "linear-gradient(135deg, #ef4444, #f87171)", color: "white" }}>
                <h3 style={{ margin: 0, fontSize: "1.5rem" }}>⚠️ Claims Oversight</h3>
                <p style={{ margin: "5px 0 0 0", opacity: 0.9 }}>Monitor claim status and volume (Read-Only).</p>
            </div>
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", color: "var(--text-main)" }}>
                    <thead style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <tr>
                            <th style={{ padding: "16px 30px", textAlign: "left", color: "var(--text-muted)" }}>ID</th>
                            <th style={{ padding: "16px 30px", textAlign: "left", color: "var(--text-muted)" }}>User</th>
                            <th style={{ padding: "16px 30px", textAlign: "left", color: "var(--text-muted)" }}>Policy</th>
                            <th style={{ padding: "16px 30px", textAlign: "left", color: "var(--text-muted)" }}>Amount</th>
                            <th style={{ padding: "16px 30px", textAlign: "left", color: "var(--text-muted)" }}>Status</th>
                            <th style={{ padding: "16px 30px", textAlign: "left", color: "var(--text-muted)" }}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {claims.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: 30, textAlign: "center", opacity: 0.6 }}>No claims found.</td></tr>
                        ) : claims.map((c, i) => (
                            <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                                <td style={{ padding: "16px 30px", fontWeight: 600 }}>#{c.id}</td>
                                <td style={{ padding: "16px 30px" }}>{c.user ? c.user.name : "Unknown"}</td>
                                <td style={{ padding: "16px 30px" }}>{c.policyName}</td>
                                <td style={{ padding: "16px 30px" }}>₹{c.amount}</td>
                                <td style={{ padding: "16px 30px" }}>
                                    <span style={{
                                        padding: "4px 10px", borderRadius: 4, fontSize: "0.8rem", fontWeight: 700,
                                        background: c.status === 'APPROVED' ? "#dcfce7" : c.status === 'REJECTED' ? "#fee2e2" : "#fef9c3",
                                        color: c.status === 'APPROVED' ? "#15803d" : c.status === 'REJECTED' ? "#b91c1c" : "#854d0e"
                                    }}>
                                        {c.status}
                                    </span>
                                </td>
                                <td style={{ padding: "16px 30px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                    {new Date(c.date).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAudit = () => (
        <div className="card-custom" style={{ padding: 0, overflow: "hidden", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "20px 30px", background: "linear-gradient(135deg, #3b82f6, #0ea5e9)", color: "white" }}>
                <h3 style={{ margin: 0, fontSize: "1.5rem" }}>📜 System Logs</h3>
                <p style={{ margin: "5px 0 0 0", opacity: 0.8 }}>Audit trail of all system activities.</p>
            </div>

            <div style={{ padding: 0 }}>
                {auditLogs.length > 0 ? (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {auditLogs.map((log, i) => (
                            <li key={log.id || i} style={{
                                padding: "16px 30px",
                                borderBottom: "1px solid rgba(255,255,255,0.05)",
                                display: "flex",
                                alignItems: "center",
                                gap: 15,
                                background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)"
                            }}>
                                <div style={{
                                    minWidth: 8, height: 8, borderRadius: "50%",
                                    background: log.action.includes("DELETE") ? "#ef4444" : log.action.includes("CREATE") ? "#10b981" : "#3b82f6"
                                }}></div>
                                <div style={{ flex: 1 }}>
                                    <strong style={{ color: "var(--text-main)", display: "block" }}>{log.action}</strong>
                                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>by User #{log.userId}</span>
                                </div>
                                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "monospace" }}>
                                    {new Date(log.timestamp).toLocaleString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>No audit logs recorded yet.</div>
                )}
            </div>
        </div>
    );

    const renderBookings = () => (
        <div className="card-custom" style={{ padding: 0, overflow: "hidden", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "20px 30px", background: "linear-gradient(135deg, #eab308, #ca8a04)", color: "white" }}>
                <h3 style={{ margin: 0, fontSize: "1.5rem" }}>📅 All Bookings ({bookings.length})</h3>
                <p style={{ margin: "5px 0 0 0", opacity: 0.9 }}>Overview of all scheduled appointments.</p>
            </div>
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", color: "var(--text-main)" }}>
                    <thead style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <tr>
                            <th style={{ padding: "16px 30px", textAlign: "left", color: "var(--text-muted)" }}>ID</th>
                            <th style={{ padding: "16px 30px", textAlign: "left", color: "var(--text-muted)" }}>Client</th>
                            <th style={{ padding: "16px 30px", textAlign: "left", color: "var(--text-muted)" }}>Agent</th>
                            <th style={{ padding: "16px 30px", textAlign: "left", color: "var(--text-muted)" }}>Date & Time</th>
                            <th style={{ padding: "16px 30px", textAlign: "left", color: "var(--text-muted)" }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((b, i) => (
                            <tr key={b.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                                <td style={{ padding: "16px 30px", fontWeight: 600 }}>#{b.id}</td>
                                <td style={{ padding: "16px 30px" }}>{b.user ? b.user.name : "Unknown"}</td>
                                <td style={{ padding: "16px 30px" }}>{b.agent ? b.agent.name : "Unknown"}</td>
                                <td style={{ padding: "16px 30px" }}>
                                    {new Date(b.startTime).toLocaleDateString()} <br />
                                    <small style={{ color: "var(--text-muted)" }}>{new Date(b.startTime).toLocaleTimeString()}</small>
                                </td>
                                <td style={{ padding: "16px 30px" }}>
                                    <span style={{
                                        padding: "4px 10px", borderRadius: 4, fontSize: "0.8rem", fontWeight: 700,
                                        display: "inline-block",
                                        ...(() => {
                                            switch (b.status) {
                                                case 'COMPLETED': return { background: "#dbeafe", color: "#1e40af" }; // Blue
                                                case 'APPROVED':
                                                case 'CONFIRMED': return { background: "#dcfce7", color: "#166534" }; // Green
                                                case 'PENDING': return { background: "#fef9c3", color: "#854d0e" }; // Yellow
                                                case 'CANCELLED': return { background: "#ffedd5", color: "#9a3412" }; // Orange
                                                case 'REJECTED': return { background: "#fee2e2", color: "#991b1b" }; // Red
                                                case 'EXPIRED': return { background: "#f3f4f6", color: "#374151" }; // Gray
                                                default: return { background: "#f3f4f6", color: "#374151" };
                                            }
                                        })()
                                    }}>
                                        {b.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    if (!user || user.role !== 'ADMIN') return null;
    if (loading) return <div style={{ padding: 50, textAlign: "center" }}>Loading Admin Dashboard...</div>;

    return (
        <div style={{ padding: "30px 40px", background: "transparent", minHeight: "100vh" }}>
            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
                title={modal.title}
                actions={
                    <>
                        <button className="secondary-btn" onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}>Cancel</button>
                        <button className="primary-btn" onClick={modal.onConfirm} style={{ background: "#ef4444", borderColor: "#ef4444" }}>Confirm</button>
                    </>
                }
            >
                {modal.content}
            </Modal>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
                <div>
                    <h1 className="text-gradient" style={{ margin: "0 0 5px 0" }}>Admin Dashboard</h1>
                    <p style={{ margin: 0, color: "#6b7280" }}>Manage users, plans, and system health.</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <span style={{ padding: "8px 16px", background: "rgba(255,255,255,0.1)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", fontWeight: 500, color: "var(--text-main)" }}>
                        Logged in as: {user.name}
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: "flex", gap: 8, marginBottom: 30, overflowX: "auto",
                borderBottom: "1px solid #e5e7eb", paddingBottom: 10
            }}>
                {['overview', 'users', 'agents', 'bookings', 'plans', 'claims', 'audit'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: "8px 20px",
                            border: "none",
                            background: activeTab === tab ? "var(--primary)" : "transparent",
                            color: activeTab === tab ? "white" : "#4b5563",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontWeight: 600,
                            textTransform: "capitalize",
                            transition: "all 0.2s"
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="fade-in">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'users' && renderUsers()}
                {activeTab === 'agents' && renderAgents()}
                {activeTab === 'bookings' && renderBookings()}
                {activeTab === 'plans' && renderPlans()}
                {activeTab === 'claims' && renderClaims()}
                {activeTab === 'audit' && renderAudit()}
            </div>
        </div>
    );
}
