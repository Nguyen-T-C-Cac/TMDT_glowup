import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { X, Star, CheckCircle } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import './css/reviewModal.css';

const RATING_HINTS = [
    '',
    'Rất tệ - Thợ làm không đạt yêu cầu',
    'Tệ - Cần cải thiện nhiều',
    'Tạm ổn - Chất lượng ở mức trung bình',
    'Tốt - Hài lòng với dịch vụ',
    'Tuyệt vời - Rất hài lòng, sẽ giới thiệu cho bạn bè',
];

interface ReviewModalProps {
    open: boolean;
    onClose: () => void;
    orderId: string;
    technicianName?: string;
    onSuccess: (rating: number) => void;
    editData?: { rating: number; content?: string };
}

const ReviewModal: React.FC<ReviewModalProps> = ({ open, onClose, orderId, technicianName, onSuccess, editData }) => {
    const [rating, setRating] = useState(editData?.rating ?? 0);
    const [hoverRating, setHoverRating] = useState(0);
    const [content, setContent] = useState(editData?.content ?? '');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const isEditing = !!editData;

    useEffect(() => {
        setRating(editData?.rating ?? 0);
        setContent(editData?.content ?? '');
        setError(null);
        setSuccess(false);
    }, [editData, open]);

    const handleSubmit = async () => {
        if (rating < 1) return;
        setSubmitting(true);
        setError(null);
        try {
            if (isEditing) {
                await reviewService.updateReview(orderId, {
                    rating,
                    content: content.trim() || undefined,
                });
            } else {
                await reviewService.createReview(orderId, {
                    rating,
                    content: content.trim() || undefined,
                });
            }
            setSuccess(true);
            setTimeout(() => {
                onSuccess(rating);
                handleReset();
            }, 1500);
        } catch (err: unknown) {
            const message =
                err && typeof err === 'object' && 'response' in err
                    ? String((err as { response: { data?: { message?: string } } }).response?.data?.message ?? '')
                    : '';
            setError(message || 'Không thể gửi đánh giá. Vui lòng thử lại sau.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setRating(0);
        setHoverRating(0);
        setContent('');
        setError(null);
        setSuccess(false);
        onClose();
    };

    return (
        <Modal open={open} onClose={submitting ? () => {} : handleReset}>
            <div className="review-modal">
                <header className="review-header">
                    <div className="header-info">
                        <h2 className="title">{isEditing ? 'CHỈNH SỬA ĐÁNH GIÁ' : 'ĐÁNH GIÁ DỊCH VỤ'}</h2>
                        <span className="sub">Đơn hàng #{orderId}{technicianName ? ` - Thợ: ${technicianName}` : ''}</span>
                    </div>
                    <button className="close-btn" onClick={handleReset} disabled={submitting} aria-label="Đóng">
                        <X size={24} />
                    </button>
                </header>

                {success ? (
                    <div className="review-success">
                        <CheckCircle className="success-icon" size={48} />
                        <h3>Đã gửi đánh giá thành công!</h3>
                        <p>Cảm ơn bạn đã chia sẻ trải nghiệm.</p>
                    </div>
                ) : (
                    <>
                        <div className="review-body">
                            {error && <div className="danger-notice">{error}</div>}

                            <div className="review-rating-section">
                                <div className="review-rating-label">Chất lượng dịch vụ</div>
                                <div className="review-stars-input">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={36}
                                            className={`star-icon ${star <= (hoverRating || rating) ? 'active' : ''}`}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            fill={star <= (hoverRating || rating) ? '#f59e0b' : 'none'}
                                            stroke={star <= (hoverRating || rating) ? '#f59e0b' : '#d1d5db'}
                                            strokeWidth={1.5}
                                        />
                                    ))}
                                </div>
                                <div className="review-rating-hint">
                                    {rating > 0 ? RATING_HINTS[rating] : 'Chạm vào số sao để đánh giá'}
                                </div>
                            </div>

                            <div className="review-comment-section">
                                <label htmlFor="review-content">Chia sẻ cảm nghĩ của bạn (không bắt buộc)</label>
                                <textarea
                                    id="review-content"
                                    placeholder="Nhập nhận xét về chất lượng sửa chữa, thái độ thợ..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    maxLength={1000}
                                />
                            </div>
                        </div>

                        <footer className="review-footer">
                            <button className="btn-text" onClick={handleReset} disabled={submitting}>
                                Hủy
                            </button>
                            <button
                                className="btn-solid-primary"
                                onClick={handleSubmit}
                                disabled={rating < 1 || submitting}
                            >
                                {submitting ? 'Đang gửi...' : isEditing ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
                            </button>
                        </footer>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default ReviewModal;
