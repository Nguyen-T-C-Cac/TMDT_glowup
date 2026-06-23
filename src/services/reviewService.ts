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
};
