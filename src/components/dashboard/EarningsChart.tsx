import React, { useState } from 'react';
import './EarningsChart.css';

const earningsData7Days = [
  { day: 'T2', value: 420 },
  { day: 'T3', value: 580 },
  { day: 'T4', value: 350 },
  { day: 'T5', value: 750 },
  { day: 'Hôm nay', value: 680 },
  { day: 'T7', value: 520 },
  { day: 'CN', value: 300 },
];

const earningsData30Days = [
  { day: 'Tuần 1', value: 2800 },
  { day: 'Tuần 2', value: 3200 },
  { day: 'Tuần 3', value: 2900 },
  { day: 'Tuần 4', value: 3600 },
];

export const EarningsChart: React.FC = () => {
  const [period, setPeriod] = useState<'7' | '30'>('7');
  const data = period === '7' ? earningsData7Days : earningsData30Days;
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="earnings-chart-card">
      <div className="earnings-chart-header">
        <h3 className="earnings-chart-title">Tổng quan thu nhập</h3>
        <div className="earnings-period-toggle">
          <button
            className={`period-btn ${period === '7' ? 'active' : ''}`}
            onClick={() => setPeriod('7')}
          >
            7 ngày
          </button>
          <button
            className={`period-btn ${period === '30' ? 'active' : ''}`}
            onClick={() => setPeriod('30')}
          >
            30 ngày
          </button>
        </div>
      </div>

      <div className="chart-area">
        <div className="chart-bars-container">
          {data.map((item, index) => {
            const heightPercent = (item.value / maxValue) * 100;
            const isToday = item.day === 'Hôm nay';
            return (
              <div key={index} className="chart-bar-wrapper">
                <div className="chart-bar-group">
                  <div
                    className={`chart-bar-bg`}
                    style={{ height: `${heightPercent * 0.6}%` }}
                  ></div>
                  <div
                    className={`chart-bar-main ${isToday ? 'bar-today' : ''}`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    <div className="bar-tooltip">
                      {(item.value * 1000).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                </div>
                <span className={`chart-bar-label ${isToday ? 'label-today' : ''}`}>
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
