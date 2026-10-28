import React, { useState } from 'react';
import type { EmbeddedWarranty } from '../../types/warranty';
import { orderService } from '../../services/order/orderService';
import { CalendarClock, CheckCircle2, Clock3, ShieldCheck, TriangleAlert } from 'lucide-react';
import styles from './Chat.module.css';

type WarrantyCardProps = {
    warranty: EmbeddedWarranty;
    role?: 'technician' | 'customer' | 'admin';
    onStatusChange?: () => void;
};

export const WarrantyCard: React.FC<WarrantyCardProps> = ({ warranty, role = 'customer', onStatusChange }) => {
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const isTechnician = role === 'technician';
    const isRequest = warranty.event === 'warranty_request';
    const isAccepted = warranty.event === 'warranty_accepted';
    const isRejected = warranty.event === 'warranty_rejected';
    const isCompleted = warranty.event === 'warranty_completed';
    const statusLabel = isAccepted
        ? 'Bảo hành được chấp nhận'
        : isRejected
            ? 'Bảo hành bị từ chối'
            : isCompleted
                ? 'Bảo hành đã hoàn thành'
                : 'Cập nhật bảo hành';
    const formatDateTime = (value: string, includeTime = true) => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleString('vi-VN', includeTime
            ? { dateStyle: 'medium', timeStyle: 'short' }
            : { dateStyle: 'medium' });
    };

    const handleAccept = async () => {
        setActionLoading('accept');
        try {
            await orderService.acceptWarranty(warranty.warrantyId);
            onStatusChange?.();
        } catch (err) {
            console.error('Failed to accept warranty:', err);
            alert('Không thể chấp nhận bảo hành. Vui lòng thử lại.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        const reason = prompt('Nhập lý do từ chối bảo hành:');
        if (!reason || !reason.trim()) return;
        setActionLoading('reject');
        try {
            await orderService.rejectWarranty(warranty.warrantyId, reason.trim());
            onStatusChange?.();
        } catch (err) {
            console.error('Failed to reject warranty:', err);
            alert('Không thể từ chối bảo hành. Vui lòng thử lại.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className={styles.warrantyCard}>
            <div className={`${styles.warrantyBadge} ${isRequest
                ? styles.warrantyBadgePending
                : isAccepted || isCompleted
                    ? styles.warrantyBadgeAccepted
                    : styles.warrantyBadgeRejected}`}>
                <ShieldCheck size={15} />
                <span>{isRequest ? 'YÊU CẦU BẢO HÀNH' : statusLabel}</span>
            </div>

            {isRequest && (
                <>
                    <div className={styles.warrantyHeader}>
                        <div>
                            <strong className={styles.warrantyTitle}>Khách hàng gửi yêu cầu bảo hành</strong>
                            <p className={styles.warrantyIntro}>
                                Sự cố tái phát trong thời hạn bảo hành. Nếu chấp nhận, vui lòng tiếp tục xử lý theo các bước sửa chữa của đơn.
                            </p>
                        </div>
                        <span className={styles.warrantyCode}>#{warranty.warrantyId}</span>
                    </div>

                    <div className={styles.warrantyBody}>
                        {(warranty.customerName || warranty.scheduledAt || warranty.warrantyExpiresAt) && (
                            <div className={styles.warrantyMetaGrid}>
                                {warranty.customerName && (
                                    <div className={styles.warrantyMetaItem}>
                                        <span className={styles.warrantyLabel}>Khách hàng</span>
                                        <strong className={styles.warrantyValue}>{warranty.customerName}</strong>
                                    </div>
                                )}
                                {warranty.scheduledAt && (
                                    <div className={styles.warrantyMetaItem}>
                                        <span className={styles.warrantyLabel}><CalendarClock size={15} /> Lịch hẹn kiểm tra</span>
                                        <strong className={styles.warrantyValue}>{formatDateTime(warranty.scheduledAt)}</strong>
                                    </div>
                                )}
                                {warranty.warrantyExpiresAt && (
                                    <div className={styles.warrantyMetaItem}>
                                        <span className={styles.warrantyLabel}>Thời hạn bảo hành đến</span>
                                        <strong className={styles.warrantyValue}>{formatDateTime(warranty.warrantyExpiresAt, false)}</strong>
                                    </div>
                                )}
                            </div>
                        )}
                        {warranty.description && (
                            <div className={styles.warrantyDescription}>
                                <span className={styles.warrantyLabel}>Mô tả sự cố</span>
                                <p>{warranty.description}</p>
                            </div>
                        )}
                        {!warranty.scheduledAt && (
                            <div className={styles.warrantyScheduleMissing}>
                                <Clock3 size={15} />
                                <span>Khách chưa chọn lịch hẹn. Vui lòng liên hệ để thống nhất thời gian kiểm tra.</span>
                            </div>
                        )}
                    </div>

                    {warranty.images && warranty.images.length > 0 && (
                        <div className={styles.warrantyEvidence}>
                            <span className={styles.warrantyLabel}>Ảnh mô tả sự cố ({warranty.images.length})</span>
                            <div className={styles.warrantyImages}>
                                {warranty.images.slice(0, 5).map((url, idx) => (
                                    <a key={idx} href={url} target="_blank" rel="noreferrer" aria-label={`Mở ảnh sự cố ${idx + 1}`}>
                                        <img src={url} alt={`Ảnh sự cố ${idx + 1}`} className={styles.warrantyImage} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {isTechnician && (
                        <>
                            <p className={styles.warrantyActionHint}>
                                Khi chấp nhận, đơn sẽ chuyển sang quy trình sửa chữa bảo hành.
                            </p>
                            <div className={styles.warrantyActions}>
                                <button
                                    className={styles.warrantyAcceptBtn}
                                    onClick={handleAccept}
                                    disabled={actionLoading !== null}
                                >
                                    {actionLoading === 'accept' ? 'Đang tiếp nhận...' : 'Chấp nhận & xử lý'}
                                </button>
                                <button
                                    className={styles.warrantyRejectBtn}
                                    onClick={handleReject}
                                    disabled={actionLoading !== null}
                                >
                                    {actionLoading === 'reject' ? 'Đang xử lý...' : 'Từ chối'}
                                </button>
                            </div>
                        </>
                    )}
                </>
            )}

            {!isRequest && (
                <div className={styles.warrantyStatusInfo}>
                    <div className={`${styles.warrantyStatusMessage} ${warranty.event === 'warranty_accepted'
                        ? styles.warrantyStatusAccepted
                        : isCompleted
                            ? styles.warrantyStatusAccepted
                            : styles.warrantyStatusRejected}`}>
                        {isAccepted || isCompleted
                            ? <CheckCircle2 size={18} />
                            : <TriangleAlert size={18} />}
                        <p>
                            {isAccepted
                                ? 'Thợ đã nhận yêu cầu. Đơn sẽ tiếp tục qua lịch hẹn và các bước sửa chữa bảo hành.'
                                : isRejected
                                    ? 'Thợ chưa thể tiếp nhận yêu cầu bảo hành này.'
                                    : isCompleted
                                        ? 'Yêu cầu bảo hành đã được xử lý hoàn tất.'
                                        : 'Trạng thái yêu cầu bảo hành đã được cập nhật.'}
                        </p>
                    </div>
                    {warranty.technicianName && (
                        <p><strong>Thợ phụ trách:</strong> {warranty.technicianName}</p>
                    )}
                    {warranty.note && (
                        <p className={styles.warrantyStatusNote}>
                            <strong>{isRejected ? 'Lý do từ chối' : 'Thông tin'}:</strong> {warranty.note}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
