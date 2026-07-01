import apiClient from '../../api/config';
import type { OrderListQuery, OrderPageResponse, OrderResponse, CreateOrderPayload } from '../../types/order/order';
import type { WarrantyResponse, CreateWarrantyPayload } from '../../types/warranty';

type ApiPageLike = {
    content?: OrderResponse[];
    items?: OrderResponse[];
    data?: OrderResponse[] | { content?: OrderResponse[] };
    page?: number;
    size?: number;
    totalPages?: number;
    totalElements?: number;
    first?: boolean;
    last?: boolean;
    number?: number;
    numberOfElements?: number;
    pageable?: {
        pageNumber?: number;
        pageSize?: number;
    };
};

type NormalizedPageQuery = {
    page: number;
    limit: number;
};

const unwrap = <T,>(payload: unknown): T => {
    if (payload && typeof payload === 'object' && 'success' in payload && (payload as { success?: boolean }).success && 'data' in payload) {
        return (payload as { data: T }).data;
    }

    if (payload && typeof payload === 'object' && 'data' in payload) {
        return (payload as { data: T }).data;
    }

    return payload as T;
};

const normalizePage = (payload: unknown, fallbackQuery: NormalizedPageQuery): OrderPageResponse => {
    const resolved = unwrap<ApiPageLike | OrderResponse[] | null>(payload);

    if (Array.isArray(resolved)) {
        return {
            items: resolved,
            page: fallbackQuery.page,
            size: fallbackQuery.limit,
            totalPages: 1,
            totalElements: resolved.length,
            first: fallbackQuery.page <= 0,
            last: true,
        };
    }

    const items = resolved?.content ?? resolved?.items ?? (Array.isArray(resolved?.data) ? resolved.data : []) ?? [];
    const page = resolved?.page ?? resolved?.number ?? resolved?.pageable?.pageNumber ?? fallbackQuery.page;
    const size = resolved?.size ?? resolved?.pageable?.pageSize ?? fallbackQuery.limit;
    const totalPages = resolved?.totalPages ?? 1;
    const totalElements = resolved?.totalElements ?? resolved?.numberOfElements ?? items.length;

    return {
        items,
        page,
        size,
        totalPages,
        totalElements,
        first: resolved?.first ?? page <= 0,
        last: resolved?.last ?? totalPages <= 1,
    };
};

const normalizeOrder = (payload: unknown): OrderResponse => unwrap<OrderResponse>(payload);

export const orderService = {
    listOrders: async (query: OrderListQuery = {}): Promise<OrderPageResponse> => {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;

        const response = await apiClient.get('/api/orders', {
            params: {
                page,
                limit,
                status: query.status,
                keyword: query.keyword,
            },
        });

        return normalizePage(response.data, { page, limit });
    },

    getOrderById: async (id: string): Promise<OrderResponse> => {
        const response = await apiClient.get(`/api/orders/${id}`);
        return normalizeOrder(response.data);
    },

    requestPriceAdjustment: async (
        orderId: string,
        payload: {
            newPrice: number;
            reason: string;
            parts?: { name: string; price: number; partCode?: string }[];
            evidenceImages?: string[];
        }
    ): Promise<OrderResponse> => {
        await apiClient.patch(`/api/orders/${orderId}/price`, payload);
        return orderService.getOrderById(orderId);
    },

    approvePriceAdjustment: async (orderId: string): Promise<OrderResponse> => {
        const response = await apiClient.post(`/api/orders/${orderId}/price/approve`);
        unwrap(response.data);
        return orderService.getOrderById(orderId);
    },

    rejectPriceAdjustment: async (orderId: string, reason: string): Promise<OrderResponse> => {
        const response = await apiClient.post(`/api/orders/${orderId}/price/reject`, { reason });
        unwrap(response.data);
        return orderService.getOrderById(orderId);
    },

    createOrder: async (payload: CreateOrderPayload): Promise<OrderResponse> => {
        const response = await apiClient.post('/api/orders', payload);
        return normalizeOrder(response.data);
    },

    acceptOrder: async (orderId: string): Promise<OrderResponse> => {
        const response = await apiClient.post(`/api/orders/${orderId}/accept`);
        unwrap(response.data);
        return orderService.getOrderById(orderId);
    },

    cancelOrder: async (orderId: string, reason: string): Promise<OrderResponse> => {
        const response = await apiClient.post(`/api/orders/${orderId}/cancel`, { reason });
        unwrap(response.data);
        return orderService.getOrderById(orderId);
    },

    updateStatus: async (orderId: string, status: string): Promise<OrderResponse> => {
        const response = await apiClient.patch(`/api/orders/${orderId}/status`, { status });
        unwrap(response.data);
        return orderService.getOrderById(orderId);
    },

    createInvoice: async (orderId: string): Promise<void> => {
        await apiClient.post(`/api/orders/${orderId}/invoice`);
    },

    createVnpayCheckout: async (orderId: string): Promise<string> => {
        const response = await apiClient.post(`/api/orders/${orderId}/invoice/vnpay-checkout`);
        const data = unwrap<{ checkoutUrl: string }>(response.data);
        return data.checkoutUrl;
    },

    confirmCashPayment: async (orderId: string): Promise<void> => {
        await apiClient.post(`/api/orders/${orderId}/invoice/confirm-cash`);
    },

    createWarranty: async (orderId: string, payload: CreateWarrantyPayload): Promise<WarrantyResponse> => {
        const response = await apiClient.post(`/api/orders/${orderId}/warranty`, payload);
        return unwrap<WarrantyResponse>(response.data);
    },

    getWarranty: async (orderId: string): Promise<WarrantyResponse | null> => {
        try {
            const response = await apiClient.get(`/api/orders/${orderId}/warranty`);
            return unwrap<WarrantyResponse>(response.data);
        } catch {
            return null;
        }
    },

    acceptWarranty: async (warrantyCode: string): Promise<WarrantyResponse> => {
        const response = await apiClient.post(`/api/warranty/${warrantyCode}/accept`);
        return unwrap<WarrantyResponse>(response.data);
    },

    rejectWarranty: async (warrantyCode: string, reason: string): Promise<WarrantyResponse> => {
        const response = await apiClient.post(`/api/warranty/${warrantyCode}/reject`, { reason });
        return unwrap<WarrantyResponse>(response.data);
    },
};
