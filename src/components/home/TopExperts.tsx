
import React, { useState, useEffect } from 'react';
import './TopExperts.css';

import {
  StarIcon,
  BadgeCheckIcon,
  CheckCircleIcon,
  ClockIcon,
} from '../common/Icons';

import { getTopTechnicians } from '../../services/providerService';

import { mapTechnicianToExpertCard } from '../../services/technicianMapper';

type Expert = ReturnType<typeof mapTechnicianToExpertCard>;

interface TopExpertsProps {
  onNavigate?: (page: string, data?: any) => void;
}

export const TopExperts: React.FC<TopExpertsProps> = ({
  onNavigate,
}) => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        setLoading(true);
        setError(null);

        const technicians =
          await getTopTechnicians(3);

        const transformedExperts =
          technicians.map((tech, index) =>
            mapTechnicianToExpertCard(
              tech,
              index,
            ),
          );

        setExperts(transformedExperts);
      } catch (err) {
        console.error(
          'Failed to fetch experts:',
          err,
        );

        setError(
          'Không thể tải danh sách chuyên gia',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, []);

  const handleExpertClick = (
    expert: Expert,
  ) => {
    onNavigate?.('provider-profile', {
      name: expert.name,
      avatar: expert.imageUrl,
      rating: expert.rating,
      reviewCount:
        parseInt(expert.completedJobs) || 0,
      location: 'TP. Hồ Chí Minh',
      type: 'premium',
      titleBadge:
        expert.badgeLabel ||
        'CHUYÊN GIA CỦA THÁNG',
    });
  };

  return (
    <section className="home-experts">
      <div className="experts-header">
        <h2 className="section-title text-center">
          Chuyên gia hàng đầu
        </h2>

        <p className="section-subtitle text-center">
          Đội ngũ kỹ thuật viên có tay nghề
          cao, đã được xác minh 100% với
          trên 5 năm kinh nghiệm thực chiến.
        </p>
      </div>

      <div className="experts-grid">
        {loading && (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '40px 20px',
            }}
          >
            <p>
              Đang tải danh sách chuyên
              gia...
            </p>
          </div>
        )}

        {error && (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '40px 20px',
              color: '#e74c3c',
            }}
          >
            <p>{error}</p>
          </div>
        )}

        {!loading &&
          !error &&
          experts.length === 0 && (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '40px 20px',
              }}
            >
              <p>
                Không có dữ liệu chuyên
                gia
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          experts.map((expert) => (
            <div
              key={expert.id}
              className="expert-card"
              onClick={() =>
                handleExpertClick(expert)
              }
              style={{ cursor: 'pointer' }}
            >
              <div
                className={`badge-tier badge-${expert.badge.toLowerCase()}`}
              >
                {expert.badge}
              </div>

              <div className="expert-info-top">
                <div className="expert-avatar-wrapper">
                  <img
                    src={expert.imageUrl}
                    alt={expert.name}
                    className="expert-avatar"
                  />

                  <div className="verified-badge">
                    <BadgeCheckIcon size={12} />
                  </div>
                </div>

                <div className="expert-name-title">
                  <h3 className="expert-name">
                    {expert.name}
                  </h3>

                  <p className="expert-title">
                    {expert.title}
                  </p>

                  <div className="expert-rating">
                    <StarIcon
                      size={14}
                      className="star-icon"
                    />

                    <span className="rating-value">
                      {expert.rating}
                    </span>
                  </div>
                </div>
              </div>

              <div className="expert-stats">
                <div className="stat-item">
                  <ClockIcon
                    size={16}
                    className="stat-icon"
                  />

                  <span>
                    {expert.experience}
                  </span>
                </div>

                <div className="stat-item">
                  <CheckCircleIcon
                    size={16}
                    className="stat-icon"
                  />

                  <span>
                    Hoàn thành:{' '}
                    {expert.completedJobs}
                  </span>
                </div>
              </div>

              <button className="btn-request">
                Gửi yêu cầu →
              </button>
            </div>
          ))}
      </div>
    </section>
  );
};