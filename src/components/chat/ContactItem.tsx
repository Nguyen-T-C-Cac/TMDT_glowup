import React from 'react';
import styles from './Chat.module.css';
import { Avatar } from '../common/Avatar';
import type { Contact } from '../../types/Message.ts';

const roleBadge = (type?: string): { badge: string; label: string; classSuffix: string } | null => {
  if (type === 'ADMIN') return { badge: 'AD', label: 'Quản trị viên', classSuffix: 'admin' };
  if (type === 'CUSTOMER') return { badge: 'KH', label: 'Khách hàng', classSuffix: 'customer' };
  if (type === 'TECHNICIAN') return { badge: 'TV', label: 'Thợ', classSuffix: 'technician' };
  return null;
};

export const ContactItem: React.FC<{
  contact: Contact;
  isActive?: boolean;
  onClick?: () => void;
}> = ({ contact, isActive, onClick }) => {
  const roleInfo = roleBadge(contact.partnerType);

  return (
    <div
      className={`${styles.contactItem} ${isActive ? styles.contactItemActive : ''} ${roleInfo ? styles[`contactItem${roleInfo.classSuffix.charAt(0).toUpperCase() + roleInfo.classSuffix.slice(1)}`] || '' : ''}`}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={styles.contactAvatarWrapper}>
        <Avatar
          src={contact.avatar}
          alt={contact.name}
          size={48}
          isOnline={contact.isOnline}
        />
        {roleInfo && <span className={styles[`${roleInfo.classSuffix}Badge`] || ''}>{roleInfo.badge}</span>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className={styles.contactName}>
            {contact.name}
            {roleInfo && <span className={styles[`${roleInfo.classSuffix}Label`] || ''}>{roleInfo.label}</span>}
          </span>
          <span className={styles.contactTime}>{contact.time}</span>
        </div>
        <div className={styles.lastMessageSnippet}>{contact.lastMessage}</div>
      </div>
    </div>
  );
};
