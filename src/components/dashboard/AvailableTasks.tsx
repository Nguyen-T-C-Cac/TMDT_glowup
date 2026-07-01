import React, { useEffect, useState } from 'react';
import { orderService } from '../../services/order/orderService';
import type { OrderResponse } from '../../types/order/order';
import './AvailableTasks.css';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: 'Mới', color: '#10b981', bg: '#ecfdf5' },
  assigned: { label: 'Đã giao', color: '#3b82f6', bg: '#eff6ff' },
  scheduled: { label: 'Đã hẹn lịch', color: '#3b82f6', bg: '#eff6ff' },
};

const formatMoney = (value?: number) =>
  value != null ? `${value.toLocaleString('vi-VN')} đ` : 'Chưa báo giá';

const ToolIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

export const AvailableTasks: React.FC = () => {
  const [tasks, setTasks] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    orderService
      .listOrders({ status: 'assigned', limit: 6 })
      .then((page) => {
        if (mounted) setTasks(page.items);
      })
      .catch(() => {
        if (mounted) setTasks([]);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="available-tasks-card">
      <div className="available-tasks-header">
        <h3 className="available-tasks-title">Công việc khả dụng</h3>
        <a href="/technician/jobs" className="view-all-tasks">Xem tất cả</a>
      </div>

      <div className="tasks-list">
        {isLoading && <p style={{ padding: '12px 0', color: '#64748b' }}>Đang tải...</p>}

        {!isLoading && tasks.length === 0 && (
          <p style={{ padding: '12px 0', color: '#64748b' }}>Chưa có công việc mới nào được giao.</p>
        )}

        {!isLoading &&
          tasks.map((task) => {
            const statusStyle = statusConfig[task.status] ?? statusConfig.assigned;
            return (
              <div key={task.id} className="task-item">
                <div className="task-icon-wrapper">
                  <ToolIcon />
                </div>
                <div className="task-details">
                  <h4 className="task-name">
                    {task.description || task.serviceName || 'Yêu cầu sửa chữa'}
                  </h4>
                  {task.address && (
                    <div className="task-address">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>{task.address}</span>
                    </div>
                  )}
                </div>
                <div className="task-right">
                  <span className="task-price">{formatMoney(task.estimatedPrice ?? task.finalPrice)}</span>
                  <span className="task-status-badge" style={{ color: statusStyle.color, backgroundColor: statusStyle.bg }}>
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