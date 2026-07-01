export type TechnicianListItem = {
  id: string;
  fullName: string;
  avatar?: string | null;
  rating?: number | string | null;
  reviewCount?: number | null;
  location?: string | null;
  district?: string | null;
  skills?: string[] | null;
  pricePerHour?: number | null;
  isAvailable?: boolean | null;
  timeAvailable?: string | null;
  type?: string | null;
  titleBadge?: string | null;
  completedJobs?: number | null;
};

export type TechnicianDetail = {
  id: string;
  fullName: string;
  avatar?: string | null;
  coverImage?: string | null;
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  district?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  rating?: number | string | null;
  reviewCount?: number | null;
  completedJobs?: number | null;
  isAvailable?: boolean | null;
  type?: string | null;
  titleBadge?: string | null;
  verificationStatus?: string | null;
  yearsExperience?: number | null;
  rewardPoints?: number | null;   
  certificates?: string[] | null;  
};

export type TechnicianListParams = {
  service?: string;
  district?: string;
  isAvailable?: boolean;
  minRating?: number;
  keyword?: string;
  page?: number;
  limit?: number;
};

export type TechnicianScheduleItem = {
  code: string;
  serviceName?: string | null;
  deviceName?: string | null;
  customerName?: string | null;
  address?: string | null;
  scheduledAt?: string | null;
  expectedTime?: string | null;
  status?: string | null;
};

export type TechnicianEarningPoint = {
  label: string;
  amount: number;
};

export type TechnicianDashboard = {
  newOrders: number;
  completedOrders: number;
  completedToday: number;
  todayEarnings: number;
  monthEarnings: number;
  todaySchedule: TechnicianScheduleItem[];
  earnings7d: TechnicianEarningPoint[];
  earnings30d: TechnicianEarningPoint[];
};

export type PagedTechnicians = {
  items: TechnicianListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CompletedProject = {
  id: number;
  code: string;
  serviceCategory: string; // Tương ứng với serviceCategory từ backend
  serviceName: string;     // Tương ứng với serviceName từ backend
  description: string;     // Mô tả dự án/đơn hàng
  deviceName: string;      // Tên thiết bị sửa chữa (deviceName)
};
