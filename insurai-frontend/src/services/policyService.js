import api from './api';

export const policyService = {
    getAllPolicies: async () => {
        try {
            const response = await api.get('/policies');
            return response.data;
        } catch (error) {
            console.warn('PolicyService: Using mock policies');
            throw error;
        }
    },

    getRecommendedPolicies: async (user) => {
        try {
            if (!user || !user.id) return [];
            // Use real AI recommendations endpoint
            const response = await api.get(`/policies/recommendations/${user.id}`);
            return response.data;
        } catch (error) {
            console.warn('PolicyService: Failed to fetch recommendations, using fallback');
            return [];
        }
    },

    getMockPolicies: () => [
        {
            id: 1,
            name: 'Health Secure Plus',
            type: 'HEALTH',
            provider: 'Star Health',
            premium: 5000,
            coverage: 1000000,
            features: {
                cashless: true,
                preExisting: true,
                maternity: true,
                ambulance: true,
                roomRent: 'No Limit',
                copay: '0%',
                restoration: true,
                wellness: true
            },
            aiScore: 89,
            aiReasons: [
                'Best coverage for your age group',
                'No co-payment required',
                'Unlimited room rent',
                'Wellness benefits included'
            ],
            recommended: true
        },
        {
            id: 2,
            name: 'Family Shield',
            type: 'HEALTH',
            provider: 'HDFC Ergo',
            premium: 7000,
            coverage: 1500000,
            features: {
                cashless: true,
                preExisting: true,
                maternity: false,
                ambulance: true,
                roomRent: '₹5000/day',
                copay: '10%',
                restoration: true,
                wellness: false
            },
            aiScore: 76,
            aiReasons: [
                'Higher coverage amount',
                'Good for families',
                'Co-payment required',
                'Limited room rent'
            ],
            recommended: false
        },
        {
            id: 3,
            name: 'Basic Care',
            type: 'HEALTH',
            provider: 'Care Health',
            premium: 3500,
            coverage: 500000,
            features: {
                cashless: false,
                preExisting: false,
                maternity: false,
                ambulance: true,
                roomRent: '₹2000/day',
                copay: '20%',
                restoration: false,
                wellness: false
            },
            aiScore: 62,
            aiReasons: [
                'Budget-friendly option',
                'Limited coverage',
                'No cashless facility',
                'High co-payment'
            ],
            recommended: false
        }
    ]
};
