import React from 'react';
import './AvailableTasks.css';

interface TaskItem {
  id: string;
  customerName: string;
  machineType: string;
  description: string;
  address: string;
  price: string;
  status: 'URGENT' | 'SCHEDULED' | 'NEW';
  icon: React.ReactNode;
}

const tasks: TaskItem[] = [
  {
    id: '1',
    customerName: 'Nguyễn Thị Lan',
    machineType: 'Máy lạnh Daikin',
    description: 'Vệ sinh máy lạnh Daikin',
    address: '45 Lê Thánh Tôn, Quận 1, TP.HCM',
    price: '450.000 đ',
    status: 'URGENT',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="22"></line>
        <line x1="12" y1="2" x2="16" y2="6"></line>
        <line x1="12" y1="2" x2="8" y2="6"></line>
        <line x1="12" y1="22" x2="16" y2="18"></line>
        <line x1="12" y1="22" x2="8" y2="18"></line>
      </svg>
    ),
  },
  {
    id: '2',
    customerName: 'Trần Văn Bảo',
    machineType: 'Tủ lạnh Samsung',
    description: 'Sửa board mạch tủ lạnh Samsung',
    address: '122 Võ Văn Tần, Quận 3, TP.HCM',
    price: '1.200.000 đ',
    status: 'SCHEDULED',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
        <line x1="5" y1="10" x2="19" y2="10"></line>
        <line x1="9" y1="14" x2="9" y2="18"></line>
      </svg>
    ),
  },
  {
    id: '3',
    customerName: 'Lê Minh Phương',
    machineType: 'Máy giặt LG',
    description: 'Máy giặt không vắt, rung lắc mạnh',
    address: '88 Nguyễn Huệ, Quận 1, TP.HCM',
    price: '650.000 đ',
    status: 'NEW',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
        <circle cx="12" cy="14" r="4"></circle>
        <line x1="8" y1="6" x2="8" y2="6"></line>
      </svg>
    ),
  },
  {
    id: '4',
    customerName: 'Hoàng Đức Anh',
    machineType: 'Điều hòa Panasonic',
    description: 'Điều hòa chảy nước, không mát',
    address: '201 Trần Hưng Đạo, Quận 5, TP.HCM',
    price: '500.000 đ',
    status: 'URGENT',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="22"></line>
        <line x1="12" y1="2" x2="16" y2="6"></line>
        <line x1="12" y1="2" x2="8" y2="6"></line>
        <line x1="12" y1="22" x2="16" y2="18"></line>
        <line x1="12" y1="22" x2="8" y2="18"></line>
      </svg>
    ),
  },
];

const statusConfig = {
  URGENT: { label: 'Khẩn cấp', color: '#ef4444', bg: '#fef2f2' },
  SCHEDULED: { label: 'Đã hẹn lịch', color: '#3b82f6', bg: '#eff6ff' },
  NEW: { label: 'Mới', color: '#10b981', bg: '#ecfdf5' },
};

export const AvailableTasks: React.FC = () => {
  return (
    <div className="available-tasks-card">
      <div className="available-tasks-header">
        <h3 className="available-tasks-title">Công việc khả dụng tại Quận 1 & 3</h3>
        <a href="#" className="view-all-tasks">Xem tất cả</a>
      </div>

      <div className="tasks-list">
        {tasks.map(task => {
          const statusStyle = statusConfig[task.status];
          return (
            <div key={task.id} className="task-item">
              <div className="task-icon-wrapper">
                {task.icon}
              </div>
              <div className="task-details">
                <h4 className="task-name">{task.description}</h4>
                <div className="task-address">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{task.address}</span>
                </div>
              </div>
              <div className="task-right">
                <span className="task-price">{task.price}</span>
                <span
                  className="task-status-badge"
                  style={{ color: statusStyle.color, backgroundColor: statusStyle.bg }}
                >
                  {statusStyle.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
