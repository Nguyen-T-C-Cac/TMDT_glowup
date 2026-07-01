import React from 'react';
import styles from './Chat.module.css';
import { Avatar } from '../common/Avatar';
import type { Contact } from '../../types/Message';

const roleConfig: Record<string, { label: string; icon: string }> = {
    ADMIN: { label: 'Quản trị viên', icon: 'AD' },
    CUSTOMER: { label: 'Khách hàng', icon: 'KH' },
    TECHNICIAN: { label: 'Thợ', icon: 'TV' },
};

export const ContactItem: React.FC<{
    contact: Contact;
    isActive?: boolean;
    onClick?: () => void;
    onDelete?: () => void;
}> = ({ contact, isActive, onClick, onDelete }) => {
    const role = contact.partnerType ? roleConfig[contact.partnerType] : null;
    const hasUnread = (contact.unreadCount ?? 0) > 0;

    return (
        <div
            className={`${styles.contactItem} ${isActive ? styles.contactItemActive : ''} ${hasUnread ? styles.contactItemUnread : ''}`}
            onClick={onClick}
            onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {onDelete && (
                <button
                    type="button"
                    className={styles.contactDeleteBtn}
                    title="Xóa hộp thoại"
                    aria-label="Xóa hộp thoại"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                >
                    ×
                </button>
            )}
            <div className={styles.contactAvatarWrapper}>
                <Avatar
                    src={contact.avatar}
                    alt={contact.name}
                    size={48}
                    isOnline={contact.isOnline}
                />
                {role && (
                    <span className={`${styles.roleBadge} ${styles[`roleBadge${contact.partnerType}`] || ''}`}>
                        {role.icon}
                    </span>
                )}
            </div>

            <div className={styles.contactInfo}>
                <div className={styles.contactTopRow}>
                    <span className={`${styles.contactName} ${hasUnread ? styles.contactNameUnread : ''}`}>
                        {contact.name}
                    </span>
                    <span className={styles.contactTime}>{contact.time}</span>
                </div>

                <div className={styles.contactBottomRow}>
                    <span className={`${styles.contactPreview} ${hasUnread ? styles.contactPreviewUnread : ''}`}>
                        {contact.lastMessage}
                    </span>
                    <div className={styles.contactRight}>
                        {role && (
                            <span className={`${styles.rolePill} ${styles[`rolePill${contact.partnerType}`] || ''}`}>
                                {role.label}
                            </span>
                        )}
                        {hasUnread && (
                            <span className={styles.unreadBadge}>
                                {contact.unreadCount}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
