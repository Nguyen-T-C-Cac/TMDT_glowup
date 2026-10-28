import React from 'react';
import type { UserRole } from '../../types/UserRole';
import { FaLocationDot, FaClock, FaUser, FaPhone, FaPersonWalkingLuggage, FaMessage, FaShieldHalved, FaXmark } from 'react-icons/fa6';
import './scheduledCard.css';
import type {ScheduledOrder} from "../../types/ScheduledOrder.ts";
import {useNavigate} from "react-router-dom";
import { navigateToChat } from "../../utils/chatNavigation";

interface ScheduledCardProps {
    data: ScheduledOrder;
    role: UserRole;
    onViewDetail: (id: string) => void;
    onCancel?: (id: string) => void;
    onUpdateStatus?: (id: string, status: string) => void;
    onAcceptWarranty?: (orderId: string) => void;
    onRejectWarranty?: (orderId: string) => void;
}

const warrantyStatusLabel = (status?: string): string => {
    switch (status) {
        case 'pending': return 'Đang chờ';
        case 'in-progress': return 'Đang xử lý';
        case 'completed': return 'Hoàn thành';
        case 'rejected': return 'Bị từ chối';
        case 'expired': return 'Hết hạn';
        default: return 'Bảo hành';
    }
};

export const ScheduledCard: React.FC<ScheduledCardProps> = ({ data, role, onViewDetail, onCancel, onUpdateStatus, onAcceptWarranty, onRejectWarranty }) => {
    const navigate = useNavigate();
    const handleChatClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (role === 'customer' && data.technicianId) {
            navigateToChat(navigate, role, {
                technicianId: data.technicianId,
                orderId: data.id,
            });
            return;
        }
        navigateToChat(navigate, role, {
            orderId: data.id,
            customerId: data.customerId,
        });
    };

    const isWarranty = data.isWarranty;
    const isPendingWarranty = isWarranty && data.warrantyStatus === 'pending';
    const warrantyLabel = warrantyStatusLabel(data.warrantyStatus);

    const handleDetailClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onViewDetail(data.id);
    };

    return (
        <div className="sched-card" onClick={() => onViewDetail(data.id)}>
            <div className="sched-card-main">
                <div className="sched-header">
                    <span className={`sched-badge ${isWarranty ? 'sched-badge-warranty' : ''}`}>
                        {isWarranty && <FaShieldHalved style={{ marginRight: 4 }} />}
                        {isWarranty && data.warrantyStatus ? warrantyLabel : data.statusText}
                    </span>
                    <span className="sched-id">#{data.id}</span>
                </div>

                <h3 className="sched-title">{data.serviceName}</h3>
                <p className="sched-subtitle">{data.subService}</p>

                <div className="sched-info-grid">
                    <div className="info-item">
                        <FaUser className="icon" />
                        <span>{role === 'technician' ? data.customerName : data.technicianName}</span>
                    </div>
                    <div className="info-item">
                        <FaClock className="icon" />
                        <span>{data.time}</span>
                    </div>
                    <div className="info-item full-width">
                        <FaLocationDot className="icon" />
                        <span>{data.address}</span>
                    </div>
                </div>
            </div>

            <div className="sched-card-actions" onClick={(e) => e.stopPropagation()}>
                {isPendingWarranty ? (
                    <>
                        <button className="btn-primary" onClick={handleDetailClick}>
                            <FaShieldHalved /> Xem chi tiết
                        </button>
                        {role === 'technician' && isPendingWarranty && (
                            <>
                                <button className="sched-btn sched-btn-warranty" onClick={(e) => { e.stopPropagation(); onAcceptWarranty?.(data.id); }}>
                                    <FaShieldHalved /> Đồng ý
                                </button>
                                <button className="sched-btn sched-btn-warranty-reject" onClick={(e) => { e.stopPropagation(); onRejectWarranty?.(data.id); }}>
                                    <FaXmark /> Từ chối
                                </button>
                            </>
                        )}
                        {role === 'customer' && data.warrantyStatus && (
                            <span className="sched-warranty-status">
                                <FaShieldHalved /> {warrantyLabel}
                            </span>
                        )}
                    </>
                ) : role === 'technician' ? (
                    <>
                        <button className="btn-primary" onClick={(e) => { e.stopPropagation(); onUpdateStatus?.(data.id, 'in-progress'); }}>
                            <FaPersonWalkingLuggage /> Tôi đang di chuyển
                        </button>
                        <button className="btn-secondary" onClick={handleChatClick}>
                            <FaPhone /> Liên hệ khách
                        </button>
                    </>
                ) : (
                    <>
                        <button className="btn-primary" onClick={handleChatClick}>
                            <FaMessage /> Chat với thợ
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCancel?.(data.id);
                            }}
                        >
                            Hủy đơn
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};