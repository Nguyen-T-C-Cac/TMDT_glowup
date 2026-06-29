import React, { useState, useEffect, useCallback } from 'react';
import { technicianService } from '../../services/technicianService';
import type { TechnicianSchedule, BookedSlot } from '../../services/technicianService';
import './ScheduleTab.css';

const DAY_NAMES_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const DAY_NAMES_FULL = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const MONTH_NAMES = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

interface ScheduleTabProps {
  technicianId?: string;
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({ technicianId }) => {
  const today = new Date();
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [schedule, setSchedule] = useState<TechnicianSchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<{ date: Date; slots: BookedSlot[] } | null>(null);

  const fetchSchedule = useCallback(async () => {
    if (!technicianId) return;
    setLoading(true);
    try {
      const from = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const to = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      from.setDate(from.getDate() - from.getDay());
      to.setDate(to.getDate() + (6 - to.getDay()));
      const fromStr = from.toISOString().slice(0, 10);
      const toStr = to.toISOString().slice(0, 10);
      const res = await technicianService.getTechnicianSchedule(technicianId, fromStr, toStr);
      if (res.success) setSchedule(res.data);
    } catch (err) {
      console.error('Lỗi khi tải lịch thợ', err);
    } finally {
      setLoading(false);
    }
  }, [technicianId, currentDate]);

  useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

  const getBookedSlotsForDate = (date: Date): BookedSlot[] => {
    if (!schedule?.bookedSlots) return [];
    const dateStr = date.toISOString().slice(0, 10);
    return schedule.bookedSlots.filter(s => s.date === dateStr);
  };

  const getDayStatus = (date: Date): 'available' | 'booked' | 'partial' | 'off' | 'past' | 'none' => {
    const dayOfWeek = date.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayNames[dayOfWeek];
    const weekTime = schedule?.weeklySchedule?.[dayKey];

    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (date < todayStart) return 'past';
    if (!weekTime) return 'off';

    const slots = getBookedSlotsForDate(date);
    if (slots.length > 0) return 'booked';
    return 'available';
  };

  const prevPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    }
    setSelectedDay(null);
  };

  const nextPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    }
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(null);
  };

  const handleDayClick = (date: Date) => {
    const status = getDayStatus(date);
    if (status === 'past' || status === 'off' || status === 'none') return;
    const slots = getBookedSlotsForDate(date);
    setSelectedDay({ date, slots });
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: React.ReactNode[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      cells.push(<div key={`prev-${d}`} className="cal-day cal-day-other">{d}</div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const status = getDayStatus(date);
      const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      const isSelected = selectedDay?.date.toDateString() === date.toDateString();
      cells.push(
        <div
          key={`day-${d}`}
          className={`cal-day cal-day-${status}${isToday ? ' cal-today' : ''}${isSelected ? ' cal-selected' : ''}`}
          onClick={() => handleDayClick(date)}
        >
          <span className="cal-day-num">{d}</span>
          {status === 'booked' && <span className="cal-day-dot booked" />}
          {status === 'available' && <span className="cal-day-dot available" />}
          {status === 'off' && <span className="cal-day-dot off" />}
        </div>
      );
    }

    const remaining = 7 - ((firstDay + daysInMonth) % 7 || 7);
    for (let d = 1; d <= remaining; d++) {
      cells.push(<div key={`next-${d}`} className="cal-day cal-day-other">{d}</div>);
    }

    return cells;
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const days: React.ReactNode[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const status = getDayStatus(date);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDay?.date.toDateString() === date.toDateString();
      days.push(
        <div
          key={`week-${i}`}
          className={`cal-day cal-day-${status}${isToday ? ' cal-today' : ''}${isSelected ? ' cal-selected' : ''}`}
          onClick={() => handleDayClick(date)}
        >
          <span className="cal-day-name">{DAY_NAMES_VI[date.getDay()]}</span>
          <span className="cal-day-num">{date.getDate()}</span>
          {status === 'booked' && <span className="cal-day-dot booked" />}
          {status === 'available' && <span className="cal-day-dot available" />}
        </div>
      );
    }
    return days;
  };

  const getWeeklyScheduleText = () => {
    if (!schedule?.weeklySchedule) return null;
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return (
      <div className="weekly-schedule-summary">
        <h4 className="ws-title">Lịch làm việc hàng tuần</h4>
        <div className="ws-grid">
          {dayNames.map((key, i) => {
            const time = schedule.weeklySchedule[key];
            return (
              <div key={key} className={`ws-item${!time ? ' ws-off' : ''}`}>
                <span className="ws-day">{DAY_NAMES_FULL[i]}</span>
                <span className="ws-time">{time || 'Nghỉ'}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const weekDateRange = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    return `${fmt(start)} - ${fmt(end)}`;
  };

  return (
    <div className="profile-card">
      <h2 className="pc-title">Lịch làm việc</h2>
      <p className="pc-text">Xem lịch trình làm việc của thợ và những khung giờ đã có lịch hẹn.</p>

      {getWeeklyScheduleText()}

      <div className="cal-toolbar">
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={prevPeriod}>&lsaquo;</button>
          <span className="cal-title">
            {viewMode === 'month'
              ? `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              : weekDateRange()
            }
          </span>
          <button className="cal-nav-btn" onClick={nextPeriod}>&rsaquo;</button>
          <button className="cal-today-btn" onClick={goToToday}>Hôm nay</button>
        </div>
        <div className="cal-toggle">
          <button
            className={`cal-toggle-btn${viewMode === 'month' ? ' active' : ''}`}
            onClick={() => setViewMode('month')}
          >Tháng</button>
          <button
            className={`cal-toggle-btn${viewMode === 'week' ? ' active' : ''}`}
            onClick={() => setViewMode('week')}
          >Tuần</button>
        </div>
      </div>

      {loading && <div className="cal-loading">Đang tải...</div>}

      {!loading && (
        <>
          <div className="cal-legend">
            <span className="legend-item"><span className="legend-dot available" /> Còn trống</span>
            <span className="legend-item"><span className="legend-dot booked" /> Đã đặt</span>
            <span className="legend-item"><span className="legend-dot off" /> Nghỉ</span>
          </div>

          <div className="cal-header">
            {DAY_NAMES_VI.map(name => <div key={name} className="cal-header-cell">{name}</div>)}
          </div>

          <div className={`cal-grid ${viewMode === 'week' ? 'cal-week-grid' : ''}`}>
            {viewMode === 'month' ? renderMonthView() : renderWeekView()}
          </div>

          {selectedDay && (
            <div className="cal-day-detail">
              <h4 className="cal-day-detail-title">
                {DAY_NAMES_FULL[selectedDay.date.getDay()]}, {selectedDay.date.getDate()}/{selectedDay.date.getMonth() + 1}/{selectedDay.date.getFullYear()}
              </h4>
              {selectedDay.slots.length === 0 ? (
                <p className="cal-day-detail-empty">Khung giờ còn trống</p>
              ) : (
                <div className="cal-day-slots">
                  {selectedDay.slots.map(slot => (
                    <div key={slot.orderCode} className="slot-item">
                      <span className="slot-time">{slot.startTime?.slice(0, 5)} - {slot.endTime?.slice(0, 5)}</span>
                      <span className="slot-code">Đơn #{slot.orderCode}</span>
                      <span className={`slot-status slot-${slot.status}`}>
                        {slot.status === 'scheduled' ? 'Đã lên lịch' :
                         slot.status === 'in-progress' ? 'Đang thực hiện' :
                         slot.status === 'completed' ? 'Đã hoàn thành' : slot.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
