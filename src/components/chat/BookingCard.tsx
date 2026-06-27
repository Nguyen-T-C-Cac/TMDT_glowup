import React, { useState } from 'react';
import type { EmbeddedBooking } from '../../types/booking';
import styles from './Chat.module.css';
import { BookingDetailModal } from './BookingDetailModal';
import { Eye, Check, X } from 'lucide-react';
import { bookingService } from '../../services/bookingService';

type BookingCardProps = {
    booking: EmbeddedBooking;
    role?: 'technician' | 'customer' | 'admin';
    onStatusChange?: (bookingCode: string, newStatus: string) => void;
};

const urgencyLabels: Record<string, string> = {
    LOW: 'Không gấp',
    NORMAL: 'Bình thường',
    HIGH: 'Cần hôm nay',
    URGENT: 'Khẩn cấp',
};

const urgencyColors: Record<string, string> = {
    LOW: '#6b7280',
    NORMAL: '#3b82f6',
    HIGH: '#f59e0b',
    URGENT: '#ef4444',
};

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: 'Đang chờ', color: '#f59e0b', bg: '#fef3c7' },
    CONFIRMED: { label: 'Đã xác nhận', color: '#10b981', bg: '#d1fae5' },
    CANCELLED: { label: 'Đã hủy', color: '#ef4444', bg: '#fee2e2' },
};

export const BookingCard: React.FC<BookingCardProps> = ({ booking, role = 'customer', onStatusChange }) => {
    const [showDetail, setShowDetail] = useState(false);
    const [showRejectConfirm, setShowRejectConfirm] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [currentStatus, setCurrentStatus] = useState(booking.status || 'PENDING');

    const urgencyText = urgencyLabels[booking.urgency ?? ''] ?? 'Không gấp';
    const urgencyColor = urgencyColors[booking.urgency ?? ''] ?? '#6b7280';
    const statusInfo = statusLabels[currentStatus] || statusLabels.PENDING;

    const isTechnician = role === 'technician';
    const isPending = currentStatus === 'PENDING';

    const handleAccept = async () => {
        setActionLoading('accept');
        try {
            await bookingService.acceptBooking(booking.code);
            setCurrentStatus('CONFIRMED');
            onStatusChange?.(booking.code, 'CONFIRMED');
        } catch (err) {
            console.error('Failed to accept booking:', err);
            alert('Không thể chấp nhận yêu cầu. Vui lòng thử lại.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        setShowRejectConfirm(false);
        setActionLoading('reject');
        try {
            await bookingService.rejectBooking(booking.code);
            setCurrentStatus('CANCELLED');
            onStatusChange?.(booking.code, 'CANCELLED');
        } catch (err) {
            console.error('Failed to reject booking:', err);
            alert('Không thể từ chối yêu cầu. Vui lòng thử lại.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <>
            <div className={styles.bookingCard} onClick={() => !showRejectConfirm && setShowDetail(true)}>
                <span className={styles.bookingBadge}>YÊU CẦU SỬA CHỮA</span>

                <div className={styles.bookingHeader}>
                    <strong>{booking.categoryName || 'Yêu cầu sửa chữa'}</strong>
                    {booking.code && <span className={styles.bookingCode}>Mã: {booking.code}</span>}
                </div>

                <div className={styles.bookingBody}>
                    {booking.deviceTypeName && (
                        <div className={styles.bookingRow}>
                            <span>Loại thiết bị:</span>
                            <span>{booking.deviceTypeName}</span>
                        </div>
                    )}
                    {booking.brandName && (
                        <div className={styles.bookingRow}>
                            <span>Hãng:</span>
                            <span>{booking.brandName}</span>
                        </div>
                    )}
                    {booking.description && (
                        <div className={styles.bookingRow}>
                            <span>Mô tả:</span>
                            <span>{booking.description}</span>
                        </div>
                    )}
                    <div className={styles.bookingRow}>
                        <span>Mức độ:</span>
                        <span style={{ color: urgencyColor, fontWeight: 600 }}>{urgencyText}</span>
                    </div>
                    {booking.scheduledDate && (
                        <div className={styles.bookingRow}>
                            <span>Ngày hẹn:</span>
                            <span>{booking.scheduledDate}</span>
                        </div>
                    )}
                    {booking.preferredTime && (
                        <div className={styles.bookingRow}>
                            <span>Giờ:</span>
                            <span>{booking.preferredTime}</span>
                        </div>
                    )}
                    {booking.address && (
                        <div className={styles.bookingRow}>
                            <span>Địa chỉ:</span>
                            <span>{booking.address}</span>
                        </div>
                    )}
                    {booking.technicianName && (
                        <div className={styles.bookingRow}>
                            <span>Thợ:</span>
                            <span>{booking.technicianName}</span>
                        </div>
                    )}
                </div>

                {/* Status badge */}
                <div className={styles.bookingStatusRow}>
                    <span
                        className={styles.bookingStatusBadge}
                        style={{ color: statusInfo.color, backgroundColor: statusInfo.bg }}
                    >
                        {statusInfo.label}
                    </span>
                </div>

                {booking.imageUrls && booking.imageUrls.length > 0 && (
                    <div className={styles.bookingImages}>
                        {booking.imageUrls.slice(0, 4).map((url, idx) => (
                            <img key={idx} src={url} alt={`Ảnh ${idx + 1}`} className={styles.bookingImage} />
                        ))}
                    </div>
                )}

                {/* Action buttons for technician when pending */}
                {isTechnician && isPending && (
                    <div className={styles.bookingActions} onClick={(e) => e.stopPropagation()}>
                        <button
                            className={styles.bookingAcceptBtn}
                            onClick={handleAccept}
                            disabled={actionLoading !== null}
                        >
                            <Check size={16} />
                            {actionLoading === 'accept' ? 'Đang xử lý...' : 'Chấp nhận'}
                        </button>
                        <button
                            className={styles.bookingRejectBtn}
                            onClick={() => setShowRejectConfirm(true)}
                            disabled={actionLoading !== null}
                        >
                            <X size={16} />
                            {actionLoading === 'reject' ? 'Đang xử lý...' : 'Từ chối'}
                        </button>
                    </div>
                )}

                {!isTechnician && (
                    <div className={styles.bookingViewBtn}>
                        <Eye size={14} />
                        <span>Xem chi tiết</span>
                    </div>
                )}
            </div>

            {/* Reject confirmation popup */}
            {showRejectConfirm && (
                <div className={styles.rejectOverlay} onClick={() => setShowRejectConfirm(false)}>
                    <div className={styles.rejectPopup} onClick={(e) => e.stopPropagation()}>
                        <h4>Từ chối yêu cầu?</h4>
                        <p>Bạn có chắc chắn muốn từ chối yêu cầu sửa chữa này?</p>
                        <div className={styles.rejectActions}>
                            <button
                                className={styles.rejectCancelBtn}
                                onClick={() => setShowRejectConfirm(false)}
                            >
                                Quay lại
                            </button>
                            <button
                                className={styles.rejectConfirmBtn}
                                onClick={handleReject}
                            >
                                Xác nhận từ chối
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDetail && (
                <BookingDetailModal
                    booking={booking}
                    role={role}
                    onClose={() => setShowDetail(false)}
                    onStatusChange={onStatusChange}
                />
            )}
        </>
    );
};