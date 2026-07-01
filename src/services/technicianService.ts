import apiClient from '../api/config';
import type { Technician } from './providerService';

export interface BookedSlot {
  date: string;
  startTime: string;
  endTime: string;
  orderCode: string;
  status: string;
}

export interface TechnicianSchedule {
  weeklySchedule: Record<string, string>;
  bookedSlots: BookedSlot[];
}

export const technicianService = {
  /**
   * GET /api/technicians
   * Tìm kiếm và lấy danh sách thợ
   */
  getTechniciansList: async (filters?: {
    skills?: string[];
    district?: string;
    isAvailable?: boolean;
    page?: number;
    limit?: number;
    locations?: string[];
  }): Promise<{ success: boolean; data: Technician[]; pagination?: any }> => {
    const response = await apiClient.get<{ success: boolean; data: Technician[]; pagination?: any }>(
      '/api/technicians',
      { params: filters }
    );
    return response.data;
  },

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
  ): Promise<{ success: boolean; data: { items: any[]; averageRating?: number; totalReviews?: number; pagination?: any } }> => {
    const response = await apiClient.get<{ success: boolean; data: { items: any[]; averageRating?: number; totalReviews?: number; pagination?: any } }>(
      `/api/technicians/${id}/reviews`
    );
    return response.data;
  },

  /**
   * GET /api/technicians/:id/schedule?from=...&to=...
   * Lấy lịch làm việc và các khung giờ đã đặt của thợ
   */
  getTechnicianSchedule: async (
    id: string,
    from: string,
    to: string
  ): Promise<{ success: boolean; data: TechnicianSchedule }> => {
    const response = await apiClient.get<{ success: boolean; data: TechnicianSchedule }>(
      `/api/technicians/${id}/schedule`,
      { params: { from, to } }
    );
    return response.data;
  }
};
