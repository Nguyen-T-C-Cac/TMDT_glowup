import React from 'react';
import type {RequestData} from "../../types/RequestData.ts";
import type {UserRole} from "../../types/UserRole.ts";
import "./requestCard.css"

import {FaLocationDot, FaCreditCard} from 'react-icons/fa6';
import {useNavigate} from "react-router-dom";
import { navigateToChat } from "../../utils/chatNavigation";
import { bookingService } from "../../services/bookingService";

interface RequestCardProps {
    data: RequestData;
    role: UserRole;
    onViewDetail: (id: string) => void;
    onCancel?: (id: string) => void;
    onBookingAccept?: (bookingCode: string) => void;
    onBookingReject?: (bookingCode: string) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({data, role, onViewDetail, onCancel, onBookingAccept, onBookingReject}) => {
    const navigate = useNavigate();
    const [actionLoading, setActionLoading] = React.useState<string | null>(null);

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

    const handleBookingAccept = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setActionLoading('accept');
        try {
            await bookingService.acceptBooking(data.id);
            onBookingAccept?.(data.id);
            alert('Đã chấp nhận yêu cầu sửa chữa!');
        } catch (err) {
            console.error('Failed to accept booking:', err);
            alert('Không thể chấp nhận yêu cầu. Vui lòng thử lại.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleBookingReject = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu sửa chữa này?')) return;
        setActionLoading('reject');
        bookingService.rejectBooking(data.id)
            .then(() => {
                onBookingReject?.(data.id);
                alert('Đã từ chối yêu cầu sửa chữa!');
            })
            .catch((err) => {
                console.error('Failed to reject booking:', err);
                alert('Không thể từ chối yêu cầu. Vui lòng thử lại.');
            })
            .finally(() => setActionLoading(null));
    };

    return (
        <div className="request-card" onClick={() => onViewDetail(data.id)}>

            <div className="card-content">
                <div className="card-header">
                    <h3 className="person-name">
                        {role === 'technician' ? data.customerName : (data.technicianName || 'Chưa có thợ nhận')}
                    </h3>
                    <span className="time-badge">{data.timeAgo}</span>
                    {data.fromBooking && (
                        <span className="booking-source-badge">Yêu cầu sửa chữa</span>
                    )}
                </div>
                <p className="device-name">{data.deviceName}</p>
                <p className="description-snippet">{data.description}</p>

                <div className="card-meta">
                    <span><FaLocationDot/> {data.address}</span>
                    <span><FaCreditCard/> Ước tính: {data.estPrice.toLocaleString('vi-VN')} VND</span>
                </div>
            </div>

            <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                {role === 'technician' && data.fromBooking ? (
                    <>
                        <button
                            className="btn-primary"
                            onClick={handleBookingAccept}
                            disabled={actionLoading !== null}
                        >
                            {actionLoading === 'accept' ? 'Đang xử lý...' : 'Chấp nhận'}
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={handleBookingReject}
                            disabled={actionLoading !== null}
                        >
                            {actionLoading === 'reject' ? 'Đang xử lý...' : 'Từ chối'}
                        </button>
                    </>
                ) : role === 'technician' ? (
                    <>
                        <button className="btn-primary" onClick={handleChatClick}>
                            Chat & Báo giá
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCancel?.(data.id);
                            }}
                        >
                            Từ chối
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className="btn-secondary"
                            onClick={(e) => { e.stopPropagation(); onCancel?.(data.id); }}
                        >
                            Hủy yêu cầu
                        </button>
                        <button className="btn-primary" onClick={() => onViewDetail(data.id)}>Xem chi tiết</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default RequestCard;