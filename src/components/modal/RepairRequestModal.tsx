import React, { useEffect, useMemo, useRef, useState } from "react";
import Modal from "../common/Modal";
import "./css/repairRequestModal.css";
import { Clock3, ImagePlus, MapPin, Phone, Send, ShieldCheck, Trash2, Wrench, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { navigateToChat } from "../../utils/chatNavigation";
import { orderService } from "../../services/order/orderService";
import { chatService } from "../../services/chat/chatService";
import { uploadService } from "../../services/uploadService";
import type { ProviderListEntry } from "../../utils/technicianMappers";

interface RepairRequestModalProps {
    open: boolean;
    onClose: () => void;
    technicianId?: string;
    provider?: ProviderListEntry;
}

const RepairRequestModal: React.FC<RepairRequestModalProps> = ({ open, onClose, technicianId, provider }) => {
    const navigate = useNavigate();
    const [deviceName, setDeviceName] = useState("");
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("123 Nguyễn Hữu Cảnh, Bình Thạnh");
    const [phone, setPhone] = useState("090 123 4567");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const providerName = provider?.name || "Kỹ thuật viên đã chọn";
    const providerAvatar = provider?.avatar || "https://placehold.co/96x96";
    const providerLocation = provider?.location || "TP. Hồ Chí Minh";
    const providerPrice = provider?.kind === "normal" ? provider.price : "Liên hệ";
    const imagePreviewUrls = useMemo(
        () => imageFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
        [imageFiles]
    );

    useEffect(() => {
        return () => {
            imagePreviewUrls.forEach(({ url }) => URL.revokeObjectURL(url));
        };
    }, [imagePreviewUrls]);

    const handlePickImages = (event: React.ChangeEvent<HTMLInputElement>) => {
        const pickedFiles = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"));
        if (pickedFiles.length === 0) {
            return;
        }
        setImageFiles((prev) => [...prev, ...pickedFiles].slice(0, 3));
        event.target.value = "";
    };

    const handleRemoveImage = (targetFile: File) => {
        setImageFiles((prev) =>
            prev.filter((file) => !(file.name === targetFile.name && file.lastModified === targetFile.lastModified))
        );
    };

    return (
        <Modal open={open} onClose={onClose}>
            <div className="repair-modal">
                <button
                    className="repair-close"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <X size={24} />
                </button>

                <header className="repair-headline">
                    <div>
                        <h2>Gửi yêu cầu sửa chữa</h2>
                        <p>
                            Mô tả rõ tình trạng thiết bị để thợ chẩn đoán nhanh hơn và mở cuộc trò chuyện ngay sau khi gửi.
                        </p>
                    </div>
                    <div className="provider-mini-card">
                        <img src={providerAvatar} alt={providerName} />
                        <div>
                            <strong>{providerName}</strong>
                            <span>
                                <ShieldCheck size={14} />
                                Thợ đã xác minh
                            </span>
                            <small>{providerLocation}</small>
                        </div>
                    </div>
                </header>

                <div className="repair-layout">
                    <div className="repair-body">
                        <section className="repair-section">
                            <h3>Thông tin thiết bị</h3>
                            <div>
                                <label className="input-label" htmlFor="repair-device">TÊN THIẾT BỊ</label>
                                <input
                                    id="repair-device"
                                    type="text"
                                    placeholder="Ví dụ: Máy lạnh Daikin, Máy giặt LG..."
                                    value={deviceName}
                                    onChange={(e) => setDeviceName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="input-label" htmlFor="repair-desc">MÔ TẢ TÌNH TRẠNG LỖI</label>
                                <textarea
                                    id="repair-desc"
                                    placeholder="Ví dụ: máy không lạnh, có tiếng ồn lớn, chảy nước..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </section>

                        <section className="repair-section">
                            <h3>Hình ảnh thực tế</h3>
                            <button type="button" className="upload-box" onClick={() => fileInputRef.current?.click()}>
                                <div className="upload-box-icon">
                                    <ImagePlus size={26} />
                                </div>
                                <strong>Thêm ảnh chụp thiết bị</strong>
                                <p>Tải lên tối đa 3 ảnh để kỹ thuật viên chẩn đoán chính xác hơn.</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handlePickImages}
                                />
                            </button>
                            {imagePreviewUrls.length > 0 ? (
                                <div className="preview-grid">
                                    {imagePreviewUrls.map(({ file, url }) => (
                                        <div key={`${file.name}-${file.lastModified}`} className="preview-item">
                                            <img src={url} alt={file.name} />
                                            <button type="button" onClick={() => handleRemoveImage(file)} aria-label="Xóa ảnh">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </section>

                        <section className="repair-section">
                            <h3>Thông tin liên hệ</h3>
                            <div>
                                <label className="input-label" htmlFor="repair-address">ĐỊA CHỈ SỬA CHỮA</label>
                                <div className="input-icon-wrap">
                                    <MapPin size={16} />
                                    <input
                                        id="repair-address"
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="input-label" htmlFor="repair-phone">SỐ ĐIỆN THOẠI LIÊN HỆ</label>
                                <div className="input-icon-wrap">
                                    <Phone size={16} />
                                    <input
                                        id="repair-phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="repair-summary">
                        <h4>Tóm tắt yêu cầu</h4>
                        <dl>
                            <div>
                                <dt>Kỹ thuật viên</dt>
                                <dd>{providerName}</dd>
                            </div>
                            <div>
                                <dt>Thiết bị</dt>
                                <dd>{deviceName.trim() || "Chưa nhập tên thiết bị"}</dd>
                            </div>
                            <div>
                                <dt>Mô tả lỗi</dt>
                                <dd>{description.trim() || "Hãy mô tả ngắn gọn lỗi đang gặp."}</dd>
                            </div>
                            <div>
                                <dt>Chi phí tham khảo</dt>
                                <dd>{providerPrice}</dd>
                            </div>
                        </dl>
                        <p className="summary-warning">
                            <Clock3 size={14} />
                            Yêu cầu sẽ được tạo ngay và mở chat với thợ.
                        </p>
                        <p className="summary-hint">
                            <Wrench size={14} />
                            Bạn có thể trao đổi thêm chi tiết và nhận báo giá trong cuộc trò chuyện.
                        </p>
                        <button
                            className="btn-submit"
                            disabled={isSubmitting || !deviceName.trim() || !description.trim()}
                            onClick={async () => {
                                if (!technicianId) return;
                                setIsSubmitting(true);
                                try {
                                    const uploadedImageUrls = imageFiles.length > 0
                                        ? (await uploadService.uploadImages(imageFiles, "orders")).data.urls
                                        : [];
                                    const order = await orderService.createOrder({
                                        deviceName,
                                        description,
                                        address,
                                        estimatedPrice: 0,
                                        expectedTime: new Date().toISOString(),
                                        serviceCategory: "Khác",
                                        images: uploadedImageUrls,
                                        technicianId
                                    });

                                    const conv = await chatService.createConversation({
                                        technicianId,
                                        orderId: order.id
                                    });

                                    onClose();
                                    navigateToChat(navigate, "customer", {
                                        conversationId: conv.id,
                                        orderId: order.id,
                                        technicianId
                                    });
                                } catch (err) {
                                    alert(err instanceof Error ? err.message : "Có lỗi xảy ra khi gửi yêu cầu");
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                        >
                            <Send size={18} />
                            {isSubmitting ? "Đang xử lý..." : "Gửi yêu cầu & Chat ngay"}
                        </button>
                    </aside>
                </div>
            </div>
        </Modal>
    );
};

export default RepairRequestModal;
