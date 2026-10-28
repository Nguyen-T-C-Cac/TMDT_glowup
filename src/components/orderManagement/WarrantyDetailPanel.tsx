import React, { useEffect, useState } from 'react';
import type { UserRole } from '../../types/UserRole';
import type { WarrantyResponse } from '../../types/warranty';
import { orderService } from '../../services/order/orderService';
import {
    FaArrowLeft, FaShieldHalved, FaClock, FaUser,
    FaCheck, FaXmark, FaCalendarDays
} from 'react-icons/fa6';
import WarrantyModal from '../modal/WarrantyModal';
import './warrantyDetailPanel.css';

interface WarrantyDetailPanelProps {
    orderId: string;
    role: UserRole;
    onBack: () => void;
    onAccepted: () => void;
}

const statusBadgeClass = (status: string): string => {
    switch (status) {
        case 'pending': return 'wd-badge-pending';
        case 'in-progress': return 'wd-badge-progress';
        case 'completed': return 'wd-badge-done';
        case 'rejected': return 'wd-badge-rejected';
        case 'expired': return 'wd-badge-expired';
        default: return '';
    }
};

const statusLabel = (status: string): string => {
    switch (status) {
        case 'pending': return 'Đang chờ';
        case 'in-progress': return 'Đang xử lý';
        case 'completed': return 'Hoàn thành';
        case 'rejected': return 'Bị từ chối';
        case 'expired': return 'Hết hạn';
        default: return status;
    }
};

export const WarrantyDetailPanel: React.FC<WarrantyDetailPanelProps> = ({ orderId, role, onBack, onAccepted }) => {
    const [warranty, setWarranty] = useState<WarrantyResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [showWarrantyModal, setShowWarrantyModal] = useState(false);
    const [submittingCreate, setSubmittingCreate] = useState(false);

    // Reject modal state
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        let cancelled = false;

        const loadWarranty = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await orderService.getWarranty(orderId);
                if (!cancelled) setWarranty(data);
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Không thể tải thông tin bảo hành');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadWarranty();
        return () => { cancelled = true; };
    }, [orderId]);

    const handleAccept = async () => {
        if (!warranty) return;
        setSubmitting(true);
        try {
            const updated = await orderService.acceptWarranty(warranty.id);
            setWarranty(updated);
            alert('Đã chấp nhận yêu cầu bảo hành!');
            onAccepted();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Không thể chấp nhận yêu cầu');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!warranty || !rejectReason.trim()) return;
        setSubmitting(true);
        try {
            const updated = await orderService.rejectWarranty(warranty.id, rejectReason.trim());
            setWarranty(updated);
            setShowRejectModal(false);
            setRejectReason('');
            alert('Đã từ chối yêu cầu bảo hành!');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Không thể từ chối yêu cầu');
        } finally {
            setSubmitting(false);
        }
    };

    const handleWarrantySubmit = async (description: string, images: string[], scheduledAt: string | null) => {
        setSubmittingCreate(true);
        try {
            const updated = await orderService.createWarranty(orderId, {
                description,
                images: images.length > 0 ? images : undefined,
                scheduledAt: scheduledAt ?? undefined,
            });
            setWarranty(updated);
            setShowWarrantyModal(false);
            alert('Yêu cầu bảo hành đã được gửi lại.');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Không thể gửi lại yêu cầu bảo hành');
        } finally {
            setSubmittingCreate(false);
        }
    };

    const isTechnician = role === 'technician';
    const isPending = warranty?.status === 'pending';
    const warrantyPeriodActive = (warranty?.remainingDays ?? 0) > 0;

    if (loading) {
        return (
            <div className="wd-panel">
                <div className="wd-header">
                    <button className="wd-back-btn" onClick={onBack}><FaArrowLeft /> BẢO HÀNH</button>
                </div>
                <div className="wd-loading">Đang tải thông tin bảo hành...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="wd-panel">
                <div className="wd-header">
                    <button className="wd-back-btn" onClick={onBack}><FaArrowLeft /> BẢO HÀNH</button>
                </div>
                <div className="wd-error">{error}</div>
            </div>
        );
    }

    if (!warranty) {
        return (
            <div className="wd-panel">
                <div className="wd-header">
                    <button className="wd-back-btn" onClick={onBack}><FaArrowLeft /> BẢO HÀNH</button>
                </div>
                <div className="wd-empty">Chưa có yêu cầu bảo hành cho đơn này.</div>
            </div>
        );
    }

    return (
        <div className="wd-panel">
            <div className="wd-header">
                <button className="wd-back-btn" onClick={onBack}>
                    <FaArrowLeft /> CHI TIẾT BẢO HÀNH
                </button>
                <span className="wd-code">#{warranty.id}</span>
            </div>

            {/* Status badge */}
            <div className="wd-status-row">
                <span className={`wd-status-badge ${statusBadgeClass(warranty.status)}`}>
                    <FaShieldHalved /> {statusLabel(warranty.status)}
                </span>
                {warranty.remainingDays != null && warranty.status === 'in-progress' && (
                    <span className="wd-remaining">Còn {warranty.remainingDays} ngày bảo hành</span>
                )}
            </div>

            {/* Warranty info card */}
            <div className="wd-card">
                <h3 className="wd-card-title">Thông tin yêu cầu bảo hành</h3>
                <div className="wd-info-grid">
                    <div className="wd-info-item">
                        <FaCalendarDays className="wd-info-icon" />
                        <div>
                            <span className="wd-info-label">Ngày gửi yêu cầu</span>
                            <span className="wd-info-value">
                                {warranty.createdAt
                                    ? new Date(warranty.createdAt).toLocaleString('vi-VN')
                                    : '--'}
                            </span>
                        </div>
                    </div>
                    <div className="wd-info-item">
                        <FaShieldHalved className="wd-info-icon" />
                        <div>
                            <span className="wd-info-label">Số lần yêu cầu bảo hành của đơn</span>
                            <span className="wd-info-value">
                                {warranty.claimCount ?? 1} lần
                            </span>
                        </div>
                    </div>
                    {warranty.scheduledAt && (
                        <div className="wd-info-item">
                            <FaClock className="wd-info-icon" />
                            <div>
                                <span className="wd-info-label">Lịch hẹn kiểm tra</span>
                                <span className="wd-info-value">
                                    {new Date(warranty.scheduledAt).toLocaleString('vi-VN')}
                                </span>
                            </div>
                        </div>
                    )}
                    {warranty.warrantyExpiresAt && (
                        <div className="wd-info-item">
                            <FaCalendarDays className="wd-info-icon" />
                            <div>
                                <span className="wd-info-label">Hạn bảo hành</span>
                                <span className="wd-info-value">
                                    {new Date(warranty.warrantyExpiresAt).toLocaleString('vi-VN')}
                                </span>
                            </div>
                        </div>
                    )}
                    {warranty.technician && (
                        <div className="wd-info-item">
                            <FaUser className="wd-info-icon" />
                            <div>
                                <span className="wd-info-label">Thợ phụ trách</span>
                                <span className="wd-info-value">{warranty.technician.fullName}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="wd-card">
                <h3 className="wd-card-title">Mô tả sự cố</h3>
                <p className="wd-description">{warranty.description || 'Không có mô tả'}</p>
            </div>

            {/* Images */}
            {warranty.images && warranty.images.length > 0 && (
                <div className="wd-card">
                    <div className="wd-card-header">
                        <h3 className="wd-card-title">Ảnh bằng chứng</h3>
                        <span className="wd-count">{warranty.images.length} ảnh</span>
                    </div>
                    <div className="wd-image-grid">
                        {warranty.images.map((url, idx) => (
                            <img key={idx} src={url} alt={`Bằng chứng ${idx + 1}`} />
                        ))}
                    </div>
                </div>
            )}

            {warranty.previousRejectedClaim && (
                <div className="wd-card wd-card-secondary">
                    <h3 className="wd-card-title">Yêu cầu trước bị từ chối</h3>
                    <div className="wd-info-grid">
                        <div className="wd-info-item">
                            <span className="wd-info-label">Ngày gửi</span>
                            <span className="wd-info-value">
                                {warranty.previousRejectedClaim.createdAt
                                    ? new Date(warranty.previousRejectedClaim.createdAt).toLocaleString('vi-VN')
                                    : '--'}
                            </span>
                        </div>
                        {warranty.previousRejectedClaim.rejectReason && (
                            <div className="wd-info-item">
                                <span className="wd-info-label">Lý do bị từ chối</span>
                                <span className="wd-info-value">{warranty.previousRejectedClaim.rejectReason}</span>
                            </div>
                        )}
                        {warranty.previousRejectedClaim.scheduledAt && (
                            <div className="wd-info-item">
                                <span className="wd-info-label">Lịch hẹn yêu cầu trước</span>
                                <span className="wd-info-value">
                                    {new Date(warranty.previousRejectedClaim.scheduledAt).toLocaleString('vi-VN')}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="wd-card-body">
                        <p className="wd-description">{warranty.previousRejectedClaim.description || 'Không có mô tả'}</p>
                    </div>
                    {warranty.previousRejectedClaim.images && warranty.previousRejectedClaim.images.length > 0 && (
                        <div className="wd-card-footer">
                            <span>{warranty.previousRejectedClaim.images.length} ảnh đính kèm</span>
                        </div>
                    )}
                </div>
            )}

            {/* Reject reason (for customer) */}
            {!isTechnician && warranty.status === 'rejected' && warranty.rejectReason && (
                <div className="wd-card wd-card-danger">
                    <h3 className="wd-card-title">Lý do bị từ chối</h3>
                    <p className="wd-reject-reason">{warranty.rejectReason}</p>
                </div>
            )}

            {!isTechnician && (warranty.status === 'rejected' || warranty.status === 'completed') && (
                <div className="wd-actions">
                    {warrantyPeriodActive ? (
                        <button
                            className="wd-btn wd-btn-retry"
                            onClick={() => setShowWarrantyModal(true)}
                            disabled={submitting || submittingCreate}
                        >
                            <FaShieldHalved /> {submittingCreate ? 'Đang gửi lại...' : 'Yêu cầu lại bảo hành'}
                        </button>
                    ) : (
                        <span>Đã hết thời hạn bảo hành.</span>
                    )}
                </div>
            )}

            {/* Technician actions */}
            {isTechnician && isPending && (
                <div className="wd-actions">
                    <button
                        className="wd-btn wd-btn-accept"
                        onClick={handleAccept}
                        disabled={submitting}
                    >
                        <FaCheck /> {submitting ? 'Đang xử lý...' : 'Đồng ý bảo hành'}
                    </button>
                    <button
                        className="wd-btn wd-btn-reject"
                        onClick={() => setShowRejectModal(true)}
                        disabled={submitting}
                    >
                        <FaXmark /> Từ chối bảo hành
                    </button>
                </div>
            )}

            {/* Reject modal */}
            {showRejectModal && (
                <div className="wd-modal-overlay">
                    <div className="wd-modal-content">
                        <div className="wd-modal-header">
                            <h3>Từ chối yêu cầu bảo hành</h3>
                        </div>
                        <div className="wd-modal-body">
                            <p>Vui lòng nhập lý do từ chối yêu cầu bảo hành này:</p>
                            <textarea
                                className="wd-reject-input"
                                placeholder="Nhập lý do chi tiết..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={4}
                            />
                        </div>
                        <div className="wd-modal-footer">
                            <button
                                className="wd-btn wd-btn-cancel"
                                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                                disabled={submitting}
                            >
                                Quay lại
                            </button>
                            <button
                                className="wd-btn wd-btn-reject"
                                onClick={handleReject}
                                disabled={submitting || !rejectReason.trim()}
                            >
                                {submitting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showWarrantyModal && (
                <WarrantyModal
                    open={showWarrantyModal}
                    onClose={() => setShowWarrantyModal(false)}
                    orderId={orderId}
                    onSubmit={handleWarrantySubmit}
                />
            )}
        </div>
    );
};

export default WarrantyDetailPanel;
