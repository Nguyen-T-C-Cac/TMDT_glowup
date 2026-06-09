import React, { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import type { Quote, QuoteLineItem } from "../../types/Quote";
import { computeQuoteSubtotal, computeQuoteTotal } from "../../types/Quote";
import "./css/quote-form.css";

interface Props {
    quote: Quote;
    setQuote: (q: Quote) => void;
    onClose: () => void;
    /** Nhận object Quote đã gộp (serviceName=serviceType, price=tổng) — ChatPage xử lý tiếp. */
    onSubmit?: (quote: Quote) => Promise<void>;
}

const SERVICE_TYPES = [
    "Sửa chữa máy giặt",
    "Sửa chữa máy lạnh / điều hòa",
    "Sửa chữa tủ lạnh",
    "Sửa chữa máy nước nóng",
    "Sửa chữa tivi",
    "Sửa chữa lò vi sóng",
    "Điện gia dụng khác",
];

const fmt = (v: number) => new Intl.NumberFormat("vi-VN").format(v || 0);

const newItem = (): QuoteLineItem => ({
    id: crypto?.randomUUID?.() ?? `${Date.now()}-${performance.now()}`,
    name: "",
    quantity: 1,
    unitPrice: 0,
});

const QuoteForm = ({ quote, setQuote, onClose, onSubmit }: Props) => {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const set = <K extends keyof Quote>(field: K, value: Quote[K]) =>
        setQuote({ ...quote, [field]: value });

    const updateItem = (id: string, patch: Partial<QuoteLineItem>) =>
        set("items", quote.items.map((it) => (it.id === id ? { ...it, ...patch } : it)));

    const addItem = () => set("items", [...quote.items, newItem()]);

    const removeItem = (id: string) =>
        set("items", quote.items.filter((it) => it.id !== id));

    const subtotal = computeQuoteSubtotal(quote);
    const total = computeQuoteTotal(quote);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setError(null);

        if (!quote.serviceType.trim()) {
            setError("Vui lòng chọn loại dịch vụ.");
            return;
        }
        if (total <= 0) {
            setError("Tổng cộng phải lớn hơn 0. Hãy thêm vật tư hoặc chi phí.");
            return;
        }

        // FE-only: gộp về các trường backend hỗ trợ qua ChatPage (serviceName, description, price, notes).
        const finalQuote: Quote = {
            ...quote,
            serviceName: quote.serviceType.trim(),
            price: total,
        };

        try {
            setSubmitting(true);
            await onSubmit?.(finalQuote);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gửi báo giá thất bại");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form className="quote-form" onSubmit={handleSubmit}>
            <div>
                <div className="quote-title">Tạo báo giá mới</div>
                <div className="quote-subtitle">Điền thông tin để gửi báo giá cho khách hàng</div>
            </div>

            {/* THÔNG TIN DỊCH VỤ */}
            <div className="qsection">
                <div className="qsection-title">Thông tin dịch vụ</div>

                <div className="field-group">
                    <label className="field-label-sm">
                        Loại dịch vụ sửa chữa <span className="req">*</span>
                    </label>
                    <select
                        className="input"
                        value={quote.serviceType}
                        onChange={(e) => set("serviceType", e.target.value)}
                        required
                    >
                        {SERVICE_TYPES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div className="field-group">
                    <label className="field-label-sm">Mô tả sự cố / yêu cầu của khách hàng</label>
                    <textarea
                        className="textarea"
                        placeholder="Ví dụ: Máy không vắt, kêu to khi hoạt động..."
                        value={quote.description}
                        onChange={(e) => set("description", e.target.value)}
                    />
                </div>
            </div>

            {/* DANH SÁCH VẬT TƯ / LINH KIỆN */}
            <div className="qsection">
                <div className="qsection-title">Danh sách vật tư / linh kiện dự kiến</div>

                <div className="qitem-head">
                    <span>Vật tư / Linh kiện</span>
                    <span>Số lượng</span>
                    <span>Đơn giá (VND)</span>
                    <span className="ta-right">Thành tiền</span>
                    <span></span>
                </div>

                {quote.items.map((it) => (
                    <div className="qitem-row" key={it.id}>
                        <input
                            className="input qitem-input"
                            placeholder="Tên vật tư / linh kiện"
                            value={it.name}
                            onChange={(e) => updateItem(it.id, { name: e.target.value })}
                        />
                        <input
                            className="input qitem-input ta-center"
                            type="number"
                            min={0}
                            value={it.quantity}
                            onChange={(e) => updateItem(it.id, { quantity: Number(e.target.value) })}
                        />
                        <input
                            className="input qitem-input ta-right"
                            type="number"
                            min={0}
                            value={it.unitPrice || ""}
                            placeholder="0"
                            onChange={(e) => updateItem(it.id, { unitPrice: Number(e.target.value) })}
                        />
                        <span className="qitem-total">{fmt(it.quantity * it.unitPrice)}</span>
                        <button
                            type="button"
                            className="qitem-del"
                            title="Xoá dòng"
                            onClick={() => removeItem(it.id)}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}

                <button type="button" className="qadd-btn" onClick={addItem}>
                    <Plus size={16} /> Thêm vật tư / linh kiện
                </button>
            </div>

            {/* CHI PHÍ KHÁC */}
            <div className="qsection">
                <div className="qsection-title">Chi phí khác (nếu có)</div>
                <div className="qfee-row">
                    <span>Phí kiểm tra (nếu đồng ý sửa chữa)</span>
                    <input
                        className="input qfee-input ta-right"
                        type="number"
                        min={0}
                        value={quote.inspectionFee || ""}
                        placeholder="0"
                        onChange={(e) => set("inspectionFee", Number(e.target.value))}
                    />
                </div>
                <div className="qfee-row">
                    <span>Phí vận chuyển (nếu có)</span>
                    <input
                        className="input qfee-input ta-right"
                        type="number"
                        min={0}
                        value={quote.shippingFee || ""}
                        placeholder="0"
                        onChange={(e) => set("shippingFee", Number(e.target.value))}
                    />
                </div>
            </div>

            {/* TỔNG CỘNG DỰ KIẾN */}
            <div className="qtotals">
                <div className="qtotals-title">Tổng cộng dự kiến</div>
                <div className="qtotal-line">
                    <span>Tạm tính</span>
                    <span>{fmt(subtotal)}</span>
                </div>
                <div className="qtotal-line">
                    <span>VAT (nếu có)</span>
                    <input
                        className="input qfee-input ta-right"
                        type="number"
                        min={0}
                        value={quote.vat || ""}
                        placeholder="0"
                        onChange={(e) => set("vat", Number(e.target.value))}
                    />
                </div>
                <div className="qtotal-line qtotal-grand">
                    <span>TỔNG CỘNG</span>
                    <span>{fmt(total)} VND</span>
                </div>
            </div>

            {/* GHI CHÚ */}
            <div className="field-group">
                <label className="field-label-sm">Ghi chú</label>
                <textarea
                    className="textarea"
                    placeholder="Ghi chú thêm cho khách hàng..."
                    value={quote.notes}
                    onChange={(e) => set("notes", e.target.value)}
                />
            </div>

            {error && <div className="quote-error">{error}</div>}

            <div className="quote-actions">
                <button type="button" className="btn btn-cancel" onClick={onClose} disabled={submitting}>
                    Hủy
                </button>
                <button type="submit" className="btn btn-submit" disabled={submitting}>
                    {submitting ? "Đang gửi..." : "Gửi báo giá"}
                </button>
            </div>
        </form>
    );
};

export default QuoteForm;
