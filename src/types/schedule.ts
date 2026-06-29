
export interface ScheduleSlot {
  id: number;
  startTime: string;   // ISO datetime, vd: "2025-06-20T09:00:00"
  endTime: string;
  title?: string;
  slotType: 'MANUAL' | 'ORDER';
  // Chỉ có khi thợ xem (không trả về cho khách)
  orderId?: string;
  customerName?: string;
  customerPhone?: string;
  serviceDescription?: string;
  address?: string;
}