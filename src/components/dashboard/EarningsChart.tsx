import React, { useEffect, useMemo, useState } from 'react';
import { orderService } from '../../services/order/orderService';
import type { OrderResponse } from '../../types/order/order';
import './EarningsChart.css';

const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const toIsoDate = (d: Date) => d.toISOString().slice(0, 10);

const buildDailySeries = (orders: OrderResponse[], days: number) => {
  const today = new Date();
  const buckets = new Map<string, number>();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.set(toIsoDate(d), 0);
  }

  orders.forEach((o) => {
    if (!o.completedAt) return;
    const key = o.completedAt.slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + (o.finalPrice ?? o.estimatedPrice ?? 0));
    }
  });

  return [...buckets.entries()].map(([dateKey, value]) => {
    const d = new Date(dateKey + 'T00:00:00');
    const isToday = toIsoDate(d) === toIsoDate(today);
    return {
      day: isToday ? 'Hôm nay' : DAY_LABELS[d.getDay()],
      value: Math.round(value / 1000), // hiển thị theo nghìn đồng giống bản gốc
      isToday,
    };
  });
};

const buildWeeklySeries = (orders: OrderResponse[]) => {
  const today = new Date();
  const buckets = [0, 0, 0, 0]; // 4 tuần gần nhất

  orders.forEach((o) => {
    if (!o.completedAt) return;
    const completed = new Date(o.completedAt);
    const diffDays = Math.floor((today.getTime() - completed.getTime()) / 86400000);
    const weekIndex = 3 - Math.floor(diffDays / 7);
    if (weekIndex >= 0 && weekIndex <= 3) {
      buckets[weekIndex] += o.finalPrice ?? o.estimatedPrice ?? 0;
    }
  });

  return buckets.map((value, i) => ({
    day: `Tuần ${i + 1}`,
    value: Math.round(value / 1000),
    isToday: i === 3,
  }));
};

export const EarningsChart: React.FC = () => {
  const [period, setPeriod] = useState<'7' | '30'>('7');
  const [completedOrders, setCompletedOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    orderService
      .listOrders({ status: 'completed', limit: 100 })
      .then((page) => {
        if (mounted) setCompletedOrders(page.items);
      })
      .catch(() => {
        if (mounted) setCompletedOrders([]);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const data = useMemo(
    () =>
      period === '7'
        ? buildDailySeries(completedOrders, 7)
        : buildWeeklySeries(completedOrders),
    [completedOrders, period]
  );

  const maxValue = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="earnings-chart-card">
      <div className="earnings-chart-header">
        <h3 className="earnings-chart-title">Tổng quan thu nhập</h3>
        <div className="earnings-period-toggle">
          <button className={`period-btn ${period === '7' ? 'active' : ''}`} onClick={() => setPeriod('7')}>
            7 ngày
          </button>
          <button className={`period-btn ${period === '30' ? 'active' : ''}`} onClick={() => setPeriod('30')}>
            30 ngày
          </button>
        </div>
      </div>

      <div className="chart-area">
        {isLoading ? (
          <p style={{ padding: '24px', color: '#64748b' }}>Đang tải dữ liệu thu nhập...</p>
        ) : (
          <div className="chart-bars-container">
            {data.map((item, index) => {
              const heightPercent = (item.value / maxValue) * 100;
              return (
                <div key={index} className="chart-bar-wrapper">
                  <div className="chart-bar-group">
                    <div className="chart-bar-bg" style={{ height: `${heightPercent * 0.6}%` }}></div>
                    <div
                      className={`chart-bar-main ${item.isToday ? 'bar-today' : ''}`}
                      style={{ height: `${heightPercent}%` }}
                    >
                      <div className="bar-tooltip">{(item.value * 1000).toLocaleString('vi-VN')} đ</div>
                    </div>
                  </div>
                  <span className={`chart-bar-label ${item.isToday ? 'label-today' : ''}`}>{item.day}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};