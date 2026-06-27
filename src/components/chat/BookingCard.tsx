import React, { useState } from 'react';
import type { EmbeddedBooking } from '../../types/booking';
import styles from './Chat.module.css';
import { BookingDetailModal } from './BookingDetailModal';
import { Eye } from 'lucide-react';

type BookingCardProps = {
    booking: EmbeddedBooking;
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

export const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
    const [showDetail, setShowDetail] = useState(false);

    const urgencyText = urgencyLabels[booking.urgency ?? ''] ?? 'Không gấp';
    const urgencyColor = urgencyColors[booking.urgency ?? ''] ?? '#6b7280';

    return (
        <>
            <div className={styles.bookingCard} onClick={() => setShowDetail(true)}>
                <span className={styles.bookingBadge}>YÊU CẦU SỬA CHỮA</span>

                <div className={styles.bookingHeader}>
                    <strong>{booking.categoryName || 'Yêu cầu sửa chữa'}</strong>
                    {booking.code && <span className={styles.bookingCode}>Mã: {booking.code}</span>}
                </div>

                <div className={styles.bookingBody}>
                    {booking.deviceTypeName && (
                        <div className={styles.bookingRow}>
                            <span className={styles.bookingLabel}>Loại máy:</span>
                            <span>{booking.deviceTypeName}</span>
                        </div>
                    )}
                    {booking.brandName && (
                        <div className={styles.bookingRow}>
                            <span className={styles.bookingLabel}>Hãng:</span>
                            <span>{booking.brandName}</span>
                        </div>
                    )}
                    {booking.description && (
                        <div className={styles.bookingRow}>
                            <span className={styles.bookingLabel}>Mô tả:</span>
                            <span>{booking.description}</span>
                        </div>
                    )}
                    <div className={styles.bookingRow}>
                        <span className={styles.bookingLabel}>Mức độ:</span>
                        <span style={{ color: urgencyColor, fontWeight: 600 }}>{urgencyText}</span>
                    </div>
                    {booking.scheduledDate && (
                        <div className={styles.bookingRow}>
                            <span className={styles.bookingLabel}>Ngày hẹn:</span>
                            <span>{booking.scheduledDate}</span>
                        </div>
                    )}
                    {booking.preferredTime && (
                        <div className={styles.bookingRow}>
                            <span className={styles.bookingLabel}>Thời gian:</span>
                            <span>{booking.preferredTime}</span>
                        </div>
                    )}
                    {booking.address && (
                        <div className={styles.bookingRow}>
                            <span className={styles.bookingLabel}>Địa chỉ:</span>
                            <span>{booking.address}</span>
                        </div>
                    )}
                    {booking.technicianName && (
                        <div className={styles.bookingRow}>
                            <span className={styles.bookingLabel}>Thợ phụ trách:</span>
                            <span>{booking.technicianName}</span>
                        </div>
                    )}
                </div>

                {booking.imageUrls && booking.imageUrls.length > 0 && (
                    <div className={styles.bookingImages}>
                        {booking.imageUrls.slice(0, 4).map((url, idx) => (
                            <img key={idx} src={url} alt={`Ảnh ${idx + 1}`} className={styles.bookingImage} />
                        ))}
                    </div>
                )}

                <div className={styles.bookingViewBtn}>
                    <Eye size={14} />
                    <span>Xem chi tiết</span>
                </div>
            </div>

            {showDetail && (
                <BookingDetailModal booking={booking} onClose={() => setShowDetail(false)} />
            )}
        </>
    );
};
