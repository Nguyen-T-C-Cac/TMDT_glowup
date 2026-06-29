import React, { useState, useEffect } from 'react';
import { scheduleService } from '../../services/scheduleService';
import type { ScheduleSlot } from '../../types/schedule';
import './SidebarWidgets.css';

// ─── Icons ────────────────────────────────────────────────────────────────────

export const RegistrationIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

export const AwardIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7"></circle>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}

const DAY_NAMES = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

function formatTimeRange(startIso: string, endIso: string): string {
  const fmt = (s: string) => new Date(s).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  return `${fmt(startIso)} - ${fmt(endIso)}`;
}

// ─── ScheduleSidebar ─────────────────────────────────────────────────────────

interface ScheduleSidebarProps {
  /** technicianCode lấy từ URL ?id= trong ProviderProfile */
  technicianCode?: string | null;
}
interface VerificationSidebarProps {
  verificationStatus?: string | null;
  yearsExperience?: number | null;
  certificates?: string[] | null;
}

export const ScheduleSidebar: React.FC<ScheduleSidebarProps> = ({ technicianCode }) => {
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!technicianCode) return;
    setLoading(true);
    // Lấy 14 ngày tới để tìm 4 ngày gần nhất có lịch
    const from = toIsoDate(new Date());
    const to   = toIsoDate(addDays(new Date(), 13));
    scheduleService
      .getPublicSlots(technicianCode, from, to)
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [technicianCode]);

  // Gom slot theo ngày, lấy 4 ngày gần nhất có lịch
  const dayMap = new Map<string, ScheduleSlot[]>();
  for (const slot of slots) {
    const key = slot.startTime.slice(0, 10); // "2025-06-20"
    if (!dayMap.has(key)) dayMap.set(key, []);
    dayMap.get(key)!.push(slot);
  }

  // Sắp xếp ngày tăng dần, lấy 4 ngày đầu
  const upcomingDays = [...dayMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 4);

  return (
    <div className="pc-widget-card">
      <h3 className="widget-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        Lịch nhận việc gần nhất
      </h3>

      {loading && (
        <p className="sw-loading">Đang tải...</p>
      )}

      {!loading && upcomingDays.length === 0 && (
        <p className="sw-empty">
          {technicianCode ? 'Chưa có lịch trong 2 tuần tới.' : 'Không có dữ liệu.'}
        </p>
      )}

      {!loading && upcomingDays.length > 0 && (
        <div className="schedule-grid">
          {upcomingDays.map(([dateKey, daySlots]) => {
            const d = new Date(dateKey + 'T00:00:00');
            const dayLabel = DAY_NAMES[d.getDay()];
            const dateLabel = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            // Hiển thị khung giờ slot đầu tiên trong ngày
            const firstSlot = daySlots[0];
            const timeLabel = formatTimeRange(firstSlot.startTime, firstSlot.endTime);
            const hasMore = daySlots.length > 1;

            return (
              <div key={dateKey} className="schedule-box schedule-box--busy">
                <span className="sc-day">{dayLabel}, {dateLabel}</span>
                <span className="sc-time sc-time--busy">{timeLabel}</span>
                {hasMore && (
                  <span className="sc-more">+{daySlots.length - 1} lịch nữa</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── VerificationSidebar ─────────────────────────────────────────────────────

export const VerificationSidebar: React.FC<VerificationSidebarProps> = ({
  verificationStatus,
  yearsExperience,
  certificates,
}) => {
  const isVerified = verificationStatus === 'verified';

  return (
    <div className="pc-widget-card">
      <h3 className="widget-title">Chứng chỉ &amp; Xác minh</h3>
      <ul className="verification-list">
        <li>
          <div className={`icon-wrapper ${isVerified ? 'orange-bg' : ''}`}>
            <RegistrationIcon size={16} className="text-orange-500" />
          </div>
          <span>{isVerified ? 'Đã xác minh CMND/CCCD' : 'Chưa xác minh danh tính'}</span>
        </li>

        {yearsExperience != null && (
          <li>
            <div className="icon-wrapper orange-bg">
              <AwardIcon size={16} className="text-orange-500" />
            </div>
            <span>{yearsExperience} năm kinh nghiệm</span>
          </li>
        )}

        {certificates && certificates.length > 0 ? (
          certificates.map((url, i) => (
            <li key={i}>
              <div className="icon-wrapper orange-bg">
                <AwardIcon size={16} className="text-orange-500" />
              </div>
              {/* Nếu URL là ảnh thì hiển thị ảnh, nếu là link thì hiển thị link */}
              {/\.(jpg|jpeg|png|webp|gif)$/i.test(url) ? (
                <a href={url} target="_blank" rel="noreferrer">
                  <img src={url} alt={`Chứng chỉ ${i + 1}`}
                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, marginTop: 4 }} />
                </a>
              ) : (
                <a href={url} target="_blank" rel="noreferrer">Chứng chỉ #{i + 1}</a>
              )}
            </li>
          ))
        ) : (
          <li>
            <div className="icon-wrapper">
              <AwardIcon size={16} />
            </div>
            <span style={{ color: 'var(--text-muted, #9ca3af)' }}>Chưa có chứng chỉ</span>
          </li>
        )}
      </ul>
    </div>
  );
};

// ─── MapSidebar ───────────────────────────────────────────────────────────────

interface MapSidebarProps {
  location?: string | null;
}

export const MapSidebar: React.FC<MapSidebarProps> = ({ location }) => {
  return (
    <div className="map-widget-card"
      style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80)' }}>
      <div className="map-overlay" />
      <div className="map-pin">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="#e02424" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#000C33' }}>
          Hoạt động tại {location || 'Chưa cập nhật'}  {/* ← SỬA: dùng data thật */}
        </span>
      </div>
    </div>
  );
};