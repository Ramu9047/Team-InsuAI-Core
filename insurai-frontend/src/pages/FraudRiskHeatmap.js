import { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/Card';

/**
 * Fraud Risk Heatmap - Admin Dashboard
 * Visualizes user fraud risk scores with color-coded heatmap
 */
export default function FraudRiskHeatmap() {
    const [heatmapData, setHeatmapData] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, GREEN, YELLOW, RED

    useEffect(() => {
        loadHeatmap();
    }, []);

    const loadHeatmap = async () => {
        try {
            const response = await api.get('/ai/fraud/heatmap');
            setHeatmapData(response.data);
        } catch (error) {
            console.error('Failed to load fraud heatmap:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (riskLevel) => {
        switch (riskLevel) {
            case 'GREEN': return '#22c55e';
            case 'YELLOW': return '#eab308';
            case 'RED': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getRiskBgColor = (riskLevel) => {
        switch (riskLevel) {
            case 'GREEN': return '#dcfce7';
            case 'YELLOW': return '#fef3c7';
            case 'RED': return '#fee2e2';
            default: return '#f3f4f6';
        }
    };

    const filteredUsers = heatmapData?.userRiskScores?.filter(user => {
        if (filter === 'ALL') return true;
        return user.riskLevel === filter;
    }) || [];

    if (loading) {
        return <div style={{ padding: 40, textAlign: 'center' }}>Loading fraud risk data...</div>;
    }

    return (
        <div style={{ padding: '40px 20px', maxWidth: 1400, margin: '0 auto' }}>
            <h1 style={{ marginBottom: 10 }}>🔍 Fraud Risk Heatmap</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 30 }}>
                AI-powered fraud detection and risk analysis
            </p>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 30 }}>
                <Card style={{ padding: 20, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: 5 }}>Total Users</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{heatmapData?.totalUsers || 0}</div>
                </Card>

                <Card style={{ padding: 20, background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: 'white' }}>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: 5 }}>✅ Low Risk</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{heatmapData?.greenCount || 0}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                        {heatmapData?.totalUsers > 0 ? ((heatmapData.greenCount / heatmapData.totalUsers) * 100).toFixed(1) : 0}%
                    </div>
                </Card>

                <Card style={{ padding: 20, background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', color: 'white' }}>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: 5 }}>⚠️ Medium Risk</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{heatmapData?.yellowCount || 0}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                        {heatmapData?.totalUsers > 0 ? ((heatmapData.yellowCount / heatmapData.totalUsers) * 100).toFixed(1) : 0}%
                    </div>
                </Card>

                <Card style={{ padding: 20, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white' }}>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: 5 }}>🚨 High Risk</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{heatmapData?.redCount || 0}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                        {heatmapData?.totalUsers > 0 ? ((heatmapData.redCount / heatmapData.totalUsers) * 100).toFixed(1) : 0}%
                    </div>
                </Card>
            </div>

            {/* Filter Buttons */}
            <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
                {['ALL', 'GREEN', 'YELLOW', 'RED'].map(level => (
                    <button
                        key={level}
                        onClick={() => setFilter(level)}
                        style={{
                            padding: '10px 20px',
                            border: filter === level ? '2px solid #667eea' : '2px solid transparent',
                            background: filter === level ? '#ede9fe' : 'white',
                            borderRadius: 8,
                            fontWeight: filter === level ? '600' : '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {level === 'ALL' ? 'All Users' : `${level} Risk`}
                    </button>
                ))}
            </div>

            {/* Heatmap Grid */}
            <Card style={{ padding: 30 }}>
                <h3 style={{ marginBottom: 20 }}>User Risk Matrix</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 15 }}>
                    {filteredUsers.map(user => (
                        <div
                            key={user.userId}
                            onClick={() => setSelectedUser(user)}
                            style={{
                                padding: 15,
                                background: getRiskBgColor(user.riskLevel),
                                border: `2px solid ${getRiskColor(user.riskLevel)}`,
                                borderRadius: 8,
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {/* Risk Score Badge */}
                            <div style={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: getRiskColor(user.riskLevel),
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.85rem'
                            }}>
                                {user.riskScore.toFixed(0)}
                            </div>

                            <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: 5, paddingRight: 45 }}>
                                {user.userName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                                {user.userEmail}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredUsers.length === 0 && (
                    <div style={{ padding: 40, textAlign: 'center', opacity: 0.6 }}>
                        No users found for this risk level
                    </div>
                )}
            </Card>

            {/* User Details Modal */}
            {selectedUser && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                    onClick={() => setSelectedUser(null)}
                >
                    <Card
                        style={{ maxWidth: 600, width: '90%', padding: 30, maxHeight: '80vh', overflow: 'auto' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
                            <div>
                                <h2 style={{ margin: 0 }}>{selectedUser.userName}</h2>
                                <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>{selectedUser.userEmail}</p>
                            </div>
                            <button
                                onClick={() => setSelectedUser(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    padding: 5
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Risk Score */}
                        <div style={{
                            padding: 20,
                            background: getRiskBgColor(selectedUser.riskLevel),
                            border: `2px solid ${getRiskColor(selectedUser.riskLevel)}`,
                            borderRadius: 8,
                            marginBottom: 20,
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '0.9rem', marginBottom: 5 }}>Fraud Risk Score</div>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: getRiskColor(selectedUser.riskLevel) }}>
                                {selectedUser.riskScore.toFixed(1)}
                            </div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: getRiskColor(selectedUser.riskLevel) }}>
                                {selectedUser.riskLevel} RISK
                            </div>
                        </div>

                        {/* Risk Factors */}
                        <div>
                            <h4 style={{ marginBottom: 15 }}>Risk Factors:</h4>
                            <ul style={{ paddingLeft: 20, margin: 0 }}>
                                {selectedUser.riskFactors.map((factor, index) => (
                                    <li key={index} style={{ marginBottom: 10, color: 'var(--text-main)' }}>
                                        {factor}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Actions */}
                        <div style={{ marginTop: 30, display: 'flex', gap: 10 }}>
                            <button style={{
                                flex: 1,
                                padding: '12px 20px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 8,
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}>
                                View Full Profile
                            </button>
                            {selectedUser.riskLevel === 'RED' && (
                                <button style={{
                                    flex: 1,
                                    padding: '12px 20px',
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 8,
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}>
                                    Flag for Review
                                </button>
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
