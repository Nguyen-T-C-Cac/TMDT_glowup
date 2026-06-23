import apiClient from '../api/config';

export interface CreateReportPayload {
    reason: string;
    description: string;
    evidenceImages?: string[];
}

export const reportService = {
    createReport: async (orderId: string, payload: CreateReportPayload) => {
        const response = await apiClient.post(`/api/orders/${orderId}/reports`, payload);
        return response.data;
    },
};
