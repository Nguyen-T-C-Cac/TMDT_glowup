import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    CheckCircle2,
    Clock3,
    Image as ImageIcon,
    MapPin,
    Play,
    Send,
    ShieldAlert,
    Wrench,
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import styles from './ChatPage.module.css';
import { ContactItem } from '../components/chat/ContactItem';
import { QuotationCard } from '../components/chat/QuotationCard';
import { MessageInput } from '../components/chat/MessageInput';
import { SearchBar } from '../components/chat/SearchBar';
import { Avatar } from '../components/common/Avatar';
import type { Contact } from '../types/Message';
import type { UserRole } from '../types/UserRole.ts';
import { getInfo } from '../services/getInfo';
import {
    acceptQuote,
    createQuote,
    listConversations,
    listMessages,
    rejectQuote,
    sendTextMessage,
    type ChatMessage,
    type ConversationListItem,
    type CreateQuotePayload,
} from '../services/chatService';

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

const formatTime = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const readCachedUserCode = (): string | null => {
    try {
        const raw = localStorage.getItem('user');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.user?.code ?? null;
    } catch {
        return null;
    }
};

export const ChatPage: React.FC<{ role?: UserRole }> = ({ role = 'customer' }) => {
    const nav = useNavigate();
    const location = useLocation();

    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(role === 'customer');

    // When arriving from "Nhắn tin với thợ", open that conversation directly.
    const openConversationId = (location.state as { openConversationId?: string })?.openConversationId ?? null;

    const [myCode, setMyCode] = useState<string | null>(readCachedUserCode());
    const [conversations, setConversations] = useState<ConversationListItem[]>([]);
    const [activeId, setActiveId] = useState<string | null>(openConversationId);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loadingConvos, setLoadingConvos] = useState(true);
    const [actionQuoteId, setActionQuoteId] = useState<string | null>(null);
    const [banner, setBanner] = useState<string | null>(null);
    /** quoteId -> orderId, captured from accept responses to show the order code. */
    const [acceptedOrders, setAcceptedOrders] = useState<Record<string, string>>({});

    const messageListRef = useRef<HTMLDivElement | null>(null);

    const isTechnician = role === 'technician';
    const isCustomer = role === 'customer';

    // ---- existing booking → chat hand-off (repair request prefill) ----------
    const repairPrefill = (location.state as {
        prefillRepairRequest?: {
            provider: { name: string; avatar: string; rating: number };
            request: {
                serviceLabel: string;
                deviceType: string;
                brand: string;
                description: string;
                urgency: string;
                timeSlot: string;
                date?: string;
                address: string;
                phone: string;
                attachments: Array<{ name: string; type: string; previewUrl: string }>;
            };
        };
    })?.prefillRepairRequest;

    const urgencyMap: Record<string, string> = {
        normal: 'Không gấp',
        today: 'Cần hôm nay',
        urgent: 'Khẩn cấp',
    };
    const [requestTimestamp] = useState(() =>
        new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    );

    // -------------------------------------------------------------------------
    // Load current user code (for message alignment) — best effort.
    // -------------------------------------------------------------------------
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const info = await getInfo();
                if (!cancelled && info?.code) setMyCode(info.code);
            } catch {
                /* fall back to cached code */
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // -------------------------------------------------------------------------
    // Load conversation list.
    // -------------------------------------------------------------------------
    const loadConversations = useCallback(async () => {
        try {
            const items = await listConversations();
            setConversations(items);
            setActiveId((prev) => prev ?? items[0]?.id ?? null);
        } catch (err) {
            setBanner(err instanceof Error ? err.message : 'Không tải được danh sách hội thoại');
        } finally {
            setLoadingConvos(false);
        }
    }, []);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    // -------------------------------------------------------------------------
    // Load messages for the active conversation + poll for updates.
    // -------------------------------------------------------------------------
    const loadMessages = useCallback(async (conversationId: string) => {
        try {
            const items = await listMessages(conversationId);
            setMessages(items);
        } catch (err) {
            setBanner(err instanceof Error ? err.message : 'Không tải được tin nhắn');
        }
    }, []);

    useEffect(() => {
        if (!activeId) {
            setMessages([]);
            return;
        }
        loadMessages(activeId);
        const timer = window.setInterval(() => {
            loadMessages(activeId);
            loadConversations();
        }, 4000);
        return () => window.clearInterval(timer);
    }, [activeId, loadMessages, loadConversations]);

    // Auto-scroll to the newest message.
    useEffect(() => {
        const el = messageListRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [messages.length, activeId]);

    useEffect(() => {
        setIsSidebarOpen(role === 'customer');
    }, [role]);

    // -------------------------------------------------------------------------
    // Actions
    // -------------------------------------------------------------------------
    const handleSendMessage = async (text: string) => {
        if (!activeId) return;
        try {
            await sendTextMessage(activeId, text);
            await loadMessages(activeId);
        } catch (err) {
            setBanner(err instanceof Error ? err.message : 'Gửi tin nhắn thất bại');
        }
    };

    const handleCreateQuote = async (payload: CreateQuotePayload) => {
        if (!activeId) throw new Error('Chưa chọn cuộc trò chuyện');
        await createQuote(activeId, payload); // throws → modal shows the error
        await loadMessages(activeId);
    };

    const handleAccept = async (quoteId: string) => {
        if (actionQuoteId) return;
        setActionQuoteId(quoteId);
        try {
            const result = await acceptQuote(quoteId);
            if (result.orderId) {
                setAcceptedOrders((prev) => ({ ...prev, [quoteId]: result.orderId }));
            }
            if (activeId) await loadMessages(activeId);
        } catch (err) {
            setBanner(err instanceof Error ? err.message : 'Chấp nhận báo giá thất bại');
        } finally {
            setActionQuoteId(null);
        }
    };

    const handleReject = async (quoteId: string) => {
        if (actionQuoteId) return;
        setActionQuoteId(quoteId);
        try {
            await rejectQuote(quoteId);
            if (activeId) await loadMessages(activeId);
        } catch (err) {
            setBanner(err instanceof Error ? err.message : 'Từ chối báo giá thất bại');
        } finally {
            setActionQuoteId(null);
        }
    };

    const onNavigate = (page: string, data?: unknown) => {
        nav(pageMap[page] || '/', { state: data });
    };

    // -------------------------------------------------------------------------
    // Derived view data
    // -------------------------------------------------------------------------
    const toContact = (c: ConversationListItem): Contact => ({
        id: c.id,
        name: c.partner?.fullName || 'Người dùng',
        lastMessage: c.lastMessage?.content || 'Bắt đầu trò chuyện',
        time: formatTime(c.lastMessage?.sentAt || c.updatedAt),
        avatar: c.partner?.avatar || 'https://placehold.co/48x48',
        isOnline: c.partner?.isOnline,
        unread: (c.unreadCount ?? 0) > 0,
    });

    const visibleConversations = conversations.filter((c) =>
        (c.partner?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    const activeConversation = conversations.find((c) => c.id === activeId) || null;
    const partner = activeConversation?.partner;

    const isMine = (m: ChatMessage) => !!myCode && m.senderId === myCode;

    return (
        <div className={styles.container}>
            {role === 'customer' && <Header onNavigate={onNavigate} />}

            <div className={styles.mainLayout}>
                {/* SIDEBAR */}
                <aside className={`${styles.sidebar} ${!isSidebarOpen ? styles.sidebarClosed : ''}`}>
                    <div style={{ padding: '16px' }}>
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Tìm kiếm hội thoại..."
                        />
                    </div>
                    <div style={{ padding: '0 8px' }}>
                        {loadingConvos && (
                            <p style={{ padding: 16, color: '#64748B', fontSize: 14 }}>Đang tải…</p>
                        )}
                        {!loadingConvos && visibleConversations.length === 0 && (
                            <p style={{ padding: 16, color: '#64748B', fontSize: 14 }}>
                                Chưa có cuộc trò chuyện nào.
                            </p>
                        )}
                        {visibleConversations.map((c) => (
                            <ContactItem
                                key={c.id}
                                contact={toContact(c)}
                                isActive={c.id === activeId}
                                onClick={() => setActiveId(c.id)}
                            />
                        ))}
                    </div>
                </aside>

                {/* CHAT AREA */}
                <main className={styles.chatArea}>
                    {/* HEADER */}
                    <header className={styles.chatHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {role === 'technician' && (
                                <button
                                    className={styles.toggleBtn}
                                    onClick={() => setIsSidebarOpen((p) => !p)}
                                >
                                    ☰
                                </button>
                            )}
                            <Avatar
                                src={partner?.avatar || 'https://placehold.co/48x48'}
                                size={40}
                                isOnline={partner?.isOnline}
                            />
                            <div>
                                <strong>{partner?.fullName || 'Chọn một cuộc trò chuyện'}</strong>
                                {partner?.isOnline && (
                                    <span style={{ fontSize: 12, color: '#22C55E', display: 'block' }}>
                                        ● Đang hoạt động
                                    </span>
                                )}
                            </div>
                        </div>
                    </header>

                    {banner && (
                        <div
                            style={{
                                margin: '8px 16px',
                                padding: '8px 12px',
                                borderRadius: 8,
                                background: '#FEF2F2',
                                color: '#DC2626',
                                fontSize: 13,
                            }}
                            onClick={() => setBanner(null)}
                        >
                            {banner}
                        </div>
                    )}

                    {/* MESSAGES */}
                    <section className={styles.messageList} ref={messageListRef}>
                        {/* Booking → chat hand-off summary (customer flow) */}
                        {repairPrefill && (
                            <div className={`${styles.messageRow} ${styles.messageRowRight}`}>
                                <div className={`${styles.messageContent} ${styles.repairMessageContent}`}>
                                    <div className={styles.repairSummaryCard}>
                                        <div className={styles.repairSummaryHeader}>
                                            <div className={styles.repairSummaryTitleGroup}>
                                                <span className={styles.repairSummaryIconWrap}>
                                                    <Wrench size={14} />
                                                </span>
                                                <h4>Yêu cầu sửa chữa đã gửi</h4>
                                            </div>
                                            <span className={`${styles.repairStatusBadge} ${styles.sent}`}>
                                                <CheckCircle2 size={13} /> Đang chờ phản hồi
                                            </span>
                                        </div>
                                        <div className={styles.repairInfoRows}>
                                            <div className={styles.repairInfoRow}>
                                                <span className={styles.repairInfoIcon}><Wrench size={15} /></span>
                                                <div>
                                                    <p className={styles.repairInfoLabel}>Thiết bị</p>
                                                    <p className={styles.repairInfoValue}>
                                                        {repairPrefill.request.serviceLabel} • {repairPrefill.request.deviceType} • {repairPrefill.request.brand}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={styles.repairInfoRow}>
                                                <span className={styles.repairInfoIcon}><AlertTriangle size={15} /></span>
                                                <div>
                                                    <p className={styles.repairInfoLabel}>Sự cố</p>
                                                    <p className={styles.repairInfoValue}>{repairPrefill.request.description || 'Chưa cập nhật'}</p>
                                                </div>
                                            </div>
                                            <div className={styles.repairInfoRow}>
                                                <span className={styles.repairInfoIcon}><MapPin size={15} /></span>
                                                <div>
                                                    <p className={styles.repairInfoLabel}>Địa chỉ</p>
                                                    <p className={styles.repairInfoValue}>{repairPrefill.request.address}</p>
                                                </div>
                                            </div>
                                            <div className={styles.repairInfoRow}>
                                                <span className={styles.repairInfoIcon}><Clock3 size={15} /></span>
                                                <div>
                                                    <p className={styles.repairInfoLabel}>Thời gian</p>
                                                    <p className={styles.repairInfoValue}>
                                                        {repairPrefill.request.timeSlot}{repairPrefill.request.date ? ` - ${repairPrefill.request.date}` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={styles.repairInfoRow}>
                                                <span className={styles.repairInfoIcon}><ShieldAlert size={15} /></span>
                                                <div>
                                                    <p className={styles.repairInfoLabel}>Mức độ</p>
                                                    <p className={styles.repairInfoValue}>{urgencyMap[repairPrefill.request.urgency] || 'Không gấp'}</p>
                                                </div>
                                            </div>
                                            <div className={styles.repairInfoRow}>
                                                <span className={styles.repairInfoIcon}><ImageIcon size={15} /></span>
                                                <div>
                                                    <p className={styles.repairInfoLabel}>Media</p>
                                                    <p className={styles.repairInfoValue}>
                                                        {repairPrefill.request.attachments.length > 0
                                                            ? `${repairPrefill.request.attachments.length} hình ảnh/video đính kèm`
                                                            : 'Không có tệp đính kèm'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {repairPrefill.request.attachments.length > 0 && (
                                            <div className={styles.repairMediaGrid}>
                                                {repairPrefill.request.attachments.slice(0, 3).map((asset, index) => (
                                                    <div key={`${asset.name}-${index}`} className={styles.repairMediaItem}>
                                                        {asset.type.startsWith('video/') ? (
                                                            <>
                                                                <video src={asset.previewUrl} muted playsInline />
                                                                <span className={styles.repairMediaPlay}><Play size={14} /></span>
                                                            </>
                                                        ) : (
                                                            <img src={asset.previewUrl} alt={asset.name} />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className={styles.repairSummaryFooter}>
                                            <span>
                                                <Send size={13} /> Thông tin đã được gửi đến thợ để tư vấn và báo giá
                                            </span>
                                            <small>{requestTimestamp}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeId && messages.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: 14, marginTop: 24 }}>
                                Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện
                                {isTechnician ? ' hoặc gửi báo giá cho khách.' : '.'}
                            </p>
                        )}

                        {messages.map((m) => {
                            const mine = isMine(m);

                            if (m.type === 'quotation' && m.quotation) {
                                const q = m.quotation;
                                return (
                                    <div
                                        key={m.id}
                                        className={`${styles.messageRow} ${mine ? styles.messageRowRight : ''}`}
                                    >
                                        {!mine && <Avatar src={partner?.avatar || 'https://placehold.co/48x48'} size={32} />}
                                        <div className={styles.messageContent}>
                                            <QuotationCard
                                                serviceName={q.serviceName}
                                                description={q.description}
                                                price={q.price}
                                                scheduledAt={q.scheduledAt}
                                                status={q.status}
                                                orderId={acceptedOrders[q.id]}
                                                showActions={isCustomer}
                                                loading={actionQuoteId === q.id}
                                                onAccept={() => handleAccept(q.id)}
                                                onReject={() => handleReject(q.id)}
                                            />
                                        </div>
                                    </div>
                                );
                            }

                            // text / system / image
                            return (
                                <div
                                    key={m.id}
                                    className={`${styles.messageRow} ${mine ? styles.messageRowRight : ''}`}
                                >
                                    {!mine && <Avatar src={partner?.avatar || 'https://placehold.co/48x48'} size={32} />}
                                    <div className={styles.messageContent}>
                                        <div
                                            className={`${styles.bubble} ${mine ? styles.bubbleRight : styles.bubbleLeft}`}
                                        >
                                            {m.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </section>

                    {/* INPUT */}
                    <footer className={styles.inputArea}>
                        <MessageInput
                            onSendMessage={handleSendMessage}
                            canQuote={isTechnician}
                            onCreateQuote={handleCreateQuote}
                            disabled={!activeId}
                        />
                    </footer>
                </main>
            </div>
        </div>
    );
};
