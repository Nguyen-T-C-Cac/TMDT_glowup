import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, MapPin, CalendarDays, Clock, AlertTriangle, Phone, User, Tag } from 'lucide-react';
import type { EmbeddedBooking } from '../../types/booking';
import './BookingDetailModal.css';

type BookingDetailModalProps = {
    booking: EmbeddedBooking;
    onClose: () => void;
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

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({ booking, onClose }) => {
    const images = booking.imageUrls ?? [];
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const urgencyText = urgencyLabels[booking.urgency ?? ''] ?? 'Không gấp';
    const urgencyColor = urgencyColors[booking.urgency ?? ''] ?? '#6b7280';

    const formatDate = (d?: string) => {
        if (!d) return '';
        try {
            return new Date(d).toLocaleDateString('vi-VN', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            });
        } catch {
            return d;
        }
    };

    return createPortal(
        <div className="bd-overlay" onClick={onClose}>
            <div className="bd-container" onClick={(e) => e.stopPropagation()}>
                <button className="bd-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="bd-header">
                    <span className="bd-badge">YÊU CẦU SỬA CHỮA</span>
                    <span className="bd-code">{booking.code}</span>
                </div>

                <div className="bd-body">
                    <h2 className="bd-title">{booking.categoryName || 'Yêu cầu sửa chữa'}</h2>

                    <div className="bd-details">
                        {booking.deviceTypeName && (
                            <div className="bd-row">
                                <Tag size={16} />
                                <span className="bd-label">Loại máy:</span>
                                <span>{booking.deviceTypeName}</span>
                            </div>
                        )}
                        {booking.brandName && (
                            <div className="bd-row">
                                <Tag size={16} />
                                <span className="bd-label">Hãng:</span>
                                <span>{booking.brandName}</span>
                            </div>
                        )}
                        {booking.description && (
                            <div className="bd-row bd-desc">
                                <AlertTriangle size={16} />
                                <span className="bd-label">Mô tả:</span>
                                <span>{booking.description}</span>
                            </div>
                        )}
                        <div className="bd-row">
                            <AlertTriangle size={16} />
                            <span className="bd-label">Mức độ:</span>
                            <span style={{ color: urgencyColor, fontWeight: 700 }}>{urgencyText}</span>
                        </div>
                        {booking.scheduledDate && (
                            <div className="bd-row">
                                <CalendarDays size={16} />
                                <span className="bd-label">Ngày hẹn:</span>
                                <span>{formatDate(booking.scheduledDate)}</span>
                            </div>
                        )}
                        {booking.preferredTime && (
                            <div className="bd-row">
                                <Clock size={16} />
                                <span className="bd-label">Thời gian:</span>
                                <span>{booking.preferredTime}</span>
                            </div>
                        )}
                        {booking.address && (
                            <div className="bd-row">
                                <MapPin size={16} />
                                <span className="bd-label">Địa chỉ:</span>
                                <span>{booking.address}</span>
                            </div>
                        )}
                        {booking.customerName && (
                            <div className="bd-row">
                                <User size={16} />
                                <span className="bd-label">Khách hàng:</span>
                                <span>{booking.customerName}</span>
                            </div>
                        )}
                        {booking.technicianName && (
                            <div className="bd-row">
                                <User size={16} />
                                <span className="bd-label">Thợ phụ trách:</span>
                                <span>{booking.technicianName}</span>
                            </div>
                        )}
                        {booking.phone && (
                            <div className="bd-row">
                                <Phone size={16} />
                                <span className="bd-label">SĐT:</span>
                                <span>{booking.phone}</span>
                            </div>
                        )}
                    </div>

                    {images.length > 0 && (
                        <div className="bd-images-section">
                            <h4>Hình ảnh ({images.length})</h4>
                            <div className="bd-images-grid">
                                {images.map((url, idx) => (
                                    <div
                                        key={idx}
                                        className="bd-thumb"
                                        onClick={() => setLightboxIndex(idx)}
                                    >
                                        <img src={url} alt={`Ảnh ${idx + 1}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {lightboxIndex !== null && (
                <div className="bd-lightbox" onClick={() => setLightboxIndex(null)}>
                    <button className="bd-lightbox-close" onClick={() => setLightboxIndex(null)}>
                        <X size={24} />
                    </button>
                    {images.length > 1 && (
                        <>
                            <button
                                className="bd-lightbox-nav bd-lightbox-prev"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
                                }}
                            >
                                <ChevronLeft size={28} />
                            </button>
                            <button
                                className="bd-lightbox-nav bd-lightbox-next"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLightboxIndex((lightboxIndex + 1) % images.length);
                                }}
                            >
                                <ChevronRight size={28} />
                            </button>
                        </>
                    )}
                    <img
                        src={images[lightboxIndex]}
                        alt={`Ảnh ${lightboxIndex + 1}`}
                        className="bd-lightbox-img"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="bd-lightbox-counter">
                        {lightboxIndex + 1} / {images.length}
                    </div>
                </div>
            )}
        </div>,
        document.body
    );
};
