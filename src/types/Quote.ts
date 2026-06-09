export interface QuoteLineItem {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
}

export interface Quote {
    /** Loại dịch vụ sửa chữa. */
    serviceType: string;
    /** Mô tả sự cố / yêu cầu của khách hàng. */
    description: string;
    /** Danh sách vật tư / linh kiện dự kiến. */
    items: QuoteLineItem[];
    /** Phí kiểm tra (nếu đồng ý sửa chữa). */
    inspectionFee: number;
    /** Phí vận chuyển (nếu có). */
    shippingFee: number;
    /** VAT (số tiền, nếu có). */
    vat: number;
    notes?: string;
}

const num = (v: number) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/** Tạm tính = tổng thành tiền các dòng vật tư. */
export const computeQuoteSubtotal = (q: Quote): number =>
    q.items.reduce((sum, it) => sum + num(it.quantity) * num(it.unitPrice), 0);

/** Tổng cộng = tạm tính + phí kiểm tra + phí vận chuyển + VAT. */
export const computeQuoteTotal = (q: Quote): number =>
    computeQuoteSubtotal(q) + num(q.inspectionFee) + num(q.shippingFee) + num(q.vat);
