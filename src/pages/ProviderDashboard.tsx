import React, { useState, useEffect } from 'react';
import { StatsCards } from '../components/dashboard/StatsCards';
import { EarningsChart } from '../components/dashboard/EarningsChart';
import { AvailableTasks } from '../components/dashboard/AvailableTasks';
import { TodaySchedule } from '../components/dashboard/TodaySchedule';
import { getStoredUser } from '../services/auth';
import { getVerificationByTechnician } from '../services/verificationService';
import './ProviderDashboard.css';

const ProviderDashboard: React.FC = () => {
  const [verificationStatus, setVerificationStatus] = useState<string>('checking');
  const [isAcceptingJobs, setIsAcceptingJobs] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');

    const getGreeting = () => {
  const hour = new Date().getHours();

    if (hour >= 5 && hour < 11) {
      return "CHÀO BUỔI SÁNG";
    }

    if (hour >= 11 && hour < 13) {
      return "CHÀO BUỔI TRƯA";
    }

    if (hour >= 13 && hour < 18) {
      return "CHÀO BUỔI CHIỀU";
    }

    if (hour >= 18 && hour < 22) {
      return "CHÀO BUỔI TỐI";
    }

    return "CHÚC BẠN NGỦ NGON";
  };

  const greeting = getGreeting();

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
        } catch {
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
      <div className="pd-main">
        <div className="pd-top-bar">
          <div className="pd-greeting">
            <span className="pd-greeting-text">
              {userName
                ? `${greeting}, ${userName.toUpperCase()}`
                : `${greeting}, KỸ THUẬT VIÊN`}
            </span>
            <h1 className="pd-page-title">Tổng quan công việc</h1>
          </div>
          <div
            className="pd-availability"
            onClick={toggleAcceptingJobs}
            style={{ cursor: verificationStatus === 'approved' ? 'pointer' : 'not-allowed' }}
          >
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

        <div className="pd-content-grid">
          <div className="pd-left-col">
            <StatsCards />
            <EarningsChart />
            <AvailableTasks />
          </div>

          <div className="pd-right-col">
            <TodaySchedule />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;