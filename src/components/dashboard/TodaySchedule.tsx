import React, { useState, useEffect } from 'react';
import { scheduleService} from '../../services/scheduleService';
import type { ScheduleSlot } from '../../types/schedule';
import './TodaySchedule.css';
 
// ─── Helpers ────────────────────────────────────────────────────────────────
 
function formatTimeRange(startIso: string, endIso: string): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  return `${fmt(startIso)} - ${fmt(endIso)}`;
}
 
function slotStatus(slot: ScheduleSlot): 'done' | 'in-progress' | 'upcoming' {
  const now = Date.now();
  const start = new Date(slot.startTime).getTime();
  const end = new Date(slot.endTime).getTime();
  if (now > end) return 'done';
  if (now >= start && now <= end) return 'in-progress';
  return 'upcoming';
}
 
const statusDot: Record<string, string> = {
  done: '#3b82f6',
  'in-progress': '#e2af74',
  upcoming: '#cbd5e1',
};

// ─── Component ───────────────────────────────────────────────────────────────
 
export const TodaySchedule: React.FC = () => {
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    scheduleService
      .getTodaySlots()
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, []);
 
  const today = new Date();
  const formattedDate = today.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
  return (
    <div className="schedule-card">
      <div className="schedule-header">
        <h3 className="schedule-title">Lịch hôm nay</h3>
        <span className="schedule-date">{formattedDate}</span>
      </div>
 
      <div className="schedule-timeline">
        {loading && (
          <div className="schedule-empty">
            <span className="schedule-empty-icon">⏳</span>
            <p>Đang tải lịch...</p>
          </div>
        )}
 
        {!loading && slots.length === 0 && (
          <div className="schedule-empty">
            <span className="schedule-empty-icon">📅</span>
            <p>Hôm nay chưa có lịch làm việc</p>
          </div>
        )}
 
        {!loading &&
          slots.map((slot, index) => {
            const status = slotStatus(slot);
            return (
              <div key={slot.id} className={`schedule-item status-${status}`}>
                <div className="timeline-line-wrapper">
                  <div
                    className="timeline-dot"
                    style={{ backgroundColor: statusDot[status] }}
                  />
                  {index < slots.length - 1 && <div className="timeline-line" />}
                </div>
 
                <div className="schedule-content">
                  <span className="schedule-time">
                    {formatTimeRange(slot.startTime, slot.endTime)}
                  </span>
 
                  <h4 className="schedule-task-title">
                    {slot.title ?? 'Lịch làm việc'}
                  </h4>
 
                  {/* Thông tin đơn hàng (chỉ có khi slot loại ORDER) */}
                  {slot.slotType === 'ORDER' && slot.customerName && (
                    <div className="schedule-order-info">
                      <span className="order-badge">Đơn hàng</span>
                      <span className="order-customer">
                        👤 {slot.customerName}
                        {slot.customerPhone && ` · ${slot.customerPhone}`}
                      </span>
                      {slot.serviceDescription && (
                        <span className="order-service">🔧 {slot.serviceDescription}</span>
                      )}
                    </div>
                  )}
 
                  {slot.address && (
                    <p className="schedule-address">📍 {slot.address}</p>
                  )}
 
                  {status === 'done' && (
                    <span className="schedule-status-badge badge-done">Xong</span>
                  )}
 
                  {status === 'in-progress' && (
                    <div className="schedule-actions">
                      {slot.address && (
                        <a
                          className="btn-schedule-action btn-dark"
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(slot.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Chỉ đường
                        </a>
                      )}
                      {slot.orderId && (
                        <span className="btn-schedule-action btn-outline">
                          #{slot.orderId}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
 
      {/* Chương trình thưởng */}
      <div className="master-program-card">
        <div className="master-program-header">
          <span className="master-icon">🏆</span>
          <h4 className="master-title">Chương trình thợ bậc thầy</h4>
        </div>
        <p className="master-desc">
          Bạn chỉ còn 3 đánh giá tốt nữa để đạt hạng Vàng và tăng 15% phí dịch vụ.
        </p>
        <div className="master-progress-bar">
          <div className="master-progress-fill" style={{ width: '72%' }} />
        </div>
      </div>
    </div>
  );
};