import React from 'react';
import './PremiumBanner.css';

const premiumBenefits = [
  'Giảm 15% cho tất cả dịch vụ',
  'Ưu tiên đặt lịch & xử lý nhanh',
  'Bảo hành mở rộng rõ ràng',
  'Hỗ trợ 24/7 dành riêng cho hội viên',
];

export const PremiumBanner: React.FC = () => {
  return (
    <section className="home-premium">
      <div className="home-premium__inner">
        <div className="home-premium__copy">
          <div className="home-premium__eyebrow">GLOWUP PREMIUM</div>
          <h2>Trải nghiệm dịch vụ<br />đẳng cấp hơn</h2>
          <p>
            Nâng tầm trải nghiệm với đặc quyền sang trọng, ưu tiên xử lý và những quyền lợi được thiết kế riêng cho khách hàng Premium.
          </p>

          <button type="button" className="home-premium__cta">
            Tham gia ngay
          </button>
        </div>

        <div className="home-premium__benefits">
          {premiumBenefits.map((benefit) => (
            <div key={benefit} className="home-premium__benefit">
              <span className="home-premium__benefit-dot" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        <div className="home-premium__card" aria-hidden="true">
          <div className="home-premium__card-ring" />
          <div className="home-premium__card-shell">
            <div className="home-premium__card-top">
              <span>GlowUp</span>
              <span className="home-premium__card-badge">Premium</span>
            </div>
            <div className="home-premium__card-body">
              <strong>Member</strong>
              <p>Đặc quyền dịch vụ cao cấp</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
