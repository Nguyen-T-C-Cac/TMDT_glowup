import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileHeader.css';
import {StarIcon, BadgeCheckIcon, ArrowLeftIcon} from '../common/Icons';
import RepairRequestModal from '../modal/RepairRequestModal';
import { createConversation } from '../../services/chatService';
import { isAuthenticated } from '../../services/auth';

export interface ProfileHeaderProps {
    /** Technician user code (e.g. USR-004) — used to open a conversation. */
    code?: string;
    name: string;
    avatar: string;
    coverImage: string;
    rating: number;
    reviewCount: number;
    completedJobs: string;
    location: string;
    isAvailable: boolean;
    type?: string;
    titleBadge?: string;
}

export const ProfileHeader: React.FC<{
    profile: ProfileHeaderProps,
    onBack?: () => void,
    onReviewsClick?: () => void
}> = ({profile, onBack, onReviewsClick}) => {
    const navigate = useNavigate();
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [startingChat, setStartingChat] = useState(false);
    const [chatError, setChatError] = useState<string | null>(null);

    const handleStartChat = async () => {
        if (startingChat) return;
        if (!isAuthenticated()) {
            navigate('/auth/login');
            return;
        }
        if (!profile.code) {
            setChatError('Không xác định được mã thợ.');
            return;
        }
        try {
            setStartingChat(true);
            setChatError(null);
            const conv = await createConversation(profile.code);
            navigate('/customer/chat', { state: { openConversationId: conv.id } });
        } catch (err) {
            setChatError(err instanceof Error ? err.message : 'Không mở được cuộc trò chuyện.');
        } finally {
            setStartingChat(false);
        }
    };

    return (
        <div className="profile-header-container">
            <div className="ph-cover-wrapper">
                <img src={profile.coverImage} alt="Cover" className="ph-cover-img"/>
                <div className="ph-cover-overlay"></div>
                {onBack && (
                    <button className="ph-back-btn" onClick={onBack}>
                        <ArrowLeftIcon size={20}/>
                    </button>
                )}
            </div>

            <div className="ph-content">
                <div className="ph-avatar-section">
                    <div className="ph-avatar-wrapper">
                        <img src={profile.avatar} alt={profile.name} className="ph-avatar-img"/>
                        {profile.isAvailable && (
                            <div className="ph-status-badge">
                                <span className="dot"></span> Đang sẵn sàng
                            </div>
                        )}
                    </div>
                </div>

                <div className="ph-info-section">
                    <div className="ph-name-row">
                        <h1 className="ph-name">{profile.name}</h1>
                        {profile.type === 'premium' && profile.titleBadge && (
                            <div className="ph-premium-badge">{profile.titleBadge}</div>
                        )}
                    </div>

                    <div className="ph-stats-row">
                        <div className="ph-stat-item" style={{cursor: 'pointer'}} onClick={onReviewsClick}>
                            <StarIcon size={16} className="star-icon text-yellow-500"/>
                            <span className="ph-stat-desc ml-1">({profile.reviewCount} đánh giá)</span>
                        </div>
                        <span className="ph-dot">•</span>
                        <div className="ph-stat-item">
                            <BadgeCheckIcon size={16} className="text-gray-500"/>
                            <span className="ph-stat-val ml-1">{profile.completedJobs} đơn hoàn thành</span>
                        </div>
                        <span className="ph-dot">•</span>
                        <div className="ph-stat-item location">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                 strokeLinejoin="round" className="text-gray-500">
                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span className="ph-stat-val ml-1">{profile.location}</span>
                        </div>
                    </div>
                </div>

                <div className="ph-action-section">
                    <button
                        className="ph-primary-btn"
                        onClick={() => setIsRequestModalOpen(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        Chat ngay & Nhận báo giá
                    </button>
                    <button
                        className="ph-primary-btn"
                        style={{ background: '#fff', color: '#1E3A8A', border: '1px solid #1E3A8A' }}
                        onClick={handleStartChat}
                        disabled={startingChat}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"></path>
                        </svg>
                        {startingChat ? 'Đang mở...' : 'Nhắn tin với thợ'}
                    </button>
                    {chatError && (
                        <p style={{ color: '#DC2626', fontSize: 13, marginTop: 8, width: '100%' }}>{chatError}</p>
                    )}
                </div>
            </div>

            <RepairRequestModal
                open={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                provider={{
                    name: profile.name,
                    avatar: profile.avatar,
                    rating: profile.rating,
                    responseEta: 'Phản hồi trong ~5 phút',
                    area: profile.location,
                }}
            />
        </div>
    );
};
