import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCircleCheck, FaShieldHalved, FaArrowRight, FaPlus } from 'react-icons/fa6';
import './TechnicianWalletWithdrawPage.css';

type BankAccount = {
  id: string;
  bank: string;
  owner: string;
  number: string;
  icon: string;
  accent: string;
};

const initialBankAccounts: BankAccount[] = [
  {
    id: 'vcb',
    bank: 'Vietcombank',
    owner: 'NGUYEN VAN A',
    number: '6123 **** 789',
    icon: 'V',
    accent: '#1a3b6b',
  },
];

const bankOptions = ['Vietcombank', 'Techcombank', 'BIDV', 'ACB', 'MB Bank', 'VPBank'];

const TechnicianWalletWithdrawPage: React.FC = () => {
  const navigate = useNavigate();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(initialBankAccounts);
  const [selectedBank, setSelectedBank] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);
  const [newBankName, setNewBankName] = useState(bankOptions[0]);
  const [newAccountOwner, setNewAccountOwner] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const amountNumber = Number(withdrawAmount.replace(/\D/g, '')) || 0;
  const fee = amountNumber > 0 ? Math.round(amountNumber * 0.005) : 0;
  const balance = 1500000;
  const remaining = Math.max(balance - amountNumber - fee, 0);

  const handleAddBank = () => {
    if (!newAccountOwner.trim() || !newAccountNumber.trim()) {
      return;
    }

    const nextBank: BankAccount = {
      id: `bank-${Date.now()}`,
      bank: newBankName,
      owner: newAccountOwner.trim(),
      number: newAccountNumber.trim(),
      icon: newBankName.charAt(0).toUpperCase(),
      accent: '#1a3b6b',
    };

    setBankAccounts((current) => [...current, nextBank]);
    setSelectedBank(nextBank.id);
    setIsAddBankOpen(false);
    setNewBankName(bankOptions[0]);
    setNewAccountOwner('');
    setNewAccountNumber('');
  };

  return (
    <div className="withdraw-page">
      <header className="withdraw-header">
        <button className="back-btn" type="button" onClick={() => navigate('/technician/wallet')}>
          <FaArrowLeft />
          Quay lại ví
        </button>
        <div>
          <p className="withdraw-kicker">Rút tiền về ngân hàng</p>
          <h1>Chuyển số dư về tài khoản liên kết</h1>
        </div>
      </header>

      <div className="withdraw-layout">
        <section className="withdraw-card">
          <div className="section-head">
            <span>Chọn ngân hàng</span>
            <h2>Tài khoản nhận tiền</h2>
          </div>

          <div className="bank-list">
            {bankAccounts.map((bank) => (
              <button
                key={bank.id}
                type="button"
                className={`bank-item ${selectedBank === bank.id ? 'active' : ''}`}
                onClick={() => setSelectedBank(bank.id)}
              >
                <span className="bank-icon" style={{ backgroundColor: bank.accent }}>
                  {bank.icon}
                </span>
                <span className="bank-info">
                  <strong>{bank.bank}</strong>
                  <small>{bank.owner}</small>
                  <small>{bank.number}</small>
                </span>
                <span className="bank-radio" aria-hidden="true" />
              </button>
            ))}

            <button type="button" className="bank-item bank-item-add" onClick={() => setIsAddBankOpen(true)}>
              <span className="bank-icon bank-icon-add" aria-hidden="true">
                <FaPlus />
              </span>
              <span className="bank-info">
                <strong>Thêm ngân hàng</strong>
                <small>Liên kết tài khoản mới để rút tiền nhanh hơn</small>
              </span>
            </button>
          </div>

          <div className="amount-block">
            <label htmlFor="withdraw-amount">Số tiền muốn rút</label>
            <div className="amount-input">
              <input
                id="withdraw-amount"
                inputMode="numeric"
                placeholder="0"
                value={withdrawAmount}
                onChange={(event) => setWithdrawAmount(event.target.value.replace(/\D/g, ''))}
              />
              <span>đ</span>
            </div>
            <div className="amount-helpers">
              <span>Hạn mức khả dụng: <strong>{balance.toLocaleString('vi-VN')}đ</strong></span>
              <button type="button" onClick={() => setWithdrawAmount(balance.toString())}>Rút tất cả</button>
            </div>
          </div>

          <div className="support-note">
            <FaShieldHalved />
            <p>Yêu cầu rút tiền được kiểm tra bảo mật trước khi xử lý. Vui lòng xác nhận đúng số tài khoản.</p>
          </div>
        </section>

        <aside className="withdraw-summary">
          <p className="summary-kicker">Tóm tắt giao dịch</p>
          <div className="summary-row">
            <span>Số dư hiện tại</span>
            <strong>{balance.toLocaleString('vi-VN')}đ</strong>
          </div>
          <div className="summary-row">
            <span>Số tiền rút</span>
            <strong>{amountNumber.toLocaleString('vi-VN')}đ</strong>
          </div>
          <div className="summary-row">
            <span>Phí giao dịch</span>
            <strong>{fee.toLocaleString('vi-VN')}đ</strong>
          </div>
          <div className="summary-row final">
            <span>Số dư còn lại</span>
            <strong>{remaining.toLocaleString('vi-VN')}đ</strong>
          </div>

          <button className="withdraw-submit" type="button">
            <FaArrowRight />
            Tạo yêu cầu rút tiền
          </button>
          <p className="withdraw-hint">Yêu cầu sẽ được xử lý trong vòng 2 - 4 giờ làm việc.</p>

          <div className="withdraw-help">
            <span>
              <FaCircleCheck /> Hỗ trợ nhanh
            </span>
            <p>Bạn gặp khó khăn khi rút tiền? Hãy liên hệ đội ngũ chăm sóc khách hàng GlowUp.</p>
          </div>
        </aside>
      </div>

      {isAddBankOpen ? (
        <div className="bank-modal-overlay" role="presentation" onClick={() => setIsAddBankOpen(false)}>
          <div
            className="bank-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-bank-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bank-modal-header">
              <div>
                <p className="summary-kicker">Liên kết tài khoản</p>
                <h2 id="add-bank-title">Thêm ngân hàng</h2>
              </div>
              <button type="button" className="bank-modal-close" onClick={() => setIsAddBankOpen(false)}>
                ×
              </button>
            </div>

            <div className="bank-modal-form">
              <label>
                <span>Ngân hàng</span>
                <select value={newBankName} onChange={(event) => setNewBankName(event.target.value)}>
                  {bankOptions.map((bankName) => (
                    <option key={bankName} value={bankName}>
                      {bankName}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Chủ tài khoản</span>
                <input
                  type="text"
                  placeholder="Nhập tên chủ tài khoản"
                  value={newAccountOwner}
                  onChange={(event) => setNewAccountOwner(event.target.value)}
                />
              </label>

              <label>
                <span>Số tài khoản</span>
                <input
                  type="text"
                  placeholder="Nhập số tài khoản"
                  value={newAccountNumber}
                  onChange={(event) => setNewAccountNumber(event.target.value)}
                />
              </label>
            </div>

            <div className="bank-modal-actions">
              <button type="button" className="bank-modal-secondary" onClick={() => setIsAddBankOpen(false)}>
                Hủy
              </button>
              <button type="button" className="bank-modal-primary" onClick={handleAddBank}>
                Thêm ngân hàng
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TechnicianWalletWithdrawPage;
