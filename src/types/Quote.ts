export interface QuoteLineItem {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
}

export interface Quote {
    // --- Trường mà ChatPage/MessageInput tiêu thụ (giữ tương thích với main) ---
    serviceName: string;   // = serviceType khi submit
    description: string;
    price: number;         // = tổng cộng tính được khi submit
    notes?: string;
    scheduledAt?: string;
    date?: string;         // legacy, form chi tiết không dùng
    time?: string;

    // --- Trường cho form báo giá chi tiết ---
    serviceType: string;
    items: QuoteLineItem[];
    inspectionFee: number; // phí kiểm tra
    shippingFee: number;   // phí vận chuyển
    vat: number;           // VAT (số tiền)
}

const num = (v: number) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/** Tạm tính = tổng thành tiền các dòng vật tư. */
export const computeQuoteSubtotal = (q: Quote): number =>
    q.items.reduce((sum, it) => sum + num(it.quantity) * num(it.unitPrice), 0);

/** Tổng cộng = tạm tính + phí kiểm tra + phí vận chuyển + VAT. */
export const computeQuoteTotal = (q: Quote): number =>
    computeQuoteSubtotal(q) + num(q.inspectionFee) + num(q.shippingFee) + num(q.vat);
