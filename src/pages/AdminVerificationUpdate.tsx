import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AdminHeader } from '../components/admin/AdminHeader'
import { AdminSidebar } from '../components/admin/AdminSidebar'
import {
  getVerificationStatus,
  reviewVerification,
  verificationStatusLabel,
  getImageUrl,
} from '../services/verificationService'
import type { VerificationRequest, VerificationStatus } from '../types/VerificationRequest'
import './AdminVerificationUpdate.css'

export default function AdminVerificationUpdate() {
  const navigate = useNavigate()
  const { requestId } = useParams()
  const [params] = useSearchParams()

  const initialDecision = (params.get('decision') as VerificationStatus | null) || 'approved'
  const [status, setStatus] = useState<VerificationStatus>(initialDecision)
  const [note, setNote] = useState('')
  const [notifyTechnician, setNotifyTechnician] = useState(true)
  const [isDone, setIsDone] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedStatus, setSavedStatus] = useState<VerificationStatus | null>(null)

  const [request, setRequest] = useState<VerificationRequest | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (requestId) {
      getVerificationStatus(requestId)
        .then(res => {
          if (res.success) setRequest(res.data)
          setLoading(false)
        })
        .catch(err => {
          console.error('Error fetching verification status', err)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [requestId])

  if (loading) {
    return <div className="avu-empty-page"><h2>Đang tải...</h2></div>
  }

  if (!request) {
    return (
      <div className="avu-empty-page">
        <h2>Không tìm thấy hồ sơ cần cập nhật</h2>
        <button onClick={() => navigate('/admin/verification')} type="button">Quay lại danh sách</button>
      </div>
    )
  }

  const handleSubmit = async () => {
    setError(null)
    setIsSaving(true)

    try {
      const response = await reviewVerification(request.id, {
        status,
        note,
        reviewedBy: 'Admin AD-9902',
        notifyTechnician,
      })

      setSavedStatus(response.data.technicianStatus ?? response.data.status)
      setIsDone(true)
    } catch (err) {
      console.error(err)
      setError('Không thể cập nhật trạng thái xác minh. Vui lòng thử lại.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="avu-layout">
      <AdminSidebar activeItem="verification" />

      <main className="avu-main">
        <AdminHeader searchPlaceholder="Tìm hồ sơ xác minh..." />

        <div className="avu-breadcrumb">
          <button type="button" onClick={() => navigate('/admin/verification')}>
            Danh sách xác minh
          </button>
          <span>›</span>
          <button type="button" onClick={() => navigate(`/admin/verification/${request.id}`)}>
            Chi tiết hồ sơ
          </button>
          <span>›</span>
          <span>Cập nhật trạng thái</span>
        </div>

        <h1 className="avu-title">Cập nhật trạng thái xác minh</h1>

        {!isDone ? (
          <section className="avu-card">
            <div className="avu-target">
              <img src={getImageUrl(request.documents.portrait)} alt={request.fullName} />
              <div>
                <h3>{request.fullName}</h3>
                <p>{request.technicianId} · {request.phone}</p>
              </div>
            </div>

            <div className="avu-group">
              <label>Trạng thái mới</label>
              <div className="avu-options">
                <label><input type="radio" checked={status === 'approved'} onChange={() => setStatus('approved')} /> Đã phê duyệt</label>
                <label><input type="radio" checked={status === 'rejected'} onChange={() => setStatus('rejected')} /> Từ chối</label>
              </div>
            </div>

            <div className="avu-group">
              <label>Ghi chú gửi cho kỹ thuật viên</label>
              <textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Hồ sơ hợp lệ, tài khoản đã được kích hoạt..."
              />
            </div>

            <label className="avu-check">
              <input type="checkbox" checked={notifyTechnician} onChange={(e) => setNotifyTechnician(e.target.checked)} />
              Gửi thông báo cập nhật trạng thái về tài khoản kỹ thuật viên
            </label>

            {error && <div className="avu-error">{error}</div>}
            <div className="avu-actions">
              <button type="button" className="avu-btn avu-btn-secondary" onClick={() => navigate(`/admin/verification/${request.id}`)}>
                Quay lại chi tiết
              </button>
              <button type="button" className="avu-btn avu-btn-primary" onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? 'Đang lưu...' : 'Xác nhận cập nhật'}
              </button>
            </div>
          </section>
        ) : (
          <section className="avu-success">
            <h2>Cập nhật thành công</h2>
            <p>
              Trạng thái hồ sơ <strong>{request.id}</strong> đã được cập nhật thành{' '}
              <strong>{verificationStatusLabel[status]}</strong>.
            </p>
            {notifyTechnician && savedStatus && (
              <p>
                Trạng thái trên tài khoản kỹ thuật viên <strong>{request.technicianId}</strong> hiện là{' '}
                <strong>{verificationStatusLabel[savedStatus]}</strong>.
              </p>
            )}

            <div className="avu-actions">
              <button type="button" className="avu-btn avu-btn-secondary" onClick={() => navigate('/admin/verification')}>
                Về danh sách xác minh
              </button>
              <button type="button" className="avu-btn avu-btn-primary" onClick={() => navigate(`/admin/verification/${request.id}`)}>
                Xem lại chi tiết hồ sơ
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
