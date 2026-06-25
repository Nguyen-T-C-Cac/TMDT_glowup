import React, { useState, useEffect } from 'react';
import './AboutTab.css';
import { StarIcon } from '../common/Icons';
import { technicianService } from '../../services/technicianService';

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  return `${Math.floor(diffDays / 30)} tháng trước`;
}

interface Review {
  id: string;
  authorName: string;
  authorAvatar: string;
  timeAgo: string;
  content: string;
  rating: number;
  attachedImage?: string;
}

export const AboutTab: React.FC<{ providerId?: string; onlyReviews?: boolean; onViewAllReviews?: () => void }> = ({ providerId, onlyReviews, onViewAllReviews }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    if (!providerId) return;

    setLoading(true);
    technicianService.getTechnicianReviews(providerId)
      .then(res => {
        const items = res.data?.items;
        if (items && items.length > 0) {
          setReviews(items.map((item: any) => ({
            id: item.id || item._id,
            authorName: item.authorName || item.customerName || item.userName || 'Khách hàng',
            authorAvatar: item.authorAvatar || item.customerAvatar || item.avatar || 'https://i.pravatar.cc/150?img=5',
            timeAgo: formatRelativeTime(item.createdAt),
            content: item.content || item.comment || '',
            rating: item.rating || 5,
            attachedImage: item.attachedImage || item.attachedImages?.[0] || undefined,
          })));
        } else {
          setReviews([]);
        }
      })
      .catch(err => {
        console.error('Lỗi khi lấy đánh giá', err);
        setReviews([]);
      })
      .finally(() => setLoading(false));
  }, [providerId]);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  const roundedRating = averageRating.toFixed(1);

  return (
    <div className="about-tab-container">
      {/* Về tôi */}
      {!onlyReviews && (
        <div className="profile-card">
          <h2 className="pc-title">Về tôi</h2>
          <p className="pc-text">
            Với hơn 10 năm kinh nghiệm trong lĩnh vực sửa chữa điện nước và điện lạnh tại TP. Hồ Chí Minh. Tôi cam kết mang đến dịch vụ chuyên nghiệp, minh bạch về giá cả và tận tâm trong từng chi tiết. Chuyên xử lý các ca khó cho căn hộ cao cấp và nhà phố.
          </p>
          <div className="pc-skills-wrapper">
            <span className="pc-skill-pill">Sửa máy lạnh</span>
            <span className="pc-skill-pill">Điện nước dân dụng</span>
            <span className="pc-skill-pill">Lắp đặt camera</span>
            <span className="pc-skill-pill">Vệ sinh máy giặt</span>
          </div>
        </div>
      )}

      {/* Đánh giá thực tế */}
      <div className="profile-card">
        <div className="review-header">
          <h2 className="pc-title mb-0">Đánh giá thực tế</h2>
          {!loading && reviews.length > 0 && (
            <div className="avg-rating-box">
              <span className="avg-rating-num">{roundedRating}</span>
              <div className="avg-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} size={16} className={star <= Math.round(averageRating) ? 'star-solid' : 'star-empty'} />
                ))}
              </div>
              <span className="review-count">({reviews.length} đánh giá)</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="review-list-loading">Đang tải đánh giá...</div>
        ) : reviews.length > 0 ? (
          <>
            <div className="review-list">
              {reviews.slice(0, visibleCount).map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-item-header">
                    <img src={review.authorAvatar} alt={review.authorName} className="review-avatar" />
                    <div className="review-author-info">
                      <h4 className="review-author-name">{review.authorName}</h4>
                      <span className="review-time">{review.timeAgo}</span>
                    </div>
                    <div className="review-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon key={star} size={12} className={star <= review.rating ? 'star-solid' : 'star-empty'} />
                      ))}
                    </div>
                  </div>
                  <p className="review-content">{review.content}</p>
                  {review.attachedImage && (
                    <div className="review-attachment">
                      <img src={review.attachedImage} alt="Attachment" className="review-img" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {onlyReviews ? (
              visibleCount < reviews.length && (
                <button className="view-more-btn" onClick={() => setVisibleCount(v => v + 3)}>Xem thêm</button>
              )
            ) : (
              <button className="view-more-btn" onClick={onViewAllReviews}>Xem tất cả</button>
            )}
          </>
        ) : (
          <p className="review-empty">Chưa có đánh giá nào.</p>
        )}
      </div>
    </div>
  );
};
