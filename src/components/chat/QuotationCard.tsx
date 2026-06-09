import React from 'react';
import styles from './Chat.module.css';
import type { QuotationStatus } from '../../services/chatService';

interface QuotationCardProps {
    serviceName?: string;
    description?: string;
    price?: number;
    /** ISO LocalDateTime string from the API, or null when no schedule set. */
    scheduledAt?: string | null;
    status?: QuotationStatus;
    /** Order code created once the customer accepts the quote. */
    orderId?: string;
    /** Static preview (modal) — never renders action buttons. */
    previewMode?: boolean;
    /** Only the customer of a pending quote may accept/reject. */
    showActions?: boolean;
    loading?: boolean;
    onAccept?: () => void;
    onReject?: () => void;
}

const formatPrice = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

const formatSchedule = (iso?: string | null) => {
    if (!iso) return 'Chưa đặt lịch';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'Chưa đặt lịch';
    const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const date = d.toLocaleDateString('vi-VN');
    return `${time} - ${date}`;
};

export const QuotationCard: React.FC<QuotationCardProps> = ({
    serviceName = "Dịch vụ sửa chữa",
    description,
    price = 0,
    scheduledAt = null,
    status = 'pending',
    orderId,
    previewMode = false,
    showActions = false,
    loading = false,
    onAccept,
    onReject,
}) => {
    const isPending = status === 'pending';

    return (
        <div className={styles.quotationCard}>
            <div className={styles.quotationHeaderLine} />

            <div className={styles.quotationBody}>

                {/* HEADER */}
                <div className={styles.quotationTop}>
                    <div>
                        <p className={styles.labelCaps}>BÁO GIÁ DỊCH VỤ</p>
                        <h3 className={styles.serviceTitle}>{serviceName}</h3>
                    </div>
                    <div>🛠️</div>
                </div>

                {/* DESCRIPTION */}
                <div className={styles.descriptionSection}>
                    <p className={styles.labelCaps}>MÔ TẢ TÌNH TRẠNG</p>
                    <p className={styles.descriptionText}>
                        {description?.trim() ? description : 'Chưa có mô tả chi tiết.'}
                    </p>
                </div>

                {/* SCHEDULE (read-only — set from the quote form) */}
                <div className={`${styles.scheduleBox} ${styles.disabled}`}>
                    <div className={styles.scheduleIcon}></div>
                    <div className={styles.scheduleContent}>
                        <p className={styles.scheduleLabel}>Lịch hẹn dự kiến</p>
                        <p className={styles.scheduleValue}>{formatSchedule(scheduledAt)}</p>
                    </div>
                </div>

                {/* FOOTER */}
                <div className={styles.quotationFooter}>
                    <div>
                        <p className={styles.labelCaps}>CHI PHÍ DỰ KIẾN</p>
                        <div>
                            <p className={styles.priceDisplay}>
                                <span className={styles.currency}>{formatPrice(price)} VNĐ</span>
                                <span className={styles.note}> * Đã bao gồm vật tư</span>
                            </p>
                        </div>
                    </div>

                    {/* Customer, pending quote → accept / reject */}
                    {!previewMode && isPending && showActions && (
                        <div className={styles.actionGroup}>
                            <button
                                className={styles.btnSecondary}
                                onClick={onReject}
                                disabled={loading}
                            >
                                Từ chối
                            </button>
                            <button
                                className={styles.btnPrimary}
                                onClick={onAccept}
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Đồng ý & Đặt đơn'}
                            </button>
                        </div>
                    )}
                </div>

                {/* STATUS STRIP */}
                {!previewMode && status === 'accepted' && (
                    <div style={badgeStyle('#16A34A', '#F0FDF4')}>
                        ✓ Báo giá được chấp nhận
                        {orderId ? ` · Đơn #${orderId}` : ''}
                        <span style={{ display: 'block', fontWeight: 400, color: '#15803D', marginTop: 2 }}>
                            Đơn hàng đang chờ thực hiện.
                        </span>
                    </div>
                )}
                {!previewMode && status === 'rejected' && (
                    <div style={badgeStyle('#DC2626', '#FEF2F2')}>
                        ✕ Khách đã từ chối báo giá
                    </div>
                )}
                {!previewMode && status === 'expired' && (
                    <div style={badgeStyle('#92400E', '#FFFBEB')}>
                        Báo giá đã hết hạn
                    </div>
                )}
                {!previewMode && isPending && !showActions && (
                    <div style={badgeStyle('#475569', '#F1F5F9')}>
                        Đang chờ khách phản hồi…
                    </div>
                )}
            </div>
        </div>
    );
};

const badgeStyle = (color: string, bg: string): React.CSSProperties => ({
    marginTop: 12,
    padding: '8px 12px',
    borderRadius: 8,
    background: bg,
    color,
    fontSize: 13,
    fontWeight: 600,
});
