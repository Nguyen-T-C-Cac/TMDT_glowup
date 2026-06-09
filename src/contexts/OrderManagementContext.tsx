/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useEffect, useMemo, useReducer } from 'react';
import { getAdminOrders, getOrderDetail } from '../services/orderService';
import type { UserRole } from '../types/UserRole';
import type { OrderResponse } from '../types/order/order';
import {
    getMergedVisibleOrders,
    initialOrderManagementState,
    orderManagementReducer,
    type OrderManagementState,
} from '../stores/orderStore';

export interface OrderManagementContextValue {
    role: UserRole;
    state: OrderManagementState;
    selectedOrder: OrderResponse | null;
    visibleOrders: OrderResponse[];
    refreshOrders: () => Promise<void>;
    selectOrder: (orderId: string) => Promise<void>;
    setActiveTab: (tab: OrderManagementState['activeTab']) => void;
    setPage: (page: number) => void;
    setSearch: (search: string) => void;
    openCancelModal: (orderId: string) => void;
    closeCancelModal: () => void;
    setCancelReason: (reason: string) => void;
    confirmCancel: () => void;
    clearSelectedOrder: () => void;
}

const OrderManagementContext = createContext<OrderManagementContextValue | null>(null);

interface OrderManagementProviderProps {
    role: UserRole;
    children: React.ReactNode;
}

// Chuẩn hóa dữ liệu từ API về đúng cấu trúc State yêu cầu
const normalizeOrder = (rawOrder: any): OrderResponse => {
    return {
        ...rawOrder,
        customer: typeof rawOrder.customer === 'string' 
            ? { name: rawOrder.customer } as any 
            : rawOrder.customer,
        status: rawOrder.status || 'PENDING',
    } as OrderResponse;
};

export const OrderManagementProvider: React.FC<OrderManagementProviderProps> = ({ role, children }) => {
    const [state, dispatch] = useReducer(orderManagementReducer, initialOrderManagementState);

    const refreshOrders = React.useCallback(async () => {
        dispatch({ type: 'LOAD_LIST_START' });

        try {
            const result = await getAdminOrders({
                page: state.page,
                limit: state.pageSize,
            });

            dispatch({
                type: 'LOAD_LIST_SUCCESS',
                payload: {
                    orders: result.items.map(normalizeOrder),
                    totalPages: Math.ceil(result.totalElements / state.pageSize),
                    totalElements: result.totalElements,
                },
            });
        } catch {
            // Đã bỏ chữ 'error' ở catch() để tránh lỗi unused-vars của ESLint
            dispatch({ type: 'LOAD_LIST_ERROR', message: 'Không thể tải đơn hàng' });
        }
    }, [state.page, state.pageSize]);

    const selectOrder = React.useCallback(async (orderId: string) => {
        dispatch({ type: 'LOAD_DETAIL_START', orderId });

        const cachedOrder = state.optimisticOrdersById[orderId] ?? state.orders.find((item) => item.id === orderId);
        if (cachedOrder) {
            dispatch({ type: 'LOAD_DETAIL_SUCCESS', order: cachedOrder });
        }

        try {
            const orderDetail = await getOrderDetail(orderId);
            dispatch({ type: 'LOAD_DETAIL_SUCCESS', order: normalizeOrder(orderDetail.order) });
        } catch {
            // Đã bỏ chữ 'error' ở catch() để tránh lỗi unused-vars của ESLint
            if (!cachedOrder) {
                dispatch({ type: 'LOAD_DETAIL_ERROR', message: 'Không thể tải chi tiết đơn hàng' });
            }
        }
    }, [state.optimisticOrdersById, state.orders]);

    useEffect(() => {
        void refreshOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.page, state.pageSize]);

    const visibleOrders = useMemo(
        () => getMergedVisibleOrders(state.orders, state.optimisticOrdersById, state.activeTab, state.search),
        [state.activeTab, state.orders, state.optimisticOrdersById, state.search],
    );

    const value = useMemo<OrderManagementContextValue>(
        () => ({
            role,
            state,
            selectedOrder: state.selectedOrder,
            visibleOrders,
            refreshOrders: async () => {
                await refreshOrders();
            },
            selectOrder,
            setActiveTab: (tab) => dispatch({ type: 'SET_ACTIVE_TAB', tab }),
            setPage: (page) => dispatch({ type: 'SET_PAGE', page }),
            setSearch: (search) => dispatch({ type: 'SET_SEARCH', search }),
            openCancelModal: (orderId) => dispatch({ type: 'OPEN_CANCEL_MODAL', orderId }),
            closeCancelModal: () => dispatch({ type: 'CLOSE_CANCEL_MODAL' }),
            setCancelReason: (reason) => dispatch({ type: 'SET_CANCEL_REASON', cancelReason: reason }),
            confirmCancel: () => dispatch({ type: 'CONFIRM_CANCEL', role }),
            clearSelectedOrder: () => dispatch({ type: 'CLEAR_SELECTED_ORDER' }),
        }),
        [role, selectOrder, state, visibleOrders, refreshOrders],
    );

    return <OrderManagementContext.Provider value={value}>{children}</OrderManagementContext.Provider>;
};

// Thêm dòng này để tắt cảnh báo Fast Refresh khi export nhiều thành phần trong 1 file
// eslint-disable-next-line react-refresh/only-export-components
export const useOrderManagementContext = () => {
    const context = React.useContext(OrderManagementContext);

    if (!context) {
        throw new Error('useOrderManagementContext must be used within OrderManagementProvider');
    }

    return context;
};