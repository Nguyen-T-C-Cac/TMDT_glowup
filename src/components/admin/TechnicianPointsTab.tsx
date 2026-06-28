import React, { useCallback, useEffect, useState } from 'react';
import Modal from '../common/Modal';
import { useToast } from '../common/Toast';
import {
  adjustTechnicianPoints,
  getTechnicianPoints,
  type TechnicianPoints,
} from '../../services/adminRefundPointsService';
import './TechnicianPointsTab.css';

const typeLabels: Record<string, string> = {
  order_completed: 'Đơn hoàn thành',
  refund_reversal: 'Hoàn/huỷ đơn',
  admin_adjust: 'Admin điều chỉnh',
};

const formatDateTime = (value: string) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('vi-VN');
};

interface Props {
  technicianCode?: string;
}

export const TechnicianPointsTab: React.FC<Props> = ({ technicianCode }) => {
  const { showToast } = useToast();
  const [data, setData] = useState<TechnicianPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!technicianCode) {
      setError('Không xác định được mã thợ');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setData(await getTechnicianPoints(technicianCode));
    } catch (err: any) {
      setError(err?.message || 'Không thể tải điểm thưởng');
    } finally {
      setLoading(false);
    }
  }, [technicianCode]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async () => {
    const numericDelta = Number(delta);
    if (!Number.isInteger(numericDelta) || numericDelta === 0) {
      showToast('Nhập số điểm điều chỉnh (khác 0, có thể âm)', 'error');
      return;
    }
    try {
      setSubmitting(true);
      const updated = await adjustTechnicianPoints(technicianCode!, numericDelta, reason.trim());
      setData(updated);
      showToast(`Đã điều chỉnh ${numericDelta > 0 ? '+' : ''}${numericDelta} điểm. Tổng: ${updated.rewardPoints}`, 'success');
      setModalOpen(false);
      setDelta('');
      setReason('');
    } catch (err: any) {
      showToast(err?.message || 'Điều chỉnh điểm thất bại', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="tpt-card"><div className="tpt-state">Đang tải điểm thưởng...</div></div>;
  }
  if (error) {
    return <div className="tpt-card"><div className="tpt-state tpt-state--error">{error}</div></div>;
  }

  return (
    <div className="tpt-card">
      <div className="tpt-summary">
        <div>
          <div className="tpt-label">Điểm tích luỹ</div>
          <div className="tpt-points">⭐ {data?.rewardPoints.toLocaleString('vi-VN') ?? 0}</div>
        </div>
        <button type="button" className="tpt-adjust-btn" onClick={() => setModalOpen(true)}>
          Điều chỉnh điểm
        </button>
      </div>

      <h4 className="tpt-history-title">Lịch sử điểm</h4>
      <div className="tpt-table-wrap">
        <table className="tpt-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Loại</th>
              <th>Điểm</th>
              <th>Số dư sau</th>
              <th>Đơn</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {(data?.history ?? []).map((item, idx) => (
              <tr key={idx}>
                <td>{formatDateTime(item.createdAt)}</td>
                <td>{typeLabels[item.type] ?? item.type}</td>
                <td className={item.points < 0 ? 'tpt-neg' : 'tpt-pos'}>
                  {item.points > 0 ? `+${item.points}` : item.points}
                </td>
                <td>{item.balanceAfter.toLocaleString('vi-VN')}</td>
                <td className="tpt-mono">{item.orderCode ?? '—'}</td>
                <td>{item.note ?? '—'}</td>
              </tr>
            ))}
            {(data?.history ?? []).length === 0 && (
              <tr><td colSpan={6} className="tpt-state">Chưa có giao dịch điểm nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="tpt-modal">
          <h3 className="tpt-modal-title">Điều chỉnh điểm thưởng</h3>
          <p className="tpt-modal-sub">Nhập số điểm cộng thêm (dương) hoặc trừ bớt (âm). Điểm sau điều chỉnh không được âm.</p>
          <label className="tpt-field">
            <span>Số điểm (+/−)</span>
            <input
              type="number"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              placeholder="VD: 50 hoặc -20"
            />
          </label>
          <label className="tpt-field">
            <span>Lý do</span>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Lý do điều chỉnh"
              maxLength={255}
            />
          </label>
          <div className="tpt-modal-actions">
            <button type="button" className="tpt-btn-ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Huỷ
            </button>
            <button type="button" className="tpt-btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Xác nhận'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TechnicianPointsTab;
