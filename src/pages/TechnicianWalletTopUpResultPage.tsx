import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FaArrowLeft, FaCircleCheck, FaClock, FaReceipt, FaTriangleExclamation, FaWallet } from 'react-icons/fa6'
import { syncTechnicianWalletTopUpResult } from '../services/walletService'
import './TechnicianWalletTopUpResultPage.css'

const formatMoney = (amount: number) => `${amount.toLocaleString('vi-VN')}đ`

const formatPayDate = (value: string | null) => {
  if (!value || value.length !== 14) {
    return '--'
  }

  const year = Number(value.slice(0, 4))
  const month = Number(value.slice(4, 6)) - 1
  const day = Number(value.slice(6, 8))
  const hour = Number(value.slice(8, 10))
  const minute = Number(value.slice(10, 12))
  const second = Number(value.slice(12, 14))
  const date = new Date(year, month, day, hour, minute, second)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('vi-VN')
}

const TechnicianWalletTopUpResultPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [syncMessage, setSyncMessage] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  const result = useMemo(() => {
    const responseCode = searchParams.get('vnp_ResponseCode') || ''
    const transactionStatus = searchParams.get('vnp_TransactionStatus') || ''
    const amount = Number(searchParams.get('vnp_Amount') || '0') / 100
    const transactionCode = searchParams.get('vnp_TxnRef') || ''
    const bankCode = searchParams.get('vnp_BankCode') || ''
    const bankTransactionNo = searchParams.get('vnp_BankTranNo') || ''
    const transactionNo = searchParams.get('vnp_TransactionNo') || ''
    const payDate = formatPayDate(searchParams.get('vnp_PayDate'))
    const orderInfo = searchParams.get('vnp_OrderInfo') || ''

    if (responseCode === '00' && transactionStatus === '00') {
      return {
        tone: 'success' as const,
        title: 'Thanh toán thành công',
        description: 'Giao dịch của bạn đã được ghi nhận thành công. Số dư ví tín dụng sẽ được cập nhật trong giây lát.',
        icon: <FaCircleCheck />,
        amount,
        transactionCode,
        bankCode,
        bankTransactionNo,
        transactionNo,
        payDate,
        orderInfo,
      }
    }

    if (responseCode === '24') {
      return {
        tone: 'failed' as const,
        title: 'Bạn đã hủy thanh toán',
        description: 'Giao dịch đã được hủy trong quá trình thanh toán. Ví tín dụng của bạn sẽ không bị trừ hoặc cộng tiền.',
        icon: <FaTriangleExclamation />,
        amount,
        transactionCode,
        bankCode,
        bankTransactionNo,
        transactionNo,
        payDate,
        orderInfo,
      }
    }

    if (!responseCode) {
      return {
        tone: 'pending' as const,
        title: 'Chưa có kết quả thanh toán',
        description: 'Chúng tôi chưa nhận được đầy đủ thông tin từ cổng thanh toán. Bạn vui lòng kiểm tra lại hoặc thử lại sau.',
        icon: <FaClock />,
        amount,
        transactionCode,
        bankCode,
        bankTransactionNo,
        transactionNo,
        payDate,
        orderInfo,
      }
    }

    return {
      tone: 'failed' as const,
      title: 'Thanh toán chưa hoàn tất',
      description: 'Giao dịch chưa được xác nhận thành công. Bạn có thể kiểm tra lại thông tin hoặc thực hiện thanh toán lại.',
      icon: <FaTriangleExclamation />,
      amount,
      transactionCode,
      bankCode,
      bankTransactionNo,
      transactionNo,
      payDate,
      orderInfo,
    }
  }, [searchParams])

  useEffect(() => {
    const responseCode = searchParams.get('vnp_ResponseCode') || ''

    if (!responseCode) {
      setSyncMessage('')
      return
    }

    let active = true

    const syncTopUpResult = async () => {
      setSyncMessage(result.tone === 'success' ? 'Đang cập nhật số dư ví...' : 'Đang cập nhật trạng thái giao dịch...')

      try {
        const ack = await syncTechnicianWalletTopUpResult(searchParams.toString())

        if (!active) {
          return
        }

        if (ack.responseCode === '00' || ack.responseCode === '02') {
          setSyncMessage(result.tone === 'success'
            ? 'Số dư ví tín dụng đã được cập nhật.'
            : 'Trạng thái giao dịch đã được cập nhật.')
          return
        }

        setSyncMessage(result.tone === 'success'
          ? 'Thanh toán đã thành công, nhưng số dư chưa được cập nhật tự động. Bạn vui lòng kiểm tra lại sau ít phút.'
          : 'Hệ thống chưa cập nhật trạng thái giao dịch tự động. Bạn vui lòng kiểm tra lại sau ít phút.')
      } catch {
        if (!active) {
          return
        }

        setSyncMessage(result.tone === 'success'
          ? 'Thanh toán đã thành công, nhưng hệ thống chưa cập nhật số dư ngay lúc này. Bạn vui lòng kiểm tra lại sau ít phút.'
          : 'Hệ thống chưa cập nhật trạng thái giao dịch ngay lúc này. Bạn vui lòng kiểm tra lại sau ít phút.')
      }
    }

    syncTopUpResult()

    return () => {
      active = false
    }
  }, [result.tone, searchParams])

  return (
    <div className="topup-result-page">
      <header className="topup-result-header">
        <button className="topup-result-back-btn" type="button" onClick={() => navigate('/technician/wallet')}>
          <FaArrowLeft />
          Quay lại ví
        </button>
        <div>
          <p className="topup-result-kicker">Kết quả thanh toán VNPay</p>
          <h1>Kết quả nạp tiền vào ví tín dụng</h1>
        </div>
      </header>

      <section className={`topup-result-card ${result.tone}`}>
        <div className="topup-result-status">
          <span className="topup-result-icon" aria-hidden="true">
            {result.icon}
          </span>
          <div>
            <h2>{result.title}</h2>
            <p>{result.description}</p>
          </div>
        </div>

        <div className="topup-result-amount">
          <span>Số tiền giao dịch</span>
          <strong>{result.amount > 0 ? formatMoney(result.amount) : '--'}</strong>
        </div>

        <div className="topup-result-grid">
          <article>
            <span><FaReceipt /> Mã giao dịch</span>
            <strong>{result.transactionCode || '--'}</strong>
          </article>
          <article>
            <span><FaWallet /> Mã thanh toán VNPay</span>
            <strong>{result.transactionNo || '--'}</strong>
          </article>
          <article>
            <span>Ngân hàng</span>
            <strong>{result.bankCode || '--'}</strong>
          </article>
          <article>
            <span>Mã giao dịch ngân hàng</span>
            <strong>{result.bankTransactionNo || '--'}</strong>
          </article>
          <article>
            <span>Thời điểm thanh toán</span>
            <strong>{result.payDate}</strong>
          </article>
          <article>
            <span>Nội dung</span>
            <strong>{result.orderInfo || '--'}</strong>
          </article>
        </div>

        <div className="topup-result-note">
          <p>
            {syncMessage || 'Nếu số dư chưa thay đổi ngay, bạn vui lòng đợi trong giây lát rồi quay lại trang ví để kiểm tra.'}
          </p>
        </div>

        <div className="topup-result-actions">
          <button className="topup-result-primary-btn" type="button" onClick={() => navigate('/technician/wallet')}>
            Về trang ví
          </button>
          <button className="topup-result-secondary-btn" type="button" onClick={() => navigate('/technician/wallet/topup')}>
            Nạp tiền lần nữa
          </button>
        </div>
      </section>
    </div>
  )
}

export default TechnicianWalletTopUpResultPage
