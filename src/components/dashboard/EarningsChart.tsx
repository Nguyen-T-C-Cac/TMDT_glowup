import React, { useState } from 'react';
import './EarningsChart.css';
import type { TechnicianEarningPoint } from '../../types/technician';

interface EarningsChartProps {
  earnings7d: TechnicianEarningPoint[];
  earnings30d: TechnicianEarningPoint[];
}

export const EarningsChart: React.FC<EarningsChartProps> = ({ earnings7d, earnings30d }) => {
  const [period, setPeriod] = useState<'7' | '30'>('7');
  const data = period === '7' ? earnings7d : earnings30d;
  const maxValue = Math.max(1, ...data.map((d) => d.amount));

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
            4 tuần
          </button>
        </div>
      </div>

      <div className="chart-area">
        <div className="chart-bars-container">
          {data.map((item, index) => {
            const heightPercent = (item.amount / maxValue) * 100;
            const isLatest = period === '7' && index === data.length - 1;
            return (
              <div key={index} className="chart-bar-wrapper">
                <div className="chart-bar-group">
                  <div
                    className="chart-bar-bg"
                    style={{ height: `${heightPercent * 0.6}%` }}
                  ></div>
                  <div
                    className={`chart-bar-main ${isLatest ? 'bar-today' : ''}`}
                    style={{ height: `${Math.max(heightPercent, 2)}%` }}
                  >
                    <div className="bar-tooltip">
                      {item.amount.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                </div>
                <span className={`chart-bar-label ${isLatest ? 'label-today' : ''}`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
