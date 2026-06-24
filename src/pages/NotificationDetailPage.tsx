import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { getNotificationById, markNotificationAsRead, type NotificationItem } from '../services/notificationService';
import { getStoredUser } from '../services/auth';
import './NotificationDetailPage.css';

export default function NotificationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<NotificationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = getStoredUser();
  const role = user?.role?.toLowerCase() ?? '';

  const backPath = role === 'technician' ? '/technician' : '/';

  useEffect(() => {
    if (!id) {
      setError('Không tìm thấy thông báo.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    getNotificationById(id)
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
  }, [id]);

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

  if (loading) {
    return (
      <div className="notif-detail-shell">
        <div className="notif-detail-container">
          <p className="notif-detail-loading">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="notif-detail-shell">
        <div className="notif-detail-container">
          <div className="notif-detail-error">
            <Bell size={40} />
            <p>{error || 'Không tìm thấy thông báo.'}</p>
            <button type="button" className="notif-detail-back-btn" onClick={() => navigate(backPath)}>
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const typeLabel: Record<string, string> = {
    info: 'Thông tin',
    warning: 'Cảnh báo',
    'status-update': 'Cập nhật trạng thái',
  };

  return (
    <div className="notif-detail-shell">
      <div className="notif-detail-container">
        <div className="notif-detail-topbar">
          <button type="button" className="notif-detail-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            Quay lại
          </button>
        </div>

        <article className="notif-detail-card">
          <div className="notif-detail-type-badge">
            {typeLabel[notification.type] || notification.type}
          </div>

          <h1 className="notif-detail-title">{notification.title}</h1>

          <div className="notif-detail-meta">
            <span>{formatFullDate(notification.createdAt)}</span>
          </div>

          {notification.body ? (
            <div
              className="notif-detail-body"
              dangerouslySetInnerHTML={{ __html: notification.body }}
            />
          ) : (
            <p className="notif-detail-no-content">Không có nội dung chi tiết.</p>
          )}
        </article>
      </div>
    </div>
  );
}
