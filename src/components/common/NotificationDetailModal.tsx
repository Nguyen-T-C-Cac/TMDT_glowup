import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Bell } from 'lucide-react';
import { getNotificationById, markNotificationAsRead, type NotificationItem } from '../../services/notificationService';
import './NotificationDetailModal.css';

interface Props {
  notificationId: string;
  onClose: () => void;
}

const typeLabel: Record<string, string> = {
  info: 'Thông tin',
  warning: 'Cảnh báo',
  'status-update': 'Cập nhật trạng thái',
  system: 'Hệ thống',
};

const formatFullDate = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const NotificationDetailModal: React.FC<Props> = ({ notificationId, onClose }) => {
  const [notification, setNotification] = useState<NotificationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getNotificationById(notificationId)
      .then((data) => {
        if (cancelled) return;
        setNotification(data);
        if (!data.isRead) {
          markNotificationAsRead(data.id).catch(() => {});
        }
      })
      .catch(() => {
        if (!cancelled) setError('Không thể tải thông báo.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [notificationId]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return createPortal(
    <div className="notif-modal-overlay" onClick={onClose}>
      <div className="notif-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="notif-modal-header">
          <h2 className="notif-modal-heading">Chi tiết thông báo</h2>
          <button type="button" className="notif-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="notif-modal-body">
          {loading && <p className="notif-modal-status">Đang tải...</p>}

          {error && (
            <div className="notif-modal-error">
              <Bell size={32} />
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && notification && (
            <>
              <div className="notif-modal-type-badge">
                {notification.data?.type === 'warning'
                  ? 'Cảnh báo'
                  : typeLabel[notification.type] || notification.type}
              </div>
              <h3 className="notif-modal-title">{notification.title}</h3>
              <div className="notif-modal-meta">
                {formatFullDate(notification.createdAt)}
              </div>
              {notification.body ? (
                <div
                  className="notif-modal-content"
                  dangerouslySetInnerHTML={{ __html: notification.body }}
                />
              ) : (
                <p className="notif-modal-no-content">Không có nội dung chi tiết.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NotificationDetailModal;
