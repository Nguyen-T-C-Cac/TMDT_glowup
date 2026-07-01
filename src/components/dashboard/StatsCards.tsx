import React, { useEffect, useState } from 'react';
import { orderService } from '../../services/order/orderService';
import { getTechnicianWalletSummary } from '../../services/walletService';
import './StatsCards.css';

interface StatsCardsProps {
  newOrders?: number;
  completedToday?: number;
}

interface StatCard {
  id: string;
  icon: React.ReactNode;
  value: string;
  label: string;
  badge?: string;
  badgeColor?: string;
  highlight?: boolean;
}

const isSameDay = (iso?: string) => {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
};

const formatMoney = (value: number) => `${value.toLocaleString('vi-VN')} đ`;

export const StatsCards: React.FC<StatsCardsProps> = ({ newOrders, completedToday }) => {
  const [newJobsCount, setNewJobsCount] = useState(0);
  const [completedTodayCount, setCompletedTodayCount] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const hasDashboardCounts = typeof newOrders === 'number' || typeof completedToday === 'number';

        const [wallet, assignedPage, completedPage] = hasDashboardCounts
          ? await Promise.all([
              getTechnicianWalletSummary(),
              Promise.resolve({ items: [] as Array<unknown> }),
              Promise.resolve({ items: [] as Array<unknown> }),
            ])
          : await Promise.all([
              getTechnicianWalletSummary(),
              orderService.listOrders({ status: 'assigned', limit: 50 }),
              orderService.listOrders({ status: 'completed', limit: 50 }),
            ]);

        if (!mounted) return;

        setNewJobsCount(hasDashboardCounts ? (newOrders ?? 0) : assignedPage.items.length);

        if (hasDashboardCounts) {
          setCompletedTodayCount(completedToday ?? 0);
        } else {
          const today = completedPage.items.filter((o: { completedAt?: string }) => isSameDay(o.completedAt));
          setCompletedTodayCount(today.length);
        }

        const actualAvailableBalance = wallet.creditBalance + wallet.personalBalance;
        setAvailableBalance(actualAvailableBalance);
      } catch {
        if (mounted) {
          setNewJobsCount(0);
          setCompletedTodayCount(0);
          setAvailableBalance(0);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    setNewJobsCount(newOrders ?? 0);
    setCompletedTodayCount(completedToday ?? 0);
    void load();

    return () => {
      mounted = false;
    };
  }, [completedToday, newOrders]);

  const statsData: StatCard[] = [
    {
      id: 'new-jobs',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
      ),
      value: isLoading ? '--'  : newJobsCount === 0
      ? '0'
      : String(newJobsCount).padStart(2, '0'),
      label: 'Đơn mới được giao',
      badge: newJobsCount > 0 ? `${newJobsCount} đơn chờ xử lý` : undefined,
      badgeColor: '#10b981',
    },
    {
      id: 'completed',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      ),
      value:
      isLoading ? '--': completedTodayCount === 0 ? '0'
          : String(completedTodayCount).padStart(2, '0'),
      label: 'Đơn đã hoàn thành',
      badge: 'Hôm nay',
      badgeColor: '#6366f1',
    },
    {
      id: 'earnings',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>
      ),
      value: isLoading ? '--' : formatMoney(availableBalance),
      label: 'Tổng tiền thực có',
      badge: '2 ví thợ',
      highlight: true,
    },
  ];

  return (
    <div className="stats-cards-row">
      {statsData.map((stat) => (
        <div key={stat.id} className={`stat-card-item ${stat.highlight ? 'stat-card-highlight' : ''}`}>
          <div className="stat-card-top">
            <div className={`stat-card-icon ${stat.highlight ? 'icon-highlight' : ''}`}>{stat.icon}</div>
            {stat.badge && (
              <span
                className="stat-card-badge"
                style={stat.badgeColor ? { backgroundColor: `${stat.badgeColor}18`, color: stat.badgeColor } : {}}
              >
                {stat.badge}
              </span>
            )}
          </div>
          <div className="stat-card-bottom">
            <h3 className={`stat-card-value ${stat.highlight ? 'value-highlight' : ''}`}>{stat.value}</h3>
            <p className={`stat-card-label ${stat.highlight ? 'label-highlight' : ''}`}>{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};