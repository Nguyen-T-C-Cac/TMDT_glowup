import React, { useState } from 'react';
import { useEffect } from 'react';
import type { UserRole } from '../../types/UserRole';
import type { CompletedOrder } from './CompletedCard';
import type { WarrantyResponse } from '../../types/warranty';
import {
    FaCheck, FaWallet, FaShieldHalved, FaStar,
    FaDownload, FaMessage, FaTriangleExclamation,
    FaArrowLeft, FaTruckFast, FaWrench, FaCheckDouble
} from 'react-icons/fa6';
import './completedDetail.css';
import WarrantyModal from '../modal/WarrantyModal';
import ReportModal from '../modal/ReportModal';
import { orderService } from '../../services/order/orderService';

interface CompletedDetailProps {
    role: UserRole;
    onBack: () => void;
    onOpenRating?: () => void;
    order: CompletedOrder & {
        id: string;
        warrantyMonths?: number;
        completedAt: string;
        totalPrice: number;
        paymentMethod: string;
        reviewed: boolean;
        myRating?: number;
        customerId?: string;
        technicianId?: string;
        customerName: string;
        technicianName: string;
    };
}
const isWithinWarranty = (
    completedAt: string,
    warrantyMonths?: number,
    warrantyExpiresAt?: string,
): boolean => {
    if (warrantyExpiresAt) {
        const expiry = new Date(warrantyExpiresAt);
        return !Number.isNaN(expiry.getTime()) && new Date() <= expiry;
    }
    const completed = new Date(completedAt);
    if (Number.isNaN(completed.getTime())) return false;
    const expiry = new Date(completed);
    expiry.setMonth(expiry.getMonth() + (warrantyMonths ?? 3));
    return new Date() <= expiry;
};
export const CompletedDetail: React.FC<CompletedDetailProps> = ({ role, onBack, onOpenRating, order }) => {
    const [showWarrantyModal, setShowWarrantyModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [existingWarranty, setExistingWarranty] = useState<WarrantyResponse | null>(null);
    const [loadingWarranty, setLoadingWarranty] = useState(false);

    
    useEffect(() => {
        if (role !== 'customer') return;
        let cancelled = false;
        setLoadingWarranty(true);
        orderService.getWarranty(order.id)
            .then((data) => { if (!cancelled) setExistingWarranty(data); })
            .catch(() => { if (!cancelled) setExistingWarranty(null); })
            .finally(() => { if (!cancelled) setLoadingWarranty(false); });
        return () => { cancelled = true; };
    }, [order.id, role]);


    const handleWarrantySubmit = async (
        description: string, images: string[], scheduledAt: string | null,
    ) => {
        const created = await orderService.createWarranty(order.id, {
            description,
            images: images.length > 0 ? images : undefined,
            scheduledAt: scheduledAt ?? undefined,
        });
        setExistingWarranty(created);
        setShowWarrantyModal(false);
    };
    const renderWarrantySection = () => {
        if (loadingWarranty) {
            return (
                <div className="warranty-submitted-notice">
                    <FaShieldHalved /> Đang kiểm tra trạng thái bảo hành...
                </div>
            );
        }

        const withinWarranty = isWithinWarranty(
            order.completedAt,
            order.warrantyMonths,
            existingWarranty?.warrantyExpiresAt,  
        );
        const status = existingWarranty?.status;

        // Đang chờ hoặc đang xử lý → chỉ hiện trạng thái, không cho gửi thêm
        if (status === 'pending' || status === 'in-progress') {
            return (
                <div className="warranty-submitted-notice">
                    <FaShieldHalved />
                    {status === 'pending'
                        ? ' Đang chờ thợ xác nhận — thợ sẽ phản hồi sớm nhất.'
                        : ' Đang trong quá trình bảo hành.'}
                </div>
            );
        }
         // Bảo hành trước đã hoàn thành + còn hạn → cho gửi yêu cầu mới
        if (status === 'completed') {
            return (
                <div className="warranty-completed-block">
                    <div className="warranty-submitted-notice">
                        <FaCheck /> Lần bảo hành trước đã hoàn thành.
                    </div>
                    {withinWarranty && (
                        <button
                            className="btn-outline-dark w-100 mb-3"
                            onClick={() => setShowWarrantyModal(true)}
                        >
                            <FaShieldHalved /> Yêu cầu bảo hành lại
                        </button>
                    )}
                </div>
            );
        }
        // Thợ từ chối → hiện lý do + nút gửi lại nếu còn hạn
        if (status === 'rejected') {
            return (
                <div className="warranty-rejected-block">
                    <div className="warranty-expired-notice">
                        Yêu cầu bảo hành bị từ chối
                        {existingWarranty?.rejectReason ? `: ${existingWarranty.rejectReason}` : '.'}
                    </div>
                    {withinWarranty ? (
                        <button
                            className="btn-outline-dark w-100 mb-3"
                            onClick={() => setShowWarrantyModal(true)}
                        >
                            <FaShieldHalved /> Yêu cầu bảo hành lại
                        </button>
                    ) : (
                        <div className="warranty-expired-notice">Đã hết thời hạn bảo hành.</div>
                    )}
                </div>
            );
        }
       // Hết hạn bảo hành
        if (!withinWarranty) {
            return (
                <div className="warranty-expired-notice">
                    Đã hết thời hạn bảo hành ({order.warrantyMonths} tháng).
                </div>
            );
        }

        // Chưa có yêu cầu nào hoặc bảo hành trước đã hoàn thành
        // → luôn hiện nút để gửi yêu cầu mới nếu còn hạn
        return (
            <button
                className="btn-outline-dark w-100 mb-3"
                onClick={() => setShowWarrantyModal(true)}
            >
                <FaShieldHalved /> Yêu cầu bảo hành
            </button>
        );
    }; 

    return (
        <div className="cmp-detail-container">
            <div className="detail-header">
                <button className="back-btn" onClick={onBack}>
                    <FaArrowLeft /> CHI TIẾT HOÀN THÀNH
                </button>
                <span className="req-id">{order.id}</span>
            </div>

            <div className="stepper-container">
                <div className="step completed">
                    <div className="step-icon"><FaCheck /></div>
                    <span>Đã nhận đơn</span>
                </div>
                <div className="step-line completed"></div>
                <div className="step completed">
                    <div className="step-icon"><FaTruckFast /></div>
                    <span>Thợ đang đến</span>
                </div>
                <div className="step-line completed"></div>
                <div className="step completed">
                    <div className="step-icon"><FaWrench /></div>
                    <span>Bắt đầu sửa</span>
                </div>
                <div className="step-line completed"></div>
                <div className="step active">
                    <div className="step-icon"><FaCheckDouble /></div>
                    <span>Hoàn thành</span>
                </div>
            </div>

            <div className="cmp-header-row">
                <div className="header-info">
                    <p>Hoàn thành vào {order.completedAt}</p>
                </div>
                <div className="header-actions">
                    {role === 'customer' && <button className="btn-outline-gray"><FaMessage /> Liên hệ thợ</button>}
                    <button className="btn-solid-dark"><FaDownload /> Tải hóa đơn PDF</button>
                </div>
            </div>

            <div className="cmp-grid-layout">
                <div className="cmp-col-main">
                    <div className="cmp-card">
                        <h3>Chi tiết thanh toán</h3>
                        <div className="invoice-rows">
                            <div className="inv-row">
                                <span>Phí dịch vụ</span>
                                <span>{order.totalPrice.toLocaleString('vi-VN')}đ</span>
                            </div>
                        </div>
                        <div className="inv-total-row">
                            <span className="total-label">Tổng thanh toán</span>
                            <span className="total-price">{order.totalPrice.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="payment-method-box">
                            <FaWallet className="wallet-icon"/>
                            <div>
                                <span className="pm-label">Phương thức thanh toán</span>
                                <strong className="pm-value">{order.paymentMethod}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="cmp-col-side">
                    <div className="cmp-card rating-card">
                        <h3>Đánh giá dịch vụ</h3>
                        {role === 'customer' ? (
                            !order.reviewed ? (
                                <>
                                    <p className="rating-desc">Trải nghiệm của bạn giúp thợ và cộng đồng GlowUp tốt hơn.</p>
                                    <div className="rating-placeholder" onClick={onOpenRating}>
                                        Chia sẻ cảm nghĩ của bạn về chất lượng sửa chữa...
                                    </div>
                                    <button className="btn-solid-dark w-100" onClick={onOpenRating}>
                                        Gửi đánh giá
                                    </button>
                                </>
                            ) : (
                                <div className="rated-success">
                                    <div className="cmp-stars justify-center mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} className={i < (order.myRating ?? 0) ? 'star-filled' : 'star-empty'} />
                                        ))}
                                    </div>
                                    <p>Bạn đã đánh giá dịch vụ này.</p>
                                </div>
                            )
                        ) : (
                            <div className="tech-received-rating">
                                {order.reviewed ? (
                                    <div className="cmp-stars mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} className={i < (order.myRating ?? 0) ? 'star-filled' : 'star-empty'} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="rating-desc">Khách hàng chưa để lại đánh giá.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {role === 'customer' && (
                        <div className="cmp-card warranty-card">
                            <h3>Hỗ trợ & Bảo hành</h3>
                            <div className="warranty-status">
                                <FaShieldHalved className="shield-icon" />
                                <div>
                                    <strong>Thời hạn bảo hành</strong>
                                    <p>{order.warrantyMonths ? `Sản phẩm/dịch vụ này còn thời hạn bảo hành ${order.warrantyMonths} tháng.` : 'Dịch vụ này được bảo hành theo chính sách của GlowUp.'}</p>
                                </div>
                            </div>
                            {renderWarrantySection()}
                            <button
                                className="btn-text-danger w-100 text-center"
                                onClick={() => setShowReportModal(true)}
                            >
                                <FaTriangleExclamation /> Báo cáo sự cố
                            </button>
                        </div>
                    )}

                    {role === 'customer' && (
                        <div className="cmp-card dark-profile-card">
                            <div className="tech-brief">
                                <div className="tech-avatar-placeholder">
                                    {order.technicianName?.charAt(0) ?? 'T'}
                                </div>
                                <div>
                                    <h4>{order.technicianName}</h4>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <WarrantyModal
                open={showWarrantyModal}
                onClose={() => setShowWarrantyModal(false)}
                orderId={order.id}
                onSubmit={handleWarrantySubmit}
            />

            <ReportModal
                open={showReportModal}
                onClose={() => setShowReportModal(false)}
                orderId={order.id}
                onSuccess={() => setShowReportModal(false)}
            />
        </div>
    );
};
