import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { ContactItem } from '../components/chat/ContactItem';
import { Avatar } from '../components/common/Avatar';
import { SearchBar } from '../components/chat/SearchBar';
import { chatService } from '../services/chat/chatService';
import { mapWsMessageToChatMessage } from '../services/chat/chatRealtimeClient';
import { getStoredUser } from '../services/auth';
import { useChatRealtime } from '../hooks/useChatRealtime';
import type { Contact } from '../types/Message';
import type { ChatMessage, ConversationItem } from '../types/chat';
import { SendHorizontal } from 'lucide-react';
import chatStyles from '../components/chat/Chat.module.css';
import './AdminChatPage.css';

const formatMessageTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const toContact = (conversation: ConversationItem): Contact => ({
  id: conversation.id,
  name: conversation.partner?.fullName ?? 'Đối tác',
  lastMessage:
    conversation.lastMessage?.preview ??
    conversation.lastMessage?.content ??
    '',
  time: conversation.lastMessage?.sentAt
    ? formatMessageTime(conversation.lastMessage.sentAt)
    : '',
  avatar: conversation.partner?.avatar ?? 'https://placehold.co/48x48',
  isOnline: conversation.partner?.isOnline ?? false,
  unread: conversation.unreadCount > 0,
  partnerType: conversation.partner?.role ?? undefined,
});

export default function AdminChatPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
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
    async (conversationId: string) => {
      setActiveConversationId(conversationId);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c
        )
      );
      await loadMessages(conversationId);
    },
    [loadMessages]
  );

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      setIsLoading(true);
      try {
        const items = await refreshConversations();
        if (cancelled) return;
        if (items.length > 0) {
          await openConversation(items[0].id);
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    bootstrap();
    return () => { cancelled = true; };
  }, [openConversation, refreshConversations]);

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
    await loadMessages(conversationId);
  };

  const handleSendMessage = async () => {
    const text = messageText.trim();
    if (!text || !activeConversationId) return;
    const sent = await chatService.sendMessage(activeConversationId, text);
    setMessages((prev) => {
      if (prev.some((m) => m.id === sent.id)) return prev;
      return [...prev, { ...sent, isRead: true }];
    });
    setMessageText('');
    await refreshConversations();
  };

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
    <div className="admin-chat-shell">
      <AdminSidebar activeItem="chat" />
      <div className="admin-chat-main">
        <AdminHeader />
        <div className="admin-chat-layout">
          <aside className="admin-chat-sidebar">
            <div className="admin-chat-search">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Tìm kiếm hội thoại..."
              />
            </div>
            <div className="admin-chat-conversations">
              {filteredConversations.map((conversation) => (
                <ContactItem
                  key={conversation.id}
                  contact={toContact(conversation)}
                  isActive={conversation.id === activeConversationId}
                  onClick={() => handleSelectConversation(conversation.id)}
                />
              ))}
              {!isLoading && filteredConversations.length === 0 && (
                <p className="admin-chat-empty">Chưa có hội thoại</p>
              )}
            </div>
          </aside>

          <section className="admin-chat-area">
            <header className="admin-chat-header">
              <div className="admin-chat-header-identity">
                <Avatar src={activeContact.avatar} size={40} isOnline={activeContact.isOnline} />
                <strong className="admin-chat-header-name">{activeContact.name}</strong>
              </div>
            </header>

            <section ref={messageListRef} className="admin-chat-messages">
              {isLoading && <p className="admin-chat-empty">Đang tải hội thoại...</p>}

              {!isLoading && !activeConversationId && (
                <p className="admin-chat-empty">Chọn một hội thoại để bắt đầu</p>
              )}

              {!isLoading &&
                messages.map((message) => {
                  const isMe = message.senderId === currentUserCode;

                  return (
                    <div
                      key={message.id}
                      className={`admin-chat-message-row ${isMe ? 'admin-chat-message-row--right' : ''}`}
                    >
                      {!isMe && (
                        <Avatar src={activeContact.avatar} size={32} isOnline={false} />
                      )}
                      <div className="admin-chat-message-content">
                        <div
                          className={`admin-chat-bubble ${
                            isMe ? 'admin-chat-bubble--right' : 'admin-chat-bubble--left'
                          } ${message.senderRole === 'ADMIN' ? 'admin-chat-bubble--admin' : ''}`}
                        >
                          {message.title && (
                            <div className="admin-chat-bubble-title" dangerouslySetInnerHTML={{ __html: message.title }} />
                          )}
                          {message.senderRole === 'ADMIN' && !isMe && (
                            <span className="admin-chat-admin-tag">Quản trị viên</span>
                          )}
                          {message.senderRole && message.senderRole !== 'ADMIN' && !isMe && (
                            <span className={`admin-chat-role-tag admin-chat-role-tag--${message.senderRole.toLowerCase()}`}>
                              {message.senderRole === 'CUSTOMER' ? 'Khách hàng' : 'Thợ'}
                            </span>
                          )}
                          <div className="admin-chat-bubble-body" dangerouslySetInnerHTML={{ __html: message.content ?? '' }} />
                        </div>
                        <span className="admin-chat-message-time">
                          {formatMessageTime(message.sentAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </section>

            {activeConversationId && (
              <footer className="admin-chat-input-area">
                <div className={chatStyles.inputContainer}>
                  <div className={chatStyles.textAreaWrapper}>
                    <textarea
                      className={chatStyles.textInput}
                      placeholder="Nhập tin nhắn..."
                      rows={1}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className={chatStyles.sendButton}
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                  >
                    <SendHorizontal size={20} color="white" />
                  </button>
                </div>
              </footer>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
