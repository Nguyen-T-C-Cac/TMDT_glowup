import React, { useState } from 'react';
import styles from './Chat.module.css';

interface InvoiceData {
  invoiceCode?: string;
  totalPrice?: number;
  serviceName?: string;
  subService?: string;
  description?: string;
  status?: string;
  createdAt?: string;
}

interface InvoiceCardProps {
  invoiceData: InvoiceData;
  orderId: string;
  isCustomer?: boolean;
  isTechnician?: boolean;
  onPayViaVNPay?: (orderId: string) => Promise<void>;
  onConfirmCash?: (orderId: string) => Promise<void>;
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN').format(value);

const statusLabels: Record<string, string> = {
  PENDING: 'Chờ thanh toán',
  PAID_VNPAY: 'Đã thanh toán VNPay',
  PAID_CASH: 'Đã thanh toán tiền mặt',
  COMPLETED: 'Hoàn tất',
};

export const InvoiceCard: React.FC<InvoiceCardProps> = ({
  invoiceData,
  orderId,
  isCustomer = false,
  isTechnician = false,
  onPayViaVNPay,
  onConfirmCash,
}) => {
  const [paying, setPaying] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const status = (invoiceData.status ?? 'PENDING').toUpperCase();
  const isPending = status === 'PENDING';
  const isPaid = ['PAID_VNPAY', 'PAID_CASH', 'COMPLETED'].includes(status);

  const handlePayVNPay = async () => {
    if (!onPayViaVNPay || paying) return;
    setPaying(true);
    try {
      await onPayViaVNPay(orderId);
    } finally {
      setPaying(false);
    }
  };

  const handleConfirmCash = async () => {
    if (!onConfirmCash || confirming) return;
    setConfirming(true);
    try {
      await onConfirmCash(orderId);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className={styles.quotationCard}>
      <div className={styles.quotationHeaderLine} style={{ background: '#f59e0b' }} />
      <div className={styles.quotationBody}>
        <div className={styles.quotationTop}>
          <div>
            <p className={styles.labelCaps}>HOÁ ĐƠN THANH TOÁN</p>
            <h3 className={styles.serviceTitle}>
              {invoiceData.invoiceCode ?? 'HD-' + orderId.slice(0, 8)}
            </h3>
          </div>
          <div>📄</div>
        </div>

        <div className={styles.descriptionSection}>
          <p className={styles.labelCaps}>DỊCH VỤ</p>
          <p className={styles.descriptionText}>
            {invoiceData.serviceName || invoiceData.subService || 'Sửa chữa'}
            {invoiceData.description ? ` - ${invoiceData.description}` : ''}
          </p>
        </div>

        <div className={styles.quotationFooter}>
          <div>
            <p className={styles.labelCaps}>TỔNG TIỀN</p>
            <p className={styles.priceDisplay}>
              <span className={styles.currency}>
                {formatPrice(invoiceData.totalPrice ?? 0)} VNĐ
              </span>
            </p>
          </div>

          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Trạng thái: <strong>{statusLabels[status] ?? status}</strong>
          </div>

          {isPending && isCustomer && onPayViaVNPay && (
            <button
              type="button"
              className={styles.btnPrimary}
              style={{ background: '#2563eb', border: 'none', color: 'white', padding: '12px', borderRadius: '25px', cursor: 'pointer', width: '100%' }}
              onClick={handlePayVNPay}
              disabled={paying}
            >
              {paying ? 'Đang xử lý...' : 'Thanh toán qua VNPay'}
            </button>
          )}

          {isPending && isTechnician && onConfirmCash && (
            <div>
              <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                * Tiền sẽ được trừ vào ví của thợ
              </p>
              <button
                type="button"
                className={styles.btnPrimary}
                style={{ background: '#16a34a', border: 'none', color: 'white', padding: '12px', borderRadius: '25px', cursor: 'pointer', width: '100%' }}
                onClick={handleConfirmCash}
                disabled={confirming}
              >
                {confirming ? 'Đang xử lý...' : 'Đã thu tiền mặt'}
              </button>
            </div>
          )}

          {isPaid && (
            <p style={{ fontSize: '13px', color: '#16a34a', fontWeight: 600, textAlign: 'center', padding: '8px 0' }}>
              ✓ Đã thanh toán
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
