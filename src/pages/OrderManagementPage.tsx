import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './orderManagementPage.css';
import { useLocation, useNavigate } from 'react-router-dom';
import type { UserRole } from '../types/UserRole.ts';
import type { OrderResponse } from '../types/order/order.ts';
import type { OrderTabId } from '../stores/orderStore.ts';
import {
    filterOrdersBySearch,
    getOrderTab,
    mapOrderToCancelledOrder,
    mapOrderToCompletedOrder,
    mapOrderToInProgressOrder,
    mapOrderToRequestData,
    mapOrderToScheduledOrder,
} from '../stores/orderStore.ts';
import { orderService } from '../services/order/orderService.ts';
import { reviewService } from '../services/reviewService.ts';

import OrderTabs from '../components/orderManagement/OrderTabs.tsx';
import RequestCard from '../components/orderManagement/RequestCard.tsx';
import { ScheduledCard } from '../components/orderManagement/ScheduledCard.tsx';
import { InProgressCard } from '../components/orderManagement/InProgressCard.tsx';
import { CompletedCard } from '../components/orderManagement/CompletedCard.tsx';
import { CancelledCard } from '../components/orderManagement/CancelledCard.tsx';
import { OrderDetailPanel } from '../components/orderManagement/OrderDetailPanel.tsx';
import { WarrantyDetailPanel } from '../components/orderManagement/WarrantyDetailPanel.tsx';
import ReviewModal from '../components/modal/ReviewModal.tsx';
import ReportModal from '../components/modal/ReportModal.tsx';
import { useToast } from '../components/common/Toast';

interface OrderPageProps {
    role: UserRole;
}

const PAGE_SIZE = 10;

const tabStatusMap: Record<Exclude<OrderTabId, 'warranty'>, string | undefined> = {
    new: 'new',
    scheduled: 'scheduled',
    'in-progress': 'in-progress',
    completed: 'completed',
    cancelled: 'cancelled',
};

export const OrderManagementPage: React.FC<OrderPageProps> = ({ role }) => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<OrderTabId>('new');
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [loadingList, setLoadingList] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [submittingCancel, setSubmittingCancel] = useState(false);
    const [submittingStatus, setSubmittingStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState('');

    const [warrantyData, setWarrantyData] = useState<Record<string, { status: string; id: string }>>({});

    const [showWarrantyRejectModal, setShowWarrantyRejectModal] = useState(false);
    const [warrantyToReject, setWarrantyToReject] = useState<string | null>(null);
    const [warrantyRejectReason, setWarrantyRejectReason] = useState('');
    const [submittingWarrantyReject, setSubmittingWarrantyReject] = useState(false);

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reviewOrder, setReviewOrder] = useState<OrderResponse | null>(null);
    const [reviewEditData, setReviewEditData] = useState<{ rating: number; content?: string } | undefined>(undefined);
    const [reportOrder, setReportOrder] = useState<OrderResponse | null>(null);
    
    const location = useLocation();
    const navigate = useNavigate();
    const loadOrders = useCallback(async () => {
        setLoadingList(true);
        setError(null);

        try {
            const status = activeTab === 'warranty' ? undefined : tabStatusMap[activeTab];
            const result = await orderService.listOrders({
                page,
                limit: PAGE_SIZE,
                status,
                keyword: search.trim() || undefined,
            });

            const visibleItems = activeTab === 'warranty'
                ? result.items.filter((item) => getOrderTab(item) === 'warranty')
                : result.items;

            setOrders(visibleItems);

            // Fetch warranty data for warranty orders
            if (activeTab === 'warranty') {
                const warrantyOrders = visibleItems.filter(o => o.isWarranty);
                if (warrantyOrders.length > 0) {
                    const results = await Promise.all(
                        warrantyOrders.map(o => orderService.getWarranty(o.id).catch(() => null))
                    );
                    const wMap: Record<string, { status: string; id: string }> = {};
                    warrantyOrders.forEach((o, i) => {
                        const w = results[i];
                        if (w) wMap[o.id] = { status: w.status, id: w.id };
                    });
                    setWarrantyData(wMap);
                } else {
                    setWarrantyData({});
                }
            } else {
                setWarrantyData({});
            }

            setTotalPages(Math.max(1, result.totalPages || 1));
            setTotalElements(activeTab === 'warranty' ? visibleItems.length : result.totalElements);
        } catch (loadError) {
            const message = loadError instanceof Error ? loadError.message : 'Không thể tải danh sách đơn hàng';
            setError(message);
            setOrders([]);
            setTotalPages(1);
            setTotalElements(0);
            setWarrantyData({});
        } finally {
            setLoadingList(false);
        }
    }, [activeTab, page, search]);

    useEffect(() => {
        void loadOrders();
    }, [loadOrders]);

    useEffect(() => {
        setPage(1);
        setSelectedOrder(null);
    }, [activeTab]);

    // Xử lý deep-link từ thông báo: { openOrderId, openTab }
    useEffect(() => {
        const state = location.state as Record<string, unknown> | null;
        if (!state?.openOrderId) return;

        const id = state.openOrderId as string;
        const openTab = state.openTab as string | undefined;

        // Clear state ngay để tránh re-trigger khi navigate nội bộ
        navigate(location.pathname, { replace: true, state: {} });

        if (openTab === 'warranty') {
            // Chuyển sang tab bảo hành và mở chi tiết đơn
            setActiveTab('warranty');
            setPage(1);
            setSelectedOrder(null);
            orderService.getOrderById(id)
                .then((order) => setSelectedOrder(order))
                .catch(() => setError('Không thể tải chi tiết đơn hàng'));
        } else {
            // Tìm đúng tab của đơn rồi mở chi tiết
            orderService.getOrderById(id)
                .then((order) => {
                    const tab = getOrderTab(order) as OrderTabId;
                    setActiveTab(tab);
                    setPage(1);
                    setSelectedOrder(order);
                })
                .catch(() => setError('Không thể tải chi tiết đơn hàng'));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state]);
        const handleTabChange = (tabId: string) => {
            setActiveTab(tabId as OrderTabId);
        };

    const handleSelectOrder = async (orderId: string) => {
        setLoadingDetail(true);
        setError(null);

        const cachedOrder = orders.find((item) => item.id === orderId) ?? null;
        if (cachedOrder) {
            setSelectedOrder(cachedOrder);
        }

        try {
            const order = await orderService.getOrderById(orderId);
            setSelectedOrder(order);
        } catch (detailError) {
            const message = detailError instanceof Error ? detailError.message : 'Không thể tải chi tiết đơn hàng';
            setError(message);
            if (!cachedOrder) {
                setSelectedOrder(null);
            }
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleViewWarranty = async (orderId: string) => {
        setActiveTab('warranty');
        setPage(1);
        setSelectedOrder(null);
        const order = await orderService.getOrderById(orderId);
        setSelectedOrder(order);
    };

    const handleOpenCancelModal = (orderId: string) => {
        setOrderToCancel(orderId);
        setCancelReason('');
        setShowCancelModal(true);
    };

    const handleConfirmCancel = async () => {
        if (!orderToCancel) {
            return;
        }

        if (!cancelReason.trim()) {
            showToast('Vui lòng nhập lý do hủy đơn.', 'warning');
            return;
        }

        setSubmittingCancel(true);
        setError(null);

        try {
            const updatedOrder = await orderService.cancelOrder(orderToCancel, cancelReason.trim());

            setShowCancelModal(false);
            setOrderToCancel(null);
            setCancelReason('');
            setSelectedOrder(updatedOrder);

            if (activeTab !== 'cancelled') {
                setActiveTab('cancelled');
                setPage(1);
            } else {
                await loadOrders();
            }
        } catch (cancelError) {
            const message = cancelError instanceof Error ? cancelError.message : 'Không thể hủy đơn hàng';
            setError(message);
        } finally {
            setSubmittingCancel(false);
        }
    };

    const handleCreateInvoice = async (orderId: string) => {
        setError(null);
        try {
            await orderService.createInvoice(orderId);
            showToast('Hoá đơn đã được gửi vào chat thành công!', 'success');
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
            const serverMsg = axiosError?.response?.data?.error?.message;
            const msg = serverMsg || (err instanceof Error ? err.message : 'Không thể gửi hoá đơn');
            setError(msg);
        }
    };

    // Thu tiền mặt → xác nhận thanh toán: đơn hoàn thành + settle (trừ phí ví tín dụng, cộng điểm).
    // Đây là bước "hoàn thành" đúng nghiệp vụ — chỉ chạy sau khi đã thu tiền.
    const handleConfirmCash = async (orderId: string) => {
        setError(null);
        try {
            await orderService.confirmCashPayment(orderId);
            showToast('Đã thu tiền mặt — đơn hoàn thành, ví & điểm đã cập nhật', 'success');
            await loadOrders();
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
            const serverMsg = axiosError?.response?.data?.error?.message;
            showToast(serverMsg || (err instanceof Error ? err.message : 'Không thể xác nhận thu tiền. Hãy gửi hoá đơn trước.'), 'error');
        }
    };

    const handleUpdateStatus = async (orderId: string, status: string) => {
        setSubmittingStatus(orderId);
        setError(null);
        try {
            const updated = await orderService.updateStatus(orderId, status);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(updated);
            }
            if (status === 'completed' || status === 'in-progress') {
                await loadOrders();
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Không thể cập nhật trạng thái';
            setError(msg);
        } finally {
            setSubmittingStatus(null);
        }
    };

    const handleAcceptWarranty = useCallback(async (orderId: string) => {
        setError(null);
        try {
            const warranty = await orderService.getWarranty(orderId);
            if (!warranty) {
                alert('Không tìm thấy yêu cầu bảo hành');
                return;
            }
            if (warranty.status !== 'pending') {
                alert('Yêu cầu bảo hành này đã được xử lý');
                return;
            }
            await orderService.acceptWarranty(warranty.id);
            alert('Đã chấp nhận yêu cầu bảo hành!');
            await loadOrders();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Không thể chấp nhận yêu cầu bảo hành';
            setError(msg);
            alert(msg);
        }
    }, [loadOrders]);

    const handleRejectWarranty = useCallback((orderId: string) => {
        setWarrantyToReject(orderId);
        setWarrantyRejectReason('');
        setShowWarrantyRejectModal(true);
    }, []);

    const handleConfirmRejectWarranty = async () => {
        if (!warrantyToReject || !warrantyRejectReason.trim()) return;
        setSubmittingWarrantyReject(true);
        setError(null);
        try {
            const warranty = await orderService.getWarranty(warrantyToReject);
            if (!warranty) {
                alert('Không tìm thấy yêu cầu bảo hành');
                return;
            }
            if (warranty.status !== 'pending') {
                alert('Yêu cầu bảo hành này đã được xử lý');
                return;
            }
            await orderService.rejectWarranty(warranty.id, warrantyRejectReason.trim());
            alert('Đã từ chối yêu cầu bảo hành!');
            setShowWarrantyRejectModal(false);
            setWarrantyToReject(null);
            setWarrantyRejectReason('');
            await loadOrders();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Không thể từ chối yêu cầu bảo hành';
            setError(msg);
            alert(msg);
        } finally {
            setSubmittingWarrantyReject(false);
        }
    };

    const handleOpenReview = (order: OrderResponse) => {
        setReviewEditData(undefined);
        setReviewOrder(order);
        setShowReviewModal(true);
    };

    const handleOpenEditReview = async (order: OrderResponse) => {
        setReviewOrder(order);
        try {
            const res = await reviewService.getMyReview(order.id);
            const review = res.data || res;
            setReviewEditData({
                rating: review.rating ?? order.myRating ?? 5,
                content: review.content || '',
            });
        } catch {
            setReviewEditData({ rating: order.myRating ?? 5 });
        }
        setShowReviewModal(true);
    };

    const handleOpenReport = (order: OrderResponse) => {
        setReportOrder(order);
        setShowReportModal(true);
    };

    const handleReviewSuccess = (rating: number) => {
        setShowReviewModal(false);
        setReviewEditData(undefined);
        setReviewOrder(null);
        if (selectedOrder) {
            setSelectedOrder({
                ...selectedOrder,
                reviewed: true,
                myRating: rating,
            });
            setOrders(prev => prev.map(o =>
                o.id === selectedOrder.id ? { ...o, reviewed: true, myRating: rating } : o
            ));
        }
    };

    const handleReportSuccess = () => {
        setShowReportModal(false);
        setReportOrder(null);
    };

    const visibleOrders = useMemo(() => filterOrdersBySearch(orders, search), [orders, search]);

    const handleBookingAccept = useCallback((bookingCode: string) => {
        setOrders(prev => prev.filter(o => o.id !== bookingCode));
    }, []);

    const handleBookingReject = useCallback((bookingCode: string) => {
        setOrders(prev => prev.filter(o => o.id !== bookingCode));
    }, []);

    const renderedCards = useMemo(() => {
        if (activeTab === 'new') {
            return visibleOrders.map((order) => (
                <RequestCard
                    key={order.id}
                    data={mapOrderToRequestData(order)}
                    role={role}
                    onViewDetail={handleSelectOrder}
                    onCancel={handleOpenCancelModal}
                    onBookingAccept={handleBookingAccept}
                    onBookingReject={handleBookingReject}
                />
            ));
        }

        if (activeTab === 'scheduled' || activeTab === 'warranty') {
            return visibleOrders.map((order) => {
                const wData = warrantyData[order.id];
                const scheduledData = {
                    ...mapOrderToScheduledOrder(order),
                    warrantyStatus: wData?.status,
                };
                return (
                    <ScheduledCard
                        key={order.id}
                        data={scheduledData}
                        role={role}
                        onViewDetail={handleSelectOrder}
                        onCancel={handleOpenCancelModal}
                        onUpdateStatus={handleUpdateStatus}
                        onAcceptWarranty={handleAcceptWarranty}
                        onRejectWarranty={handleRejectWarranty}
                    />
                );
            });
        }

        if (activeTab === 'in-progress') {
            return visibleOrders.map((order) => (
                <InProgressCard
                    key={order.id}
                    data={mapOrderToInProgressOrder(order)}
                    role={role}
                    onViewDetail={handleSelectOrder}
                    onCreateInvoice={role === 'technician' ? handleCreateInvoice : undefined}
                    onConfirmCash={role === 'technician' ? handleConfirmCash : undefined}
                />
            ));
        }

        if (activeTab === 'completed') {
            return visibleOrders.map((order) => (
                <CompletedCard
                    key={order.id}
                    data={mapOrderToCompletedOrder(order)}
                    role={role}
                    onViewDetail={handleSelectOrder}
                />
            ));
        }

        return visibleOrders.map((order) => (
            <CancelledCard
                key={order.id}
                data={mapOrderToCancelledOrder(order)}
                role={role}
                onViewDetail={handleSelectOrder}
            />
        ));
    }, [activeTab, handleSelectOrder, role, visibleOrders, warrantyData, handleAcceptWarranty, handleRejectWarranty]);

    return (
        <div className="layout-wrapper">
            <div className="main-content">
                <main className="page-body bg-plate-white">
                    <div className="orders-container">
                        {selectedOrder && activeTab === 'warranty' && (
            <WarrantyDetailPanel
                orderId={selectedOrder.id}
                role={role}
                onBack={() => setSelectedOrder(null)}
            />
                        )}

                        {selectedOrder && activeTab !== 'warranty' && (
            <OrderDetailPanel
                order={selectedOrder}
                role={role}
                onBack={() => setSelectedOrder(null)}
                onCancel={handleOpenCancelModal}
                onReview={handleOpenReview}
                onEditReview={handleOpenEditReview}
                onReport={handleOpenReport}
                onViewWarranty={handleViewWarranty}
            />
                        )}

                        {!selectedOrder && (
                            <>
                                <div className="page-header order-page-header">
                                    <div>
                                        <h2>Quản lý đơn hàng</h2>
                                        <p className="order-page-subtitle">
                                            Theo dõi yêu cầu, lịch hẹn và trạng thái xử lý theo dữ liệu từ hệ thống.
                                        </p>
                                    </div>

                                    <div className="search-bar">
                                        <input
                                            type="text"
                                            placeholder="Tìm mã đơn, dịch vụ, địa chỉ..."
                                            value={search}
                                            onChange={(event) => {
                                                setSearch(event.target.value);
                                                setPage(1);
                                            }}
                                        />
                                    </div>
                                </div>

                                <OrderTabs activeTab={activeTab} onChangeTab={handleTabChange} />

                                {loadingList && (
                                    <div className="order-alert loading">Đang tải danh sách đơn hàng...</div>
                                )}

                                {loadingDetail && (
                                    <div className="order-alert loading">Đang tải chi tiết đơn hàng...</div>
                                )}

                                {error && (
                                    <div className="order-alert error">{error}</div>
                                )}

                                <div className="request-list">
                                    {!loadingList && renderedCards.length === 0 ? (
                                        <div className="order-empty-state">
                                            Chưa có đơn hàng nào trong mục này.
                                        </div>
                                    ) : renderedCards}
                                </div>

                                <div className="order-pagination">
                                    <span className="order-pagination-summary">
                                        Trang {page}/{Math.max(1, totalPages)} · {totalElements} đơn
                                    </span>

                                    <div className="order-pagination-actions">
                                        <button
                                            type="button"
                                            className="order-pagination-btn"
                                            disabled={page <= 1 || loadingList}
                                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                            aria-label="Trang trước"
                                        >
                                            <span className="order-pagination-btn-icon" aria-hidden="true">‹</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="order-pagination-btn"
                                            disabled={page >= totalPages || loadingList}
                                            onClick={() => setPage((prev) => prev + 1)}
                                            aria-label="Trang sau"
                                        >
                                            <span className="order-pagination-btn-icon" aria-hidden="true">›</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {showCancelModal && (
                            <div className="order-cancel-modal-overlay" style={{ zIndex: 9999 }}>
                                <div className="order-cancel-modal-content">
                                    <div className="order-cancel-modal-header">
                                        <h2 style={{ color: '#ef4444' }}>
                                            {role === 'technician' ? 'Từ chối yêu cầu' : 'Xác nhận hủy đơn'}
                                        </h2>
                                    </div>
                                    <div className="order-cancel-modal-body">
                                        <p style={{ fontSize: '14px', color: 'var(--stem-grey)', marginBottom: '16px' }}>
                                            Vui lòng cho biết lý do bạn muốn {role === 'technician' ? 'từ chối' : 'hủy'} đơn hàng <strong>{orderToCancel}</strong>.
                                        </p>
                                        <textarea
                                            className="order-cancel-reason-input"
                                            placeholder="Nhập lý do chi tiết..."
                                            value={cancelReason}
                                            onChange={(event) => setCancelReason(event.target.value)}
                                            style={{ minHeight: '120px' }}
                                        />
                                    </div>
                                    <div className="order-cancel-modal-footer">
                                        <button
                                            type="button"
                                            className="order-cancel-btn-back"
                                            onClick={() => setShowCancelModal(false)}
                                            disabled={submittingCancel}
                                        >
                                            Quay lại
                                        </button>
                                        <button
                                            type="button"
                                            className="order-cancel-btn-confirm"
                                            style={{ background: '#ef4444' }}
                                            onClick={handleConfirmCancel}
                                            disabled={submittingCancel}
                                        >
                                            {submittingCancel ? 'Đang xử lý...' : 'Xác nhận'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <ReviewModal
                            open={showReviewModal}
                            onClose={() => { setShowReviewModal(false); setReviewEditData(undefined); setReviewOrder(null); }}
                            orderId={reviewOrder?.id ?? ''}
                            technicianName={reviewOrder?.technician?.fullName}
                            onSuccess={handleReviewSuccess}
                            editData={reviewEditData}
                        />

                        {showWarrantyRejectModal && (
                            <div className="order-cancel-modal-overlay" style={{ zIndex: 9999 }}>
                                <div className="order-cancel-modal-content">
                                    <div className="order-cancel-modal-header">
                                        <h2 style={{ color: '#ef4444' }}>
                                            Từ chối bảo hành
                                        </h2>
                                    </div>
                                    <div className="order-cancel-modal-body">
                                        <p style={{ fontSize: '14px', color: 'var(--stem-grey)', marginBottom: '16px' }}>
                                            Vui lòng nhập lý do từ chối yêu cầu bảo hành của đơn <strong>{warrantyToReject}</strong>.
                                        </p>
                                        <textarea
                                            className="order-cancel-reason-input"
                                            placeholder="Nhập lý do từ chối..."
                                            value={warrantyRejectReason}
                                            onChange={(event) => setWarrantyRejectReason(event.target.value)}
                                            style={{ minHeight: '120px' }}
                                        />
                                    </div>
                                    <div className="order-cancel-modal-footer">
                                        <button
                                            type="button"
                                            className="order-cancel-btn-back"
                                            onClick={() => { setShowWarrantyRejectModal(false); setWarrantyToReject(null); setWarrantyRejectReason(''); }}
                                            disabled={submittingWarrantyReject}
                                        >
                                            Quay lại
                                        </button>
                                        <button
                                            type="button"
                                            className="order-cancel-btn-confirm"
                                            style={{ background: '#ef4444' }}
                                            onClick={handleConfirmRejectWarranty}
                                            disabled={submittingWarrantyReject || !warrantyRejectReason.trim()}
                                        >
                                            {submittingWarrantyReject ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <ReportModal
                            open={showReportModal}
                            onClose={() => { setShowReportModal(false); setReportOrder(null); }}
                            orderId={reportOrder?.id ?? ''}
                            onSuccess={handleReportSuccess}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OrderManagementPage;
