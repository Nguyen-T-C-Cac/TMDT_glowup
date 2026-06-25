import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { FaArrowLeft, FaCircleCheck, FaClock, FaReceipt, FaTriangleExclamation, FaMessage } from 'react-icons/fa6'
import './OrderPaymentResultPage.css'

const formatPayDate = (value: string | null) => {
    if (!value || value.length !== 14) return '--'
    const date = new Date(
        Number(value.slice(0, 4)),
        Number(value.slice(4, 6)) - 1,
        Number(value.slice(6, 8)),
        Number(value.slice(8, 10)),
        Number(value.slice(10, 12)),
        Number(value.slice(12, 14))
    )
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('vi-VN')
}

const OrderPaymentResultPage: React.FC = () => {
    const navigate = useNavigate()
    const { code: orderCode } = useParams<{ code: string }>()
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
                description: 'Giao dịch thanh toán hoá đơn đã được ghi nhận thành công.',
                icon: <FaCircleCheck />,
                amount, transactionCode, bankCode, bankTransactionNo, transactionNo, payDate, orderInfo,
            }
        }

        if (responseCode === '24') {
            return {
                tone: 'failed' as const,
                title: 'Bạn đã hủy thanh toán',
                description: 'Giao dịch đã được hủy trong quá trình thanh toán.',
                icon: <FaTriangleExclamation />,
                amount, transactionCode, bankCode, bankTransactionNo, transactionNo, payDate, orderInfo,
            }
        }

        if (!responseCode) {
            return {
                tone: 'pending' as const,
                title: 'Chưa có kết quả thanh toán',
                description: 'Chưa nhận được thông tin từ cổng thanh toán.',
                icon: <FaClock />,
                amount, transactionCode, bankCode, bankTransactionNo, transactionNo, payDate, orderInfo,
            }
        }

        return {
            tone: 'failed' as const,
            title: 'Thanh toán chưa hoàn tất',
            description: 'Giao dịch chưa được xác nhận thành công.',
            icon: <FaTriangleExclamation />,
            amount, transactionCode, bankCode, bankTransactionNo, transactionNo, payDate, orderInfo,
        }
    }, [searchParams])

    useEffect(() => {
        const responseCode = searchParams.get('vnp_ResponseCode') || ''
        if (!responseCode) {
            setSyncMessage('')
            return
        }

        let active = true
        const syncPaymentResult = async () => {
            setSyncMessage('Đang cập nhật trạng thái thanh toán...')
            try {
                const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080'
                const response = await fetch(`${apiUrl}/api/payments/vnpay/ipn?${searchParams.toString()}`, {
                    method: 'GET',
                })
                if (!active) return
                const data = await response.json()
                if (data.RspCode === '00' || data.RspCode === '02') {
                    setSyncMessage(result.tone === 'success'
                        ? 'Đơn hàng đã được cập nhật trạng thái thanh toán.'
                        : 'Trạng thái giao dịch đã được cập nhật.')
                } else {
                    setSyncMessage('Không thể cập nhật trạng thái giao dịch.')
                }
            } catch {
                if (!active) return
                setSyncMessage('Hệ thống chưa cập nhật trạng thái ngay lúc này.')
            }
        }

        syncPaymentResult()
        return () => { active = false }
    }, [result.tone, searchParams])

    const handleGoToChat = () => {
        const isCustomer = !window.location.pathname.startsWith('/technician')
        navigate(isCustomer ? '/customer/chat' : '/technician/chat')
    }

    const handleGoToOrders = () => {
        const isCustomer = !window.location.pathname.startsWith('/technician')
        navigate(isCustomer ? '/customer/order-management' : '/technician/jobs')
    }

    return (
        <div className="payment-result-page">
            <header className="payment-result-header">
                <button className="payment-result-back-btn" type="button" onClick={handleGoToOrders}>
                    <FaArrowLeft />
                    Quay lại đơn hàng
                </button>
                <div>
                    <p className="payment-result-kicker">Kết quả thanh toán VNPay</p>
                    <h1>Thanh toán hoá đơn {orderCode}</h1>
                </div>
            </header>

            <section className={`payment-result-card ${result.tone}`}>
                <div className="payment-result-status">
                    <span className="payment-result-icon" aria-hidden="true">{result.icon}</span>
                    <div>
                        <h2>{result.title}</h2>
                        <p>{result.description}</p>
                    </div>
                </div>

                <div className="payment-result-amount">
                    <span>Số tiền giao dịch</span>
                    <strong>{result.amount > 0 ? result.amount.toLocaleString('vi-VN') + 'đ' : '--'}</strong>
                </div>

                <div className="payment-result-grid">
                    <article>
                        <span><FaReceipt /> Mã giao dịch</span>
                        <strong>{result.transactionCode || '--'}</strong>
                    </article>
                    <article>
                        <span>Mã thanh toán VNPay</span>
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

                <div className="payment-result-note">
                    <p>{syncMessage || 'Đang xử lý kết quả thanh toán...'}</p>
                </div>

                <div className="payment-result-actions">
                    <button className="payment-result-primary-btn" type="button" onClick={handleGoToOrders}>
                        Về danh sách đơn hàng
                    </button>
                    <button className="payment-result-secondary-btn" type="button" onClick={handleGoToChat}>
                        <FaMessage /> Xem trong chat
                    </button>
                </div>
            </section>
        </div>
    )
}

export default OrderPaymentResultPage
