import React, { useState, useEffect } from 'react';
import { scheduleService} from '../../services/scheduleService';
import { technicianService } from '../../services/technicianService';
import { getStoredUser } from '../../services/auth';
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

interface TechnicianStats {
  rating: number;
  reviewCount: number;
  rewardPoints: number;
}

// ─── Component ───────────────────────────────────────────────────────────────
 
export const TodaySchedule: React.FC = () => {
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TechnicianStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
 
  useEffect(() => {
    scheduleService
      .getTodaySlots()
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const currentUser = getStoredUser();
    const technicianCode = currentUser?.code;
    if (!technicianCode) {
      setStatsLoading(false);
      return;
    }

    technicianService
      .getTechnicianById(technicianCode)
      .then((res) => {
        const data = res?.data as any;
        if (data) {
          setStats({
            rating: Number(data.rating) || 0,
            reviewCount: Number(data.reviewCount) || 0,
            rewardPoints: Number(data.rewardPoints) || 0,
          });
        }
      })
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
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
 
      {/* Người thợ toàn năng */}
      <div className="master-program-card">
        <div className="master-program-header">
          <span className="master-icon">🏆</span>
          <h4 className="master-title">Người thợ toàn năng</h4>
        </div>

        {statsLoading && (
          <p className="master-desc">Đang tải thống kê...</p>
        )}

        {!statsLoading && !stats && (
          <p className="master-desc">Chưa có dữ liệu thống kê.</p>
        )}

        {!statsLoading && stats && (
          <>
            <p className="master-desc">
              Đánh giá trung bình từ khách hàng và điểm thưởng tích lũy của bạn.
            </p>
            <div className="master-stats-row">
              <div className="master-stat-item">
                <span className="master-stat-value">
                  ⭐ {stats.rating > 0 ? stats.rating.toFixed(1) : '—'}
                </span>
                <span className="master-stat-label">
                  {stats.reviewCount} đánh giá
                </span>
              </div>
              <div className="master-stat-divider" />
              <div className="master-stat-item">
                <span className="master-stat-value">🎖️ {stats.rewardPoints}</span>
                <span className="master-stat-label">Điểm thưởng</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};