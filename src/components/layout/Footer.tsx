import React from 'react';
import './Footer.css';
import { FacebookIcon, InstagramIcon } from '../common/Icons';

export const Footer: React.FC = () => {
  return (
    <footer className="home-footer">
      <div className="home-footer__inner">
        <div className="home-footer__brand">
          <h2>GlowUp</h2>
          <p>
            Giải pháp chăm sóc toàn diện cho ngôi nhà với đội ngũ kỹ thuật viên chuyên nghiệp và dịch vụ minh bạch.
          </p>

          <div className="home-footer__socials">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FacebookIcon size={18} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <InstagramIcon size={18} />
            </a>
          </div>
        </div>

        <div className="home-footer__column">
          <h3>Dịch vụ</h3>
          <a href="#">Máy lạnh</a>
          <a href="#">Bếp từ</a>
          <a href="#">Tủ lạnh</a>
          <a href="#">Máy nước nóng</a>
          <a href="#">Xem tất cả</a>
        </div>

        <div className="home-footer__column">
          <h3>Công ty</h3>
          <a href="#">Giới thiệu</a>
          <a href="#">Quy chế hoạt động</a>
          <a href="#">Chính sách bảo mật</a>
          <a href="#">Điều khoản sử dụng</a>
        </div>

        <div className="home-footer__column">
          <h3>Hỗ trợ</h3>
          <a href="#">Trung tâm trợ giúp</a>
          <a href="#">Hướng dẫn đặt dịch vụ</a>
          <a href="#">Chính sách bảo hành</a>
          <a href="#">Liên hệ</a>

          <div className="home-footer__apps">
            <span>Tải ứng dụng</span>
            <div className="home-footer__store-badges">
              <div className="home-footer__store-badge">App Store</div>
              <div className="home-footer__store-badge">Google Play</div>
            </div>
          </div>
        </div>
      </div>

      <div className="home-footer__bottom">
        © 2024 GlowUp. Cùng bạn kiến tạo không gian sống tuyệt vời.
      </div>
    </footer>
  );
};

export default Footer;