import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AdminHeader } from '../components/admin/AdminHeader'
import { AdminSidebar } from '../components/admin/AdminSidebar'
import {
  getTechnicianVerificationStatus,
  getVerificationRequestById,
  updateVerificationRequestStatus,
  verificationStatusLabel,
} from '../services/verificationService'
import type { VerificationStatus } from '../types/VerificationRequest'
import './AdminVerificationUpdate.css'

type ReviewPreset = { value: string; label: string; description: string }

/** Gợi ý nội dung từ chối hồ sơ định danh (status = rejected). */
const REJECT_PRESETS: ReviewPreset[] = [
  { value: 'id-blurry', label: 'Ảnh CCCD không rõ nét', description: 'Ảnh CCCD bạn cung cấp bị mờ/lóa, không đọc được đầy đủ thông tin. Vui lòng chụp lại rõ nét, đủ sáng và không bị che khuất các góc.' },
  { value: 'info-mismatch', label: 'Thông tin không khớp', description: 'Thông tin trên giấy tờ không khớp với thông tin tài khoản bạn đã đăng ký (họ tên/ngày sinh/số CCCD). Vui lòng kiểm tra và cập nhật lại cho đúng.' },
  { value: 'portrait-invalid', label: 'Ảnh chân dung không hợp lệ', description: 'Ảnh chân dung không rõ mặt hoặc không trùng khớp với ảnh trên CCCD. Vui lòng chụp ảnh chân dung trực diện, rõ mặt, không đeo khẩu trang/kính râm.' },
  { value: 'cert-expired', label: 'Chứng chỉ hết hạn / không hợp lệ', description: 'Chứng chỉ nghề bạn cung cấp đã hết hạn hoặc không hợp lệ. Vui lòng tải lên chứng chỉ còn hiệu lực do cơ quan có thẩm quyền cấp.' },
  { value: 'doc-fake', label: 'Nghi ngờ giấy tờ giả mạo', description: 'Hệ thống ghi nhận dấu hiệu chỉnh sửa/giả mạo trên giấy tờ. Hồ sơ bị từ chối. Vui lòng cung cấp giấy tờ gốc, hợp lệ để được xét duyệt lại.' },
  { value: 'other', label: 'Khác', description: '' },
]

/** Gợi ý nội dung yêu cầu bổ sung (status = needs_resubmit). */
const RESUBMIT_PRESETS: ReviewPreset[] = [
  { value: 'missing-back', label: 'Thiếu ảnh CCCD mặt sau', description: 'Hồ sơ còn thiếu ảnh CCCD mặt sau. Vui lòng bổ sung để chúng tôi hoàn tất việc xác minh.' },
  { value: 'missing-portrait', label: 'Thiếu ảnh chân dung', description: 'Hồ sơ còn thiếu ảnh chân dung rõ mặt. Vui lòng tải lên ảnh chân dung trực diện để tiếp tục.' },
  { value: 'missing-cert', label: 'Bổ sung chứng chỉ nghề', description: 'Vui lòng bổ sung chứng chỉ nghề phù hợp với lĩnh vực dịch vụ bạn đăng ký để tăng độ tin cậy hồ sơ.' },
  { value: 'retake-clearer', label: 'Chụp lại ảnh rõ hơn', description: 'Một số ảnh chưa đủ rõ. Vui lòng chụp lại trong điều kiện đủ sáng, lấy nét và gửi lại hồ sơ.' },
  { value: 'other', label: 'Khác', description: '' },
]

export default function AdminVerificationUpdate() {
  const navigate = useNavigate()
  const { requestId } = useParams()
  const [params] = useSearchParams()

  const request = useMemo(() => (requestId ? getVerificationRequestById(requestId) : undefined), [requestId])

  const initialDecision = (params.get('decision') as VerificationStatus | null) || 'approved'
  const [status, setStatus] = useState<VerificationStatus>(initialDecision)
  const [note, setNote] = useState('')
  const [notePreset, setNotePreset] = useState('')
  const [notifyTechnician, setNotifyTechnician] = useState(true)
  const [isDone, setIsDone] = useState(false)
  const [savedStatus, setSavedStatus] = useState<VerificationStatus | null>(null)

  if (!request) {
    return (
      <div className="avu-empty-page">
        <h2>Không tìm thấy hồ sơ cần cập nhật</h2>
        <button onClick={() => navigate('/admin/verification')} type="button">Quay lại danh sách</button>
      </div>
    )
  }

  const handleSubmit = () => {
    const updated = updateVerificationRequestStatus(request.id, {
      status,
      note,
      reviewedBy: 'Admin AD-9902',
    })

    if (!updated) return

    setSavedStatus(getTechnicianVerificationStatus(request.technicianId))
    setIsDone(true)
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
              <img src={request.documents.portrait} alt={request.fullName} />
              <div>
                <h3>{request.fullName}</h3>
                <p>{request.technicianId} · {request.phone}</p>
              </div>
            </div>

            <div className="avu-group">
              <label>Trạng thái mới</label>
              <div className="avu-options">
                <label><input type="radio" checked={status === 'approved'} onChange={() => { setStatus('approved'); setNotePreset('') }} /> Đã phê duyệt</label>
                <label><input type="radio" checked={status === 'rejected'} onChange={() => { setStatus('rejected'); setNotePreset('') }} /> Từ chối</label>
                <label><input type="radio" checked={status === 'needs_resubmit'} onChange={() => { setStatus('needs_resubmit'); setNotePreset('') }} /> Yêu cầu bổ sung</label>
              </div>
            </div>

            {status !== 'approved' && (
              <div className="avu-group">
                <label>{status === 'rejected' ? 'Gợi ý lý do từ chối' : 'Gợi ý nội dung yêu cầu bổ sung'}</label>
                <select
                  className="avu-select"
                  value={notePreset}
                  onChange={(e) => {
                    const value = e.target.value
                    const presets = status === 'rejected' ? REJECT_PRESETS : RESUBMIT_PRESETS
                    const found = presets.find((p) => p.value === value)
                    setNotePreset(value)
                    if (found && found.value !== 'other') setNote(found.description)
                    else if (found?.value === 'other') setNote('')
                  }}
                >
                  <option value="">-- Chọn nội dung gợi ý --</option>
                  {(status === 'rejected' ? REJECT_PRESETS : RESUBMIT_PRESETS).map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            )}

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

            <div className="avu-actions">
              <button type="button" className="avu-btn avu-btn-secondary" onClick={() => navigate(`/admin/verification/${request.id}`)}>
                Quay lại chi tiết
              </button>
              <button type="button" className="avu-btn avu-btn-primary" onClick={handleSubmit}>
                Xác nhận cập nhật
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
