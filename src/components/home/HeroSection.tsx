import React from 'react';
import './HeroSection.css';
import { BadgeCheckIcon, CheckCircleIcon, ClockIcon, StarIcon } from '../common/Icons';

type HeroSectionProps = {
  onNavigate?: (page: string, data?: unknown) => void;
};

const heroStats = [
  {
    icon: <StarIcon size={16} />,
    value: '4.9/5',
    label: 'Đánh giá từ 50.000+ khách hàng',
  },
  {
    icon: <BadgeCheckIcon size={16} />,
    value: '1.200+',
    label: 'Chuyên gia uy tín',
  },
  {
    icon: <CheckCircleIcon size={16} />,
    value: '15+',
    label: 'Dịch vụ đa dạng',
  },
];

const floatingCards = [
  {
    title: 'Bảo hành minh bạch',
    note: 'Cam kết rõ ràng',
    icon: <BadgeCheckIcon size={18} />,
    align: 'left',
  },
  {
    title: 'Kỹ thuật viên chuyên nghiệp',
    note: '+200 chuyên gia',
    icon: <StarIcon size={18} />,
    align: 'center',
  },
  {
    title: 'Có mặt nhanh chóng',
    note: '30 phút',
    icon: <ClockIcon size={18} />,
    align: 'right',
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  return (
    <section className="home-hero">
      <div className="home-hero__shell">
        <div className="home-hero__content">
          <div className="home-hero__eyebrow">DỊCH VỤ CAO CẤP</div>
          <h1 className="home-hero__title">
            Chăm sóc
            <br />
            ngôi nhà của bạn
            <span>Dễ dàng hơn</span>
          </h1>
          <p className="home-hero__description">
            Kết nối với đội ngũ kỹ thuật viên chuyên nghiệp, uy tín và tận tâm. Nhanh chóng, minh bạch, an tâm trên từng lần đặt dịch vụ.
          </p>

          <div className="home-hero__actions">
            <button className="home-hero__button home-hero__button--primary" type="button" onClick={() => onNavigate?.('services')}>
              Đặt lịch ngay
            </button>
            <button className="home-hero__button home-hero__button--secondary" type="button" onClick={() => onNavigate?.('services')}>
              Xem dịch vụ →
            </button>
          </div>

          <div className="home-hero__stats">
            {heroStats.map((stat) => (
              <article key={stat.label} className="home-hero__stat-card">
                <div className="home-hero__stat-icon">{stat.icon}</div>
                <div>
                  <strong>{stat.value}</strong>
                  <p>{stat.label}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="home-hero__visual" aria-hidden="true">
          <div className="home-hero__glow home-hero__glow--one" />
          <div className="home-hero__glow home-hero__glow--two" />
          <div className="home-hero__frame">
            <img
              src="public/image/header.png"
              alt=""
              className="home-hero__image"
            />
          </div>

          {floatingCards.map((card) => (
            <div key={card.title} className={`home-hero__floating-card home-hero__floating-card--${card.align}`}>
              <div className="home-hero__floating-card-icon">{card.icon}</div>
              <div>
                <strong>{card.title}</strong>
                <p>{card.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;