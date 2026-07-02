import apiClient from '../api/config';
import type { VoucherResponse } from '../types/voucher';

const unwrap = <T,>(payload: unknown): T => {
    if (payload && typeof payload === 'object' && 'data' in payload) {
        return (payload as { data: T }).data;
    }
    return payload as T;
};

export const voucherService = {
    listAvailable: async (): Promise<VoucherResponse[]> => {
        const response = await apiClient.get('/api/vouchers');
        return unwrap<VoucherResponse[]>(response.data);
    },

    listSaved: async (): Promise<VoucherResponse[]> => {
        const response = await apiClient.get('/api/vouchers/saved');
        return unwrap<VoucherResponse[]>(response.data);
    },

    save: async (code: string): Promise<VoucherResponse> => {
        const response = await apiClient.post(`/api/vouchers/${code}/save`);
        return unwrap<VoucherResponse>(response.data);
    },

    getMyPoints: async (): Promise<number> => {
        const response = await apiClient.get('/api/vouchers/points');
        const data = unwrap<{ rewardPoints: number }>(response.data);
        return data.rewardPoints ?? 0;
    },
};

export default voucherService;
