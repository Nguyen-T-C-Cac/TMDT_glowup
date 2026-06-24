import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../common/Modal';
import { AlertTriangle, X, CheckCircle, Loader } from 'lucide-react';
import { sendAdminNotification } from '../../services/notificationService';
import { updateAdminUserStatus, getAdminUserById } from '../../services/adminUserService';
import './css/warningModal.css';

type WarningLevel = 'low' | 'medium' | 'high';

interface WarningPreset {
  value: string;
  label: string;
  description: string;
}

const WARNING_PRESETS: WarningPreset[] = [
  { value: 'cancel_many', label: 'Hủy đơn nhiều lần', description: 'Hệ thống ghi nhận bạn đã hủy đơn nhiều lần trong thời gian gần đây. Vui lòng chỉ nhận những công việc mà bạn có khả năng thực hiện. Việc hủy đơn liên tục ảnh hưởng đến trải nghiệm của khách hàng và uy tín của bạn trên nền tảng.' },
  { value: 'bad_attitude', label: 'Thái độ phục vụ', description: 'Hệ thống ghi nhận phản ánh từ khách hàng về thái độ phục vụ thiếu chuyên nghiệp của bạn. Vui lòng giữ thái độ lịch sự, tôn trọng và chuyên nghiệp khi làm việc với khách hàng. Đây là lần cảnh báo đầu tiên về vấn đề này.' },
  { value: 'extra_fee', label: 'Thu phí ngoài thỏa thuận', description: 'Hệ thống ghi nhận bạn đã tự ý thu thêm phí ngoài thỏa thuận với khách hàng. Mọi khoản phí phát sinh cần được thông báo và xác nhận qua hệ thống trước khi thực hiện. Vui lòng tuân thủ quy định về minh bạch tài chính.' },
  { value: 'poor_quality', label: 'Chất lượng dịch vụ', description: 'Hệ thống ghi nhận nhiều phản ánh từ khách hàng về chất lượng dịch vụ chưa đạt yêu cầu. Vui lòng nâng cao tay nghề và đảm bảo chất lượng công việc trước khi bàn giao cho khách hàng.' },
  { value: 'policy_violation', label: 'Vi phạm chính sách', description: 'Hệ thống ghi nhận bạn đã có hành vi vi phạm chính sách hoạt động của nền tảng. Vui lòng xem lại các điều khoản và quy định để đảm bảo tuân thủ đúng. Mọi vi phạm sẽ bị xử lý theo quy chế của hệ thống.' },
  { value: 'no_show', label: 'Không đến đúng giờ', description: 'Hệ thống ghi nhận bạn đã không đến đúng giờ hoặc không đến làm việc mà không báo trước cho khách hàng. Vui lòng sắp xếp thời gian hợp lý và thông báo kịp thời nếu có thay đổi lịch làm việc.' },
  { value: 'other', label: 'Khác', description: '' },
];

const LEVEL_LABELS: Record<WarningLevel, string> = {
  low: 'Nhẹ',
  medium: 'Trung bình',
  high: 'Nghiêm trọng',
};

interface WarningModalProps {
  open: boolean;
  onClose: () => void;
  technician: {
    id: string | number;
    name: string;
    code?: string;
  };
  onSuccess?: () => void;
}

const WarningModal: React.FC<WarningModalProps> = ({ open, onClose, technician, onSuccess }) => {
  const [level, setLevel] = useState<WarningLevel>('low');
  const [preset, setPreset] = useState('');
  const [content, setContent] = useState('');
  const [lockAccount, setLockAccount] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userCode, setUserCode] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setUserCode(technician.code ?? null);
    if (!technician.code) {
      getAdminUserById(Number(technician.id))
        .then((u) => setUserCode(u.code))
        .catch(() => {});
    }
  }, [open, technician.id, technician.code]);

  const selectedPreset = useMemo(
    () => WARNING_PRESETS.find((p) => p.value === preset),
    [preset]
  );

  const handlePresetChange = (value: string) => {
    setPreset(value);
    const found = WARNING_PRESETS.find((p) => p.value === value);
    if (found && found.description) {
      setContent(found.description);
    } else {
      setContent('');
    }
  };

  const handleSubmit = async () => {
    if (!preset || !content.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const selectedLabel = selectedPreset?.label || preset;
      const title = `[Cảnh báo - ${LEVEL_LABELS[level]}] ${selectedLabel}`;

      await sendAdminNotification({
        title,
        body: content.trim(),
        recipientCodes: userCode ? [userCode] : [],
        type: 'warning',
      });

      if (lockAccount) {
        await updateAdminUserStatus(Number(technician.id), {
          status: 'locked',
          reason: content.trim(),
        });
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        handleReset();
      }, 1500);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Không thể gửi cảnh báo. Vui lòng thử lại sau.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setLevel('low');
    setPreset('');
    setContent('');
    setLockAccount(false);
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={submitting ? () => {} : handleReset}>
      <div className="warning-modal">
        <header className="warning-header">
          <div className="warning-header-info">
            <h2 className="warning-title">
              <AlertTriangle size={22} />
              GỬI CẢNH BÁO
            </h2>
            <span className="warning-sub">Kỹ thuật viên: {technician.name}</span>
          </div>
          <button className="warning-close-btn" onClick={handleReset} disabled={submitting} aria-label="Đóng">
            <X size={24} />
          </button>
        </header>

        {success ? (
          <div className="warning-success">
            <CheckCircle className="warning-success-icon" size={48} />
            <h3>Đã gửi cảnh báo thành công!</h3>
            <p>Thông báo đã được gửi đến kỹ thuật viên.</p>
          </div>
        ) : (
          <>
            <div className="warning-body">
              {error && <div className="warning-notice warning-notice--error">{error}</div>}

              <div className="warning-field">
                <label className="warning-label">Loại cảnh báo</label>
                <select
                  className="warning-select"
                  value={level}
                  onChange={(e) => setLevel(e.target.value as WarningLevel)}
                  disabled={submitting}
                >
                  <option value="low">Nhẹ</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Nghiêm trọng</option>
                </select>
              </div>

              <div className="warning-field">
                <label className="warning-label">Tiêu đề</label>
                <select
                  className="warning-select"
                  value={preset}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  disabled={submitting}
                >
                  <option value="">-- Chọn tiêu đề --</option>
                  {WARNING_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div className="warning-field">
                <label className="warning-label">Nội dung</label>
                <textarea
                  className="warning-textarea"
                  rows={5}
                  placeholder="Nhập nội dung cảnh báo..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <label className="warning-checkbox">
                <input
                  type="checkbox"
                  checked={lockAccount}
                  onChange={(e) => setLockAccount(e.target.checked)}
                  disabled={submitting}
                />
                <span>Khóa tài khoản kỹ thuật viên</span>
              </label>
            </div>

            <footer className="warning-footer">
              <button className="warning-btn warning-btn--cancel" onClick={handleReset} disabled={submitting}>
                Hủy
              </button>
              <button
                className="warning-btn warning-btn--submit"
                onClick={handleSubmit}
                disabled={!preset || !content.trim() || submitting}
              >
                {submitting ? <Loader size={18} className="warning-spinner" /> : null}
                {submitting ? 'Đang gửi...' : 'Gửi cảnh báo'}
              </button>
            </footer>
          </>
        )}
      </div>
    </Modal>
  );
};

export default WarningModal;
