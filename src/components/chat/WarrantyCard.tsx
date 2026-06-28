import React, { useState } from 'react';
import type { EmbeddedWarranty } from '../../types/warranty';
import { orderService } from '../../services/order/orderService';
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
            <span className={styles.warrantyBadge}>
                {warranty.event === 'warranty_accepted' ? 'BẢO HÀNH ĐÃ CHẤP NHẬN' :
                 warranty.event === 'warranty_rejected' ? 'BẢO HÀNH BỊ TỪ CHỐI' :
                 'YÊU CẦU BẢO HÀNH'}
            </span>

            {isRequest && (
                <>
                    <div className={styles.warrantyHeader}>
                        <strong>Yêu cầu bảo hành</strong>
                        <span className={styles.warrantyCode}>Mã: {warranty.warrantyId}</span>
                    </div>

                    <div className={styles.warrantyBody}>
                        {warranty.customerName && (
                            <div className={styles.warrantyRow}>
                                <span>Khách hàng:</span>
                                <span>{warranty.customerName}</span>
                            </div>
                        )}
                        {warranty.description && (
                            <div className={styles.warrantyRow}>
                                <span>Mô tả:</span>
                                <span>{warranty.description}</span>
                            </div>
                        )}
                        {warranty.scheduledAt && (
                            <div className={styles.warrantyRow}>
                                <span>Lịch hẹn:</span>
                                <span>{new Date(warranty.scheduledAt).toLocaleString('vi-VN')}</span>
                            </div>
                        )}
                        {warranty.warrantyExpiresAt && (
                            <div className={styles.warrantyRow}>
                                <span>Hết hạn BH:</span>
                                <span>{new Date(warranty.warrantyExpiresAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                        )}
                    </div>

                    {warranty.images && warranty.images.length > 0 && (
                        <div className={styles.warrantyImages}>
                            {warranty.images.slice(0, 4).map((url, idx) => (
                                <img key={idx} src={url} alt={`BH ${idx + 1}`} className={styles.warrantyImage} />
                            ))}
                        </div>
                    )}

                    {isTechnician && (
                        <div className={styles.warrantyActions}>
                            <button
                                className={styles.warrantyAcceptBtn}
                                onClick={handleAccept}
                                disabled={actionLoading !== null}
                            >
                                {actionLoading === 'accept' ? 'Đang xử lý...' : 'Chấp nhận'}
                            </button>
                            <button
                                className={styles.warrantyRejectBtn}
                                onClick={handleReject}
                                disabled={actionLoading !== null}
                            >
                                {actionLoading === 'reject' ? 'Đang xử lý...' : 'Từ chối'}
                            </button>
                        </div>
                    )}
                </>
            )}

            {!isRequest && (
                <div className={styles.warrantyStatusInfo}>
                    {warranty.technicianName && (
                        <p><strong>Thợ:</strong> {warranty.technicianName}</p>
                    )}
                    {warranty.note && (
                        <p><strong>{warranty.event === 'warranty_accepted' ? 'Ghi chú' : 'Lý do'}:</strong> {warranty.note}</p>
                    )}
                </div>
            )}
        </div>
    );
};
