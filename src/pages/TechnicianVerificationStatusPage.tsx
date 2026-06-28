import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, CheckCircle, AlertCircle, Lock, Phone, MessageCircle, Mail, Shield } from 'lucide-react'
import { getStoredUser } from '../services/auth'
import { getVerificationByTechnician, formatDate, getImageUrl } from '../services/verificationService'
import type { VerificationStatus } from '../types/VerificationRequest'
import './TechnicianVerificationStatusPage.css'

interface VerificationStatusData {
  status: VerificationStatus | 'processing' | 'completed'
  submittedAt: string
  documents: {
    idFront: {
      type: string
      status: 'approved' | 'pending' | 'rejected'
      image?: string
    }
    idBack: {
      type: string
      status: 'approved' | 'pending' | 'rejected'
      image?: string
    }
    faceSelfie: {
      type: string
      status: 'approved' | 'pending' | 'rejected'
      image?: string
    }
  }
}

export const TechnicianVerificationStatusPage: React.FC = () => {
  const navigate = useNavigate()
  const [verificationData, setVerificationData] = useState<VerificationStatusData>({
    status: 'pending',
    submittedAt: new Date().toLocaleString('vi-VN'),
    documents: {
      idFront: {
        type: 'CCCD mặt trước',
        status: 'pending',
        image: 'https://i.pravatar.cc/150?img=1',
      },
      idBack: {
        type: 'CCCD mặt sau',
        status: 'pending',
        image: 'https://i.pravatar.cc/150?img=2',
      },
      faceSelfie: {
        type: 'Xác thực khuôn mặt',
        status: 'pending',
        image: 'https://i.pravatar.cc/150?img=3',
      },
    },
  })

  useEffect(() => {
    let isMounted = true
    const fetchStatus = async () => {
      const user = getStoredUser()
      if (user) {
        const techId = user.code || `TECH-${user.id}`
        try {
          const response = await getVerificationByTechnician(techId)
          if (response && response.success && response.data && isMounted) {
            const currentStatus = response.data.status
            setVerificationData(prev => ({
              ...prev,
              status: currentStatus,
              submittedAt: formatDate(response.data.submittedAt),
              documents: {
                idFront: { ...prev.documents.idFront, status: currentStatus === 'approved' ? 'approved' : currentStatus === 'rejected' ? 'rejected' : 'pending', image: getImageUrl(response.data.documents?.idFront) || prev.documents.idFront.image },
                idBack: { ...prev.documents.idBack, status: currentStatus === 'approved' ? 'approved' : currentStatus === 'rejected' ? 'rejected' : 'pending', image: getImageUrl(response.data.documents?.idBack) || prev.documents.idBack.image },
                faceSelfie: { ...prev.documents.faceSelfie, status: currentStatus === 'approved' ? 'approved' : currentStatus === 'rejected' ? 'rejected' : 'pending', image: getImageUrl(response.data.documents?.portrait) || prev.documents.faceSelfie.image },
              }
            }))
          } else if (isMounted) {
            // Chưa có hồ sơ hoặc dữ liệu null
            navigate('/technician/verification')
          }
        } catch (error) {
          console.error("Error fetching status:", error)
          if (isMounted) {
             navigate('/technician/verification')
          }
        }
      }
    }
    
    fetchStatus()
    return () => { isMounted = false }
  }, [])

  const getDocumentStatusLabel = (status: 'approved' | 'pending' | 'rejected') => {
    switch (status) {
      case 'approved':
        return 'ĐÃ NHẬN'
      case 'pending':
        return 'CHỜ DUYỆT'
      case 'rejected':
        return 'BỊ TỪ CHỐI'
      default:
        return 'CHỜ DUYỆT'
    }
  }

  return (
    <div className="verification-status-page">
      <div className="status-container">
        {/* Header */}
        <div className="status-header">
          <h1 className="status-title">Xác minh danh tính</h1>
        </div>
        {/* Processing Message */}
        {verificationData.status === 'rejected' ? (
          <div className="processing-message" style={{ backgroundColor: '#fdeded', border: '1px solid #e74c3c' }}>
            <div className="message-icon" style={{ color: '#e74c3c' }}>
              <AlertCircle size={32} />
            </div>
            <div className="message-content">
              <h3 className="message-title" style={{ color: '#e74c3c' }}>Hồ sơ của bạn đã bị từ chối</h3>
              <p className="message-text" style={{ color: '#c0392b' }}>
                Thông tin và tài liệu bạn cung cấp không đáp ứng đủ yêu cầu hoặc không rõ ràng. Vui lòng kiểm tra lại.
              </p>
              <button 
                className="verification-status-resubmit" 
                onClick={() => navigate('/technician/verification?resubmit=true')}
                style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                NỘP LẠI TỪ ĐẦU
              </button>
            </div>
          </div>
        ) : verificationData.status === 'approved' || verificationData.status === 'completed' ? (
          <div className="processing-message" style={{ backgroundColor: '#eafaf1', border: '1px solid #2ecc71' }}>
            <div className="message-icon" style={{ color: '#2ecc71' }}>
              <CheckCircle size={32} />
            </div>
            <div className="message-content">
              <h3 className="message-title" style={{ color: '#2ecc71' }}>Hồ sơ đã được phê duyệt</h3>
              <p className="message-text" style={{ color: '#27ae60' }}>
                Bạn đã trở thành thợ chính thức. Bây giờ bạn có thể bật trạng thái nhận việc để bắt đầu nhận đơn.
              </p>
            </div>
          </div>
        ) : (
          <div className="processing-message">
            <div className="message-icon">
              <Clock size={32} />
            </div>
            <div className="message-content">
              <h3 className="message-title">Hồ sơ của bạn đang được xử lý</h3>
              <p className="message-text">
                Chúng tôi đang kiểm tra thông tin và tài liệu bạn đã cung cấp. Khi quá số tối đa 24h làm việc sẽ có thông báo đến hộp thư...
              </p>
              <p className="message-info">
                <AlertCircle size={16} />
                Bạn sẽ nhận được thông báo qua ứng dụng khi có kết quả.
              </p>
            </div>
          </div>
        )}
        <div className="status-main-content">
          {/* Left Content */}
          <div className="status-left">
            {/* Timeline Progress */}
            <div className="timeline-section">
              <div className="status-summary">
                <div>
                  <p className="summary-label">Trạng thái hồ sơ</p>
                  <h2 className="summary-title">{(verificationData.status === 'completed' || verificationData.status === 'approved') ? 'Đã xác minh' : (verificationData.status === 'processing' || verificationData.status === 'pending') ? 'Đang phê duyệt' : 'Bị từ chối'}</h2>
                  <p className="summary-note">Hồ sơ đã được gửi vào {verificationData.submittedAt}. Bạn sẽ nhận được kết quả trong vòng 24h làm việc.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                  <span className={`summary-pill ${verificationData.status}`}>{(verificationData.status === 'completed' || verificationData.status === 'approved') ? 'Hoàn tất' : (verificationData.status === 'processing' || verificationData.status === 'pending') ? 'Đang xử lý' : 'Từ chối'}</span>
                </div>
              </div>

              <div className="timeline-progress">
                <div className="timeline-step completed">
                  <div className="step-circle">
                    <CheckCircle size={24} />
                  </div>
                  <div className="step-content">
                    <p className="step-label">Gửi hồ sơ</p>
                    <p className="step-date">{verificationData.submittedAt}</p>
                  </div>
                </div>

                <div className={`timeline-step ${['processing', 'pending', 'rejected'].includes(verificationData.status) ? 'active' : ''}`}>
                  <div className={`step-circle ${['processing', 'pending', 'rejected'].includes(verificationData.status) ? 'active' : ''}`}>
                    <Clock size={24} />
                  </div>
                  <div className="step-content">
                    <p className="step-label">Đang xử lý</p>
                    <p className="step-description">Dự kiến 24h làm việc</p>
                  </div>
                </div>

                <div className={`timeline-step ${['approved', 'completed'].includes(verificationData.status) ? 'completed' : ''}`}>
                  <div className={`step-circle ${['approved', 'completed'].includes(verificationData.status) ? 'active' : ''}`}>
                    <Shield size={24} />
                  </div>
                  <div className="step-content">
                    <p className="step-label">Hoàn tất</p>
                    <p className="step-description">{['approved', 'completed'].includes(verificationData.status) ? 'Đã được duyệt' : 'Chờ phê duyệt'}</p>
                  </div>
                </div>
              </div>
            </div>

            

            {/* Document Details */}
            <div className="document-details">
              <h3 className="details-title">Chi tiết hồ sơ số</h3>
              <p className="details-subtitle">Các giấy tờ bạn đã cung cấp</p>

              <div className="documents-list">
                {[
                  verificationData.documents.idFront,
                  verificationData.documents.idBack,
                  verificationData.documents.faceSelfie,
                ].map((document, index) => (
                  <div className="document-item" key={index}>
                    <img src={document.image} alt={document.type} className="document-image" />
                    <div className="document-info">
                      <p className="document-type">{document.type}</p>
                      <p className={`status-value ${document.status}`}>
                        {getDocumentStatusLabel(document.status)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="notes-section">
              <h3 className="notes-title">Một vài lưu ý</h3>
              <div className="notes-list">
                <div className="note-item">
                  <AlertCircle size={20} />
                  <div className="note-content">
                    <p className="note-text">Không gửi lại hồ sơ nếu như chưa lâu</p>
                    <p className="note-description">Hồ sơ của bạn đang được xử lý.</p>
                  </div>
                </div>

                <div className="note-item">
                  <Mail size={20} />
                  <div className="note-content">
                    <p className="note-text">Kết quả sẽ được thông báo qua email</p>
                    <p className="note-description">Chúng tôi sẽ gửi thông báo qua email và ứng dụng.</p>
                  </div>
                </div>

                <div className="note-item">
                  <Lock size={20} />
                  <div className="note-content">
                    <p className="note-text">Thông tin được bảo mật</p>
                    <p className="note-description">Một cơ sở dữ liệu bảo mật cao nhất tuyệt đối.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="security-footer">
              <div className="security-icon">
                <Shield size={24} />
              </div>
              <div className="security-content">
                <p className="security-title">Thông tin của bạn được bảo mật tuyệt đối</p>
                <p className="security-description">
                  GlowUp cam kết bảo mật thông tin cá nhân cao nhất. Dữ liệu của bạn được bảo vệ theo tiêu chuẩn an ninh cao nhất. Mã hóa dữ liệu • Không chứa aiệm • Xóa khi không cần thiết
                </p>
              </div>
              <div className="security-links">
                <a href="#" className="security-link">Mã hóa dữ liệu</a>
                <a href="#" className="security-link">Không chứa aiệm</a>
                <a href="#" className="security-link">Xóa khi không cần thiết</a>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="status-right">
            <div className="support-card">
              <div className="support-header">
                <AlertCircle size={20} />
                <p className="support-title">Cần hỗ trợ?</p>
              </div>

              <div className="support-content">
                <p className="support-subtitle">Đường dây nóng hỗ trợ đối tác</p>

                <div className="support-phone">
                  <Phone size={24} />
                  <div className="phone-info">
                    <p className="phone-number">1900 8888 (24/7)</p>
                  </div>
                </div>

                <button className="chat-button">
                  <MessageCircle size={20} />
                  <span>Chat với nhân viên</span>
                </button>

                <div className="support-hours">
                  <p className="hours-label">24h làm việc</p>
                  <p className="hours-time">Từ 09:00-22:00, 05/2025 16:30</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TechnicianVerificationStatusPage
