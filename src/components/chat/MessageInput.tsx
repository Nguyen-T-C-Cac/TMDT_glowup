import React, { useState } from 'react';
import { FileText, Image, Smile, SendHorizontal } from 'lucide-react';
import styles from './Chat.module.css';
import QuoteCreateModal from '../modal/QuoteCreateModal';
import type { CreateQuotePayload } from '../../services/chatService';

import { ChatInputWrapper } from './ChatInputWrapper';


interface MessageInputProps {
    onSendMessage?: (message: string) => void;
    /** When true, shows the "Tạo báo giá" action (technician only). */
    canQuote?: boolean;
    /** Posts the composed quote to the backend. */
    onCreateQuote?: (payload: CreateQuotePayload) => Promise<void> | void;
    disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
    onSendMessage,
    canQuote = false,
    onCreateQuote,
    disabled = false,
}) => {
    const [message, setMessage] = useState('');
    const [open, setOpen] = useState(false);

    const handleSend = () => {
        if (message.trim() && onSendMessage) {
            onSendMessage(message);
            setMessage('');
        }
    };

    return (
        <>
            <ChatInputWrapper
                leftIcons={
                    <>
                        {canQuote && (
                            <button
                                title="Tạo báo giá gửi cho khách"
                                onClick={() => setOpen(true)}
                                disabled={disabled}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '8px 12px',
                                    borderRadius: 8,
                                    border: 'none',
                                    background: disabled ? '#94A3B8' : '#1E3A8A',
                                    color: '#fff',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: disabled ? 'not-allowed' : 'pointer',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <FileText size={16} color="#fff" />
                                Tạo báo giá
                            </button>
                        )}

                        <button className={styles.iconButton} title="Gửi hình ảnh">
                            <Image size={20} color="#4A5E8B" />
                        </button>

                        <button className={styles.iconButton} title="Biểu cảm">
                            <Smile size={20} color="#4A5E8B" />
                        </button>
                    </>
                }
                rightElement={
                    <button
                        className={styles.sendButton}
                        onClick={handleSend}
                        disabled={disabled || !message.trim()}
                    >
                        <SendHorizontal size={20} color="white" />
                    </button>
                }
            >
                <textarea
                    className={styles.textInput}
                    placeholder="Nhập tin nhắn..."
                    rows={1}
                    value={message}
                    disabled={disabled}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />
            </ChatInputWrapper>

            {/* MODAL (tách ra ngoài) — chỉ thợ mới tạo báo giá */}
            {canQuote && (
                <QuoteCreateModal
                    open={open}
                    onClose={() => setOpen(false)}
                    onSubmit={onCreateQuote}
                />
            )}
        </>
    );
};
