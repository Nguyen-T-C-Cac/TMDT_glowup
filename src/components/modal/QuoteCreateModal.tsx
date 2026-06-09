import React, { useState } from "react";
import Modal from "../common/Modal";
import QuoteForm from "../quote/QuoteForm";
import { QuotationCard } from "../chat/QuotationCard";
import type { Quote } from "../../types/Quote";
import { computeQuoteTotal } from "../../types/Quote";
import type { CreateQuotePayload } from "../../services/chatService";
import "./css/quote.css";

interface QuoteCreateModalProps {
    open: boolean;
    onClose: () => void;
    /** Submit handler wired by the chat page; posts the quote to the backend. */
    onSubmit?: (payload: CreateQuotePayload) => Promise<void> | void;
}

const initialQuote = (): Quote => ({
    serviceType: "Sửa chữa máy giặt",
    description: "",
    items: [
        { id: "seed-1", name: "Công thợ sửa chữa", quantity: 1, unitPrice: 0 },
    ],
    inspectionFee: 0,
    shippingFee: 0,
    vat: 0,
    notes: "",
});

const QuoteCreateModal: React.FC<QuoteCreateModalProps> = ({ open, onClose, onSubmit }) => {
    const [quote, setQuote] = useState<Quote>(initialQuote);

    const total = computeQuoteTotal(quote);

    return (
        <Modal open={open} onClose={onClose}>
            <div className="quote-modal">
                {/* LEFT: FORM */}
                <div className="quote-left">
                    <QuoteForm
                        quote={quote}
                        setQuote={setQuote}
                        onClose={onClose}
                        onSubmit={onSubmit}
                    />
                </div>

                {/* RIGHT: PREVIEW */}
                <div className="quote-right">
                    <div className="preview-header-text" style={{ marginBottom: "24px" }}>
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
