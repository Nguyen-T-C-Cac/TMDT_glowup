import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCircleCheck, FaCopy, FaQrcode, FaShieldHalved } from 'react-icons/fa6';
import './TechnicianWalletTopUpPage.css';

type AmountId = 'basic' | 'popular' | 'premium' | 'professional';
type PaymentMethodId = 'momo' | 'zalopay' | 'vietqr';

const quickAmounts: Array<{ id: AmountId; label: string; value: number }> = [
  { id: 'basic', label: 'Cơ bản', value: 100000 },
  { id: 'popular', label: 'Phổ biến', value: 200000 },
  { id: 'premium', label: 'Nâng cao', value: 500000 },
  { id: 'professional', label: 'Chuyên nghiệp', value: 1000000 },
];

const paymentMethods: Array<{
  id: PaymentMethodId;
  name: string;
  description: string;
  accent: string;
  code: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
}> = [
  {
    id: 'momo',
    name: 'Ví MoMo',
    description: 'Thanh toán nhanh qua ứng dụng MoMo',
    accent: '#a21a63',
    code: 'MOMO-GLOWUP-01',
    accountName: 'GlowUp Service',
    accountNumber: 'momo.glowup.service',
    bankName: 'MoMo',
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    description: 'Ví điện tử ZaloPay an toàn tiện lợi',
    accent: '#0d8adf',
    code: 'ZALO-GLOWUP-02',
    accountName: 'GlowUp Service',
    accountNumber: '0912345678',
    bankName: 'ZaloPay',
  },
  {
    id: 'vietqr',
    name: 'Chuyển khoản VietQR',
    description: 'Xử lý tự động trong 30 giây',
    accent: '#1f2d65',
    code: 'VQR-GLOWUP-03',
    accountName: 'GLOWUP SERVICE',
    accountNumber: '123456789',
    bankName: 'Techcombank',
  },
];

const formatMoney = (amount: number) => `${amount.toLocaleString('vi-VN')}đ`;

const QrMatrix: React.FC<{ seed: string; accent: string }> = ({ seed, accent }) => {
  const matrix = useMemo(() => {
    const size = 21;
    const hash = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);

    return Array.from({ length: size }, (_, row) =>
      Array.from({ length: size }, (_, col) => {
        const inFinder =
          (row < 7 && col < 7) ||
          (row < 7 && col >= size - 7) ||
          (row >= size - 7 && col < 7);

        if (inFinder) {
          const localRow = row % 7;
          const localCol = col % 7;
          return localRow === 0 || localRow === 6 || localCol === 0 || localCol === 6 || (localRow >= 2 && localRow <= 4 && localCol >= 2 && localCol <= 4);
        }

        return ((row * 13 + col * 7 + hash) % 5 === 0) || ((row + col + hash) % 9 === 0);
      }),
    );
  }, [seed]);

  return (
    <div className="qr-card" style={{ ['--qr-accent' as string]: accent } as React.CSSProperties}>
      <div className="qr-grid">
        {matrix.flatMap((row, rowIndex) =>
          row.map((filled, colIndex) => (
            <span
              key={`${rowIndex}-${colIndex}`}
              className={`qr-cell ${filled ? 'filled' : ''}`}
            />
          )),
        )}
      </div>
      <div className="qr-caption">
        <FaQrcode />
        <span>Quet ma QR de thanh toan</span>
      </div>
    </div>
  );
};

const TechnicianWalletTopUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState<AmountId>('popular');
  const [customAmount, setCustomAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>('vietqr');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  

  const finalAmount = useMemo(() => {
    const parsed = Number(customAmount.replace(/\D/g, ''));
    if (parsed > 0) return parsed;

    return quickAmounts.find((item) => item.id === selectedAmount)?.value ?? 0;
  }, [customAmount, selectedAmount]);

  return (
    <div className="topup-page">
      <header className="topup-header">
        <button className="back-btn" type="button" onClick={() => navigate('/technician/wallet')}>
          <FaArrowLeft />
          Quay lại ví
        </button>
        <div>
          <p className="topup-kicker">Nạp tiền vào ví</p>
          <h1>Chọn số tiền và phương thức thanh toán</h1>
        </div>
      </header>

      <div className="topup-layout">
        <section className="topup-card topup-amount-card">
          <div className="section-head">
            <span>Bước 1</span>
            <h2>Chọn số tiền</h2>
          </div>

          <div className="amount-option-grid">
            {quickAmounts.map((amount) => (
              <button
                key={amount.id}
                className={`amount-option ${selectedAmount === amount.id ? 'active' : ''}`}
                type="button"
                onClick={() => {
                  setSelectedAmount(amount.id);
                  setCustomAmount('');
                }}
              >
                <small>{amount.label}</small>
                <strong>{formatMoney(amount.value)}</strong>
              </button>
            ))}
          </div>

          <div className="custom-amount-block">
            <label htmlFor="custom-amount">Số tiền khác</label>
            <div className="custom-amount-input">
              <input
                id="custom-amount"
                inputMode="numeric"
                placeholder="Nhập số tiền..."
                value={customAmount}
                onChange={(event) => setCustomAmount(event.target.value.replace(/\D/g, ''))}
              />
              <span>đ</span>
            </div>
          </div>

          <div className="topup-summary">
            <FaShieldHalved />
            <div>
              <strong>Thanh toán an toàn</strong>
              <p>Mỗi phương thức bên phải đều có mã QR riêng để quét nhanh và đúng số tiền.</p>
            </div>
          </div>
        </section>

        <section className="topup-card topup-methods-card">
          <div className="section-head">
            <span>Bước 2</span>
            <h2>Phương thức thanh toán</h2>
          </div>

          <div className="method-list">
            {paymentMethods.map((method) => (
              <article
                key={method.id}
                className={`method-card ${selectedMethod === method.id ? 'active' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedMethod(method.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedMethod(method.id); } }}
              >
                {/* native radio (hidden) to keep single input per option and ensure only one selected */}
                <input
                  type="radio"
                  name="topup-method"
                  id={`method-${method.id}`}
                  checked={selectedMethod === method.id}
                  onChange={() => setSelectedMethod(method.id)}
                  style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                />

                <div className="method-select">
                  <div className="method-text">
                    <strong>{method.name}</strong>
                    <small>{method.description}</small>
                  </div>
                  <span className="method-radio" aria-hidden="true" />
                </div>

                <div className="method-content">
                  {selectedMethod === method.id ? (
                    <>
                      <QrMatrix seed={`${method.code}-${finalAmount}`} accent={method.accent} />

                      <div className="method-details">
                        <div>
                          <p>Tên tài khoản</p>
                          <h3>{method.accountName}</h3>
                        </div>
                        <div>
                          <p>Số tài khoản</p>
                          <h3>
                            {method.accountNumber}
                            <button type="button" className="copy-btn" aria-label="Sao chép số tài khoản">
                              <FaCopy />
                            </button>
                          </h3>
                        </div>
                        <div>
                          <p>Phương thức</p>
                          <h3>{method.bankName}</h3>
                        </div>
                        <div className="transfer-note">
                          <FaCircleCheck />
                          <span>Nội dung chuyển khoản: {method.code} - {formatMoney(finalAmount)}</span>
                        </div>
                        <div className="method-actions">
                          <button className="confirm-topup-btn" type="button">Xác nhận đã chuyển khoản</button>
                          <p className="topup-hint">* Vui lòng kiểm tra kỹ số tiền và nội dung chuyển khoản trước khi xác nhận.</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="method-compact">
                      <div className="method-compact-left">
                        <strong>{method.name}</strong>
                        <small>{method.bankName}</small>
                      </div>
                      <div className="method-compact-right">
                        <span className="method-compact-account">{method.accountNumber}</span>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* confirm button moved into selected method details to avoid duplicate buttons */}
        </section>
      </div>
    </div>
  );
};

export default TechnicianWalletTopUpPage;
