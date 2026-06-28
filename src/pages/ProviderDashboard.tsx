import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { StatsCards } from '../components/dashboard/StatsCards';
import { EarningsChart } from '../components/dashboard/EarningsChart';
import { AvailableTasks } from '../components/dashboard/AvailableTasks';
import { TodaySchedule } from '../components/dashboard/TodaySchedule';
import { getStoredUser } from '../services/auth';
import { getVerificationByTechnician } from '../services/verificationService';
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

  const [verificationStatus, setVerificationStatus] = useState<string>('checking');
  const [isAcceptingJobs, setIsAcceptingJobs] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      const user = getStoredUser();
      if (user) {
        setUserName(user.fullName || '');
        const techId = user.code || `TECH-${user.id}`;
        try {
          const response = await getVerificationByTechnician(techId);
          if (response && response.success && response.data && isMounted) {
            const status = response.data.status;
            setVerificationStatus(status);
            if (status === 'approved') {
              setIsAcceptingJobs(true);
            }
          } else if (isMounted) {
            setVerificationStatus('not_submitted');
          }
        } catch (error) {
          if (isMounted) setVerificationStatus('error');
        }
      }
    };
    fetchStatus();
    return () => { isMounted = false; };
  }, []);

  const toggleAcceptingJobs = () => {
    if (verificationStatus !== 'approved') {
      alert('Bạn cần xác minh tài khoản thành công để nhận việc!');
      return;
    }
    setIsAcceptingJobs(!isAcceptingJobs);
  };

  return (
    <div className="pd-layout">
      {/*<TechnicianSidebar activeItem="dashboard" onNavigate={onNavigate} />*/}

      <div className="pd-main">
        {/* Top Header Bar */}
        <div className="pd-top-bar">
          <div className="pd-greeting">
            <span className="pd-greeting-text">CHÀO BUỔI SÁNG, {userName.toUpperCase() || 'KỸ THUẬT VIÊN'}</span>
            <h1 className="pd-page-title">Tổng quan công việc</h1>
          </div>
          <div className="pd-availability" onClick={toggleAcceptingJobs} style={{ cursor: verificationStatus === 'approved' ? 'pointer' : 'not-allowed' }}>
            <span className="pd-availability-label">TRẠNG THÁI</span>
            <span className="pd-availability-status">
              {verificationStatus === 'checking' ? (
                 <><span className="status-dot" style={{ backgroundColor: 'gray' }}></span>Đang kiểm tra...</>
              ) : verificationStatus === 'approved' ? (
                isAcceptingJobs ? (
                  <><span className="status-dot-green"></span>Đang nhận việc</>
                ) : (
                  <><span className="status-dot" style={{ backgroundColor: 'orange' }}></span>Tạm nghỉ</>
                )
              ) : (
                <><span className="status-dot" style={{ backgroundColor: 'red' }}></span>Chưa xác minh</>
              )}
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
