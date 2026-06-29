import React, { useState, useEffect, useCallback } from 'react';
import { scheduleService } from '../services/scheduleService';
import type { ScheduleSlot } from '../types/schedule';
import './TechnicianSchedulePage.css';

// ─── Constants ───────────────────────────────────────────────────────────────

const HOUR_START = 6;   // 06:00
const HOUR_END   = 22;  // 22:00
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
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

/** Tính slot nằm trong ô (dayIndex 0=T2, hour 6..21) */
function getSlotsInCell(slots: ScheduleSlot[], dayDate: Date, hour: number): ScheduleSlot[] {
  return slots.filter((s) => {
    const start = new Date(s.startTime);
    const end   = new Date(s.endTime);
    const cellStart = new Date(dayDate);
    cellStart.setHours(hour, 0, 0, 0);
    const cellEnd = new Date(dayDate);
    cellEnd.setHours(hour + 1, 0, 0, 0);
    // slot giao với ô giờ này
    return start < cellEnd && end > cellStart;
  });
}

// ─── Add Slot Modal ───────────────────────────────────────────────────────────

interface AddSlotModalProps {
  defaultDate: string;
  defaultHour: number;
  onClose: () => void;
  onSaved: () => void;
}

const AddSlotModal: React.FC<AddSlotModalProps> = ({ defaultDate, defaultHour, onClose, onSaved }) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const [startDate, setStartDate] = useState(defaultDate);
  const [startHour, setStartHour] = useState(String(defaultHour));
  const [startMin,  setStartMin]  = useState('00');
  const [endHour,   setEndHour]   = useState(String(Math.min(defaultHour + 1, 21)));
  const [endMin,    setEndMin]    = useState('00');
  const [title, setTitle]   = useState('');
  const [note,  setNote]    = useState('');
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const handleSave = async () => {
    setError('');
    const startTime = `${startDate}T${pad(Number(startHour))}:${pad(Number(startMin))}:00`;
    const endTime   = `${startDate}T${pad(Number(endHour))}:${pad(Number(endMin))}:00`;
    if (endTime <= startTime) {
      setError('Giờ kết thúc phải sau giờ bắt đầu.');
      return;
    }
    try {
      setSaving(true);
      await scheduleService.createSlot({ startTime, endTime, title: title || undefined, note: note || undefined });
      onSaved();
    } catch {
      setError('Không thể lưu lịch. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tsp-modal-overlay" onClick={onClose}>
      <div className="tsp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tsp-modal-header">
          <h3>Thêm lịch làm việc</h3>
          <button className="tsp-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="tsp-modal-body">
          <label className="tsp-label">Ngày</label>
          <input
            type="date"
            className="tsp-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <div className="tsp-time-row">
            <div>
              <label className="tsp-label">Từ</label>
              <div className="tsp-time-inputs">
                <select className="tsp-select" value={startHour} onChange={(e) => setStartHour(e.target.value)}>
                  {HOURS.map((h) => <option key={h} value={h}>{pad(h)}h</option>)}
                </select>
                <select className="tsp-select" value={startMin} onChange={(e) => setStartMin(e.target.value)}>
                  {['00','15','30','45'].map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="tsp-label">Đến</label>
              <div className="tsp-time-inputs">
                <select className="tsp-select" value={endHour} onChange={(e) => setEndHour(e.target.value)}>
                  {HOURS.map((h) => <option key={h} value={h}>{pad(h)}h</option>)}
                </select>
                <select className="tsp-select" value={endMin} onChange={(e) => setEndMin(e.target.value)}>
                  {['00','15','30','45'].map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

          <label className="tsp-label">Tiêu đề (tuỳ chọn)</label>
          <input
            type="text"
            className="tsp-input"
            placeholder="Vd: Giữ lịch cá nhân..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="tsp-label">Ghi chú</label>
          <textarea
            className="tsp-input tsp-textarea"
            placeholder="Ghi chú thêm..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {error && <p className="tsp-error">{error}</p>}
        </div>

        <div className="tsp-modal-footer">
          <button className="tsp-btn-cancel" onClick={onClose}>Huỷ</button>
          <button className="tsp-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu lịch'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Slot Detail Popup ────────────────────────────────────────────────────────

interface SlotPopupProps {
  slot: ScheduleSlot;
  onClose: () => void;
  onDeleted: () => void;
}

const SlotPopup: React.FC<SlotPopupProps> = ({ slot, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Xoá lịch này?')) return;
    try {
      setDeleting(true);
      await scheduleService.deleteSlot(slot.id);
      onDeleted();
    } catch {
      alert('Không thể xoá. Vui lòng thử lại.');
    } finally {
      setDeleting(false);
    }
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="tsp-modal-overlay" onClick={onClose}>
      <div className="tsp-modal tsp-modal--sm" onClick={(e) => e.stopPropagation()}>
        <div className="tsp-modal-header">
          <h3>{slot.title ?? 'Chi tiết lịch'}</h3>
          <button className="tsp-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="tsp-modal-body">
          <div className="tsp-detail-row">
            <span className="tsp-detail-icon">🕐</span>
            <span>{fmt(slot.startTime)} – {fmt(slot.endTime)}</span>
          </div>

          {slot.slotType === 'ORDER' ? (
            <>
              <span className="tsp-badge-order">Từ đơn hàng #{slot.orderId}</span>
              {slot.customerName && (
                <div className="tsp-detail-row">
                  <span className="tsp-detail-icon">👤</span>
                  <span>{slot.customerName}{slot.customerPhone && ` · ${slot.customerPhone}`}</span>
                </div>
              )}
              {slot.serviceDescription && (
                <div className="tsp-detail-row">
                  <span className="tsp-detail-icon">🔧</span>
                  <span>{slot.serviceDescription}</span>
                </div>
              )}
              {slot.address && (
                <div className="tsp-detail-row">
                  <span className="tsp-detail-icon">📍</span>
                  <span>{slot.address}</span>
                </div>
              )}
              <p className="tsp-note-order">Lịch này gắn với đơn hàng. Hủy đơn để gỡ lịch.</p>
            </>
          ) : (
            <>
              <span className="tsp-badge-manual">Lịch thủ công</span>
              {slot.address && (
                <div className="tsp-detail-row">
                  <span className="tsp-detail-icon">📍</span>
                  <span>{slot.address}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="tsp-modal-footer">
          <button className="tsp-btn-cancel" onClick={onClose}>Đóng</button>
          {slot.slotType === 'MANUAL' && (
            <button className="tsp-btn-delete" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Đang xoá...' : 'Xoá lịch'}
            </button>
          )}
          {slot.slotType === 'ORDER' && slot.address && (
            <a
              className="tsp-btn-save"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(slot.address)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Chỉ đường
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const TechnicianSchedulePage: React.FC = () => {
  const [monday, setMonday] = useState<Date>(() => getMondayOfWeek(new Date()));
  const [slots, setSlots]   = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [addModal, setAddModal]     = useState<{ date: string; hour: number } | null>(null);
  const [detailSlot, setDetailSlot] = useState<ScheduleSlot | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  const loadSlots = useCallback(async () => {
    setLoading(true);
    try {
      const from = toIsoDate(monday);
      const to   = toIsoDate(addDays(monday, 6));
      const data = await scheduleService.getMySlots(from, to);
      setSlots(data);
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [monday]);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  const prevWeek = () => setMonday((d) => addDays(d, -7));
  const nextWeek = () => setMonday((d) => addDays(d, 7));
  const goToday  = () => setMonday(getMondayOfWeek(new Date()));

  const handleCellClick = (dayDate: Date, hour: number) => {
    const cellSlots = getSlotsInCell(slots, dayDate, hour);
    if (cellSlots.length > 0) {
      setDetailSlot(cellSlots[0]);
    } else {
      setAddModal({ date: toIsoDate(dayDate), hour });
    }
  };

  const monthLabel = monday.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  return (
    <div className="tsp-page">
      {/* ── Header ── */}
      <div className="tsp-header">
        <div>
          <h1 className="tsp-title">Thời gian biểu</h1>
          <p className="tsp-subtitle">Quản lý lịch làm việc trong tuần</p>
        </div>
        <button
          className="tsp-btn-add"
          onClick={() => setAddModal({ date: toIsoDate(new Date()), hour: 8 })}
        >
          + Thêm lịch
        </button>
      </div>

      {/* ── Week navigation ── */}
      <div className="tsp-nav">
        <button className="tsp-nav-btn" onClick={prevWeek}>‹</button>
        <div className="tsp-nav-center">
          <span className="tsp-nav-month">{monthLabel}</span>
          <button className="tsp-today-btn" onClick={goToday}>Hôm nay</button>
        </div>
        <button className="tsp-nav-btn" onClick={nextWeek}>›</button>
      </div>

      {/* ── Legend ── */}
      <div className="tsp-legend">
        <span className="tsp-legend-dot tsp-legend-dot--order" />
        <span>Đơn hàng</span>
        <span className="tsp-legend-dot tsp-legend-dot--manual" />
        <span>Lịch thủ công</span>
        <span className="tsp-legend-hint">Bấm ô trống để thêm · Bấm lịch để xem chi tiết</span>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="tsp-loading">⏳ Đang tải lịch...</div>
      ) : (
        <div className="tsp-grid-wrapper">
          <table className="tsp-grid">
            <thead>
              <tr>
                <th className="tsp-th-hour" />
                {weekDays.map((d, i) => (
                  <th key={i} className={`tsp-th-day ${isToday(d) ? 'tsp-today-col' : ''}`}>
                    <span className="tsp-day-label">{DAY_LABELS[i]}</span>
                    <span className={`tsp-day-date ${isToday(d) ? 'tsp-today-badge' : ''}`}>
                      {formatDateHeader(d)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour} className="tsp-row">
                  <td className="tsp-td-hour">{String(hour).padStart(2, '0')}:00</td>
                  {weekDays.map((dayDate, di) => {
                    const cellSlots = getSlotsInCell(slots, dayDate, hour);
                    const hasSlot   = cellSlots.length > 0;
                    const isOrder   = cellSlots.some((s) => s.slotType === 'ORDER');
                    return (
                      <td
                        key={di}
                        className={[
                          'tsp-td-cell',
                          isToday(dayDate) ? 'tsp-today-col' : '',
                          hasSlot ? (isOrder ? 'tsp-cell-order' : 'tsp-cell-manual') : 'tsp-cell-empty',
                        ].join(' ')}
                        onClick={() => handleCellClick(dayDate, hour)}
                        title={
                          cellSlots.length > 0
                            ? cellSlots[0].title ?? (isOrder ? 'Đơn hàng' : 'Lịch làm việc')
                            : 'Bấm để thêm lịch'
                        }
                      >
                        {cellSlots.length > 0 && (
                          <div className="tsp-cell-content">
                            <span className="tsp-cell-label">
                              {cellSlots[0].title ??
                                (isOrder ? `Đơn #${cellSlots[0].orderId ?? ''}` : '📌 Lịch')}
                            </span>
                            {isOrder && cellSlots[0].customerName && (
                              <span className="tsp-cell-sub">{cellSlots[0].customerName}</span>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modals ── */}
      {addModal && (
        <AddSlotModal
          defaultDate={addModal.date}
          defaultHour={addModal.hour}
          onClose={() => setAddModal(null)}
          onSaved={() => { setAddModal(null); loadSlots(); }}
        />
      )}

      {detailSlot && (
        <SlotPopup
          slot={detailSlot}
          onClose={() => setDetailSlot(null)}
          onDeleted={() => { setDetailSlot(null); loadSlots(); }}
        />
      )}
    </div>
  );
};

export default TechnicianSchedulePage;