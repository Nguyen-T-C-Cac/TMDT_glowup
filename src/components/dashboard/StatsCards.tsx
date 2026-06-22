import React from 'react';
import './StatsCards.css';

interface StatCard {
  id: string;
  icon: React.ReactNode;
  value: string;
  label: string;
  badge?: string;
  badgeColor?: string;
  highlight?: boolean;
}

const statsData: StatCard[] = [
  {
    id: 'new-jobs',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
    ),
    value: '04',
    label: 'Đơn mới được giao',
    badge: '+2 đơn mới',
    badgeColor: '#10b981',
  },
  {
    id: 'completed',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    ),
    value: '12',
    label: 'Đơn đã hoàn thành',
    badge: 'Hôm nay',
    badgeColor: '#6366f1',
  },
  {
    id: 'earnings',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"></rect>
        <line x1="2" y1="10" x2="22" y2="10"></line>
      </svg>
    ),
    value: '8.420.000 đ',
    label: 'Tổng thu nhập',
    badge: 'Tuần này',
    highlight: true,
  },
];

export const StatsCards: React.FC = () => {
  return (
    <div className="stats-cards-row">
      {statsData.map(stat => (
        <div key={stat.id} className={`stat-card-item ${stat.highlight ? 'stat-card-highlight' : ''}`}>
          <div className="stat-card-top">
            <div className={`stat-card-icon ${stat.highlight ? 'icon-highlight' : ''}`}>
              {stat.icon}
            </div>
            {stat.badge && (
              <span
                className="stat-card-badge"
                style={stat.badgeColor ? { backgroundColor: `${stat.badgeColor}18`, color: stat.badgeColor } : {}}
              >
                {stat.badge}
              </span>
            )}
          </div>
          <div className="stat-card-bottom">
            <h3 className={`stat-card-value ${stat.highlight ? 'value-highlight' : ''}`}>{stat.value}</h3>
            <p className={`stat-card-label ${stat.highlight ? 'label-highlight' : ''}`}>{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
