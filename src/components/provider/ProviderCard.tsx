import React from 'react';
import './ProviderCard.css';
import { BadgeCheckIcon, StarIcon, MapPinIcon } from '../common/Icons';

export interface ProviderProps {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  location: string;
  skills: string[];
  price: string;
  isAvailable: boolean;
  timeAvailable?: string;
}

export const ProviderCard: React.FC<{
  provider: ProviderProps;
  onNavigate?: (page: string, data?: any) => void
}> = ({ provider, onNavigate }) => {

  return (
    <div className="provider-card">
      <div className="pc-content">
        <div className="pc-left-section">
          <div className="pc-avatar-wrapper">
            <img src={provider.avatar} alt={provider.name} className="pc-avatar" />
            <div className="pc-verified-badge"><BadgeCheckIcon size={14} /></div>
          </div>
          
          <div className="pc-info">
            <div className="pc-name-row">
              <h3 className="pc-name">{provider.name}</h3>
              <div className="pc-skills">
                {provider.skills.slice(0, 3).map(skill => (
                  <span key={skill} className="pc-skill-tag">{skill}</span>
                ))}
              </div>
            </div>
            
            <div className="pc-meta">
              <StarIcon size={14} className="star-icon" />
              <span className="pc-rating-val">{provider.rating}</span>
              <span className="pc-review-count">({provider.reviewCount})</span>
              <span className="pc-dot">•</span>
              <MapPinIcon size={14} className="location-icon" />
              <span className="pc-location">{provider.location}</span>
            </div>
          </div>
        </div>

        <div className="pc-right-section">
          <div className="pc-price-wrapper">
            <div className="pc-price-box">
              <span className="pc-price">{provider.price}</span><span className="pc-price-unit">/giờ</span>
            </div>
            {provider.isAvailable ? (
              <span className="pc-avail-now">Sẵn sàng</span>
            ) : (
              <span className="pc-avail-later">Bận đến {provider.timeAvailable}</span>
            )}
          </div>
          
          <div className="pc-actions">
            <button className="pc-btn-outline"
              onClick={() => onNavigate?.('provider-profile', { id: provider.id, name: provider.name, avatar: provider.avatar })}>
              Hồ sơ
            </button>
            <button
              className="pc-btn-solid"
              onClick={() => onNavigate?.('open-modal', provider)}
            >
              Gửi yêu cầu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
