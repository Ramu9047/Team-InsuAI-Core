import api from './api';

export const documentService = {
    getDocuments: async (userId) => {
        try {
            const response = await api.get(`/users/${userId}/documents`);
            return response.data;
        } catch (error) {
            console.warn('DocumentService: Using mock documents');
            throw error;
        }
    },

    uploadDocument: async (userId, file, type) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const response = await api.post(`/users/${userId}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    verifyDocument: async (docId) => {
        await api.patch(`/documents/${docId}/verify`);
    },

    rejectDocument: async (docId, reason) => {
        await api.patch(`/documents/${docId}/reject`, { reason });
    },

    deleteDocument: async (docId) => {
        await api.delete(`/documents/${docId}`);
    },

    getMockDocuments: () => [
        {
            id: 1,
            name: 'Aadhaar Card',
            filename: 'aadhaar_123456.pdf',
            type: 'IDENTITY',
            status: 'VERIFIED',
            uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            size: 245000,
            verifiedBy: 'Agent Rahul',
            verifiedAt: new Date(Date.now() - 86400000 * 4).toISOString()
        },
        {
            id: 2,
            name: 'Income Proof',
            filename: 'salary_slip_jan2026.pdf',
            type: 'INCOME',
            status: 'VERIFIED',
            uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            size: 189000,
            verifiedBy: 'Agent Rahul',
            verifiedAt: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
            id: 3,
            name: 'Medical Report',
            filename: 'health_checkup_2026.pdf',
            type: 'MEDICAL',
            status: 'PENDING',
            uploadedAt: new Date(Date.now() - 86400000).toISOString(),
            size: 512000,
            verifiedBy: null,
            verifiedAt: null
        }
    ]
};
