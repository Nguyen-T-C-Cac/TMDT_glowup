import apiClient from '../api/config';

export interface CreateReviewPayload {
    rating: number;
    content?: string;
    attachedImages?: string[];
}

export const reviewService = {
    createReview: async (orderId: string, payload: CreateReviewPayload) => {
        const response = await apiClient.post(`/api/orders/${orderId}/reviews`, payload);
        return response.data;
    },
    updateReview: async (orderId: string, payload: CreateReviewPayload) => {
        const response = await apiClient.put(`/api/orders/${orderId}/review`, payload);
        return response.data;
    },
    getMyReview: async (orderId: string) => {
        const response = await apiClient.get(`/api/orders/${orderId}/review`);
        return response.data;
    },
};
