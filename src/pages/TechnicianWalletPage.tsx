import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowRight,
  FaArrowTrendDown,
  FaArrowTrendUp,
  FaClockRotateLeft,
  FaCreditCard,
  FaMoneyBillTransfer,
  FaShieldHalved,
  FaWallet,
} from 'react-icons/fa6';
import './TechnicianWalletPage.css';

type WalletType = 'all' | 'credit' | 'personal';

type HistoryRow = {
  id: string;
  date: string;
  title: string;
  category: string;
  amount: number;
  status: 'success' | 'pending';
  walletType: Exclude<WalletType, 'all'>;
  note: string;
};

const walletBalances = {
  credit: 900000,
  personal: 650000,
};

const historyData: HistoryRow[] = [
  {
    id: 'TX-240524-01',
    date: '24/05/2024',
    title: 'Nạp ví tín dụng qua MoMo',
    category: 'NẠP TIỀN',
    amount: 500000,
    status: 'success',
    walletType: 'credit',
    note: 'Tăng số dư để hệ thống khấu trừ cho đơn tiền mặt.',
  },
  {
    id: 'TX-240524-02',
    date: '24/05/2024',
    title: 'Khấu trừ đơn tiền mặt #102',
    category: 'KHẤU TRỪ TỰ ĐỘNG',
    amount: -50000,
    status: 'success',
    walletType: 'credit',
    note: 'Backend trừ từ ví tín dụng sau khi hoàn tất giao dịch tiền mặt.',
  },
  {
    id: 'TX-230524-01',
    date: '23/05/2024',
    title: 'Doanh thu chuyển về ví cá nhân',
    category: 'ĐỐI SOÁT',
    amount: 350000,
    status: 'success',
    walletType: 'personal',
    note: 'Thu nhập khả dụng để rút về tài khoản ngân hàng.',
  },
  {
    id: 'TX-230524-02',
    date: '23/05/2024',
    title: 'Rút tiền về Vietcombank',
    category: 'RÚT TIỀN',
    amount: -1000000,
    status: 'pending',
    walletType: 'personal',
    note: 'Yêu cầu đang chờ xử lý và chỉ áp dụng cho ví cá nhân.',
  },
];

const formatMoney = (amount: number) =>
  `${amount < 0 ? '-' : '+'}${Math.abs(amount).toLocaleString('vi-VN')}đ`;

const walletFilterCounts: Record<WalletType, number> = {
  all: historyData.length,
  credit: historyData.filter((item) => item.walletType === 'credit').length,
  personal: historyData.filter((item) => item.walletType === 'personal').length,
};

const TechnicianWalletPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<WalletType>('all');

  const totalBalance = walletBalances.credit + walletBalances.personal;

  const visibleHistory = useMemo(() => {
    if (activeFilter === 'all') {
      return historyData;
    }

    return historyData.filter((item) => item.walletType === activeFilter);
  }, [activeFilter]);

  return (
    <div className="wallet-home">
      <header className="wallet-home-header">
        <div>
          <p className="wallet-home-kicker">GlowUp Service</p>
          <h1>Quản lý 2 ví của kỹ thuật viên</h1>
          <p className="wallet-home-subtitle">
            Tách riêng ví dùng để nạp chi phí vận hành và ví nhận thu nhập rút về ngân hàng.
          </p>
        </div>
      </header>

      <section className="wallet-overview-card">
        <div className="wallet-overview-copy">
          <span className="wallet-balance-label">
            <FaWallet /> Tổng số dư đang theo dõi
          </span>
          <strong>{totalBalance.toLocaleString('vi-VN')}đ</strong>
          <p>
            Ví tín dụng dùng để nạp tiền vào hệ thống và cho backend khấu trừ khi có giao dịch tiền mặt.
            Ví cá nhân là nơi giữ thu nhập khả dụng để rút tiền.
          </p>
        </div>

        <div className="wallet-overview-points">
          <article>
            <FaShieldHalved />
            <div>
              <strong>Khấu trừ đúng ví</strong>
              <span>Giao dịch tiền mặt chỉ ảnh hưởng ví tín dụng.</span>
            </div>
          </article>
          <article>
            <FaMoneyBillTransfer />
            <div>
              <strong>Rút tiền rõ ràng</strong>
              <span>Chỉ ví cá nhân mới có thể tạo yêu cầu rút tiền.</span>
            </div>
          </article>
        </div>
      </section>

      <section className="wallet-dual-grid">
        <article className="wallet-pocket-card credit">
          <div className="wallet-pocket-head">
            <span className="wallet-pocket-icon">
              <FaCreditCard />
            </span>
            <div>
              <p>Ví tín dụng</p>
              <strong>{walletBalances.credit.toLocaleString('vi-VN')}đ</strong>
            </div>
          </div>

          <ul className="wallet-pocket-list">
            <li>Nạp tiền để duy trì số dư hoạt động trên hệ thống.</li>
            <li>Backend tự động trừ khi hoàn tất đơn thanh toán tiền mặt.</li>
            <li>Không dùng để rút tiền về ngân hàng.</li>
          </ul>

          <div className="wallet-pocket-actions">
            <button
              className="wallet-pocket-btn primary"
              onClick={() => navigate('/technician/wallet/topup')}
              type="button"
            >
              <FaArrowTrendUp />
              Nạp vào ví tín dụng
            </button>
          </div>

          <p className="wallet-pocket-note">Hệ thống chỉ sử dụng ví này để khấu trừ các đơn thanh toán tiền mặt.</p>
        </article>

        <article className="wallet-pocket-card personal">
          <div className="wallet-pocket-head">
            <span className="wallet-pocket-icon">
              <FaWallet />
            </span>
            <div>
              <p>Ví cá nhân</p>
              <strong>{walletBalances.personal.toLocaleString('vi-VN')}đ</strong>
            </div>
          </div>

          <ul className="wallet-pocket-list">
            <li>Nhận tiền đối soát và số dư thu nhập khả dụng.</li>
            <li>Cho phép tạo yêu cầu rút về tài khoản ngân hàng liên kết.</li>
            <li>Tách biệt hoàn toàn với logic khấu trừ đơn tiền mặt.</li>
          </ul>

          <div className="wallet-pocket-actions">
            <button
              className="wallet-pocket-btn primary"
              onClick={() => navigate('/technician/wallet/withdraw')}
              type="button"
            >
              <FaArrowTrendDown />
              Rút từ ví cá nhân
            </button>
          </div>

          <p className="wallet-pocket-note">Số dư ví cá nhân có thể dùng để rút về tài khoản ngân hàng đã liên kết.</p>
        </article>
      </section>

      <section className="wallet-rules-grid">
        <article className="wallet-rule-card">
          <p className="wallet-section-kicker">Luồng nạp tiền</p>
          <h2>Ví tín dụng phục vụ vận hành</h2>
          <p>
            Khi kỹ thuật viên nạp tiền, hệ thống cộng vào ví tín dụng. Số dư này chỉ dành cho các
            khoản backend cần khấu trừ sau đơn hàng thu tiền mặt.
          </p>
        </article>

        <article className="wallet-rule-card">
          <p className="wallet-section-kicker">Luồng rút tiền</p>
          <h2>Ví cá nhân phục vụ thanh toán ra ngoài</h2>
          <p>
            Thu nhập sau đối soát được đưa vào ví cá nhân. Người dùng có thể chủ động rút tiền về
            ngân hàng mà không làm ảnh hưởng số dư vận hành.
          </p>
        </article>
      </section>

      <section className="wallet-history-card">
        <div className="wallet-history-header">
          <div>
            <p className="wallet-section-kicker">
              <FaClockRotateLeft /> Lịch sử giao dịch
            </p>
            <h2>Giao dịch theo từng ví</h2>
          </div>

          <div className="wallet-filter-tabs">
            {(['all', 'credit', 'personal'] as WalletType[]).map((filter) => (
              <button
                key={filter}
                className={activeFilter === filter ? 'active' : ''}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter === 'all'
                  ? 'Tất cả'
                  : filter === 'credit'
                    ? 'Ví tín dụng'
                    : 'Ví cá nhân'}
                <span>{walletFilterCounts[filter]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="wallet-history-table">
          <div className="wallet-history-head">
            <span>Ngày giao dịch</span>
            <span>Nội dung</span>
            <span>Ví</span>
            <span>Số tiền</span>
            <span>Trạng thái</span>
          </div>

          {visibleHistory.map((item) => (
            <div className="wallet-history-row" key={item.id}>
              <span>{item.date}</span>
              <span>
                <strong>{item.title}</strong>
                <small>{item.category}</small>
                <em>{item.note}</em>
              </span>
              <span>
                <b className={`wallet-chip ${item.walletType}`}>
                  {item.walletType === 'credit' ? 'Ví tín dụng' : 'Ví cá nhân'}
                </b>
              </span>
              <span className={item.amount > 0 ? 'amount-in' : 'amount-out'}>{formatMoney(item.amount)}</span>
              <span>
                <b className={`wallet-status ${item.status}`}>
                  {item.status === 'success' ? 'Thành công' : 'Đang xử lý'}
                </b>
              </span>
            </div>
          ))}
        </div>

        <div className="wallet-history-footer">
          <span>Hiển thị lịch sử mẫu cho 2 loại ví</span>
          <button type="button">
            Xem tất cả lịch sử <FaArrowRight />
          </button>
        </div>
      </section>
    </div>
  );
};

export default TechnicianWalletPage;
