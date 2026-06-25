import React, { useState } from "react";
import { X } from "lucide-react";
import Modal from "../common/Modal";
import QuoteForm from "../quote/QuoteForm";
import { QuotationCard } from "../chat/QuotationCard";
import type { Quote } from "../../types/Quote";
import { computeQuoteTotal } from "../../types/Quote";
import "./css/quote.css";

interface QuoteCreateModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (quote: Quote) => Promise<void>;
}

const initialQuote = (): Quote => ({
    serviceName: "Sửa chữa máy giặt",
    serviceType: "Sửa chữa máy giặt",
    description: "",
    price: 0,
    notes: "",
    items: [{ id: "seed-1", name: "Công thợ sửa chữa", quantity: 1, unitPrice: 0 }],
    inspectionFee: 0,
    shippingFee: 0,
    vat: 0,
});

const QuoteCreateModal: React.FC<QuoteCreateModalProps> = ({ open, onClose, onSubmit }) => {
    const [quote, setQuote] = useState<Quote>(initialQuote);

    const total = computeQuoteTotal(quote);

    return (
        <Modal open={open} onClose={onClose}>
            <div className="quote-modal">
                <button
                    type="button"
                    className="quote-close"
                    onClick={onClose}
                    aria-label="Đóng báo giá"
                >
                    <X size={20} />
                </button>
                <div className="quote-left">
                    <div className="quote-shell-header">
                        <div>
                            <div className="quote-shell-title">Tạo báo giá</div>
                            <div className="quote-shell-subtitle">Soạn báo giá rõ ràng trước khi gửi cho khách hàng.</div>
                        </div>
                    </div>
                    <QuoteForm
                        quote={quote}
                        setQuote={setQuote}
                        onClose={onClose}
                        onSubmit={onSubmit}
                    />
                </div>
                <div className="quote-right">
                    <div className="preview-header-text">
                        <div className="preview-title">XEM TRƯỚC BÁO GIÁ</div>
                        <div className="preview-sub">Giao diện khách hàng sẽ nhận</div>
                    </div>
                    <QuotationCard
                        serviceName={quote.serviceType}
                        description={quote.description}
                        price={total}
                        previewMode={true}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default QuoteCreateModal;
