import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { technicianService } from '../services/technicianService';
import { useCustomerNavigate } from '../components/layout/useCustomerNavigate';
import { ProfileHeader } from '../components/provider-profile/ProfileHeader';
import { ProfileTabs } from '../components/provider-profile/ProfileTabs';
import { AboutTab } from '../components/provider-profile/AboutTab';
import { ScheduleTab } from '../components/provider-profile/ScheduleTab';
import { ProjectsTab } from '../components/provider-profile/ProjectsTab';
import { ScheduleSidebar, VerificationSidebar, MapSidebar } from '../components/provider-profile/SidebarWidgets';
import { resolveTechnicianIdFromLocation } from '../utils/providerNavigation';
import './ProviderProfile.css';

export const ProviderProfile: React.FC = () => {
  const onNavigate = useCustomerNavigate();
  const location = useLocation();
  const providerData = location.state as any;
  const searchParams = new URLSearchParams(location.search);
  const providerId = resolveTechnicianIdFromLocation(searchParams, providerData);
  const [activeTab, setActiveTab] = useState(() => providerData?.activeTab || 'about');
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!!providerId); 

  useEffect(() => {
    if (!providerId) return;
    setIsLoading(true); 
    technicianService.getTechnicianById(providerId)
      .then(res => {
        if (res.data) setFetchedData(res.data);
      })
      .catch(err => console.error('Lỗi khi lấy thông tin thợ', err))
      .finally(() => setIsLoading(false)); 
  }, [providerId]);

  const defaultProfile = {
    name: 'Nguyễn Văn A',
    avatar: 'https://segayanime.com/wp-content/uploads/2026/01/avatar-fb-mac-dinh-1.jpg',
    coverImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80',
    rating: 4.9,
    reviewCount: 1240,
    completedJobs: '1.500+',
    location: 'Quận 1, HCMC',
    isAvailable: true,
    type: 'normal',
    titleBadge: '',
    rewardPoints: 0,
  };

  const sourceData = fetchedData || providerData;
  const profileData = sourceData ? {
    ...defaultProfile,
    technicianId: sourceData.id || sourceData.technicianId || providerId || undefined,
    name: sourceData.fullName || sourceData.name || defaultProfile.name,             // ← SỬA thứ tự ưu tiên
    avatar: sourceData.avatar || defaultProfile.avatar,
    coverImage: sourceData.coverImage || defaultProfile.coverImage,                  // ← THÊM
    rating: sourceData.rating || defaultProfile.rating,
    reviewCount: sourceData.reviewCount ?? defaultProfile.reviewCount,
    completedJobs: sourceData.completedJobs != null                                  // ← SỬA: dùng số thật
      ? `${Number(sourceData.completedJobs).toLocaleString('vi-VN')}+`
      : defaultProfile.completedJobs,
    location: sourceData.location || sourceData.district || defaultProfile.location,
    type: sourceData.type || defaultProfile.type,
    titleBadge: sourceData.titleBadge || defaultProfile.titleBadge,
    isAvailable: sourceData.isAvailable ?? defaultProfile.isAvailable,
    rewardPoints: sourceData.rewardPoints ?? defaultProfile.rewardPoints,
    // THÊM: các field mới truyền xuống sidebar và tab
    bio: sourceData.bio ?? '',
    skills: sourceData.skills ?? [],
    verificationStatus: sourceData.verificationStatus ?? null,
    yearsExperience: sourceData.yearsExperience ?? null,
    certificates: sourceData.certificates ?? [],
    district: sourceData.district ?? null,
  } : defaultProfile;

  if (isLoading) { //loading state
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Đang tải hồ sơ thợ...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: '100vh' }}>
      <main className="pp-main-container">
        <ProfileHeader profile={profileData} onBack={() => onNavigate('provider')} onReviewsClick={() => setActiveTab('reviews')} />

        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} reviewCount={profileData.reviewCount} />

        <div className="pp-layout">
          <div className="pp-content-left">
            {activeTab === 'about' && (
              <AboutTab
                providerId={providerId}
                bio={profileData.bio}        
                skills={profileData.skills}  
                onViewAllReviews={() => setActiveTab('reviews')}
              />
            )}
            {activeTab === 'reviews' && <AboutTab providerId={providerId} onlyReviews={true} />}
            {activeTab === 'schedule' && <ScheduleTab technicianCode={providerId} />}
            {activeTab === 'projects' && <ProjectsTab technicianId={providerId} />}
          </div>
          
            <div className="pp-sidebar-right">
              <ScheduleSidebar technicianCode={providerId} />  {/* ← SỬA: truyền prop */}
              <VerificationSidebar
                verificationStatus={profileData.verificationStatus}
                yearsExperience={profileData.yearsExperience}
                certificates={profileData.certificates}
              />  {/* ← THÊM props */}
              <MapSidebar location={profileData.location} />  {/* ← THÊM prop */}
            </div>
          
        </div>
      </main>
    </div>
  );
};

export default ProviderProfile;