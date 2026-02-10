import api from './api';

export const agentService = {
    getAgentAppointments: async () => {
        try {
            const response = await api.get("/agents/appointments");
            return response.data;
        } catch (error) {
            console.warn('AgentService: Using mock appointments');
            return [];
        }
    },

    updateAvailability: async (agentId, available) => {
        try {
            await api.patch(`/agents/${agentId}/availability`, { available });
            return true;
        } catch (error) {
            console.error('AgentService: Failed to update availability');
            throw error;
        }
    },

    reviewConsultation: async (consultationId, status) => {
        try {
            await api.patch(`/bookings/${consultationId}/status`, { status });
            return true;
        } catch (error) {
            console.error('AgentService: Failed to review consultation');
            throw error;
        }
    },

    getAgentConsultations: async () => {
        try {
            const response = await api.get('/agents/consultations');
            return response.data;
        } catch (error) {
            console.warn('AgentService: Failed to fetch consultations');
            return [];
        }
    },

    getRiskAssessment: async (userId, policyId) => {
        try {
            const response = await api.get(`/ai/risk-assessment`, {
                params: { userId, policyId }
            });
            return response.data;
        } catch (error) {
            console.error('AgentService: Failed to get AI risk assessment');
            return null; // Return null to trigger fallback
        }
    },

    getAgentPerformance: async () => {
        try {
            const response = await api.get('/agents/performance');
            return response.data;
        } catch (error) {
            console.warn('AgentService: Failed to fetch performance stats');
            return null;
        }
    }
};
