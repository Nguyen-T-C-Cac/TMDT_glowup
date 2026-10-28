import React, { useState } from "react";
import Modal from "../common/Modal";
import "./css/warrantyModal.css";
import { X, Upload } from "lucide-react";
import { uploadService } from "../../services/uploadService";

interface WarrantyModalProps {
    open: boolean;
    onClose: () => void;
    orderId: string;
    onSubmit?: (description: string, images: string[], scheduledAt: string | null) => Promise<void>;
}

const WarrantyModal: React.FC<WarrantyModalProps> = ({ open, onClose, orderId, onSubmit }) => {
    const [description, setDescription] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!description.trim()) {
            alert("Vui lòng mô tả sự cố");
            return;
        }
        setSubmitting(true);
        try {
            const scheduledAt = scheduledDate && scheduledTime
                ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
                : null;
            await onSubmit?.(description.trim(), images, scheduledAt);
            onClose();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Không thể gửi yêu cầu bảo hành");
        } finally {
            setSubmitting(false);
        }
    };

    const handleImageUpload = () => {
        if (images.length >= 5) {
            alert("Bạn chỉ có thể tải lên tối đa 5 ảnh");
            return;
        }
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.multiple = true;
        input.onchange = async () => {
            const files = Array.from(input.files ?? []).slice(0, 5 - images.length);
            if (files.length === 0) return;
            try {
                const results = await Promise.all(files.map((file) => uploadService.uploadImage(file, "warranty")));
                const urls = results.map((res) => res.data?.url).filter((url): url is string => Boolean(url));
                setImages((prev) => [...prev, ...urls].slice(0, 5));
            } catch {
                alert("Không thể tải ảnh lên");
            }
        };
        input.click();
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <Modal open={open} onClose={onClose}>
            <div className="warranty-modal">
                <header className="warranty-header">
                    <div className="warranty-header-info">
                        <h2 className="warranty-title">YÊU CẦU BẢO HÀNH</h2>
                        <span className="warranty-subtitle">Đơn hàng {orderId}</span>
                    </div>
                    <button className="warranty-close-btn" onClick={onClose} aria-label="Đóng biểu mẫu">
                        <X size={24} />
                    </button>
                </header>

                <div className="warranty-body">
                    <div className="warranty-notice">
                        Bảo hành miễn phí theo chính sách của GlowUp
                    </div>

                    <div className="warranty-form-group">
                        <label htmlFor="warranty-desc">Mô tả sự cố tái phát</label>
                        <textarea
                            id="warranty-desc"
                            className="warranty-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Vui lòng mô tả chi tiết vấn đề bạn đang gặp phải..."
                        />
                    </div>

                    <div className="warranty-form-group">
                        <label>Ảnh chụp bằng chứng ({images.length}/5 ảnh)</label>
                        <div className="warranty-upload-box" role="button" tabIndex={0} onClick={handleImageUpload} onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                handleImageUpload();
                            }
                        }}>
                            <Upload size={20} />
                            <span>Tải ảnh lên</span>
                            <small>JPG, PNG · Tối đa 5 ảnh</small>
                        </div>
                        {images.length > 0 && (
                            <div className="warranty-image-list">
                                {images.map((url, idx) => (
                                    <div key={idx} className="warranty-image-item">
                                        <img src={url} alt={`Ảnh ${idx + 1}`} />
                                        <button className="warranty-image-remove" onClick={() => removeImage(idx)} aria-label={`Xóa ảnh ${idx + 1}`}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="warranty-form-group">
                        <label>Lịch hẹn kiểm tra (không bắt buộc)</label>
                        <div className="datetime-row">
                            <input
                                type="date"
                                className="warranty-date-input"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                            />
                            <input
                                type="time"
                                className="warranty-time-input"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <footer className="warranty-footer">
                    <button className="warranty-submit-btn" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? "Đang gửi..." : "Gửi yêu cầu bảo hành"}
                    </button>
                    <button className="warranty-back-btn" onClick={onClose}>
                        Quay lại
                    </button>
                </footer>
            </div>
        </Modal>
    );
};

export default WarrantyModal;
