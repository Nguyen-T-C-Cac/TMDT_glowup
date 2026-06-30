import React, { useCallback, useEffect, useState } from 'react';
import { StatsCards } from '../components/dashboard/StatsCards';
import { EarningsChart } from '../components/dashboard/EarningsChart';
import { AvailableTasks } from '../components/dashboard/AvailableTasks';
import { TodaySchedule } from '../components/dashboard/TodaySchedule';
import { technicianService } from '../services/technician/technicianService';
import { getStoredUser } from '../services/auth';
import { getVerificationByTechnician } from '../services/verificationService';
import type { TechnicianDashboard } from '../types/technician';
import './ProviderDashboard.css';

const greetingByHour = () => {
  const h = new Date().getHours();
  if (h < 11) return 'CHÀO BUỔI SÁNG';
  if (h < 14) return 'CHÀO BUỔI TRƯA';
  if (h < 18) return 'CHÀO BUỔI CHIỀU';
  return 'CHÀO BUỔI TỐI';
};

const ProviderDashboard: React.FC = () => {
  const currentUser = getStoredUser();
  const technicianCode = currentUser?.code;

  const [data, setData] = useState<TechnicianDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!technicianCode) {
      setError('Không xác định được tài khoản thợ. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setData(await technicianService.getDashboard(technicianCode));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải tổng quan công việc');
    } finally {
      setLoading(false);
    }
  }, [technicianCode]);

  useEffect(() => {
    load();
  }, [load]);

  const greetingName = (currentUser?.fullName || 'BẠN').toUpperCase();

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
      <div className="pd-main">
        {/* Top Header Bar */}
        <div className="pd-top-bar">
          <div className="pd-greeting">
            <span className="pd-greeting-text">{greetingByHour()}, {userName ? userName.toUpperCase() : greetingName}</span>
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

        {loading && <div className="pd-state">Đang tải tổng quan công việc...</div>}
        {!loading && error && <div className="pd-state pd-state--error">{error}</div>}

        {!loading && !error && data && (
          <div className="pd-content-grid">
            {/* Left Column */}
            <div className="pd-left-col">
              <StatsCards
                newOrders={data.newOrders}
                completedOrders={data.completedOrders}
                completedToday={data.completedToday}
                monthEarnings={data.monthEarnings}
              />
              <EarningsChart earnings7d={data.earnings7d} earnings30d={data.earnings30d} />
              <AvailableTasks />
            </div>

            {/* Right Column */}
            <div className="pd-right-col">
              <TodaySchedule schedule={data.todaySchedule} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
