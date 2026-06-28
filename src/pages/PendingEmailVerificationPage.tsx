import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, ArrowRight, RefreshCw } from 'lucide-react'
import { resendConfirmationEmail } from '../services/auth'
import './AuthScreens.css'

interface PendingEmailVerificationPageProps {
  email?: string
}

export function PendingEmailVerificationPage({ email: initialEmail }: PendingEmailVerificationPageProps) {
  const navigate = useNavigate()
  const [email, setEmail] = useState(initialEmail || '')
  const [resendCount, setResendCount] = useState(0)
  const [canResend, setCanResend] = useState(true)
  const [statusMessage, setStatusMessage] = useState('')
  const [statusType, setStatusType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    // Get email from local storage if not provided
    const sessionEmail = localStorage.getItem('registerEmail')
    if (sessionEmail) {
      setEmail(sessionEmail)
    }
  }, [])

  const handleResendEmail = async () => {
    if (!email) {
      setStatusType('error')
      setStatusMessage('Không tìm thấy địa chỉ email để gửi lại. Vui lòng đăng nhập lại.')
      return
    }

    setCanResend(false)
    setStatusMessage('')

    try {
      await resendConfirmationEmail(email)
      setStatusType('success')
      setStatusMessage('Email xác nhận đã được gửi lại. Vui lòng kiểm tra hộp thư đến hoặc spam.')
    } catch (error: any) {
      setStatusType('error')
      setStatusMessage(error.message || 'Không thể gửi lại email. Vui lòng thử lại sau.')
    } finally {
      setResendCount(prev => prev + 1)
      setTimeout(() => {
        setCanResend(true)
      }, 60000)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <aside className="auth-hero" aria-hidden="true">
          <div className="auth-hero__badge">
            <Mail size={16} />
            <span>Xác nhận Email</span>
          </div>

          <div className="auth-hero__content">
            <div className="auth-brand">
              <div className="auth-brand__mark">G</div>
              <div>
                <p className="auth-brand__name">GlowUp</p>
                <p className="auth-brand__tag">SaaS service platform</p>
              </div>
            </div>

            <div className="auth-hero__items">
              <div className="auth-hero__item">
                <Mail size={20} className="auth-hero__icon" />
                <div>
                  <p className="auth-hero__item-title">Kiểm tra email của bạn</p>
                  <p className="auth-hero__item-description">
                    Chúng tôi đã gửi một link xác nhận đến email của bạn
                  </p>
                </div>
              </div>
              <div className="auth-hero__item">
                <RefreshCw size={20} className="auth-hero__icon" />
                <div>
                  <p className="auth-hero__item-title">Không tìm thấy?</p>
                  <p className="auth-hero__item-description">
                    Kiểm tra thư mục spam hoặc yêu cầu gửi lại email
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <article className="auth-card">
          <div className="auth-card__inner">
            <div className="pending-email__container">
              <div className="pending-email__icon">
                <Mail size={56} />
              </div>
              <h1 className="pending-email__title">Vui lòng xác nhận email</h1>
              <p className="pending-email__description">
                Chúng tôi đã gửi một email xác nhận đến <strong>{email}</strong>
              </p>
              <p className="pending-email__instruction">
                Vui lòng kiểm tra email của bạn và click vào link xác nhận để hoàn tất đăng ký. 
                Link sẽ hết hạn sau 24 giờ.
              </p>

              <div className="pending-email__actions">
                <button
                  className="pending-email__button pending-email__button--primary"
                  onClick={() => window.location.href = 'https://mail.google.com'}
                >
                  <span>Mở Gmail</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  className={`pending-email__button pending-email__button--secondary ${!canResend ? 'pending-email__button--disabled' : ''}`}
                  onClick={handleResendEmail}
                  disabled={!canResend}
                >
                  <span>
                    {canResend 
                      ? 'Gửi lại email' 
                      : `Gửi lại sau ${60}s`
                    }
                  </span>
                  {canResend && <RefreshCw size={18} />}
                </button>
              </div>

              {statusMessage && (
                <p className={`pending-email__status pending-email__status--${statusType}`}>
                  {statusMessage}
                </p>
              )}

              <div className="pending-email__divider"></div>

              <button
                className="pending-email__link"
                onClick={() => navigate('/auth/login')}
              >
                Quay lại đăng nhập
              </button>
            </div>
          </div>
        </article>
      </section>
    </main>
  )
}
