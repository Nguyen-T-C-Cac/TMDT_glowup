import React, { useState, useEffect, useCallback } from 'react';
import { scheduleService } from '../../services/scheduleService';
import type { ScheduleSlot } from '../../types/schedule';
import './ScheduleTab.css';

// ─── Constants ────────────────────────────────────────────────────────────────

const HOUR_START = 6;
const HOUR_END   = 22;
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDateHeader(date: Date): string {
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

/** Kiểm tra slot có giao với ô (dayDate, hour) không */
function isSlotInCell(slot: ScheduleSlot, dayDate: Date, hour: number): boolean {
  const start = new Date(slot.startTime);
  const end   = new Date(slot.endTime);
  const cellStart = new Date(dayDate); cellStart.setHours(hour, 0, 0, 0);
  const cellEnd   = new Date(dayDate); cellEnd.setHours(hour + 1, 0, 0, 0);
  return start < cellEnd && end > cellStart;
}

function getSlotsInCell(slots: ScheduleSlot[], dayDate: Date, hour: number): ScheduleSlot[] {
  return slots.filter((s) => isSlotInCell(s, dayDate, hour));
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ScheduleTabProps {
  /** technicianCode — lấy từ URL ?id= trong ProviderProfile */
  technicianCode?: string | null;
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({ technicianCode }) => {
  const [monday, setMonday] = useState<Date>(() => getMondayOfWeek(new Date()));
  const [slots, setSlots]   = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(false);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  const loadSlots = useCallback(async () => {
    if (!technicianCode) return;
    setLoading(true);
    setError(false);
    try {
      const from = toIsoDate(monday);
      const to   = toIsoDate(addDays(monday, 6));
      const data = await scheduleService.getPublicSlots(technicianCode, from, to);
      setSlots(data);
    } catch {
      setError(true);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [technicianCode, monday]);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  const prevWeek = () => setMonday((d) => addDays(d, -7));
  const nextWeek = () => setMonday((d) => addDays(d, 7));
  const goToday  = () => setMonday(getMondayOfWeek(new Date()));

  const monthLabel = monday.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  // Tổng hợp trạng thái ngày — dùng cho list view dưới grid
  const getDayStatus = (dayDate: Date): 'free' | 'busy' | 'partial' => {
    const daySlots = slots.filter((s) => {
      const d = new Date(s.startTime);
      return (
        d.getDate() === dayDate.getDate() &&
        d.getMonth() === dayDate.getMonth() &&
        d.getFullYear() === dayDate.getFullYear()
      );
    });
    if (daySlots.length === 0) return 'free';
    // Tổng giờ bận (tính theo số ô giờ bị lấp)
    const busyHours = HOURS.filter((h) => getSlotsInCell(daySlots, dayDate, h).length > 0).length;
    return busyHours >= 8 ? 'busy' : 'partial';
  };

  if (!technicianCode) {
    return (
      <div className="profile-card">
        <h2 className="pc-title">Lịch làm việc</h2>
        <p className="pc-text stab-muted">Không tìm thấy thông tin thợ.</p>
      </div>
    );
  }

  return (
    <div className="profile-card stab-wrapper">
      {/* ── Tiêu đề + legend ── */}
      <div className="stab-header">
        <div>
          <h2 className="pc-title">Lịch làm việc trong tuần</h2>
          <p className="pc-text stab-muted">
            Các khung giờ <strong>đã có lịch</strong> của thợ trong tuần này.
          </p>
        </div>
      </div>

      <div className="stab-legend">
        <span className="stab-dot stab-dot--busy" />
        <span>Đã có lịch</span>
        <span className="stab-dot stab-dot--free" />
        <span>Còn trống</span>
        <span className="stab-dot stab-dot--today" />
        <span>Hôm nay</span>
      </div>

      {/* ── Điều hướng tuần ── */}
      <div className="stab-nav">
        <button className="stab-nav-btn" onClick={prevWeek}>‹</button>
        <div className="stab-nav-center">
          <span className="stab-nav-month">{monthLabel}</span>
          <button className="stab-today-btn" onClick={goToday}>Tuần này</button>
        </div>
        <button className="stab-nav-btn" onClick={nextWeek}>›</button>
      </div>

      {/* ── Grid thời gian biểu ── */}
      {loading ? (
        <div className="stab-loading">Đang tải lịch...</div>
      ) : error ? (
        <div className="stab-loading stab-error">
          Không thể tải lịch. <button className="stab-retry" onClick={loadSlots}>Thử lại</button>
        </div>
      ) : (
        <>
          <div className="stab-grid-wrapper">
            <table className="stab-grid">
              <thead>
                <tr>
                  <th className="stab-th-hour" />
                  {weekDays.map((d, i) => (
                    <th
                      key={i}
                      className={`stab-th-day ${isToday(d) ? 'stab-today-col' : ''}`}
                    >
                      <span className="stab-day-label">{DAY_LABELS[i]}</span>
                      <span className={`stab-day-date ${isToday(d) ? 'stab-today-badge' : ''}`}>
                        {formatDateHeader(d)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {HOURS.map((hour) => (
                  <tr key={hour}>
                    <td className="stab-td-hour">{String(hour).padStart(2, '0')}:00</td>
                    {weekDays.map((dayDate, di) => {
                      const busy = getSlotsInCell(slots, dayDate, hour).length > 0;
                      return (
                        <td
                          key={di}
                          className={[
                            'stab-td-cell',
                            isToday(dayDate) ? 'stab-today-col' : '',
                            busy ? 'stab-cell-busy' : 'stab-cell-free',
                          ].join(' ')}
                          title={busy ? 'Đã có lịch' : 'Còn trống'}
                        >
                          {busy && <div className="stab-busy-bar" />}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Tổng hợp theo ngày (list view) ── */}
          <div className="stab-day-list">
            <p className="stab-day-list-title">Tổng quan tuần</p>
            {weekDays.map((dayDate, i) => {
              const status = getDayStatus(dayDate);
              const isPast = dayDate < new Date(new Date().setHours(0,0,0,0));
              const busyCount = HOURS.filter(
                (h) => getSlotsInCell(slots, dayDate, h).length > 0
              ).length;

              return (
                <div
                  key={i}
                  className={`stab-day-row ${isPast ? 'stab-day-past' : ''} ${isToday(dayDate) ? 'stab-day-today' : ''}`}
                >
                  <div className="stab-day-info">
                    <span className="stab-day-name">
                      {isToday(dayDate) ? '📌 ' : ''}{DAY_LABELS[i]}, {formatDateHeader(dayDate)}
                    </span>
                  </div>

                  <div className="stab-day-status">
                    {status === 'free' && (
                      <span className="stab-status-badge stab-status-free">Còn trống</span>
                    )}
                    {status === 'busy' && (
                      <span className="stab-status-badge stab-status-busy">Đã kín lịch</span>
                    )}
                    {status === 'partial' && (
                      <span className="stab-status-badge stab-status-partial">
                        Còn trống {16 - busyCount}h
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {slots.length === 0 && (
            <p className="stab-empty">Thợ chưa có lịch nào trong tuần này.</p>
          )}
        </>
      )}
    </div>
  );
};