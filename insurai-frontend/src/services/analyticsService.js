import api from './api';

export const analyticsService = {
    getAllData: async () => {
        try {
            // Fetch real data from backend endpoints
            const [usersRes, agentsRes, bookingsRes, policiesRes, issuedPoliciesRes, pendingDocsRes] = await Promise.all([
                api.get("/users").catch(err => {
                    console.error("Failed to fetch users:", err);
                    return { data: [] };
                }),
                api.get("/agents").catch(err => {
                    console.error("Failed to fetch agents:", err);
                    return { data: [] };
                }),
                api.get("/bookings").catch(err => {
                    console.error("Failed to fetch bookings:", err);
                    return { data: [] };
                }),
                api.get("/policies").catch(err => {
                    console.error("Failed to fetch policies:", err);
                    return { data: [] };
                }),
                api.get("/policies/issued").catch(err => {
                    console.error("Failed to fetch issued policies:", err);
                    return { data: [] };
                }),
                api.get("/documents/pending").catch(err => {
                    console.error("Failed to fetch pending docs:", err);
                    return { data: [] };
                })
            ]);

            return {
                users: usersRes.data || [],
                agents: agentsRes.data || [],
                bookings: bookingsRes.data || [],
                policies: policiesRes.data || [],
                issuedPolicies: issuedPoliciesRes.data || [],
                pendingDocuments: pendingDocsRes.data || []
            };
        } catch (error) {
            console.error('AnalyticsService: Critical failure fetching data', error);
            return { users: [], agents: [], bookings: [], policies: [] };
        }
    }
};
