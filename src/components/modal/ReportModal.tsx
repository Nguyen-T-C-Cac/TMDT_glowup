import React, { useRef, useState } from 'react';
import Modal from '../common/Modal';
import { X, CheckCircle, Camera, Trash2 } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { uploadService } from '../../services/uploadService';
import './css/reportModal.css';

const SUGGESTED_REASONS = [
    { value: 'extra_fee', label: 'Thợ thu thêm phụ phí ngoài hệ thống', icon: '💰' },
    { value: 'bad_attitude', label: 'Thợ có thái độ không tốt, bất lịch sự', icon: '😤' },
    { value: 'no_show', label: 'Thợ không đến đúng giờ hoặc không đến', icon: '⏰' },
    { value: 'poor_quality', label: 'Chất lượng sửa chữa kém, không đạt yêu cầu', icon: '🔧' },
    { value: 'fraud', label: 'Thợ gian lận, lừa đảo', icon: '⚠️' },
    { value: 'other', label: 'Lý do khác', icon: '📝' },
];

interface ReportModalProps {
    open: boolean;
    onClose: () => void;
    orderId: string;
    onSuccess: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ open, onClose, orderId, onSuccess }) => {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files?.length) return;

        setUploadingImages(true);
        try {
            const results = await Promise.all(
                Array.from(files).map((file) => uploadService.uploadImage(file, 'reports'))
            );
            const urls = results.map((r) => r.data.url);
            setEvidenceUrls((prev) => [...prev, ...urls].slice(0, 5));
        } catch (err: any) {
            console.error('[ReportModal] Upload error:', err);
            const message =
                err?.response?.data?.message
                || err?.message
                || 'Không thể tải ảnh lên. Vui lòng thử lại.';
            setError(message);
        } finally {
            setUploadingImages(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveImage = (index: number) => {
        setEvidenceUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!reason) return;
        if (!description.trim()) return;

        setSubmitting(true);
        setError(null);
        try {
            await reportService.createReport(orderId, {
                reason,
                description: description.trim(),
                evidenceImages: evidenceUrls,
            });
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                handleReset();
            }, 1500);
        } catch (err: unknown) {
            const message =
                err && typeof err === 'object' && 'response' in err
                    ? String((err as { response: { data?: { message?: string } } }).response?.data?.message ?? '')
                    : '';
            setError(message || 'Không thể gửi báo cáo. Vui lòng thử lại sau.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setReason('');
        setDescription('');
        setEvidenceUrls([]);
        setError(null);
        setSuccess(false);
        onClose();
    };

    return (
        <Modal open={open} onClose={submitting ? () => {} : handleReset}>
            <div className="report-modal">
                <header className="report-header">
                    <div className="header-info">
                        <h2 className="title">BÁO CÁO SỰ CỐ / KHIẾU NẠI</h2>
                        <span className="sub">Đơn hàng #{orderId}</span>
                    </div>
                    <button className="close-btn" onClick={handleReset} disabled={submitting} aria-label="Đóng">
                        <X size={24} />
                    </button>
                </header>

                {success ? (
                    <div className="review-success">
                        <CheckCircle className="success-icon" size={48} />
                        <h3>Đã gửi báo cáo thành công!</h3>
                        <p>Đội ngũ GlowUp sẽ xử lý khiếu nại trong vòng 24h làm việc.</p>
                    </div>
                ) : (
                    <>
                        <div className="report-body">
                            <div className="notice danger-notice">
                                Đội ngũ GlowUp sẽ tiếp nhận và xử lý khiếu nại của bạn trong vòng 24h làm việc.
                            </div>

                            {error && <div className="danger-notice">{error}</div>}

                            <div className="form-group">
                                <label>VẤN ĐỀ BẠN GẶP PHẢI</label>
                                <div className="report-reason-list">
                                    {SUGGESTED_REASONS.map((r) => (
                                        <button
                                            key={r.value}
                                            type="button"
                                            className={`report-reason-item ${reason === r.value ? 'selected' : ''}`}
                                            onClick={() => setReason(r.value)}
                                        >
                                            <span className="reason-icon">{r.icon}</span>
                                            <span className="reason-label">{r.label}</span>
                                            {reason === r.value && <span className="reason-check">✓</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="report-desc">MÔ TẢ CHI TIẾT</label>
                                <textarea
                                    id="report-desc"
                                    placeholder="Vui lòng cung cấp thêm thông tin chi tiết để GlowUp hỗ trợ bạn tốt nhất..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    maxLength={2000}
                                />
                            </div>

                            <div className="form-group">
                                <label>ẢNH MINH CHỨNG (tối đa 5 ảnh)</label>
                                <div className="report-evidence-grid">
                                    {evidenceUrls.map((url, index) => (
                                        <div key={url} className="report-evidence-item">
                                            <img src={url} alt={`Minh chứng ${index + 1}`} />
                                            <button
                                                type="button"
                                                className="report-evidence-remove"
                                                onClick={() => handleRemoveImage(index)}
                                                disabled={submitting}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {evidenceUrls.length < 5 && (
                                        <div
                                            className="report-evidence-upload"
                                            onClick={() => fileInputRef.current?.click()}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <Camera size={24} />
                                            <span>{uploadingImages ? 'Đang tải...' : 'Thêm ảnh'}</span>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        hidden
                                        onChange={handleUpload}
                                        disabled={uploadingImages}
                                    />
                                </div>
                            </div>
                        </div>

                        <footer className="report-footer">
                            <button className="btn-text" onClick={handleReset} disabled={submitting}>
                                Hủy bỏ
                            </button>
                            <button
                                className="btn-solid-danger"
                                onClick={handleSubmit}
                                disabled={!reason || !description.trim() || submitting}
                            >
                                {submitting ? 'Đang gửi...' : 'Gửi khiếu nại'}
                            </button>
                        </footer>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default ReportModal;
