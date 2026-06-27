import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import styles from './ChatPage.module.css';
import { ContactItem } from '../components/chat/ContactItem';
import { QuotationCard } from '../components/chat/QuotationCard';
import { InvoiceCard } from '../components/chat/InvoiceCard';
import { MessageInput } from '../components/chat/MessageInput';
import { SearchBar } from '../components/chat/SearchBar';
import { Avatar } from '../components/common/Avatar';
import { RepairRequestCard } from '../components/chat/RepairRequestCard';
import { PriceAdjustmentCard } from '../components/chat/PriceAdjustmentCard';
import { AdjustmentModal, type AdjustmentSubmitPayload } from '../components/modal/AdjustmentModal';
import UpdatePriceModal from '../components/modal/UpdatePriceModal';
import { chatService } from '../services/chat/chatService';
import { mapWsMessageToChatMessage } from '../services/chat/chatRealtimeClient';
import { orderService } from '../services/order/orderService';
import { getStoredUser } from '../services/auth';
import { userService } from '../services/userService';
import { useChatRealtime } from '../hooks/useChatRealtime';
import type { Contact } from '../types/Message';
import type { UserRole } from '../types/UserRole';
import type { ChatLocationState, ChatMessage, ConversationItem } from '../types/chat';
import type { OrderResponse } from '../types/order/order';
import type { Quote } from '../types/Quote';
import { BookingCard } from '../components/chat/BookingCard';

const pageMap: Record<string, string> = {
    home: '/',
    provider: '/provider',
    services: '/services',
    rewards: '/rewards',
    'provider-profile': '/provider-profile',
    'provider-dashboard': '/provider-dashboard',
    'customer-settings': '/customer/account-settings',
    login: '/auth/login',
};

const stripHtml = (text: string): string =>
    text.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();

const friendlyPreview = (msg: ConversationItem['lastMessage']): string => {
    if (!msg) return '';
    const type = msg.type;
    const content = msg.content || '';
    if (type === 'image') return '📷 Hình ảnh';
    if (type === 'quotation') return '📄 Báo giá';
    if (type === 'invoice') return '🧾 Hoá đơn';
    if (type === 'booking') return '🔧 Yêu cầu sửa chữa';
    if (type === 'system') return '🔔 Thông báo hệ thống';
    if (!content) return '';
    const cleaned = stripHtml(content);
    try { JSON.parse(cleaned); return '📄 Dữ liệu'; } catch { /* not json */ }
    return cleaned;
};

const formatMessageTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const formatMessageDate = (value: string): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const day = 86400000;
    if (diff < day) return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    if (diff < 2 * day) return 'Hôm qua';
    if (diff < 7 * day) return date.toLocaleDateString('vi-VN', { weekday: 'long' });
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const toContact = (conversation: ConversationItem): Contact => ({
    id: conversation.id,
    name: conversation.partner?.fullName ?? 'Đối tác',
    lastMessage: friendlyPreview(conversation.lastMessage),
    time: conversation.lastMessage?.sentAt
        ? formatMessageDate(conversation.lastMessage.sentAt)
        : '',
    avatar: conversation.partner?.avatar ?? 'https://placehold.co/48x48',
    isOnline: conversation.partner?.isOnline ?? false,
    unread: conversation.unreadCount > 0,
    unreadCount: conversation.unreadCount,
    partnerType: conversation.partner?.role ?? undefined,
    msgType: conversation.lastMessage?.type ?? undefined,
});

export const ChatPage: React.FC<{ role?: UserRole }> = ({ role = 'customer' }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location.state as ChatLocationState | null;

    const routeConversationId = locationState?.conversationId;
    const routeOrderId = locationState?.orderId;
    const routeTechnicianId = locationState?.technicianId;
    const routeCustomerId = locationState?.customerId;

    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(role === 'customer');
    const [conversations, setConversations] = useState<ConversationItem[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [linkedOrder, setLinkedOrder] = useState<OrderResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
    const [isPriceConfirmOpen, setIsPriceConfirmOpen] = useState(false);
    const [invoiceInfo, setInvoiceInfo] = useState<{ invoiceCode: string; totalPrice: number } | null>(null);
    const messageListRef = useRef<HTMLElement | null>(null);

    const currentUser = getStoredUser();
    const currentUserCode = currentUser?.code ?? '';

    const activeConversation = useMemo(
        () => conversations.find((c) => c.id === activeConversationId) ?? null,
        [conversations, activeConversationId]
    );

    const filteredConversations = useMemo(() => {
        const keyword = searchQuery.trim().toLowerCase();
        if (!keyword) return conversations;
        return conversations.filter((c) => c.partner.fullName.toLowerCase().includes(keyword));
    }, [conversations, searchQuery]);

    const loadLinkedOrder = useCallback(async (orderId?: string | null) => {
        if (!orderId) {
            setLinkedOrder(null);
            return;
        }
        try {
            const order = await orderService.getOrderById(orderId);
            setLinkedOrder(order);
        } catch {
            setLinkedOrder(null);
        }
    }, []);

    const loadMessages = useCallback(async (conversationId: string) => {
        const items = await chatService.listMessages(conversationId);
        setMessages(items);
    }, []);

    const refreshConversations = useCallback(async () => {
        const items = await chatService.listConversations();
        setConversations(items);
        return items;
    }, []);

    const conversationIds = useMemo(
        () => conversations.map((c) => c.id).filter(Boolean),
        [conversations]
    );

    const handleRealtimeMessage = useCallback(
        (payload: Parameters<typeof mapWsMessageToChatMessage>[0]) => {
            const incoming = mapWsMessageToChatMessage(payload);
            const conversationId = incoming.conversationId;
            const isActive = conversationId === activeConversationId;
            const isFromMe = incoming.senderId === currentUserCode;

            if (isActive) {
                setMessages((prev) => {
                    const idx = prev.findIndex((m) => m.id === incoming.id);
                    if (idx >= 0) {
                        const next = [...prev];
                        next[idx] = incoming;
                        return next;
                    }
                    return [...prev, incoming];
                });
            }

            setConversations((prev) =>
                prev.map((c) => {
                    if (c.id !== conversationId) return c;
                    const preview =
                        incoming.type === 'quotation'
                            ? 'Báo giá mới'
                            : incoming.type === 'invoice'
                                ? 'Hoá đơn mới'
                                : incoming.type === 'booking'
                                    ? 'Yêu cầu sửa chữa mới'
                                    : incoming.title
                                        ? `[${incoming.title}] ${incoming.content ?? ''}`
                                        : incoming.content ?? '';
                    return {
                        ...c,
                        lastMessage: {
                            type: incoming.type,
                            content: preview,
                            preview,
                            sentAt: incoming.sentAt,
                        },
                        unreadCount:
                            isActive || isFromMe ? c.unreadCount : c.unreadCount + 1,
                    };
                })
            );
        },
        [activeConversationId, currentUserCode]
    );

    useChatRealtime({
        conversationIds,
        enabled: !isLoading && conversationIds.length > 0,
        onMessage: handleRealtimeMessage,
    });

    const openConversation = useCallback(
        async (conversationId: string, orderId?: string | null) => {
            setActiveConversationId(conversationId);
            setConversations((prev) =>
                prev.map((c) =>
                    c.id === conversationId ? { ...c, unreadCount: 0 } : c
                )
            );
            await loadLinkedOrder(orderId ?? null);
            await loadMessages(conversationId);
        },
        [loadLinkedOrder, loadMessages]
    );

    useEffect(() => {
        setIsSidebarOpen(role === 'customer');
    }, [role]);

    useEffect(() => {
        let cancelled = false;

        const bootstrap = async () => {
            setIsLoading(true);
            setLoadError(null);

            try {
                let items = await refreshConversations();
                if (cancelled) return;

                let technicianId = routeTechnicianId;
                let orderId = routeOrderId;

                if (role === 'customer' && orderId && !technicianId) {
                    const order = await orderService.getOrderById(orderId);
                    if (cancelled) return;
                    technicianId = order.technician?.id;
                    setLinkedOrder(order);
                    if (!technicianId) {
                        setLoadError('Đơn hàng chưa có thợ nhận. Vui lòng đợi thợ nhận đơn trước khi chat.');
                        return;
                    }
                }

                if (routeConversationId) {
                    const found = items.find((c) => c.id === routeConversationId);
                    await openConversation(
                        routeConversationId,
                        found?.orderId ?? orderId ?? null
                    );
                    return;
                }

                if (orderId) {
                    const byOrder = items.find((c) => c.orderId === orderId);
                    if (byOrder) {
                        await openConversation(byOrder.id, byOrder.orderId ?? orderId);
                        return;
                    }

                    if (role === 'technician' || role === 'customer') {
                        try {
                            const order = await orderService.getOrderById(orderId);
                            if (cancelled) return;
                            const partnerId =
                                role === 'technician'
                                    ? order.customer?.id
                                    : order.technician?.id;
                            if (partnerId) {
                                const byPartner = items.find((c) => c.partner?.id === partnerId);
                                if (byPartner) {
                                    await openConversation(
                                        byPartner.id,
                                        byPartner.orderId ?? orderId
                                    );
                                    return;
                                }
                            }
                            if (role === 'customer' && order.technician?.id) {
                                technicianId = order.technician.id;
                            }
                            if (role === 'technician' && order.customer?.id) {
                                const byCustomer = items.find(
                                    (c) => c.partner?.id === order.customer?.id
                                );
                                if (byCustomer) {
                                    await openConversation(byCustomer.id, orderId);
                                    return;
                                }
                            }
                        } catch {
                            // order lookup failed — fall through
                        }
                    }
                }

                if (role === 'technician' && routeCustomerId) {
                    const byCustomer = items.find((c) => c.partner?.id === routeCustomerId);
                    if (byCustomer) {
                        await openConversation(
                            byCustomer.id,
                            byCustomer.orderId ?? orderId ?? null
                        );
                        return;
                    }
                }

                if (role === 'customer' && technicianId) {
                    const existing = items.find((c) => c.partner?.id === technicianId);
                    if (existing && (!orderId || existing.orderId === orderId)) {
                        await openConversation(
                            existing.id,
                            existing.orderId ?? orderId ?? null
                        );
                        return;
                    }

                    const created = await chatService.createConversation({
                        technicianId,
                        orderId,
                    });
                    if (cancelled) return;

                    setConversations((prev) => {
                        const withoutDup = prev.filter((c) => c.id !== created.id);
                        return [created, ...withoutDup];
                    });
                    await openConversation(created.id, created.orderId ?? orderId ?? null);
                    return;
                }

                if (items.length > 0 && !orderId && !routeCustomerId && !technicianId) {
                    await openConversation(items[0].id, items[0].orderId);
                    return;
                }

                if (routeOrderId || routeTechnicianId || routeCustomerId) {
                    setLoadError(
                        'Không tìm thấy hội thoại tương ứng. Hãy thử mở lại từ đơn hàng hoặc hồ sơ thợ.'
                    );
                }
            } catch (error) {
                if (!cancelled) {
                    setLoadError(
                        error instanceof Error
                            ? error.message
                            : 'Không thể tải dữ liệu chat. Vui lòng thử lại.'
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        bootstrap();

        return () => {
            cancelled = true;
        };
    }, [
        openConversation,
        refreshConversations,
        role,
        routeConversationId,
        routeOrderId,
        routeTechnicianId,
        routeCustomerId,
    ]);

    useEffect(() => {
        if (role !== 'customer') return;
        if (linkedOrder?.priceAdjustment?.status?.toLowerCase() === 'pending') {
            setIsPriceConfirmOpen(true);
        }
    }, [linkedOrder, role]);

    useEffect(() => {
        if (!activeConversationId || isLoading) return;

        const frameId = window.requestAnimationFrame(() => {
            const messageList = messageListRef.current;
            if (!messageList) return;
            messageList.scrollTop = messageList.scrollHeight;
        });

        return () => window.cancelAnimationFrame(frameId);
    }, [activeConversationId, isLoading, messages]);

    const handleSelectConversation = async (conversationId: string) => {
        setActiveConversationId(conversationId);
        setConversations((prev) =>
            prev.map((c) =>
                c.id === conversationId ? { ...c, unreadCount: 0 } : c
            )
        );
        const selected = conversations.find((c) => c.id === conversationId);
        await loadLinkedOrder(selected?.orderId);
        await loadMessages(conversationId);
        if (window.innerWidth < 900) setIsSidebarOpen(false);
    };

    const handleSendMessage = async (text: string, title?: string) => {
        if (!activeConversationId) return;
        const sent = await chatService.sendMessage(activeConversationId, text, title);
        setMessages((prev) => {
            if (prev.some((message) => message.id === sent.id)) {
                return prev;
            }
            return [...prev, { ...sent, isRead: true }];
        });
        await refreshConversations();
    };

    const handleCreateQuote = async (quote: Quote) => {
        if (!activeConversationId) return;
        const scheduledAt =
            quote.scheduledAt ??
            (quote.date && quote.time
                ? new Date(`${quote.date}T${quote.time}`).toISOString()
                : new Date().toISOString());

        await chatService.createQuotation(activeConversationId, {
            serviceName: quote.serviceName,
            description: quote.description,
            price: quote.price,
            scheduledAt,
            notes: quote.notes,
        });
        await refreshConversations();
    };

    const handleAcceptQuote = async (quotationId: string) => {
        if (role === 'customer') {
            try {
                const me = await userService.getMe();
                const address = me.data?.address?.trim();
                if (!address) {
                    alert('Bạn cần cập nhật địa chỉ trong tài khoản trước khi chấp nhận báo giá.');
                    navigate('/customer/account-settings');
                    return;
                }
            } catch {
                alert('Không thể kiểm tra địa chỉ tài khoản lúc này. Vui lòng thử lại.');
                return;
            }
        }

        const result = await chatService.acceptQuotation(quotationId);
        if (activeConversationId) {
            await loadMessages(activeConversationId);
        }
        await loadLinkedOrder(result.orderId);
        const items = await refreshConversations();
        const active = items.find((c) => c.orderId === result.orderId);
        if (active) {
            setActiveConversationId(active.id);
        }
    };

    const handleRejectQuote = async (quotationId: string) => {
        await chatService.rejectQuotation(quotationId);
        if (activeConversationId) {
            await loadMessages(activeConversationId);
        }
    };

    const handleSubmitPriceAdjustment = async (payload: AdjustmentSubmitPayload) => {
        if (!linkedOrder?.id) return;
        const updated = await orderService.requestPriceAdjustment(linkedOrder.id, payload);
        setLinkedOrder(updated);
        if (activeConversationId) {
            await loadMessages(activeConversationId);
        }
    };

    const handleApprovePrice = async () => {
        if (!linkedOrder?.id) return;
        const updated = await orderService.approvePriceAdjustment(linkedOrder.id);
        setLinkedOrder(updated);
        setIsPriceConfirmOpen(false);
    };

    const handleRejectPrice = async () => {
        if (!linkedOrder?.id) return;
        const updated = await orderService.rejectPriceAdjustment(
            linkedOrder.id,
            'Khách hàng từ chối điều chỉnh giá'
        );
        setLinkedOrder(updated);
        setIsPriceConfirmOpen(false);
    };

    const handleAcceptOrder = async () => {
        if (!linkedOrder?.id) return;
        try {
            const updated = await orderService.acceptOrder(linkedOrder.id);
            setLinkedOrder(updated);
            if (activeConversationId) {
                await loadMessages(activeConversationId);
            }
            await refreshConversations();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Không thể chấp nhận đơn hàng");
        }
    };

    const handleRejectOrder = async () => {
        if (!linkedOrder?.id) return;
        const reason = prompt("Nhập lý do từ chối yêu cầu:") || "Thợ từ chối yêu cầu sửa chữa";
        try {
            const updated = await orderService.cancelOrder(linkedOrder.id, reason);
            setLinkedOrder(updated);
            if (activeConversationId) {
                await loadMessages(activeConversationId);
            }
            await refreshConversations();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Không thể từ chối đơn hàng");
        }
    };

    const handleCreateInvoice = async () => {
        if (!linkedOrder?.id) return;
        try {
            await orderService.createInvoice(linkedOrder.id);
            setInvoiceInfo(null);
            if (activeConversationId) {
                await loadMessages(activeConversationId);
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Không thể xuất hoá đơn');
        }
    };

    const handlePayViaVNPay = async (orderId: string) => {
        try {
            const checkoutUrl = await orderService.createVnpayCheckout(orderId);
            window.open(checkoutUrl, '_blank');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Không thể tạo thanh toán VNPay');
        }
    };

    const handleConfirmCash = async (orderId: string) => {
        try {
            await orderService.confirmCashPayment(orderId);
            if (linkedOrder?.id === orderId) {
                const updated = await orderService.getOrderById(orderId);
                setLinkedOrder(updated);
            }
            if (activeConversationId) {
                await loadMessages(activeConversationId);
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Xác nhận tiền mặt thất bại');
        }
    };

    const onNavigate = (page: string, data?: unknown) => {
        const path = pageMap[page] || '/';
        navigate(path, { state: data });
    };

    const orderStatus = linkedOrder?.status?.toLowerCase() ?? '';
    const showPriceAdjustAction =
        role === 'technician' && orderStatus === 'in_progress';
    const showInvoiceAction =
        role === 'technician' && orderStatus === 'in_progress';
    const showRepairCard = Boolean(
        linkedOrder &&
            (['new', 'assigned'].includes(orderStatus) ||
                !messages.some((m) => m.type === 'quotation'))
    );

    const pendingAdjustment =
        linkedOrder?.priceAdjustment?.status?.toLowerCase() === 'pending'
            ? linkedOrder.priceAdjustment
            : null;

    const activeContact: Contact = activeConversation
        ? toContact(activeConversation)
        : {
              id: '',
              name: 'Chọn hội thoại',
              lastMessage: '',
              time: '',
              avatar: 'https://placehold.co/48x48',
          };

    return (
        <div
            className={`${styles.container} ${role === 'technician' ? styles.containerEmbedded : ''} ${role === 'customer' ? styles.containerCustomer : ''}`}
        >
            {role === 'customer' && <Header onNavigate={onNavigate} />}

            <div className={`${styles.mainLayout} ${role === 'customer' ? styles.mainLayoutCustomer : ''}`}>
                <aside
                    className={`${styles.sidebar} ${role === 'customer' ? styles.sidebarCustomer : ''} ${!isSidebarOpen ? styles.sidebarClosed : ''}`}
                >
                    <div className={styles.sidebarSearch}>
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Tìm kiếm hội thoại..."
                        />
                    </div>
                    <div className={styles.conversationList}>
                        {filteredConversations.map((conversation) => (
                            <ContactItem
                                key={conversation.id}
                                contact={toContact(conversation)}
                                isActive={conversation.id === activeConversationId}
                                onClick={() => handleSelectConversation(conversation.id)}
                            />
                        ))}
                        {!isLoading && filteredConversations.length === 0 && (
                            <p className={styles.emptySidebar}>Chưa có hội thoại</p>
                        )}
                    </div>
                </aside>

                <main className={styles.chatArea}>
                    <header className={styles.chatHeader}>
                        <div className={styles.chatHeaderIdentity}>
                            {role === 'technician' && (
                                <button
                                    type="button"
                                    className={styles.toggleBtn}
                                    onClick={() => setIsSidebarOpen((prev) => !prev)}
                                >
                                    ☰
                                </button>
                            )}
                            <Avatar src={activeContact.avatar} size={40} isOnline={activeContact.isOnline} />
                            <div className={styles.chatHeaderMeta}>
                                <strong className={styles.chatHeaderName}>{activeContact.name}</strong>
                                {linkedOrder && (
                                    <span className={styles.chatHeaderSubline}>
                                        Đơn {linkedOrder.id}
                                    </span>
                                )}
                            </div>
                        </div>
                    </header>

                    <section ref={messageListRef} className={styles.messageList}>
                        {isLoading && <p className={styles.emptyChat}>Đang tải hội thoại...</p>}

                        {!isLoading && loadError && (
                            <p className={styles.emptyChat}>{loadError}</p>
                        )}

                        {!isLoading && !loadError && !activeConversationId && (
                            <p className={styles.emptyChat}>Chọn hoặc bắt đầu một cuộc trò chuyện</p>
                        )}

                        {!isLoading && activeConversationId && linkedOrder && showRepairCard && (
                            <div className={styles.messageRow}>
                                <div className={styles.messageContent}>
                                    <RepairRequestCard 
                                        order={linkedOrder} 
                                        role={role}
                                        onAccept={handleAcceptOrder}
                                        onReject={handleRejectOrder}
                                    />
                                </div>
                            </div>
                        )}

                        {!isLoading &&
                            messages.map((message) => {
                                const isMe = message.type === 'booking' && role === 'customer' ? true : message.senderId === currentUserCode;
                                const isQuotation = message.type === 'quotation' && message.quotation;
                                const isInvoice = message.type === 'invoice';
                                const isBooking = message.type === 'booking';
                                let invoiceParsed: Record<string, unknown> | null = null;
                                if (isInvoice && message.content) {
                                    try {
                                        invoiceParsed = JSON.parse(message.content);
                                    } catch {
                                        invoiceParsed = null;
                                    }
                                }

                                return (
                                    <div
                                        key={message.id}
                                        className={`${styles.messageRow} ${isMe ? styles.messageRowRight : ''}`}
                                    >
                                        {!isMe && (
                                            <Avatar src={activeContact.avatar} size={32} isOnline={false} />
                                        )}
                                        <div className={styles.messageContent}>
                                            {isBooking && message.booking ? (
                                                <BookingCard
                                                    booking={message.booking}
                                                    role={role}
                                                    onStatusChange={(bookingCode, newStatus) => {
                                                        setMessages(prev => prev.map(msg => {
                                                            if (msg.booking?.code === bookingCode) {
                                                                return {
                                                                    ...msg,
                                                                    booking: { ...msg.booking, status: newStatus }
                                                                };
                                                            }
                                                            return msg;
                                                        }));
                                                    }}
                                                />
                                            ) : isInvoice && invoiceParsed ? (
                                                <InvoiceCard
                                                    invoiceData={invoiceParsed as any}
                                                    orderId={linkedOrder?.id ?? ''}
                                                    isCustomer={role === 'customer'}
                                                    isTechnician={role === 'technician'}
                                                    onPayViaVNPay={
                                                        role === 'customer' ? handlePayViaVNPay : undefined
                                                    }
                                                    onConfirmCash={
                                                        role === 'technician' ? handleConfirmCash : undefined
                                                    }
                                                />
                                            ) : isQuotation ? (
                                                <QuotationCard
                                                    serviceName={message.quotation!.serviceName}
                                                    description={message.quotation!.description}
                                                    price={message.quotation!.price}
                                                    scheduledAt={message.quotation!.scheduledAt}
                                                    status={message.quotation!.status}
                                                    isCustomer={role === 'customer'}
                                                    onAccept={() =>
                                                        handleAcceptQuote(message.quotation!.id)
                                                    }
                                                    onReject={() =>
                                                        handleRejectQuote(message.quotation!.id)
                                                    }
                                                />
                                            ) : (
                                                <div
                                                    className={`${styles.bubble} ${
                                                        isMe ? styles.bubbleRight : styles.bubbleLeft
                                                    } ${message.senderRole === 'ADMIN' ? styles.bubbleAdmin : ''}`}
                                                >
                                                    {message.title && (
                                                        <div className={styles.bubbleTitle} dangerouslySetInnerHTML={{ __html: message.title }} />
                                                    )}
                                                    {message.senderRole === 'ADMIN' && !isMe && (
                                                        <span className={styles.adminTag}>Quản trị viên</span>
                                                    )}
                                                    <div dangerouslySetInnerHTML={{ __html: message.content ?? '' }} />
                                                </div>
                                            )}
                                            <span className={styles.messageTime}>
                                                {formatMessageTime(message.sentAt)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}

                        {pendingAdjustment && role === 'customer' && (
                            <div className={styles.messageRow}>
                                <div className={styles.messageContent}>
                                    <PriceAdjustmentCard
                                        adjustment={pendingAdjustment}
                                        onConfirm={() => setIsPriceConfirmOpen(true)}
                                    />
                                </div>
                            </div>
                        )}
                    </section>

                    {activeConversationId && (
                        <footer className={styles.inputArea}>
                            <MessageInput
                                role={role}
                                onSendMessage={handleSendMessage}
                                onCreateQuote={handleCreateQuote}
                                showQuoteAction={role === 'technician'}
                                showPriceAdjustAction={showPriceAdjustAction}
                                onOpenPriceAdjust={() => setIsAdjustmentOpen(true)}
                                showInvoiceAction={showInvoiceAction}
                                onCreateInvoice={handleCreateInvoice}
                            />
                        </footer>
                    )}
                </main>
            </div>

            {isAdjustmentOpen && linkedOrder && (
                <AdjustmentModal
                    currentPrice={linkedOrder.estimatedPrice ?? linkedOrder.finalPrice ?? 0}
                    onClose={() => setIsAdjustmentOpen(false)}
                    onSubmit={handleSubmitPriceAdjustment}
                />
            )}

            {pendingAdjustment && (
                <UpdatePriceModal
                    open={isPriceConfirmOpen}
                    onClose={() => setIsPriceConfirmOpen(false)}
                    adjustment={pendingAdjustment}
                    onConfirm={handleApprovePrice}
                    onReject={handleRejectPrice}
                />
            )}
        </div>
    );
};
