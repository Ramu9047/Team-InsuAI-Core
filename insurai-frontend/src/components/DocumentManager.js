import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { documentService } from '../services/documentService';
import { useNotification } from '../context/NotificationContext';

export default function DocumentManager({ userId, userRole }) {
    const { notify } = useNotification();
    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [actionDocId, setActionDocId] = useState(null); // For handling delete/reject actions
    const [actionType, setActionType] = useState(null); // 'DELETE' or 'REJECT'
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        const loadDocuments = async () => {
            try {
                const docs = await documentService.getDocuments(userId);
                setDocuments(docs || documentService.getMockDocuments());
            } catch (err) {
                setDocuments(documentService.getMockDocuments());
            }
        };
        loadDocuments();
    }, [userId]);

    const handleFileUpload = async (event, docType) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        if (file.size > 5 * 1024 * 1024) {
            notify('File size must be less than 5MB', 'warning');
            return;
        }

        if (!file.type.includes('pdf') && !file.type.includes('image')) {
            notify('Only PDF and image files are allowed', 'warning');
            return;
        }

        setUploading(true);

        try {
            await documentService.uploadDocument(userId, file, docType);

            // Mock success
            const newDoc = {
                id: Date.now(),
                name: docType,
                filename: file.name,
                type: docType,
                status: 'PENDING',
                uploadedAt: new Date().toISOString(),
                size: file.size,
                verifiedBy: null,
                verifiedAt: null
            };

            setDocuments(prev => [...prev, newDoc]);
            notify('Document uploaded successfully', 'success');
        } catch (err) {
            console.error('Upload error:', err);
            notify('Upload failed. Please try again.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleVerify = async (docId) => {
        try {
            await documentService.verifyDocument(docId);

            setDocuments(prev =>
                prev.map(doc =>
                    doc.id === docId
                        ? {
                            ...doc,
                            status: 'VERIFIED',
                            verifiedBy: 'Current Agent',
                            verifiedAt: new Date().toISOString()
                        }
                        : doc
                )
            );
        } catch (err) {
            console.error('Verify error:', err);
        }
    };

    const initiateReject = (docId) => {
        setActionDocId(docId);
        setActionType('REJECT');
        setRejectReason('');
    };

    const confirmReject = async () => {
        if (!rejectReason.trim()) return;

        try {
            await documentService.rejectDocument(actionDocId, rejectReason);
            setDocuments(prev => prev.map(doc =>
                doc.id === actionDocId ? { ...doc, status: 'REJECTED', rejectionReason: rejectReason } : doc
            ));
            cancelAction();
        } catch (err) {
            console.error('Reject error:', err);
        }
    };

    const cancelAction = () => {
        setActionDocId(null);
        setActionType(null);
        setRejectReason('');
    };

    const initiateDelete = (docId) => {
        setActionDocId(docId);
        setActionType('DELETE');
    };

    const confirmDelete = async () => {
        try {
            await documentService.deleteDocument(actionDocId);
            setDocuments(prev => prev.filter(doc => doc.id !== actionDocId));
            cancelAction();
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'VERIFIED': return '#10b981';
            case 'PENDING': return '#f59e0b';
            case 'REJECTED': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'VERIFIED': return '✅';
            case 'PENDING': return '⏳';
            case 'REJECTED': return '❌';
            default: return '📄';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'IDENTITY': return '🪪';
            case 'INCOME': return '💰';
            case 'MEDICAL': return '🏥';
            case 'ADDRESS': return '🏠';
            default: return '📄';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
                padding: '25px 30px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white'
            }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'white' }}>
                    📂 Document Management
                </h3>
                <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '0.95rem' }}>
                    {userRole === 'AGENT' ? 'Review and verify user documents' : 'Upload and manage your documents'}
                </p>
            </div>

            {/* Documents List */}
            <div style={{ padding: '30px' }}>
                {documents.length === 0 ? (
                    <div style={{
                        padding: 60,
                        textAlign: 'center',
                        color: 'var(--text-muted)'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: 20 }}>📂</div>
                        <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>
                            No documents uploaded yet
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.95rem' }}>
                            Upload your documents to proceed with your application
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {documents.map((doc, idx) => (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                style={{
                                    padding: 20,
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 16,
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                {/* Icon */}
                                <div style={{
                                    fontSize: '2.5rem',
                                    flexShrink: 0
                                }}>
                                    {getTypeIcon(doc.type)}
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                        <h4 style={{
                                            margin: 0,
                                            fontSize: '1.1rem',
                                            fontWeight: 600,
                                            color: 'var(--text-main)'
                                        }}>
                                            {doc.name}
                                        </h4>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            padding: '4px 12px',
                                            borderRadius: 12,
                                            background: `${getStatusColor(doc.status)}20`,
                                            border: `1px solid ${getStatusColor(doc.status)}40`
                                        }}>
                                            <span style={{ fontSize: '0.9rem' }}>{getStatusIcon(doc.status)}</span>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                color: getStatusColor(doc.status),
                                                textTransform: 'uppercase'
                                            }}>
                                                {doc.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{
                                        fontSize: '0.85rem',
                                        color: 'var(--text-muted)',
                                        marginBottom: 8
                                    }}>
                                        📎 {doc.filename} • {formatFileSize(doc.size)}
                                    </div>

                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: 'var(--text-muted)',
                                        opacity: 0.8
                                    }}>
                                        Uploaded: {formatDate(doc.uploadedAt)}
                                        {doc.verifiedBy && (
                                            <> • Verified by {doc.verifiedBy} on {formatDate(doc.verifiedAt)}</>
                                        )}
                                    </div>

                                    {doc.status === 'REJECTED' && doc.rejectionReason && (
                                        <div style={{
                                            marginTop: 10,
                                            padding: '10px 14px',
                                            background: 'rgba(239,68,68,0.1)',
                                            border: '1px solid rgba(239,68,68,0.3)',
                                            borderRadius: 8,
                                            fontSize: '0.85rem',
                                            color: '#ef4444'
                                        }}>
                                            ⚠️ Rejection Reason: {doc.rejectionReason}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                    {userRole === 'AGENT' && doc.status === 'PENDING' && (
                                        <>
                                            {actionDocId === doc.id && actionType === 'REJECT' ? (
                                                <div style={{ display: 'flex', gap: 5 }}>
                                                    <input
                                                        type="text"
                                                        value={rejectReason}
                                                        onChange={(e) => setRejectReason(e.target.value)}
                                                        placeholder="Reason..."
                                                        style={{ padding: '8px', borderRadius: 4, border: '1px solid #ccc', width: 150 }}
                                                    />
                                                    <button onClick={confirmReject} className="primary-btn" style={{ padding: '8px', background: '#ef4444' }}>✓</button>
                                                    <button onClick={cancelAction} className="secondary-btn" style={{ padding: '8px' }}>✕</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleVerify(doc.id)}
                                                        className="primary-btn"
                                                        style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#10b981' }}
                                                    >
                                                        ✅ Verify
                                                    </button>
                                                    <button
                                                        onClick={() => initiateReject(doc.id)}
                                                        className="primary-btn"
                                                        style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#ef4444' }}
                                                    >
                                                        ❌ Reject
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    )}

                                    {userRole === 'USER' && (
                                        <>
                                            <button
                                                onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}
                                                className="primary-btn"
                                                style={{
                                                    padding: '8px 16px',
                                                    fontSize: '0.85rem',
                                                    background: '#3b82f6'
                                                }}
                                            >
                                                👁️ View
                                            </button>
                                            {doc.status !== 'VERIFIED' && (
                                                actionDocId === doc.id && actionType === 'DELETE' ? (
                                                    <div style={{ display: 'flex', gap: 5 }}>
                                                        <button onClick={confirmDelete} className="primary-btn" style={{ padding: '8px', background: '#ef4444' }}>Confirm</button>
                                                        <button onClick={cancelAction} className="secondary-btn" style={{ padding: '8px' }}>Cancel</button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => initiateDelete(doc.id)}
                                                        className="primary-btn"
                                                        style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#ef4444' }}
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                )
                                            )}
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Upload Section (User only) */}
                {userRole === 'USER' && (
                    <div style={{ marginTop: 30 }}>
                        <h4 style={{ marginBottom: 16, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                            📤 Upload New Document
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                            {['IDENTITY', 'INCOME', 'MEDICAL', 'ADDRESS'].map(type => (
                                <label
                                    key={type}
                                    style={{
                                        padding: '16px',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '2px dashed rgba(255,255,255,0.2)',
                                        borderRadius: 12,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                        e.currentTarget.style.borderColor = '#3b82f6';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                                    }}
                                >
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => handleFileUpload(e, type)}
                                        style={{ display: 'none' }}
                                        disabled={uploading}
                                    />
                                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>
                                        {getTypeIcon(type)}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                        {type}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                        Click to upload
                                    </div>
                                </label>
                            ))}
                        </div>
                        <p style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                            Supported formats: PDF, JPG, PNG • Max size: 5MB
                        </p>
                    </div>
                )}

                {uploading && (
                    <div style={{
                        marginTop: 20,
                        padding: 16,
                        background: 'rgba(59,130,246,0.1)',
                        border: '1px solid rgba(59,130,246,0.3)',
                        borderRadius: 12,
                        textAlign: 'center',
                        color: '#3b82f6'
                    }}>
                        <div className="spinner" style={{ margin: '0 auto 10px', width: 30, height: 30 }}></div>
                        Uploading document...
                    </div>
                )}
            </div>
        </div>
    );
}
