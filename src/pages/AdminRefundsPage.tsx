import React, { useCallback, useEffect, useState } from 'react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { useToast } from '../components/common/Toast';
import {
  createRefund,
  getRefunds,
  type RefundItem,
} from '../services/adminRefundPointsService';
import './AdminRefundsPage.css';

const PAGE_SIZE = 10;

const statusLabels: Record<string, string> = {
  pending: 'Đang xử lý',
  completed: 'Hoàn tất',
  failed: 'Thất bại',
};

const formatMoney = (value: number | null | undefined) =>
  value == null ? '—' : `${Number(value).toLocaleString('vi-VN')}₫`;

const formatDateTime = (value: string) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('vi-VN');
};

const AdminRefundsPage: React.FC = () => {
  const { showToast } = useToast();

  const [items, setItems] = useState<RefundItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create-refund form state
  const [orderCode, setOrderCode] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadRefunds = useCallback(async (targetPage: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getRefunds(targetPage, PAGE_SIZE);
      setItems(result.items);
      setTotalPages(Math.max(result.totalPages, 1));
      setTotal(result.total);
      setPage(result.page);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách hoàn tiền');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRefunds(1);
  }, [loadRefunds]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedCode = orderCode.trim();
    const numericAmount = Number(amount);

    if (!trimmedCode) {
      showToast('Vui lòng nhập mã đơn hàng', 'error');
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      showToast('Số tiền hoàn phải lớn hơn 0', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const refund = await createRefund(trimmedCode, numericAmount, reason.trim());
      const lockNote = refund.technicianLocked ? ' — Thợ đã bị khoá do ví âm.' : '';
      showToast(`Hoàn tiền ${formatMoney(refund.amount)} cho đơn ${refund.orderCode} thành công.${lockNote}`, 'success');
      setOrderCode('');
      setAmount('');
      setReason('');
      await loadRefunds(1);
    } catch (err: any) {
      showToast(err?.message || 'Hoàn tiền thất bại', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="arf-layout">
      <AdminSidebar activeItem="refunds" />

      <div className="arf-main">
        <AdminHeader />

        <div className="arf-header">
          <h1 className="arf-title">Hoàn tiền</h1>
          <p className="arf-subtitle">
            Admin ứng tiền hoàn cho khách và trừ vào ví tín dụng của thợ (cho phép ví âm + khoá tài khoản).
          </p>
        </div>

        {/* Create refund */}
        <form className="arf-card arf-create" onSubmit={handleSubmit}>
          <h3 className="arf-card-title">Tạo yêu cầu hoàn tiền</h3>
          <div className="arf-form-grid">
            <label className="arf-field">
              <span>Mã đơn hàng</span>
              <input
                type="text"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                placeholder="VD: GU-99210"
              />
            </label>
            <label className="arf-field">
              <span>Số tiền hoàn (₫)</span>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="VD: 500000"
              />
            </label>
            <label className="arf-field arf-field--wide">
              <span>Lý do</span>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Lý do hoàn tiền cho khách"
                maxLength={500}
              />
            </label>
          </div>
          <button type="submit" className="arf-submit-btn" disabled={submitting}>
            {submitting ? 'Đang xử lý...' : 'Hoàn tiền'}
          </button>
        </form>

        {/* Refund list */}
        <div className="arf-card">
          <div className="arf-card-head">
            <h3 className="arf-card-title">Danh sách hoàn tiền</h3>
            <span className="arf-count">{total} bản ghi</span>
          </div>

          {error && <div className="arf-state arf-state--error">{error}</div>}

          {!error && (
            <div className="arf-table-wrap">
              <table className="arf-table">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Đơn</th>
                    <th>Khách hàng</th>
                    <th>Thợ</th>
                    <th>Số tiền</th>
                    <th>Trạng thái</th>
                    <th>Ví thợ sau</th>
                    <th>Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {loading &&
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={`sk-${idx}`} className="arf-skeleton-row">
                        {Array.from({ length: 8 }).map((__, c) => (
                          <td key={c}><div className="arf-skeleton" /></td>
                        ))}
                      </tr>
                    ))}

                  {!loading && items.map((item) => (
                    <tr key={item.code}>
                      <td className="arf-mono">{item.code}</td>
                      <td className="arf-mono">{item.orderCode ?? '—'}</td>
                      <td>{item.customerName ?? '—'}</td>
                      <td>
                        {item.technicianName ?? '—'}
                        {item.technicianLocked && <span className="arf-badge arf-badge--locked">Đã khoá</span>}
                      </td>
                      <td className="arf-amount">{formatMoney(item.amount)}</td>
                      <td>
                        <span className={`arf-status arf-status--${item.status}`}>
                          {statusLabels[item.status] ?? item.status}
                        </span>
                        {item.technicianDebt && <span className="arf-badge arf-badge--debt">Ví âm</span>}
                      </td>
                      <td className={item.technicianBalanceAfter != null && item.technicianBalanceAfter < 0 ? 'arf-negative' : ''}>
                        {formatMoney(item.technicianBalanceAfter)}
                      </td>
                      <td>{formatDateTime(item.createdAt)}</td>
                    </tr>
                  ))}

                  {!loading && items.length === 0 && (
                    <tr>
                      <td colSpan={8} className="arf-state">Chưa có yêu cầu hoàn tiền nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!error && totalPages > 1 && (
            <div className="arf-pagination">
              <button disabled={page <= 1 || loading} onClick={() => loadRefunds(page - 1)}>‹ Trước</button>
              <span>Trang {page}/{totalPages}</span>
              <button disabled={page >= totalPages || loading} onClick={() => loadRefunds(page + 1)}>Sau ›</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRefundsPage;
