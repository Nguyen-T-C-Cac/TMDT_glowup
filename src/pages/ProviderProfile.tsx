import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { technicianService } from '../services/technicianService';
import { useCustomerNavigate } from '../components/layout/useCustomerNavigate';
import { ProfileHeader } from '../components/provider-profile/ProfileHeader';
import { ProfileTabs } from '../components/provider-profile/ProfileTabs';
import { AboutTab } from '../components/provider-profile/AboutTab';
import { ScheduleTab } from '../components/provider-profile/ScheduleTab';
import { ProjectsTab } from '../components/provider-profile/ProjectsTab';
import { ScheduleSidebar, VerificationSidebar, MapSidebar } from '../components/provider-profile/SidebarWidgets';
import { ChangePasswordTab } from '../components/provider-profile/ChangePasswordTab';
import './ProviderProfile.css';

export const ProviderProfile: React.FC = () => {
  const onNavigate = useCustomerNavigate();
  const location = useLocation();
  const providerData = location.state as any;

  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState(() => providerData?.activeTab || 'about');
  const [fetchedData, setFetchedData] = useState<any>(null);
  
  useEffect(() => {
    const providerId = id || providerData?.id;
    if (providerId) {
      technicianService.getTechnicianById(providerId)
        .then(res => {
          if (res.data) setFetchedData(res.data);
        })
        .catch(err => console.error('Lỗi khi lấy thông tin thợ', err));
    }
  }, [id, providerData]);

  const defaultProfile = {
    name: 'Nguyễn Văn Hùng',
    avatar: 'https://i.pravatar.cc/150?img=33',
    coverImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80',
    rating: 4.9,
    reviewCount: 1240,
    completedJobs: '1.500+',
    location: 'Quận 1, HCMC',
    isAvailable: true,
    type: 'normal',
    titleBadge: ''
  };

  const sourceData = fetchedData || providerData;
  const profileData = sourceData ? {
    ...defaultProfile,
    name: sourceData.name || sourceData.fullName || defaultProfile.name,
    avatar: sourceData.avatar || defaultProfile.avatar,
    rating: sourceData.rating || defaultProfile.rating,
    reviewCount: sourceData.reviewCount || defaultProfile.reviewCount,
    location: sourceData.location || sourceData.district || defaultProfile.location,
    type: sourceData.type || defaultProfile.type,
    titleBadge: sourceData.titleBadge || defaultProfile.titleBadge,
    isAvailable: sourceData.isAvailable ?? defaultProfile.isAvailable,
  } : defaultProfile;

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: '100vh' }}>
      <main className="pp-main-container">
        <ProfileHeader profile={profileData} onBack={() => onNavigate('find-provider')} onReviewsClick={() => setActiveTab('reviews')} />
        
        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} reviewCount={profileData.reviewCount} />

        <div className="pp-layout">
          <div className="pp-content-left">
            {activeTab === 'about' && <AboutTab onViewAllReviews={() => setActiveTab('reviews')} />}
            {activeTab === 'reviews' && <AboutTab onlyReviews={true} />}
            {activeTab === 'schedule' && <ScheduleTab />}
            {activeTab === 'projects' && <ProjectsTab />}
            {activeTab === 'security' && <ChangePasswordTab />}
          </div>
          {activeTab !== 'security' && (
            <div className="pp-sidebar-right">
              <ScheduleSidebar />
              <VerificationSidebar />
              <MapSidebar />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProviderProfile;
