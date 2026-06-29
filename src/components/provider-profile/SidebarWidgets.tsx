import React, { useState, useEffect } from 'react';
import { technicianService } from '../../services/technicianService';
import type { TechnicianSchedule } from '../../services/technicianService';
import MapView from '../common/MapView';
import './SidebarWidgets.css';


export const RegistrationIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
);

export const AwardIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
);

const DAY_NAMES = ['chủ nhật', 'thứ 2', 'thứ 3', 'thứ 4', 'thứ 5', 'thứ 6', 'thứ 7'];
const DAY_NAMES_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

interface ScheduleSidebarProps {
  technicianId?: string;
}

export const ScheduleSidebar: React.FC<ScheduleSidebarProps> = ({ technicianId }) => {
  const [schedule, setSchedule] = useState<TechnicianSchedule | null>(null);

  useEffect(() => {
    if (!technicianId) return;
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - from.getDay());
    const to = new Date(from);
    to.setDate(from.getDate() + 6);
    technicianService.getTechnicianSchedule(
      technicianId,
      from.toISOString().slice(0, 10),
      to.toISOString().slice(0, 10)
    ).then(res => {
      if (res.success) setSchedule(res.data);
    }).catch(() => {});
  }, [technicianId]);

  return (
    <div className="pc-widget-card">
      <h3 className="widget-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        Lịch làm việc
      </h3>
      <div className="schedule-grid">
        {DAY_NAMES.map((_, i) => {
          const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const time = schedule?.weeklySchedule?.[dayKeys[i]];
          return (
            <div key={dayKeys[i]} className={`schedule-box${!time ? ' full' : ''}`}>
              <span className="sc-day">{DAY_NAMES_SHORT[i]}</span>
              <span className="sc-time">{time || 'Nghỉ'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const VerificationSidebar: React.FC = () => {
  return (
    <div className="pc-widget-card">
      <h3 className="widget-title">Chứng chỉ & Xác minh</h3>
      <ul className="verification-list">
        <li>
          <div className="icon-wrapper orange-bg">
            <RegistrationIcon size={16} className="text-orange-500" />
          </div>
          <span>Đã xác minh CMND/CCCD</span>
        </li>
        <li>
          <div className="icon-wrapper orange-bg">
            <AwardIcon size={16} className="text-orange-500" />
          </div>
          <span>Chứng chỉ Kỹ thuật điện HCMC</span>
        </li>
      </ul>
    </div>
  );
};

interface MapSidebarProps {
  location?: string;
}

export const MapSidebar: React.FC<MapSidebarProps> = ({ location }) => {
  return (
    <div className="map-widget-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <MapView
        address={location || 'Quận 1, HCMC'}
        height={200}
        zoom={13}
      />
      <div className="map-pin" style={{
        position: 'absolute',
        bottom: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'white',
        padding: '6px 14px',
        borderRadius: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 10,
        whiteSpace: 'nowrap',
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e02424" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#000C33' }}>{location || 'Hoạt động tại Quận 1'}</span>
      </div>
    </div>
  );
};
