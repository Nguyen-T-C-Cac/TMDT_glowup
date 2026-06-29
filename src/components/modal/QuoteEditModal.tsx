import React, { useState } from "react";
import { X } from "lucide-react";
import Modal from "../common/Modal";
import QuoteForm from "../quote/QuoteForm";
import { QuotationCard } from "../chat/QuotationCard";
import type { Quote } from "../../types/Quote";
import { computeQuoteTotal } from "../../types/Quote";
import "./css/quote.css";

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (quote: Quote) => Promise<void>;
    initialData: {           // điền sẵn giá trị báo giá cũ
        serviceName: string;
        description?: string;
        price: number;
        scheduledAt?: string;
    };
}

const QuoteEditModal: React.FC<Props> = ({ open, onClose, onSubmit, initialData }) => {
    const [quote, setQuote] = useState<Quote>({
        serviceName: initialData.serviceName,
        serviceType: initialData.serviceName,
        description: initialData.description ?? "",
        price: initialData.price,
        notes: "",
        items: [{ id: "seed-1", name: "Công thợ sửa chữa", quantity: 1, unitPrice: initialData.price }],
        inspectionFee: 0,
        shippingFee: 0,
        vat: 0,
        scheduledAt: initialData.scheduledAt,
    });

    const total = computeQuoteTotal(quote);

    return (
        <Modal open={open} onClose={onClose}>
            <div className="quote-modal">
                <button type="button" className="quote-close" onClick={onClose}>
                    <X size={20} />
                </button>
                <div className="quote-left">
                    <div className="quote-shell-header">
                        <div className="quote-shell-title">Sửa báo giá</div>
                        <div className="quote-shell-subtitle">Chỉnh sửa và gửi lại cho khách xác nhận.</div>
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

export default QuoteEditModal;