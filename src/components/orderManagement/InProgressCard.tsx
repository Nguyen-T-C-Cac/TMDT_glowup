import React from 'react';
import {
    FaLocationDot, FaWrench, FaMessage,
    FaUserTie, FaRegClock, FaCircleExclamation, FaCheck,
    FaFileInvoiceDollar
} from 'react-icons/fa6';
import './inProgressCard.css';
import type {InProgressOrder} from "../../types/InProgressOrder.ts";
import type {UserRole} from '../../types/UserRole.ts';
import { useNavigate } from 'react-router-dom';
import { navigateToChat } from '../../utils/chatNavigation';

interface InProgressCardProps {
    data: InProgressOrder;
    role: UserRole;
    onViewDetail: (id: string) => void;
    onCreateInvoice?: (id: string) => Promise<void>;
    onConfirmCash?: (id: string) => Promise<void>;
}

export const InProgressCard: React.FC<InProgressCardProps> = ({data, role, onViewDetail, onCreateInvoice, onConfirmCash}) => {
    const navigate = useNavigate();
    const [invoiceLoading, setInvoiceLoading] = React.useState(false);
    const [cashLoading, setCashLoading] = React.useState(false);

    const handleChatClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (role === 'customer' && data.technicianId) {
            navigateToChat(navigate, 'customer', {
                technicianId: data.technicianId,
                orderId: data.id,
            });
            return;
        }
        navigateToChat(navigate, 'technician', {
            orderId: data.id,
            customerId: data.customerId,
        });
    };

    const handleSendInvoice = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!onCreateInvoice || invoiceLoading) return;
        setInvoiceLoading(true);
        try {
            await onCreateInvoice(data.id);
        } finally {
            setInvoiceLoading(false);
        }
    };

    // Thu tiền mặt = xác nhận thanh toán → đơn hoàn thành + settle (trừ phí ví tín dụng, cộng điểm).
    // Theo nghiệp vụ: đơn chỉ "hoàn thành" sau khi đã thanh toán (tiền mặt hoặc khách trả VNPay).
    const handleConfirmCash = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!onConfirmCash || cashLoading) return;
        setCashLoading(true);
        try {
            await onConfirmCash(data.id);
        } finally {
            setCashLoading(false);
        }
    };

    return (
        <div className={`ip-list-card ${data.isWaitingApproval ? 'needs-action' : ''}`}
             onClick={() => onViewDetail(data.id)}>
            <div className="ip-card-main">
                <div className="ip-card-header">
                    {/* Đổi màu Badge tùy thuộc vào việc có đang chờ khách xác nhận không */}
                    <span className={`ip-status-badge ${data.isWaitingApproval ? 'warning' : 'active'}`}>
                        {data.statusText}
                    </span>
                    <span className="ip-id">#{data.id}</span>
                </div>

                <h3 className="ip-title">{data.serviceName}</h3>
                <p className="ip-subtitle">{data.subService}</p>

                <div className="ip-info-grid">
                    <div className="info-item">
                        <FaUserTie className="icon"/>
                        <span>Thợ: <strong>{data.technicianName}</strong></span>
                    </div>
                    <div className="info-item">
                        <FaRegClock className="icon"/>
                        <span>Bắt đầu lúc: {data.startTime}</span>
                    </div>
                    <div className="info-item full-width">
                        <FaLocationDot className="icon"/>
                        <span>{data.address}</span>
                    </div>
                </div>

                {/* Hiển thị cảnh báo nếu có phát sinh chi phí */}
                {data.isWaitingApproval && (
                    <div className="ip-alert-msg">
                        <FaCircleExclamation/> Thợ vừa cập nhật chi phí phát sinh. Vui lòng kiểm tra!
                    </div>
                )}
            </div>

            <div className="ip-card-actions" onClick={(e) => e.stopPropagation()}>
                <div className="price-display">
                    <span className="price-label">Chi phí hiện tại</span>
                    <span className={`price-value ${data.isWaitingApproval ? 'text-warning' : ''}`}>
                        {data.currentPrice.toLocaleString('vi-VN')}đ
                    </span>
                </div>

                <button className="btn-primary" onClick={() => onViewDetail(data.id)}>
                    <FaWrench/> Xem tiến độ
                </button>
                {role === 'technician' && (
                    <>
                        <button className="btn-warning" onClick={handleSendInvoice} disabled={invoiceLoading}>
                            <FaFileInvoiceDollar/> {invoiceLoading ? 'Đang gửi...' : 'Gửi hoá đơn'}
                        </button>
                        <button className="btn-success" onClick={handleConfirmCash} disabled={cashLoading}>
                            <FaCheck/> {cashLoading ? 'Đang xử lý...' : 'Thu tiền mặt'}
                        </button>
                    </>
                )}
                {role === 'customer' && (
                    <button type="button" className="btn-secondary" onClick={handleChatClick}>
                        <FaMessage/> Chat với thợ
                    </button>
                )}
            </div>
        </div>
    );
};

export default InProgressCard; 