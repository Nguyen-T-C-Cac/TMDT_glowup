import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WarningModal from '../modal/WarningModal';
import './AdminSidebarWidgets.css';

export const InternalNotes: React.FC = () => {
  const [note, setNote] = useState('');
  return (
    <div className="asw-card">
      <h4 className="asw-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        Ghi chú nội bộ
      </h4>
      <textarea
        className="asw-textarea"
        placeholder="Nhập ghi chú quản trị viên tại đây... (Chỉ Admin mới có thể xem)"
        value={note}
        onChange={e => setNote(e.target.value)}
        rows={4}
      />
      <button className="asw-btn-save">Lưu ghi chú</button>
    </div>
  );
};

export const SystemStatus: React.FC = () => {
  const today = new Date();
  const timeStr = today.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="asw-card asw-status-card">
      <h4 className="asw-title asw-status-title">Trạng thái hệ thống</h4>
      <div className="asw-status-grid">
        <div className="asw-status-item">
          <span className="asw-status-label">Ngày gia nhập</span>
          <span className="asw-status-value">12/05/2021</span>
        </div>
        <div className="asw-status-item">
          <span className="asw-status-label">Lần cuối hoạt động</span>
          <span className="asw-status-value">Hôm nay, {timeStr}</span>
        </div>
        <div className="asw-status-item">
          <span className="asw-status-label">Thiết bị đăng nhập</span>
          <span className="asw-status-value">iPhone 14 Pro</span>
        </div>
        <div className="asw-status-item">
          <span className="asw-status-label">Bảo hiểm nghề nghiệp</span>
          <span className="asw-status-active">ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

interface SupportWidgetProps {
  user?: {
    id: string | number;
    name: string;
    code?: string;
  };
}

export const SupportWidget: React.FC<SupportWidgetProps> = ({ user }) => {
  const navigate = useNavigate();
  const [warningOpen, setWarningOpen] = useState(false);

  const handleContact = () => {
    if (!user) return;
    navigate('/admin/chat', {
      state: { technicianId: String(user.id) },
    });
  };

  return (
    <>
      <div className="asw-card asw-support-card">
        <div className="asw-support-inner">
          <div className="asw-support-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <div>
            <strong className="asw-support-title">Cần trợ giúp?</strong>
            <a href="#" className="asw-support-link">Liên hệ Support Center</a>
          </div>
        </div>
        {user && (
          <div className="asw-support-actions">
            <button className="asw-btn-contact" onClick={handleContact}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Liên hệ trực tiếp
            </button>
            <button className="asw-btn-warn" onClick={() => setWarningOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              Gửi cảnh báo
            </button>
          </div>
        )}
      </div>

      <WarningModal
        open={warningOpen}
        onClose={() => setWarningOpen(false)}
        technician={{
          id: user?.id ?? '',
          name: user?.name ?? '',
          code: user?.code,
        }}
      />
    </>
  );
};
