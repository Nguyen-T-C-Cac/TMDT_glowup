import apiClient from '../api/config';
import type { ScheduleSlot } from '../types/schedule';


export const scheduleService = {
  /** Thợ lấy lịch của mình theo tuần/tháng */
  getMySlots: async (from: string, to: string): Promise<ScheduleSlot[]> => {
    const res = await apiClient.get('/api/technicians/me/slots', { params: { from, to } });
    return res.data.data ?? [];
  },
 
  /** Thợ thêm slot thủ công */
  createSlot: async (data: {
    startTime: string;
    endTime: string;
    title?: string;
    note?: string;
  }): Promise<ScheduleSlot> => {
    const res = await apiClient.post('/api/technicians/me/slots', data);
    return res.data.data;
  },
 
  /** Thợ xóa slot thủ công */
  deleteSlot: async (slotId: number): Promise<void> => {
    await apiClient.delete(`/api/technicians/me/slots/${slotId}`);
  },
 
  /** Lịch hôm nay — dùng cho TodaySchedule widget */
  getTodaySlots: async (): Promise<ScheduleSlot[]> => {
    const res = await apiClient.get('/api/technicians/me/slots/today');
    return res.data.data ?? [];
  },
 
  /** Khách xem lịch của thợ (chỉ trả startTime + endTime) */
  getPublicSlots: async (
    technicianCode: string,
    from: string,
    to: string
  ): Promise<ScheduleSlot[]> => {
    const res = await apiClient.get(`/api/technicians/${technicianCode}/slots/public`, {
      params: { from, to },
    });
    return res.data.data ?? [];
  },
};
 