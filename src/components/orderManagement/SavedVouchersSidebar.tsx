import { useEffect, useState } from 'react';
import { Ticket, Loader2 } from 'lucide-react';
import { voucherService } from '../../services/voucherService';
import type { VoucherResponse } from '../../types/voucher';
import './SavedVouchersSidebar.css';

function formatVnd(amount?: number | null): string {
    if (amount === undefined || amount === null) return '';
    return amount.toLocaleString('vi-VN') + 'đ';
}

function voucherAccent(v: VoucherResponse): string {
    if (v.discountType === 'percent') return `-${v.discountValue}%`;
    return `-${formatVnd(v.discountValue)}`;
}

function formatExpiry(endAt?: string | null): string {
    if (!endAt) return 'Không giới hạn';
    const date = new Date(endAt);
    if (Number.isNaN(date.getTime())) return endAt;
    return `HSD ${date.toLocaleDateString('vi-VN')}`;
}

/**
 * Sidebar shown on the customer's "Quản lý đơn hàng" page listing vouchers
 * they have saved from the rewards page, so they can quickly recall which
 * ones are ready to apply next time they pay an invoice.
 */
export function SavedVouchersSidebar() {
    const [vouchers, setVouchers] = useState<VoucherResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [points, setPoints] = useState<number | null>(null);

    useEffect(() => {
        let mounted = true;
        Promise.all([voucherService.listSaved(), voucherService.getMyPoints()])
            .then(([savedVouchers, rewardPoints]) => {
                if (!mounted) return;
                setVouchers(savedVouchers);
                setPoints(rewardPoints);
            })
            .catch(() => {
                if (mounted) setVouchers([]);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <aside className="saved-vouchers-sidebar">
            <div className="saved-vouchers-head">
                <Ticket size={18} />
                <h3>Voucher đã lưu</h3>
            </div>

            {points !== null && (
                <div className="saved-points-pill">
                    Điểm thưởng: <strong>{points.toLocaleString('vi-VN')}</strong>
                </div>
            )}

            {loading ? (
                <div className="saved-vouchers-loading">
                    <Loader2 className="spin" size={16} /> Đang tải...
                </div>
            ) : vouchers.length === 0 ? (
                <p className="saved-vouchers-empty">
                    Bạn chưa lưu voucher nào. Ghé trang{' '}
                    <a href="/rewards">Ưu đãi & phần thưởng</a> để lưu voucher nhé.
                </p>
            ) : (
                <ul className="saved-vouchers-list">
                    {vouchers.map((v) => (
                        <li key={v.code} className={`saved-voucher-item tone-${v.tone}`}>
                            <div className="saved-voucher-amount">{voucherAccent(v)}</div>
                            <div className="saved-voucher-info">
                                <strong>{v.title}</strong>
                                <span>{formatExpiry(v.endAt)}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <p className="saved-vouchers-hint">
                Áp dụng voucher &amp; điểm thưởng ngay trong hoá đơn khi thanh toán qua VNPay.
            </p>
        </aside>
    );
}

export default SavedVouchersSidebar;
