import apiClient from '../api/config';
import type { Technician } from './providerService';

export const technicianService = {
  /**
   * GET /api/technicians/:id
   * Xem chi tiết hồ sơ thợ
   */
  getTechnicianById: async (id: string): Promise<{ success: boolean; data: Technician }> => {
    const response = await apiClient.get<{ success: boolean; data: Technician }>(
      `/api/technicians/${id}`
    );
    return response.data;
  },

  /**
   * PATCH /api/technicians/:id/profile
   * Thợ cập nhật thông tin hành nghề
   */
  updateTechnicianProfile: async (
    id: string,
    data: Partial<Technician>
  ): Promise<{ success: boolean; data: Technician; message?: string }> => {
    const response = await apiClient.patch<{ success: boolean; data: Technician; message?: string }>(
      `/api/technicians/${id}/profile`,
      data
    );
    return response.data;
  },

  /**
   * PATCH /api/technicians/:id/availability
   * Thợ bật/tắt nhận đơn
   */
  updateTechnicianAvailability: async (
    id: string,
    isAvailable: boolean
  ): Promise<{ success: boolean; data: Technician; message?: string }> => {
    const response = await apiClient.patch<{ success: boolean; data: Technician; message?: string }>(
      `/api/technicians/${id}/availability`,
      { isAvailable }
    );
    return response.data;
  },

  /**
   * GET /api/technicians/:id/reviews
   * Lấy danh sách đánh giá của thợ
   */
  getTechnicianReviews: async (
    id: string
  ): Promise<{ success: boolean; data: any[] }> => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>(
      `/api/technicians/${id}/reviews`
    );
    return response.data;
  }
};
