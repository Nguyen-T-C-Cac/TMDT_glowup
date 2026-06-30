import React from 'react';
import './StatsCards.css';

interface StatsCardsProps {
  newOrders: number;
  completedOrders: number;
  completedToday: number;
  monthEarnings: number;
}

const formatCurrency = (value: number) => `${value.toLocaleString('vi-VN')} đ`;

const newJobsIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const completedIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const earningsIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
    <line x1="2" y1="10" x2="22" y2="10"></line>
  </svg>
);

export const StatsCards: React.FC<StatsCardsProps> = ({
  newOrders,
  completedOrders,
  completedToday,
  monthEarnings,
}) => {
  return (
    <div className="stats-cards-row">
      <div className="stat-card-item">
        <div className="stat-card-top">
          <div className="stat-card-icon">{newJobsIcon}</div>
        </div>
        <div className="stat-card-bottom">
          <h3 className="stat-card-value">{String(newOrders).padStart(2, '0')}</h3>
          <p className="stat-card-label">Đơn đang nhận</p>
        </div>
      </div>

      <div className="stat-card-item">
        <div className="stat-card-top">
          <div className="stat-card-icon">{completedIcon}</div>
          <span className="stat-card-badge" style={{ backgroundColor: '#6366f118', color: '#6366f1' }}>
            +{completedToday} hôm nay
          </span>
        </div>
        <div className="stat-card-bottom">
          <h3 className="stat-card-value">{String(completedOrders).padStart(2, '0')}</h3>
          <p className="stat-card-label">Đơn đã hoàn thành</p>
        </div>
      </div>

      <div className="stat-card-item stat-card-highlight">
        <div className="stat-card-top">
          <div className="stat-card-icon icon-highlight">{earningsIcon}</div>
          <span className="stat-card-badge" style={{ backgroundColor: '#10b98118', color: '#10b981' }}>
            Tháng này
          </span>
        </div>
        <div className="stat-card-bottom">
          <h3 className="stat-card-value value-highlight">{formatCurrency(monthEarnings)}</h3>
          <p className="stat-card-label label-highlight">Thu nhập tháng này</p>
        </div>
      </div>
    </div>
  );
};
