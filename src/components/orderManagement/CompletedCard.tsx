import React from 'react';
import type { UserRole } from '../../types/UserRole';
import { FaRegCalendar, FaStar, FaWrench } from 'react-icons/fa6';
import './completedCard.css';

export interface CompletedOrder {
    id: string;
    serviceName: string;
    subService: string;
    customerName: string;
    technicianName: string;
    completionDate: string;
    totalPrice: number;
    rating: number;
    reviewed?: boolean;
    isWarranty?: boolean;
}

interface CompletedCardProps {
    data: CompletedOrder;
    role: UserRole;
    onViewDetail: (id: string) => void;
}

export const CompletedCard: React.FC<CompletedCardProps> = ({ data, role, onViewDetail }) => {
    return (
        <div className="cmp-list-card" onClick={() => onViewDetail(data.id)}>
            <div className="cmp-icon-box">
                <FaWrench />
            </div>

            <div className="cmp-card-main">
                <h3 className="cmp-person-name">
                    {role === 'technician' ? data.customerName : data.technicianName}
                </h3>
                <p className="cmp-service-name">{data.serviceName} - {data.subService}</p>

                <div className="cmp-meta-row">
                    <span className="cmp-date">
                        <FaRegCalendar /> {data.completionDate}
                    </span>
                    {data.reviewed ? (
                        <div className="cmp-stars">
                            {[...Array(5)].map((_, i) => (
                                <FaStar key={i} className={i < data.rating ? 'star-filled' : 'star-empty'} />
                            ))}
                        </div>
                    ) : (
                        data.rating > 0 && (
                            <div className="cmp-stars">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} className={i < data.rating ? 'star-filled' : 'star-empty'} />
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>

            <div className="cmp-card-actions">
                <div className="cmp-price-block">
                    <span className="price-label">TỔNG CHI PHÍ</span>
                    <span className="price-value">{data.totalPrice.toLocaleString('vi-VN')} VND</span>
                </div>
                {data.reviewed && (
                    <span className="cmp-reviewed-badge">Đã đánh giá</span>
                )}
            </div>
        </div>
    );
};
