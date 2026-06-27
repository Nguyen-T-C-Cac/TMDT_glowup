import apiClient from '../api/config';
import type { Brand, BookingSubmitResponse, CreateBookingPayload, DeviceType } from '../types/booking';

const unwrap = <T>(payload: unknown): T => {
    if (payload && typeof payload === 'object' && 'success' in payload && (payload as { success?: boolean }).success && 'data' in payload) {
        return (payload as { data: T }).data;
    }
    if (payload && typeof payload === 'object' && 'data' in payload) {
        return (payload as { data: T }).data;
    }
    return payload as T;
};

export const bookingService = {
    getDeviceTypes: async (categoryCode: string): Promise<DeviceType[]> => {
        const response = await apiClient.get('/api/device-types', {
            params: { categoryCode },
        });
        const data = unwrap<DeviceType[]>(response.data);
        return data ?? [];
    },

    getBrands: async (categoryCode: string): Promise<Brand[]> => {
        const response = await apiClient.get('/api/brands', {
            params: { categoryCode },
        });
        const data = unwrap<Brand[]>(response.data);
        return data ?? [];
    },

    createBooking: async (payload: CreateBookingPayload): Promise<BookingSubmitResponse> => {
        const response = await apiClient.post('/api/bookings', payload);
        return unwrap<BookingSubmitResponse>(response.data);
    },

    acceptBooking: async (code: string): Promise<void> => {
        await apiClient.patch(`/api/bookings/${code}/accept`);
    },

    rejectBooking: async (code: string): Promise<void> => {
        await apiClient.patch(`/api/bookings/${code}/reject`);
    },
};
