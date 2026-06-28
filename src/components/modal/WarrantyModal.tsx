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
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.multiple = false;
        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            try {
                const res = await uploadService.uploadImage(file, "warranty");
                const url = res.data?.url;
                if (url) setImages((prev) => [...prev, url]);
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
                    <div className="header-info">
                        <h2 className="title">YÊU CẦU BẢO HÀNH</h2>
                        <span className="sub">Đơn hàng {orderId}</span>
                    </div>
                    <button className="close-btn" onClick={onClose} aria-label="Close modal">
                        <X size={24} />
                    </button>
                </header>

                <div className="warranty-body">
                    <div className="notice">
                        Bảo hành miễn phí theo chính sách của GlowUp
                    </div>

                    <div className="form-group">
                        <label htmlFor="warranty-desc">MÔ TẢ SỰ CỐ TÁI PHÁT</label>
                        <textarea
                            id="warranty-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Vui lòng mô tả chi tiết vấn đề bạn đang gặp phải..."
                        />
                    </div>

                    <div className="form-group">
                        <label>ẢNH CHỤP BẰNG CHỨNG ({images.length}/5 ẢNH)</label>
                        <div className="upload-box" role="button" tabIndex={0} onClick={handleImageUpload}>
                            <Upload size={20} />
                            TẢI ẢNH LÊN
                        </div>
                        {images.length > 0 && (
                            <div className="image-preview-list">
                                {images.map((url, idx) => (
                                    <div key={idx} className="image-preview-item">
                                        <img src={url} alt={`Ảnh ${idx + 1}`} />
                                        <button className="image-remove-btn" onClick={() => removeImage(idx)}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>LỊCH HẸN KIỂM TRA</label>
                        <div className="datetime-row">
                            <input
                                type="date"
                                className="date-input"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                            />
                            <input
                                type="time"
                                className="time-input"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <footer className="warranty-footer">
                    <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? "Đang gửi..." : "Gửi yêu cầu bảo hành"}
                    </button>
                    <button className="btn-text" onClick={onClose}>
                        Quay lại
                    </button>
                </footer>
            </div>
        </Modal>
    );
};

export default WarrantyModal;
