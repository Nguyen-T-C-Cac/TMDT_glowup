import React, { useCallback, useEffect, useState } from 'react';
import Modal from '../common/Modal';
import { useToast } from '../common/Toast';
import {
  adjustCommissionWallet,
  getAdminCommissionWallets,
} from '../../services/adminCommissionService';
import './CreditWalletTab.css';

interface Props {
  technicianCode?: string;
}

const formatCurrency = (value: number) =>
  `${value.toLocaleString('vi-VN')} đ`;

export const CreditWalletTab: React.FC<Props> = ({ technicianCode }) => {
  const { showToast } = useToast();
  const [balance, setBalance] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [direction, setDirection] = useState<'topup' | 'deduct'>('topup');
  const [amount, setAmount] = useState('');
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
      const result = await getAdminCommissionWallets({ keyword: technicianCode, size: 5 });
      const match = result.items.find((w) => w.technicianId === technicianCode) ?? result.items[0];
      if (match) {
        setBalance(match.walletBalance);
        setLocked(match.locked);
      } else {
        setBalance(0);
        setLocked(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Không thể tải ví tín dụng');
    } finally {
      setLoading(false);
    }
  }, [technicianCode]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async () => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      showToast('Nhập số tiền lớn hơn 0', 'error');
      return;
    }
    if (!reason.trim()) {
      showToast('Vui lòng nhập lý do điều chỉnh', 'error');
      return;
    }
    try {
      setSubmitting(true);
      const result = await adjustCommissionWallet({
        technicianId: technicianCode!,
        amount: numericAmount,
        direction,
        reason: reason.trim(),
      });
      setBalance(result.newBalance);
      showToast(
        `Đã ${direction === 'topup' ? 'cộng' : 'trừ'} ${formatCurrency(numericAmount)}. Số dư: ${formatCurrency(result.newBalance)}`,
        'success',
      );
      setModalOpen(false);
      setAmount('');
      setReason('');
      // Tải lại để cập nhật trạng thái khoá (BE có thể tự mở/khoá theo số dư).
      load();
    } catch (err: any) {
      showToast(err?.message || 'Điều chỉnh ví thất bại', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="cwt-card"><div className="cwt-state">Đang tải ví tín dụng...</div></div>;
  }
  if (error) {
    return <div className="cwt-card"><div className="cwt-state cwt-state--error">{error}</div></div>;
  }

  const isNegative = (balance ?? 0) < 0;

  return (
    <div className="cwt-card">
      <div className="cwt-summary">
        <div>
          <div className="cwt-label">Số dư ví tín dụng (hoa hồng)</div>
          <div className={`cwt-balance ${isNegative ? 'cwt-balance--neg' : ''}`}>
            {formatCurrency(balance ?? 0)}
          </div>
          {locked && (
            <span className="cwt-locked">🔒 Tài khoản đang bị khoá do ví tín dụng âm</span>
          )}
        </div>
        <button type="button" className="cwt-adjust-btn" onClick={() => setModalOpen(true)}>
          Điều chỉnh ví
        </button>
      </div>

      <p className="cwt-hint">
        Cộng tiền vào ví tín dụng để mở khoá tài khoản thợ khi ví bị âm. Trừ tiền dùng để
        thu hồi phí/hoa hồng. Thao tác trừ sẽ bị chặn nếu khiến số dư nhỏ hơn 0.
      </p>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="cwt-modal">
          <h3 className="cwt-modal-title">Điều chỉnh ví tín dụng</h3>

          <div className="cwt-direction">
            <button
              type="button"
              className={`cwt-dir-btn ${direction === 'topup' ? 'active' : ''}`}
              onClick={() => setDirection('topup')}
            >
              + Cộng tiền
            </button>
            <button
              type="button"
              className={`cwt-dir-btn cwt-dir-btn--deduct ${direction === 'deduct' ? 'active' : ''}`}
              onClick={() => setDirection('deduct')}
            >
              − Trừ tiền
            </button>
          </div>

          <label className="cwt-field">
            <span>Số tiền (đ)</span>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="VD: 50000"
            />
          </label>
          <label className="cwt-field">
            <span>Lý do</span>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Lý do điều chỉnh ví"
              maxLength={255}
            />
          </label>
          <div className="cwt-modal-actions">
            <button type="button" className="cwt-btn-ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Huỷ
            </button>
            <button type="button" className="cwt-btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Xác nhận'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreditWalletTab;
