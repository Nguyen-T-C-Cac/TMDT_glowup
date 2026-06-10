import React from 'react';
// import { useNavigate } from 'react-router-dom';
import { StatsCards } from '../components/dashboard/StatsCards';
import { EarningsChart } from '../components/dashboard/EarningsChart';
import { AvailableTasks } from '../components/dashboard/AvailableTasks';
import { TodaySchedule } from '../components/dashboard/TodaySchedule';
import './ProviderDashboard.css';

// const pageMap: Record<string, string> = {
//   'home': '/',
//   'find-provider': '/find-provider',
//   'provider-profile': '/provider-profile',
//   'provider-dashboard': '/provider-dashboard',
//   'dashboard': '/provider-dashboard',
//   'jobs': '/technician/jobs',
//   'profile': '/technician/profile',
//   'earnings': '/provider-dashboard',
//   'wallet': '/technician/wallet',
//   'services': '/services',
// };

const ProviderDashboard: React.FC = () => {
  // const nav = useNavigate();
  // const onNavigate = (page: string, data?: unknown) => {
  //   const path = pageMap[page] || '/';
  //   nav(path, { state: data });
  // };

  return (
    <div className="pd-layout">
      {/*<TechnicianSidebar activeItem="dashboard" onNavigate={onNavigate} />*/}

      <div className="pd-main">
        {/* Top Header Bar */}
        <div className="pd-top-bar">
          <div className="pd-greeting">
            <span className="pd-greeting-text">CHÀO BUỔI SÁNG, MINH</span>
            <h1 className="pd-page-title">Tổng quan công việc</h1>
          </div>
          <div className="pd-availability">
            <span className="pd-availability-label">TRẠNG THÁI</span>
            <span className="pd-availability-status">
              <span className="status-dot-green"></span>
              Đang nhận việc
            </span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="pd-content-grid">
          {/* Left Column */}
          <div className="pd-left-col">
            <StatsCards />
            <EarningsChart />
            <AvailableTasks />
          </div>

          {/* Right Column */}
          <div className="pd-right-col">
            <TodaySchedule />
          </div>
        </div>

        {/* Floating Action Button */}
        <button className="pd-fab" title="Thêm mới">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProviderDashboard;
