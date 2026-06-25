import React from 'react';
import './TodaySchedule.css';

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  address: string;
  status: 'done' | 'in-progress' | 'upcoming';
}

const scheduleData: ScheduleItem[] = [
  {
    id: '1',
    time: '10:00 - 11:30',
    title: 'Sửa máy giặt Toshiba',
    address: '25 Bis Nguyễn Thị Minh Khai, Quận 1, TP.HCM',
    status: 'done',
  },
  {
    id: '2',
    time: '14:00 - 15:30',
    title: 'Sửa tủ lạnh Hitachi',
    address: 'Sarimi Building, Quận 2, TP. Thủ Đức',
    status: 'in-progress',
  },
  {
    id: '3',
    time: '17:00 - 18:00',
    title: 'Bảo trì hệ thống lọc nước',
    address: 'Vinhome Golden River, Quận 1, TP.HCM',
    status: 'upcoming',
  },
];

const statusDot: Record<string, string> = {
  'done': '#3b82f6',
  'in-progress': '#e2af74',
  'upcoming': '#cbd5e1',
};

export const TodaySchedule: React.FC = () => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });

  return (
    <div className="schedule-card">
      <div className="schedule-header">
        <h3 className="schedule-title">Lịch hôm nay</h3>
        <span className="schedule-date">{formattedDate}</span>
      </div>

      <div className="schedule-timeline">
        {scheduleData.map((item, index) => (
          <div key={item.id} className={`schedule-item status-${item.status}`}>
            <div className="timeline-line-wrapper">
              <div className="timeline-dot" style={{ backgroundColor: statusDot[item.status] }}></div>
              {index < scheduleData.length - 1 && <div className="timeline-line"></div>}
            </div>
            <div className="schedule-content">
              <span className="schedule-time">{item.time}</span>
              <h4 className="schedule-task-title">{item.title}</h4>
              <p className="schedule-address">{item.address}</p>
              {item.status === 'done' && (
                <span className="schedule-status-badge badge-done">Xong</span>
              )}
              {item.status === 'in-progress' && (
                <div className="schedule-actions">
                  <button className="btn-schedule-action btn-dark">Chỉ đường</button>
                  <button className="btn-schedule-action btn-outline">Chi tiết</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="master-program-card">
        <div className="master-program-header">
          <span className="master-icon">🏆</span>
          <h4 className="master-title">Chương trình thợ bậc thầy</h4>
        </div>
        <p className="master-desc">
          Bạn chỉ còn 3 đánh giá tốt nữa để đạt hạng Vàng và tăng 15% phí dịch vụ.
        </p>
        <div className="master-progress-bar">
          <div className="master-progress-fill" style={{ width: '72%' }}></div>
        </div>
      </div>
    </div>
  );
};
