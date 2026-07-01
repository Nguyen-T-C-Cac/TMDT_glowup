import React, { useEffect, useState } from 'react';
import { orderService } from '../../services/order/orderService';
import { getTechnicianWalletSummary } from '../../services/walletService';
import './StatsCards.css';

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

export const StatsCards: React.FC = () => {
  const [newJobsCount, setNewJobsCount] = useState(0);
  const [completedTodayCount, setCompletedTodayCount] = useState(0);
  const [weeklyEarnings, setWeeklyEarnings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [assignedPage, completedPage, wallet] = await Promise.all([
          orderService.listOrders({ status: 'assigned', limit: 50 }),
          orderService.listOrders({ status: 'completed', limit: 50 }),
          getTechnicianWalletSummary(),
        ]);

        if (!mounted) return;

        setNewJobsCount(assignedPage.items.length);

        const today = completedPage.items.filter((o) => isSameDay(o.completedAt));
        setCompletedTodayCount(today.length);

        // Tổng thu nhập trong 7 ngày gần nhất từ các đơn đã hoàn thành
        const sevenDaysAgo = Date.now() - 7 * 86400000;
        const weekly = completedPage.items
          .filter((o) => o.completedAt && new Date(o.completedAt).getTime() >= sevenDaysAgo)
          .reduce((sum, o) => sum + (o.finalPrice ?? o.estimatedPrice ?? 0), 0);
        setWeeklyEarnings(weekly || wallet.totalEarned);
      } catch {
        if (mounted) {
          setNewJobsCount(0);
          setCompletedTodayCount(0);
          setWeeklyEarnings(0);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

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
      value: isLoading ? '--' : formatMoney(weeklyEarnings),
      label: 'Tổng thu nhập',
      badge: 'Tuần này',
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