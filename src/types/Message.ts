export interface Contact {
    id: string;
    name: string;
    lastMessage: string;
    time: string;
    avatar: string;
    isOnline?: boolean;
    unread?: boolean;
    unreadCount?: number;
    partnerType?: string;
    /** Original message type for preview icon: 'text' | 'image' | 'quotation' | 'booking' | 'invoice' | 'system' */
    msgType?: string;
}

export interface Message {
    id: string;
    senderId: string;
    content: string;
    time: string;
    type: 'text' | 'quotation';
    isMe: boolean;
}
