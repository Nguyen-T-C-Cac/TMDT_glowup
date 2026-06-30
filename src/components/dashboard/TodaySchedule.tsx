import React from 'react';
import './TodaySchedule.css';
import type { TechnicianScheduleItem } from '../../types/technician';

interface TodayScheduleProps {
  schedule: TechnicianScheduleItem[];
}

type UiStatus = 'done' | 'in-progress' | 'upcoming';

const statusDot: Record<UiStatus, string> = {
  'done': '#3b82f6',
  'in-progress': '#e2af74',
  'upcoming': '#cbd5e1',
};

const toUiStatus = (status?: string | null): UiStatus => {
  const s = (status ?? '').toLowerCase();
  if (s === 'completed') return 'done';
  if (s === 'in-progress' || s === 'in_progress') return 'in-progress';
  return 'upcoming';
};

const formatTime = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const buildTimeRange = (item: TechnicianScheduleItem) => {
  const start = formatTime(item.scheduledAt);
  const end = formatTime(item.expectedTime);
  if (start && end) return `${start} - ${end}`;
  return start || end || 'Chưa đặt giờ';
};

export const TodaySchedule: React.FC<TodayScheduleProps> = ({ schedule }) => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });

  return (
    <div className="schedule-card">
      <div className="schedule-header">
        <h3 className="schedule-title">Lịch hôm nay</h3>
        <span className="schedule-date">{formattedDate}</span>
      </div>

      <div className="schedule-timeline">
        {schedule.length === 0 && (
          <p className="schedule-empty">Hôm nay bạn chưa có lịch hẹn nào.</p>
        )}
        {schedule.map((item, index) => {
          const uiStatus = toUiStatus(item.status);
          const title = item.serviceName || item.deviceName || `Đơn ${item.code}`;
          return (
            <div key={item.code} className={`schedule-item status-${uiStatus}`}>
              <div className="timeline-line-wrapper">
                <div className="timeline-dot" style={{ backgroundColor: statusDot[uiStatus] }}></div>
                {index < schedule.length - 1 && <div className="timeline-line"></div>}
              </div>
              <div className="schedule-content">
                <span className="schedule-time">{buildTimeRange(item)}</span>
                <h4 className="schedule-task-title">{title}</h4>
                <p className="schedule-address">{item.address || item.customerName || '—'}</p>
                {uiStatus === 'done' && (
                  <span className="schedule-status-badge badge-done">Xong</span>
                )}
                {uiStatus === 'in-progress' && (
                  <div className="schedule-actions">
                    <button className="btn-schedule-action btn-dark">Chỉ đường</button>
                    <button className="btn-schedule-action btn-outline">Chi tiết</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
