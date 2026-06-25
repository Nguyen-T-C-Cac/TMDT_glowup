import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './orderManagementPage.css';

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
import ReviewModal from '../components/modal/ReviewModal.tsx';
import ReportModal from '../components/modal/ReportModal.tsx';

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

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reviewOrder, setReviewOrder] = useState<OrderResponse | null>(null);
    const [reviewEditData, setReviewEditData] = useState<{ rating: number; content?: string } | undefined>(undefined);
    const [reportOrder, setReportOrder] = useState<OrderResponse | null>(null);

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
            setTotalPages(Math.max(1, result.totalPages || 1));
            setTotalElements(activeTab === 'warranty' ? visibleItems.length : result.totalElements);
        } catch (loadError) {
            const message = loadError instanceof Error ? loadError.message : 'Không thể tải danh sách đơn hàng';
            setError(message);
            setOrders([]);
            setTotalPages(1);
            setTotalElements(0);
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
            window.alert('Vui lòng nhập lý do hủy đơn.');
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
            alert('Hoá đơn đã được gửi vào chat thành công!');
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
            const serverMsg = axiosError?.response?.data?.error?.message;
            const msg = serverMsg || (err instanceof Error ? err.message : 'Không thể gửi hoá đơn');
            setError(msg);
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

    const renderedCards = useMemo(() => {
        if (activeTab === 'new') {
            return visibleOrders.map((order) => (
                <RequestCard
                    key={order.id}
                    data={mapOrderToRequestData(order)}
                    role={role}
                    onViewDetail={handleSelectOrder}
                    onCancel={handleOpenCancelModal}
                />
            ));
        }

        if (activeTab === 'scheduled' || activeTab === 'warranty') {
            return visibleOrders.map((order) => (
                <ScheduledCard
                    key={order.id}
                    data={mapOrderToScheduledOrder(order)}
                    role={role}
                    onViewDetail={handleSelectOrder}
                    onCancel={handleOpenCancelModal}
                    onUpdateStatus={handleUpdateStatus}
                />
            ));
        }

        if (activeTab === 'in-progress') {
            return visibleOrders.map((order) => (
                <InProgressCard
                    key={order.id}
                    data={mapOrderToInProgressOrder(order)}
                    role={role}
                    onViewDetail={handleSelectOrder}
                    onUpdateStatus={handleUpdateStatus}
                    onCreateInvoice={role === 'technician' ? handleCreateInvoice : undefined}
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
    }, [activeTab, handleSelectOrder, role, visibleOrders]);

    return (
        <div className="layout-wrapper">
            <div className="main-content">
                <main className="page-body bg-plate-white">
                    <div className="orders-container">
                        {selectedOrder && (
            <OrderDetailPanel
                order={selectedOrder}
                role={role}
                onBack={() => setSelectedOrder(null)}
                onCancel={handleOpenCancelModal}
                onReview={handleOpenReview}
                onEditReview={handleOpenEditReview}
                onReport={handleOpenReport}
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
