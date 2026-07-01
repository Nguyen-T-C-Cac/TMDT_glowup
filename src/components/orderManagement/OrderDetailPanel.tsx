import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaCalendarCheck, FaClock, FaMoneyBillWave, FaUser, FaUsers, FaImage, FaLocationDot, FaStar, FaTriangleExclamation, FaShieldHalved } from 'react-icons/fa6';
import type { UserRole } from '../../types/UserRole.ts';
import type { OrderResponse } from '../../types/order/order.ts';
import type { WarrantyResponse } from '../../types/warranty.ts';
import { getOrderStatusLabel } from '../../stores/orderStore.ts';
import WarrantyModal from '../modal/WarrantyModal.tsx';
import { orderService } from '../../services/order/orderService.ts';

interface OrderDetailPanelProps {
    order: OrderResponse;
    role: UserRole;
    onBack: () => void;
    onCancel: (id: string) => void;
    onReview?: (order: OrderResponse) => void;
    onEditReview?: (order: OrderResponse) => void;
    onReport?: (order: OrderResponse) => void;
    onViewWarranty?: (orderId: string) => void;
}

const formatDateTime = (value?: string): string => {
    if (!value) return 'Chưa cập nhật';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatMoney = (value?: number): string => (value ?? 0).toLocaleString('vi-VN');

const warrantyStatusLabel = (status: string): string => {
    switch (status) {
        case 'pending': return 'Đang chờ xử lý';
        case 'in-progress': return 'Đang bảo hành';
        case 'completed': return 'Hoàn thành bảo hành';
        case 'rejected': return 'Bị từ chối';
        case 'expired': return 'Hết hạn bảo hành';
        default: return status;
    }
};

export const OrderDetailPanel: React.FC<OrderDetailPanelProps> = ({ order, role, onBack, onCancel, onReview, onEditReview, onReport, onViewWarranty }) => {
    const [showWarrantyModal, setShowWarrantyModal] = useState(false);
    const [warrantySubmitted, setWarrantySubmitted] = useState(false);
    const [existingWarranty, setExistingWarranty] = useState<WarrantyResponse | null>(null);
    const [loadingWarranty, setLoadingWarranty] = useState(false);

    const partner = role === 'technician' ? order.customer : order.technician;
    const canCancel = !['completed', 'cancelled', 'warranty'].includes(order.status.toLowerCase());
    const isCompleted = order.status.toLowerCase() === 'completed';
    const isCustomer = role === 'customer';
    const hasImages = (order.images?.length ?? 0) > 0;

    useEffect(() => {
        if (isCompleted && isCustomer) {
            setLoadingWarranty(true);
            orderService.getWarranty(order.id)
                .then((data) => {
                    if (data) setExistingWarranty(data);
                })
                .catch(() => {})
                .finally(() => setLoadingWarranty(false));
        }
    }, [order.id, isCompleted, isCustomer]);

    const handleWarrantySubmit = async (description: string, images: string[], scheduledAt: string | null) => {
        const result = await orderService.createWarranty(order.id, {
            description,
            images: images.length > 0 ? images : undefined,
            scheduledAt: scheduledAt ?? undefined,
        });
        setWarrantySubmitted(true);
        setExistingWarranty(result);
    };

    return (
        <div className="order-detail-panel">
            <div className="detail-header">
                <button className="back-btn" onClick={onBack}>
                    <FaArrowLeft /> CHI TIẾT ĐƠN HÀNG
                </button>
                <span className="req-id">#{order.id}</span>
            </div>

            <div className="detail-summary-grid">
                <section className="detail-card">
                    <div className="detail-card-header">
                        <span className="detail-label">Trạng thái</span>
                        <span className="detail-status-pill">{getOrderStatusLabel(order)}</span>
                    </div>
                    <h2>{order.serviceName ?? order.deviceName ?? 'Đơn hàng'}</h2>
                    <p>{order.subService ?? order.serviceCategory ?? order.description ?? 'Không có mô tả'}</p>

                    <div className="detail-meta-list">
                        <div className="detail-meta-item"><FaLocationDot /> {order.address ?? 'Chưa cập nhật địa chỉ'}</div>
                        <div className="detail-meta-item"><FaClock /> {formatDateTime(order.scheduledAt ?? order.expectedTime)}</div>
                        <div className="detail-meta-item"><FaMoneyBillWave /> {formatMoney(order.finalPrice ?? order.estimatedPrice)} VND</div>
                    </div>
                </section>

                <section className="detail-card">
                    <span className="detail-label">{role === 'technician' ? 'Khách hàng' : 'Thợ phụ trách'}</span>
                    <div className="detail-profile-row">
                        <div className="detail-avatar"><FaUser /></div>
                        <div>
                            <h3>{partner?.fullName ?? 'Chưa cập nhật'}</h3>
                            <p>{partner?.phone ?? partner?.email ?? 'Chưa có liên hệ'}</p>
                        </div>
                    </div>

                    <div className="detail-meta-list mt-16">
                        <div className="detail-meta-item"><FaUsers /> {order.customer?.fullName ?? 'Khách hàng'}</div>
                        <div className="detail-meta-item"><FaCalendarCheck /> {formatDateTime(order.createdAt)}</div>
                    </div>
                </section>
            </div>

            <div className="detail-card mt-24">
                <span className="detail-label">Mô tả & ghi chú</span>
                <p className="detail-description">{order.description ?? 'Đơn hàng chưa có mô tả chi tiết.'}</p>

                {order.priceAdjustment && (
                    <div className="detail-adjustment-box">
                        <strong>Điều chỉnh giá:</strong>
                        <div>Trạng thái: {order.priceAdjustment.status ?? 'Chưa cập nhật'}</div>
                        <div>Từ: {formatMoney(order.priceAdjustment.beforePrice)} VND</div>
                        <div>Đến: {formatMoney(order.priceAdjustment.afterPrice)} VND</div>
                    </div>
                )}
            </div>

            <div className="detail-card mt-24">
                <div className="detail-card-header">
                    <span className="detail-label">Hình ảnh</span>
                    <span className="detail-count">{order.images?.length ?? 0} ảnh</span>
                </div>

                {hasImages ? (
                    <div className="detail-image-grid">
                        {order.images?.map((image, index) => (
                            <img key={`${order.id}-${index}`} src={image} alt={`Order ${order.id} ${index + 1}`} />
                        ))}
                    </div>
                ) : (
                    <div className="detail-empty-state">
                        <FaImage /> Chưa có hình ảnh đính kèm.
                    </div>
                )}
            </div>

            {order.cancelReason && (
                <div className="detail-card mt-24 danger-border">
                    <span className="detail-label">Lý do hủy</span>
                    <p className="detail-description">{order.cancelReason}</p>
                </div>
            )}

            <div className="detail-footer">
                <button className="btn-large-secondary" onClick={onBack}>
                    Quay lại
                </button>
                {canCancel && onCancel && (
                    <button className="btn-large-primary danger-button" onClick={() => onCancel(order.id)}>
                        Hủy đơn
                    </button>
                )}
            </div>

            {isCompleted && isCustomer && (
                <div className="detail-card mt-24">
                    <span className="detail-label">Đánh giá & hỗ trợ</span>
                    <div className="detail-review-actions">
                        {order.reviewed ? (
                            <div className="detail-reviewed-info">
                                <div className="detail-reviewed-stars">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <FaStar key={i} className={i <= (order.myRating ?? 0) ? 'star-filled' : 'star-empty'} />
                                    ))}
                                </div>
                                <span>Bạn đã đánh giá dịch vụ này</span>
                                <button className="detail-edit-review-btn" onClick={() => onEditReview?.(order)}>
                                    Chỉnh sửa
                                </button>
                            </div>
                        ) : (
                            <button className="detail-review-btn" onClick={() => onReview?.(order)}>
                                <FaStar /> Đánh giá dịch vụ
                            </button>
                        )}
                        {loadingWarranty ? (
                            <div className="detail-warranty-submitted">
                                <FaShieldHalved /> Đang kiểm tra bảo hành...
                            </div>
                        ) : existingWarranty ? (
                            <div className="detail-warranty-existing">
                                <div className="detail-warranty-status-row" onClick={() => onViewWarranty?.(order.id)} style={{ cursor: 'pointer' }}>
                                    <FaShieldHalved />
                                    <span>Bảo hành: <strong>{warrantyStatusLabel(existingWarranty.status)}</strong></span>
                                </div>
                                {existingWarranty.status === 'rejected' && existingWarranty.rejectReason && (
                                    <div className="detail-warranty-rejected">
                                        <span>Lý do: {existingWarranty.rejectReason}</span>
                                    </div>
                                )}
                                {existingWarranty.status === 'rejected' && (
                                    <button className="detail-warranty-btn detail-warranty-retry-btn" onClick={() => setShowWarrantyModal(true)}>
                                        <FaShieldHalved /> Yêu cầu lại bảo hành
                                    </button>
                                )}
                            </div>
                        ) : warrantySubmitted ? (
                            <div className="detail-warranty-submitted">
                                <FaShieldHalved /> Yêu cầu bảo hành đã gửi
                            </div>
                        ) : (
                            <button className="detail-warranty-btn" onClick={() => setShowWarrantyModal(true)}>
                                <FaShieldHalved /> Yêu cầu bảo hành
                            </button>
                        )}
                        <button className="detail-report-btn" onClick={() => onReport?.(order)}>
                            <FaTriangleExclamation /> Báo cáo sự cố
                        </button>
                    </div>
                </div>
            )}

            <WarrantyModal
                open={showWarrantyModal}
                onClose={() => setShowWarrantyModal(false)}
                orderId={order.id}
                onSubmit={handleWarrantySubmit}
            />
        </div>
    );
};

export default OrderDetailPanel;
