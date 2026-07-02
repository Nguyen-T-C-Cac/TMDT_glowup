export interface VoucherResponse {
    code: string;
    title: string;
    description?: string;
    tone: string;
    badge: string;
    discountType: 'percent' | 'fixed';
    discountValue: number;
    maxDiscountAmount?: number | null;
    minOrderAmount: number;
    endAt?: string | null;
    saved: boolean;
    used: boolean;
}

export interface InvoiceDiscountResponse {
    invoiceCode: string;
    totalPrice: number;
    voucherCode?: string | null;
    discountAmount: number;
    pointsUsed: number;
    pointsDiscountAmount: number;
    payableAmount: number;
    availablePoints: number;
}
