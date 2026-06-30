import React, { useEffect, useMemo, useState } from "react";
import Modal from "../common/Modal";
import "./css/repairRequestModal.css";
import {
    AlertTriangle,
    Bolt,
    CalendarDays,
    CheckCircle2,
    Circle,
    Fan,
    MapPin,
    Phone,
    Refrigerator,
    Shirt,
    Upload,
    Video,
    Wrench,
    X,
    Zap,
} from "lucide-react";
import {useNavigate} from "react-router-dom";
import { getCategories, type Category } from "../../services/categoryService";
import { bookingService } from "../../services/bookingService";
import { uploadService } from "../../services/uploadService";
import type { Brand, DeviceType } from "../../types/booking";

interface RepairRequestModalProps {
    open: boolean;
    onClose: () => void;
    technicianId?: string;
    provider?: {
        id?: string;
        name: string;
        avatar: string;
        rating: number;
        responseEta?: string;
        area?: string;
    };
}

type UrgencyId = "NORMAL" | "HIGH" | "URGENT";

interface UploadedAsset {
    id: string;
    file: File;
    previewUrl: string;
}

const urgencyOptions: Array<{ id: UrgencyId; label: string; icon: string }> = [
    { id: "NORMAL", label: "Không gấp", icon: "😌" },
    { id: "HIGH", label: "Cần hôm nay", icon: "⚡" },
    { id: "URGENT", label: "Khẩn cấp", icon: "🚨" },
];

const timeSlotOptions = [
    { value: "Sáng (7:00-11:00)", label: "Sáng", sub: "7:00-11:00" },
    { value: "Trưa (11:00-13:00)", label: "Trưa", sub: "11:00-13:00" },
    { value: "Chiều (13:00-17:00)", label: "Chiều", sub: "13:00-17:00" },
    { value: "Tối (17:00-21:00)", label: "Tối", sub: "17:00-21:00" },
];

const locationSuggestions = [
    "123 Nguyễn Hữu Cảnh, Bình Thạnh",
    "45 Lê Văn Sỹ, Phú Nhuận",
    "12 Võ Văn Kiệt, Quận 1",
];

const categoryIcons: Record<string, React.ReactNode> = {
    "Máy lạnh": <Fan size={18} />,
    "Máy giặt": <Shirt size={18} />,
    "Tủ lạnh": <Refrigerator size={18} />,
    "Máy nước nóng": <Zap size={18} />,
    "Sửa điện": <Zap size={18} />,
    "Sửa nước": <Zap size={18} />,
    "Vệ sinh máy lạnh": <Fan size={18} />,
    "Khác": <Wrench size={18} />,
};

const categoryIssues: Record<string, string[]> = {
    "CAT-001": [
        "Máy lạnh không lạnh",
        "Máy lạnh chảy nước",
        "Máy lạnh kêu to",
        "Máy lạnh bốc mùi hôi",
        "Remote không hoạt động",
        "Máy lạnh không bật",
        "Cần vệ sinh máy lạnh",
        "Cần nạp gas máy lạnh",
    ],
    "CAT-002": [
        "Máy giặt không vắt",
        "Máy giặt không xả nước",
        "Máy giặt kêu to khi quay",
        "Máy giặt báo lỗi",
        "Máy giặt không vào nước",
        "Máy giặt rung lắc mạnh",
        "Cần vệ sinh máy giặt",
        "Thay dây curoa máy giặt",
    ],
    "CAT-003": [
        "Tủ lạnh không lạnh",
        "Tủ lạnh chảy nước",
        "Tủ lạnh kêu to",
        "Tủ lạnh đóng tuyết nhiều",
        "Cánh tủ không kín",
        "Đèn tủ lạnh không sáng",
        "Tủ lạnh không đông đá",
        "Cần vệ sinh tủ lạnh",
    ],
    "CAT-004": [
        "Máy nước nóng không nóng",
        "Máy nước nóng rò rỉ nước",
        "Máy nước nóng kêu to",
        "Máy nước nóng không bật",
        "Cần lắp đặt máy nước nóng",
        "Thay thanh đốt máy nước nóng",
        "Rò điện ở máy nước nóng",
    ],
    "CAT-SD": [
        "Mất điện cục bộ",
        "CB/aptomat nhảy liên tục",
        "Ổ cắm bị hư",
        "Công tắc đèn không hoạt động",
        "Quạt trần không chạy",
        "Đèn LED bị nhấp nháy",
        "Cần lắp đặt điện mới",
        "Điện yếu / chập chờn",
    ],
    "CAT-SW": [
        "Vòi nước bị rò rỉ",
        "Ống nước bị bể/vỡ",
        "Bồn cầu bị tắc",
        "Bồn rửa chén bị tắc",
        "Sen tắm bị yếu nước",
        "Van nước không đóng được",
        "Máy bơm nước yếu/hỏng",
        "Bồn nước trên mái bị tràn",
    ],
    "CAT-VML": [
        "Vệ sinh máy lạnh định kỳ",
        "Nạp gas máy lạnh",
        "Máy lạnh bám bụi nhiều",
        "Máy lạnh có mùi ẩm mốc",
        "Kiểm tra máy lạnh trước mùa nóng",
        "Xịt rửa dàn nóng",
    ],
    "CAT-005": [
        "Lò vi sóng không hoạt động",
        "Lò nướng không nóng",
        "Máy lọc nước hư",
        "Bếp từ không hoạt động",
        "Quạt công nghiệp hư",
        "Thiết bị khác cần sửa",
    ],
};

const today = new Date().toISOString().split("T")[0];

const RepairRequestModal: React.FC<RepairRequestModalProps> = ({open, onClose, technicianId, provider}) => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState<Category[]>([]);
    const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);

    const [categoryCode, setCategoryCode] = useState<string>("");
    const [deviceTypeCode, setDeviceTypeCode] = useState<string>("");
    const [customDeviceType, setCustomDeviceType] = useState("");
    const [brandCode, setBrandCode] = useState<string>("");
    const [customBrand, setCustomBrand] = useState("");
    const [description, setDescription] = useState("");
    const [uploads, setUploads] = useState<UploadedAsset[]>([]);
    const [urgency, setUrgency] = useState<UrgencyId>("NORMAL");
    const [timeSlot, setTimeSlot] = useState(timeSlotOptions[0].value);
    const [date, setDate] = useState(today);
    const [address, setAddress] = useState("123 Nguyễn Hữu Cảnh, Bình Thạnh");
    const [phone, setPhone] = useState("0901234567");
    const [submitting, setSubmitting] = useState(false);

    const OTHER_VALUE = "__other__";

    useEffect(() => {
        if (open) {
            getCategories("active").then(setCategories).catch(() => {});
        }
    }, [open]);

    useEffect(() => {
        if (categoryCode) {
            console.log("[RepairRequestModal] Fetching deviceTypes/brands for categoryCode:", categoryCode);
            bookingService.getDeviceTypes(categoryCode).then(data => {
                console.log("[RepairRequestModal] deviceTypes received:", JSON.stringify(data));
                setDeviceTypes(data);
            }).catch(err => {
                console.warn("[RepairRequestModal] deviceTypes fetch failed:", err);
                setDeviceTypes([]);
            });
            bookingService.getBrands(categoryCode).then(data => {
                console.log("[RepairRequestModal] brands received:", JSON.stringify(data));
                setBrands(data);
            }).catch(err => {
                console.warn("[RepairRequestModal] brands fetch failed:", err);
                setBrands([]);
            });
        } else {
            setDeviceTypes([]);
            setBrands([]);
        }
        setDeviceTypeCode("");
        setCustomDeviceType("");
        setBrandCode("");
        setCustomBrand("");
    }, [categoryCode]);

    const allDeviceTypes = useMemo(() => {
        const hasOther = deviceTypes.length > 0;
        if (!hasOther) return [];
        return [...deviceTypes, { code: OTHER_VALUE, name: "Khác…", categoryCode: categoryCode }];
    }, [deviceTypes, categoryCode]);

    const allBrands = useMemo(() => {
        const hasOther = brands.length > 0;
        if (!hasOther) return [];
        return [...brands, { code: OTHER_VALUE, name: "Hãng khác…", categoryCode: categoryCode }];
    }, [brands, categoryCode]);

    const selectedCategory = categories.find(c => c.id === categoryCode);
    const issuesForCategory = categoryCode ? (categoryIssues[categoryCode] || []) : [];

    const summaryError = useMemo(() => {
        if (!categoryCode) return "Chưa chọn dịch vụ";
        if (!description.trim()) return "Chưa có mô tả lỗi";
        if (!address.trim()) return "Chưa có địa chỉ";
        return null;
    }, [categoryCode, description, address]);

    const onFileSelected: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        const selectedFiles = Array.from(event.target.files ?? []);
        if (!selectedFiles.length) return;

        const nextUploads = selectedFiles.map((file, index) => ({
            id: `${file.name}-${Date.now()}-${index}`,
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        setUploads((prev) => [...prev, ...nextUploads].slice(0, 8));
        event.target.value = "";
    };

    const removeUpload = (id: string) => {
        setUploads((prev) => {
            const target = prev.find((item) => item.id === id);
            if (target) {
                URL.revokeObjectURL(target.previewUrl);
            }
            return prev.filter((item) => item.id !== id);
        });
    };

    useEffect(() => {
        return () => {
            uploads.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        };
    }, [uploads]);

    const [uploadError, setUploadError] = useState<string | null>(null);

    const uploadImages = async (): Promise<string[]> => {
        if (uploads.length === 0) return [];
        setUploadError(null);
        try {
            const files = uploads.map(item => item.file);
            const response = await uploadService.uploadImages(files, "bookings");
            if (!response.data?.urls?.length) {
                setUploadError("Upload ảnh thất bại, vui lòng thử lại.");
                return [];
            }
            return response.data.urls;
        } catch (e: any) {
            const msg = e?.response?.data?.error?.message || e?.message || "Upload ảnh thất bại";
            console.warn("Upload failed:", msg);
            setUploadError(msg);
            return [];
        }
    };

    const resolveDeviceTypeCode = () => {
        if (deviceTypeCode === OTHER_VALUE && customDeviceType.trim()) {
            return customDeviceType.trim();
        }
        return deviceTypeCode && deviceTypeCode !== OTHER_VALUE ? deviceTypeCode : undefined;
    };

    const resolveBrandCode = () => {
        if (brandCode === OTHER_VALUE && customBrand.trim()) {
            return customBrand.trim();
        }
        return brandCode && brandCode !== OTHER_VALUE ? brandCode : undefined;
    };

    const onSubmit = async () => {
        if (summaryError || submitting) return;
        setSubmitting(true);
        try {
            const imageUrls = await uploadImages();
            const payload = {
                categoryCode: categoryCode,
                deviceTypeCode: resolveDeviceTypeCode(),
                brandCode: resolveBrandCode(),
                technicianCode: technicianId || provider?.id,
                description: description.trim(),
                urgency: urgency,
                scheduledDate: date || undefined,
                preferredTime: timeSlot,
                address: address.trim(),
                phone: phone.trim() || undefined,
                imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
            };
            console.log("[RepairRequestModal] Booking payload:", JSON.stringify(payload));
            const result = await bookingService.createBooking(payload);

            navigate("/customer/chat", {
                state: {
                    conversationId: result.conversationId,
                },
            });
            onClose();
        } catch (err: any) {
            console.error("[RepairRequestModal] Booking submit error:", err);
            if (err?.response?.data) {
                console.error("[RepairRequestModal] Server response:", JSON.stringify(err.response.data));
            }
            const msg = err?.response?.data?.message || err?.message || "Gửi yêu cầu thất bại. Vui lòng thử lại.";
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const severityText = urgencyOptions.find((item) => item.id === urgency)?.label ?? "Không gấp";
    const providerName = provider?.name ?? "Thợ kỹ thuật";
    const providerAvatar = provider?.avatar ?? "https://placehold.co/80x80";
    const providerRating = provider?.rating ?? 4.8;
    const providerResponseEta = provider?.responseEta ?? "Phản hồi trong ~5 phút";

    const resolvedDeviceTypeName = useMemo(() => {
        if (deviceTypeCode === OTHER_VALUE && customDeviceType.trim()) return customDeviceType.trim();
        const found = deviceTypes.find(dt => dt.code === deviceTypeCode);
        return found?.name || "";
    }, [deviceTypeCode, customDeviceType, deviceTypes]);

    const resolvedBrandName = useMemo(() => {
        if (brandCode === OTHER_VALUE && customBrand.trim()) return customBrand.trim();
        const found = brands.find(b => b.code === brandCode);
        return found?.name || "";
    }, [brandCode, customBrand, brands]);

    return (
        <Modal open={open} onClose={onClose}>
            <div className="repair-modal">
                <button className="repair-close" onClick={onClose} aria-label="Close modal">
                    <X size={20}/>
                </button>

                <div className="repair-headline">
                    <div>
                        <h2>Yêu cầu sửa chữa</h2>
                        <p>Mô tả nhanh sự cố để thợ tư vấn và báo giá chính xác hơn</p>
                    </div>
                    <div className="provider-mini-card">
                        <img src={providerAvatar} alt={providerName} />
                        <div>
                            <strong>{providerName}</strong>
                            <span>
                                <Bolt size={14}/> {providerRating.toFixed(1)}
                            </span>
                            <small>{providerResponseEta}</small>
                        </div>
                    </div>
                </div>

                <div className="repair-layout">
                    <div className="repair-body">
                        <section className="repair-section">
                            <h3>1. Chọn dịch vụ</h3>
                            <div className="service-grid">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        className={`service-card ${categoryCode === cat.id ? "active" : ""}`}
                                        onClick={() => setCategoryCode(cat.id === categoryCode ? "" : cat.id)}
                                    >
                                        {categoryIcons[cat.title] || <Wrench size={18} />}
                                        <span>{cat.title}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="repair-section">
                            <h3>2. Thiết bị cụ thể</h3>
                            {allDeviceTypes.length > 0 && (
                                <>
                                    <div className="inline-label">Loại máy</div>
                                    <div className="radio-grid">
                                        {allDeviceTypes.map((dt) => (
                                            <button
                                                key={dt.code}
                                                type="button"
                                                className={`radio-option ${deviceTypeCode === dt.code ? "active" : ""}`}
                                                onClick={() => setDeviceTypeCode(deviceTypeCode === dt.code ? "" : dt.code)}
                                            >
                                                {deviceTypeCode === dt.code ? <CheckCircle2 size={16}/> : <Circle size={16}/>}
                                                {dt.name}
                                            </button>
                                        ))}
                                    </div>
                                    {deviceTypeCode === OTHER_VALUE && (
                                        <input
                                            type="text"
                                            className="custom-input"
                                            placeholder="Nhập loại máy của bạn..."
                                            value={customDeviceType}
                                            onChange={(e) => setCustomDeviceType(e.target.value)}
                                            autoFocus
                                        />
                                    )}
                                </>
                            )}
                            {allBrands.length > 0 && (
                                <>
                                    <label className="input-label" htmlFor="repair-brand">Hãng</label>
                                    <div className="radio-grid">
                                        {allBrands.map((b) => (
                                            <button
                                                key={b.code}
                                                type="button"
                                                className={`radio-option ${brandCode === b.code ? "active" : ""}`}
                                                onClick={() => setBrandCode(brandCode === b.code ? "" : b.code)}
                                            >
                                                {brandCode === b.code ? <CheckCircle2 size={16}/> : <Circle size={16}/>}
                                                {b.name}
                                            </button>
                                        ))}
                                    </div>
                                    {brandCode === OTHER_VALUE && (
                                        <input
                                            type="text"
                                            className="custom-input"
                                            placeholder="Nhập tên hãng..."
                                            value={customBrand}
                                            onChange={(e) => setCustomBrand(e.target.value)}
                                            autoFocus
                                        />
                                    )}
                                </>
                            )}
                            {allDeviceTypes.length === 0 && allBrands.length === 0 && (
                                <p className="soft-note">Thông tin thiết bị sẽ được bổ sung nhanh trong khung chat sau khi gửi yêu cầu.</p>
                            )}
                        </section>

                        <section className="repair-section">
                            <h3>3. Mô tả sự cố</h3>
                            {issuesForCategory.length > 0 && (
                                <div className="issue-chips">
                                    {issuesForCategory.map((issue) => (
                                        <button
                                            key={issue}
                                            type="button"
                                            className={`chip ${description.includes(issue) ? "active" : ""}`}
                                            onClick={() => {
                                                if (description.includes(issue)) {
                                                    setDescription(prev => prev.replace(issue, "").replace(/,\s*,/g, ",").replace(/^,\s*/, "").replace(/\s*, $/, "").trim());
                                                } else {
                                                    setDescription(prev => prev ? `${prev}, ${issue}` : issue);
                                                }
                                            }}
                                        >
                                            {issue}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <textarea
                                id="repair-desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={categoryCode && !issuesForCategory.length
                                    ? "Mô tả chi tiết sự cố bạn đang gặp phải..."
                                    : "Hoặc nhập mô tả chi tiết sự cố..."}
                            />
                        </section>

                        <section className="repair-section">
                            <h3>4. Upload hình/video</h3>
                            <label className="upload-box" htmlFor="repair-upload">
                                <input id="repair-upload" type="file" accept="image/*,video/*" multiple onChange={onFileSelected} />
                                <Upload size={20} />
                                <strong>+ Tải ảnh hoặc video</strong>
                                <p>Giúp thợ chẩn đoán nhanh hơn</p>
                            </label>
                            {uploadError && (
                                <p className="summary-warning" style={{ margin: 0 }}>
                                    {uploadError}
                                </p>
                            )}
                            {uploads.length > 0 && (
                                <div className="preview-grid">
                                    {uploads.map((item) => (
                                        <div className="preview-item" key={item.id}>
                                            {item.file.type.startsWith("video/") ? (
                                                <video src={item.previewUrl} muted playsInline />
                                            ) : (
                                                <img src={item.previewUrl} alt={item.file.name} />
                                            )}
                                            <button type="button" onClick={() => removeUpload(item.id)} aria-label="Xóa tệp">
                                                <X size={14}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="repair-section">
                            <h3>5. Mức độ khẩn cấp</h3>
                            <div className="urgency-grid">
                                {urgencyOptions.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className={`urgency-card ${urgency === item.id ? "active" : ""}`}
                                        onClick={() => setUrgency(item.id)}
                                    >
                                        <span>{item.icon}</span>
                                        <strong>{item.label}</strong>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="repair-section">
                            <h3>6. Thời gian mong muốn</h3>
                            <div className="chip-row">
                                {timeSlotOptions.map((item) => (
                                    <button
                                        key={item.value}
                                        type="button"
                                        className={`chip ${timeSlot === item.value ? "active" : ""}`}
                                        onClick={() => setTimeSlot(item.value)}
                                    >
                                        {item.label}
                                        <small>{item.sub}</small>
                                    </button>
                                ))}
                            </div>
                            <label className="input-label" htmlFor="repair-date">Ngày hẹn</label>
                            <div className="input-icon-wrap">
                                <CalendarDays size={16} />
                                <input
                                    id="repair-date"
                                    type="date"
                                    value={date}
                                    min={today}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </section>

                        <section className="repair-section">
                            <h3>7. Địa chỉ</h3>
                            <div className="input-icon-wrap">
                                <MapPin size={16} />
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Nhập khu vực cần sửa"
                                />
                            </div>
                            <div className="location-list">
                                {locationSuggestions
                                    .filter((item) => {
                                        const keyword = address.trim().toLowerCase();
                                        if (!keyword) return true;
                                        return item.toLowerCase().includes(keyword);
                                    })
                                    .slice(0, 3)
                                    .map((item) => (
                                        <button key={item} type="button" onClick={() => setAddress(item)}>
                                            {item}
                                        </button>
                                    ))}
                            </div>
                            <div className="mini-map">
                                <MapPin size={16} />
                                <span>{address || "Bản đồ khu vực"}</span>
                            </div>
                        </section>

                        <section className="repair-section">
                            <h3>8. Số điện thoại liên hệ</h3>
                            <div className="input-icon-wrap">
                                <Phone size={16} />
                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                            </div>
                            <div className="privacy-badge">✅ Chỉ chia sẻ cho thợ sau khi xác nhận</div>
                        </section>

                        <button
                            type="button"
                            className="btn-submit"
                            onClick={onSubmit}
                            disabled={Boolean(summaryError) || submitting}
                        >
                            {submitting ? "Đang gửi..." : "Bắt đầu chat với thợ"}
                        </button>
                    </div>

                    <aside className="repair-summary">
                        <h4>Tổng kết nhanh</h4>
                        <dl>
                            <div>
                                <dt>Dịch vụ</dt>
                                <dd>{selectedCategory?.title || "Chưa chọn"}</dd>
                            </div>
                            <div>
                                <dt>Thiết bị</dt>
                                <dd>{resolvedDeviceTypeName || resolvedBrandName || "Chưa cập nhật"}</dd>
                            </div>
                            <div>
                                <dt>Lỗi chính</dt>
                                <dd>{description.trim() || "Chưa cập nhật"}</dd>
                            </div>
                            <div>
                                <dt>Khu vực</dt>
                                <dd>{address || provider?.area || "Chưa cập nhật"}</dd>
                            </div>
                            <div>
                                <dt>Thời gian</dt>
                                <dd>{`${timeSlot.split(" (")[0]}${date ? ` - ${date}` : ""}`}</dd>
                            </div>
                            <div>
                                <dt>Mức độ</dt>
                                <dd>{severityText}</dd>
                            </div>
                        </dl>
                        <button
                            type="button"
                            className="btn-submit secondary"
                            onClick={onSubmit}
                            disabled={Boolean(summaryError) || submitting}
                        >
                            {submitting ? "Đang gửi..." : "Gửi yêu cầu và nhận tư vấn"}
                        </button>
                        {summaryError && (
                            <p className="summary-warning">
                                <AlertTriangle size={14} /> {summaryError}
                            </p>
                        )}
                        <p className="summary-hint">
                            <Video size={14}/> Thêm hình/video để thợ dễ xác định vấn đề hơn.
                        </p>
                    </aside>
                </div>
            </div>
        </Modal>
    );
};

export default RepairRequestModal;