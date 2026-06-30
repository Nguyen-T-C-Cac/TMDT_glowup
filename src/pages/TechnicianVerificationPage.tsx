import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Check, Camera, Upload, Phone, Mail, MapPin, Grid, Image, X } from 'lucide-react'
import { getCategories, type Category } from '../services/categoryService'
import { getStoredUser } from '../services/auth'
import { submitVerification, getVerificationByTechnician } from '../services/verificationService'
import './TechnicianVerificationPage.css'

type VerificationStep = 'identity' | 'face' | 'description' | 'complete'

interface VerificationData {
  idFront: File | null
  idBack: File | null
  faceSelfie: File | null
  certificate?: File | null
  phone?: string
  email?: string
  area?: string
  services: string[]
  experience?: string
}

const HCMC_DISTRICTS = [
  'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8',
  'Quận 10', 'Quận 11', 'Quận 12',
  'Quận Bình Thạnh', 'Quận Bình Tân', 'Quận Gò Vấp',
  'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Tân Phú',
  'Thành phố Thủ Đức',
  'Huyện Bình Chánh', 'Huyện Cần Giờ', 'Huyện Củ Chi',
  'Huyện Hóc Môn', 'Huyện Nhà Bè',
]

export const TechnicianVerificationPage: React.FC = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<VerificationStep>('identity')
  const [verificationData, setVerificationData] = useState<VerificationData>({
    idFront: null,
    idBack: null,
    faceSelfie: null,
    certificate: null,
    phone: '',
    email: '',
    area: '',
    services: [],
    experience: '',
  })

  const location = useLocation()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    let isMounted = true
    const checkExistingVerification = async () => {
      const searchParams = new URLSearchParams(location.search)
      if (searchParams.get('resubmit') === 'true') {
        setIsChecking(false)
        return
      }

      const user = getStoredUser()
      if (user) {
        const techId = user.code || `TECH-${user.id}`
        try {
          const response = await getVerificationByTechnician(techId)
          if (response && response.success && response.data && isMounted) {
            // Đã có hồ sơ
            navigate('/technician/verification-status')
          } else if (isMounted) {
            setIsChecking(false)
          }
        } catch (error) {
           if (isMounted) setIsChecking(false)
        }
      } else {
        setIsChecking(false)
      }
    }
    
    checkExistingVerification()
    return () => { isMounted = false }
  }, [navigate, location.search])

  if (isChecking) {
    return <div className="verification-page-container"><div className="verification-loading">Đang kiểm tra hồ sơ...</div></div>
  }

  const handleFileUpload = (fileType: 'idFront' | 'idBack', file: File | null) => {
    if (file) {
      setVerificationData(prev => ({
        ...prev,
        [fileType]: file,
      }))
    }
  }

  const handleFaceCapture = (file: File | null) => {
    if (file) {
      setVerificationData(prev => ({
        ...prev,
        faceSelfie: file,
      }))
    }
  }

  const handleNextStep = () => {
    if (currentStep === 'identity') {
      setCurrentStep('face')
    } else if (currentStep === 'face') {
      setCurrentStep('description')
    } else if (currentStep === 'description') {
      setCurrentStep('complete')
    }
  }

  const handlePrevStep = () => {
    if (currentStep === 'face') setCurrentStep('identity')
    else if (currentStep === 'description') setCurrentStep('face')
    else if (currentStep === 'complete') setCurrentStep('description')
  }

  const handleContinue = async () => {
    try {
      if (!verificationData.idFront || !verificationData.idBack) {
        alert('Vui lòng tải lên mặt trước và mặt sau CCCD.')
        setCurrentStep('identity')
        return
      }
      if (!verificationData.faceSelfie) {
        alert('Vui lòng chụp ảnh khuôn mặt.')
        setCurrentStep('face')
        return
      }
      if (!verificationData.phone || !verificationData.email || !verificationData.area || verificationData.services.length === 0) {
        alert('Vui lòng điền đầy đủ thông tin mô tả bản thân.')
        setCurrentStep('description')
        return
      }

      const user = getStoredUser()
      const techId = user?.code || (user?.id ? `TECH-${user.id}` : 'TECH-9921')
      const name = user?.fullName || 'Kỹ thuật viên'
      
      console.log('Submitting verification:', verificationData)
      
      const formData = new FormData()
      formData.append('technicianId', techId)
      formData.append('fullName', name)
      formData.append('phone', verificationData.phone || '')
      formData.append('email', verificationData.email || '')
      
      // Match backend CreateVerificationRequest expectations:
      formData.append('district', verificationData.area || '')
      formData.append('serviceCategory', verificationData.services.join(', '))
      
      // Extract years of experience
      const match = verificationData.experience?.match(/(\d+)\s*năm/i)
      const yearsExp = match ? parseInt(match[1]) : (verificationData.experience ? 1 : 0)
      formData.append('yearsExperience', yearsExp.toString())
      
      if (verificationData.idFront) formData.append('idFront', verificationData.idFront)
      if (verificationData.idBack) formData.append('idBack', verificationData.idBack)
      if (verificationData.faceSelfie) formData.append('portrait', verificationData.faceSelfie)
      if (verificationData.certificate) formData.append('certificate', verificationData.certificate)

      await submitVerification(formData)
      
      navigate('/technician/provider-dashboard')
    } catch (error) {
      console.error('Failed to submit verification', error)
      alert('Có lỗi xảy ra khi nộp hồ sơ. Vui lòng thử lại.')
    }
  }

  const isStepComplete = (step: VerificationStep): boolean => {
    switch (step) {
      case 'identity':
        return !!(verificationData.idFront && verificationData.idBack)
      case 'face':
        return !!verificationData.faceSelfie
      case 'description':
        return !!(verificationData.phone || verificationData.email || verificationData.area || verificationData.services.length > 0 || verificationData.experience)
      case 'complete':
        return true
      default:
        return false
    }
  }

  return (
    <div className="verification-page">
      <div className="verification-container">
        {/* Header */}
        <div className="verification-header">
          <button className="back-button">
            <ArrowLeft size={24} />
          </button>
          <h1 className="verification-title">Xác minh danh tính</h1>
          <p className="verification-subtitle">
            Hoàn thành 4 bước xác minh để bắt đầu nhận việc làm GlowUp
          </p>
        </div>

        {/* Steps indicator */}
        <div className="steps-indicator">
          <div className="step-item" onClick={() => setCurrentStep('identity')}>
            <div className={`step-number ${currentStep === 'identity' || isStepComplete('identity') ? 'active' : ''} ${isStepComplete('identity') ? 'completed' : ''}`}>
              {isStepComplete('identity') ? <Check size={20} /> : '1'}
            </div>
            <div className="step-label">
              <p className="step-title">Giấy tờ tùy thân</p>
              <p className="step-description">Tải lên CCCD</p>
            </div>
          </div>

          <div className="step-divider"></div>

          <div className="step-item" onClick={() => setCurrentStep('face')}>
            <div className={`step-number ${currentStep === 'face' || isStepComplete('face') ? 'active' : ''} ${isStepComplete('face') ? 'completed' : ''}`}>
              {isStepComplete('face') ? <Check size={20} /> : '2'}
            </div>
            <div className="step-label">
              <p className="step-title">Xác thực khuôn mặt</p>
              <p className="step-description">Chụp ảnh selfie</p>
            </div>
          </div>

          <div className="step-divider"></div>

          <div className="step-item" onClick={() => setCurrentStep('description')}>
            <div className={`step-number ${currentStep === 'description' ? 'active' : ''} ${isStepComplete('description') ? 'completed' : ''}`}>
              {isStepComplete('description') ? <Check size={20} /> : '3'}
            </div>
            <div className="step-label">
              <p className="step-title">Mô tả bản thân</p>
              <p className="step-description">Thông tin liên hệ & kinh nghiệm</p>
            </div>
          </div>

          <div className="step-divider"></div>

          <div className="step-item" onClick={() => setCurrentStep('complete')}>
            <div className={`step-number ${currentStep === 'complete' ? 'active' : ''} ${isStepComplete('complete') ? 'completed' : ''}`}>
              {isStepComplete('complete') ? <Check size={20} /> : '4'}
            </div>
            <div className="step-label">
              <p className="step-title">Hoàn tất</p>
              <p className="step-description">Chờ hoàn tất tài khoản</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="verification-content">
          {currentStep === 'identity' && (
            <IdentityVerificationStep
              data={verificationData}
              onFileUpload={handleFileUpload}
              onNext={handleNextStep}
            />
          )}

          {currentStep === 'face' && (
            <FaceVerificationStep
              data={verificationData}
              onFaceCapture={handleFaceCapture}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
            />
          )}

          {currentStep === 'description' && (
            <DescriptionStep
              data={verificationData}
              onChange={(fields) => setVerificationData(prev => ({ ...prev, ...fields }))}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
            />
          )}

          {currentStep === 'complete' && (
            <CompleteVerificationStep
              onContinue={handleContinue}
              onPrev={handlePrevStep}
            />
          )}
        </div>

        {/* Security info */}
        <div className="security-info">
          <div className="security-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="security-text">
              Thông tin của bạn được bảo mật tuyệt đối
            </p>
          </div>
          <p className="security-description">
            GlowUp cam kết bảo mật thông tin cá nhân cao nhất. Dữ liệu của bạn được bảo vệ theo tiêu chuẩn an ninh cao nhất.
          </p>
          <div className="security-features">
            <div className="feature">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Mã hóa dữ liệu</span>
            </div>
            <div className="feature">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Không chứa aiệm</span>
            </div>
            <div className="feature">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Xóa khi không cần thiết</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="verification-disclaimer">
          Yêu cầu hoàn thành để sử dụng các tính năng đặc biệt
        </p>
      </div>
    </div>
  )
}

interface IdentityVerificationStepProps {
  data: VerificationData
  onFileUpload: (fileType: 'idFront' | 'idBack', file: File | null) => void
  onNext: () => void
}

const IdentityVerificationStep: React.FC<IdentityVerificationStepProps> = ({
  data,
  onFileUpload,
  onNext,
}) => {
  const [frontPreview, setFrontPreview] = useState<string>('')
  const [backPreview, setBackPreview] = useState<string>('')

  const handleFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileUpload('idFront', file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setFrontPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileUpload('idBack', file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setBackPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="step-content">
      <div className="id-cards-grid">
        {/* ID Front */}
        <div className="id-card-section">
          <h3 className="card-title">CCCD mặt trước</h3>
          <label className="badge">BẮT BUỘC</label>

          <div className="card-upload-area">
            {frontPreview ? (
              <div className="preview-container">
                <img src={frontPreview} alt="CCCD mặt trước" className="preview-image" />
                <button 
                  className="change-button"
                  onClick={() => {
                    const input = document.getElementById('front-input') as HTMLInputElement
                    input?.click()
                  }}
                >
                  Thay đổi
                </button>
              </div>
            ) : (
              <div className="empty-state">
                <div className="placeholder-card">
                  <div className="placeholder-content">
                    <svg width="60" height="40" viewBox="0 0 60 40" fill="none">
                      <rect width="60" height="40" fill="#E8E7E1" rx="4" />
                      <rect x="8" y="6" width="44" height="28" fill="#D0D0D0" rx="2" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            <input
              id="front-input"
              type="file"
              accept="image/*"
              onChange={handleFrontUpload}
              style={{ display: 'none' }}
            />

            <label htmlFor="front-input" className="upload-button">
              <Upload size={20} />
              <span>Tải lên ảnh</span>
            </label>
          </div>

          <ul className="requirements">
            <li>✓ Chụp rõ nét, không bị mờ góc</li>
            <li>✓ Không tô che sáng</li>
            <li>✓ Thông tin dễ đọc</li>
          </ul>
        </div>

        {/* ID Back */}
        <div className="id-card-section">
          <h3 className="card-title">CCCD mặt sau</h3>
          <label className="badge">BẮT BUỘC</label>

          <div className="card-upload-area">
            {backPreview ? (
              <div className="preview-container">
                <img src={backPreview} alt="CCCD mặt sau" className="preview-image" />
                <button 
                  className="change-button"
                  onClick={() => {
                    const input = document.getElementById('back-input') as HTMLInputElement
                    input?.click()
                  }}
                >
                  Thay đổi
                </button>
              </div>
            ) : (
              <div className="empty-state">
                <div className="placeholder-card">
                  <div className="placeholder-content">
                    <svg width="60" height="40" viewBox="0 0 60 40" fill="none">
                      <rect width="60" height="40" fill="#E8E7E1" rx="4" />
                      <rect x="8" y="6" width="44" height="28" fill="#D0D0D0" rx="2" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            <input
              id="back-input"
              type="file"
              accept="image/*"
              onChange={handleBackUpload}
              style={{ display: 'none' }}
            />

            <label htmlFor="back-input" className="upload-button">
              <Upload size={20} />
              <span>Tải lên ảnh</span>
            </label>
          </div>

          <ul className="requirements">
            <li>✓ Chụp rõ nét, không bị mờ góc</li>
            <li>✓ Không tô che sáng</li>
            <li>✓ Thông tin dễ đọc</li>
          </ul>
        </div>
      </div>

      <div className="step-actions">
        <button
          className={`primary-button ${data.idFront && data.idBack ? '' : 'disabled'}`}
          onClick={onNext}
        >
          Tiếp tục
        </button>
      </div>
    </div>
  )
}

interface FaceVerificationStepProps {
  data: VerificationData
  onFaceCapture: (file: File | null) => void
  onNext: () => void
  onPrev?: () => void
}

const FaceVerificationStep: React.FC<FaceVerificationStepProps> = ({
  data,
  onFaceCapture,
  onNext,
  onPrev,
}) => {
  const [preview, setPreview] = useState<string>('')
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      })
      setIsCapturing(true)
      // Đợi render để videoRef được gắn vào DOM
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      }, 100)
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.')
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)

        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' })
            onFaceCapture(file)

            const reader = new FileReader()
            reader.onload = (event) => {
              setPreview(event.target?.result as string)
            }
            reader.readAsDataURL(blob)

            // Stop camera
            if (videoRef.current?.srcObject) {
              const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
              tracks.forEach(track => track.stop())
              setIsCapturing(false)
            }
          }
        })
      }
    }
  }

  const retakePhoto = () => {
    setPreview('')
    onFaceCapture(null)
    startCamera()
  }

  return (
    <div className="step-content">
      <div className="face-verification-box">
        {preview ? (
          <div className="face-preview">
            <img src={preview} alt="Selfie" className="selfie-image" />
            <button className="retake-button" onClick={retakePhoto}>
              Chụp lại
            </button>
          </div>
        ) : (
          <>
            {isCapturing ? (
              <div className="camera-container">
                <video ref={videoRef} autoPlay playsInline className="camera-preview" />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <button className="capture-button" onClick={capturePhoto}>
                  <Camera size={32} />
                  <span>Chụp ảnh</span>
                </button>
              </div>
            ) : (
              <div className="face-placeholder">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="38" stroke="#D0D0D0" strokeWidth="2" />
                  <circle cx="30" cy="32" r="6" fill="#D0D0D0" />
                  <circle cx="50" cy="32" r="6" fill="#D0D0D0" />
                  <path d="M 30 50 Q 40 58 50 50" stroke="#D0D0D0" strokeWidth="2" fill="none" />
                </svg>
                <p className="placeholder-text">Bấm nút bên dưới để chụp ảnh</p>
              </div>
            )}
          </>
        )}

        {!isCapturing && !preview && (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="start-camera-button" onClick={startCamera}>
              <Camera size={24} />
              <span>Mở camera chụp ngay</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="file"
                id="face-upload"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    onFaceCapture(file)
                    const reader = new FileReader()
                    reader.onload = (ev) => setPreview(ev.target?.result as string)
                    reader.readAsDataURL(file)
                  }
                }}
              />
              <label htmlFor="face-upload" className="secondary-button" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={20} />
                <span>Tải ảnh lên</span>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="face-requirements">
        <p className="requirements-title">Yêu cầu chụp ảnh:</p>
        <ul>
          <li>✓ Chụp trực diện, rõ ràng</li>
          <li>✓ Không đeo kính nghi, mũ hay khẩu trang</li>
          <li>✓ Mặt chiếm ít nhất 70% khung hình</li>
        </ul>
      </div>

      <div className="step-actions">
        {onPrev && (
          <button className="secondary-button" onClick={onPrev}>
            Quay lại
          </button>
        )}

        <button
          className={`primary-button ${data.faceSelfie ? '' : 'disabled'}`}
          onClick={onNext}
        >
          Tiếp tục
        </button>
      </div>
    </div>
  )
}

interface CompleteVerificationStepProps {
  onContinue: () => void
  onPrev?: () => void
}

const CompleteVerificationStep: React.FC<CompleteVerificationStepProps> = ({
  onContinue,
  onPrev,
}) => {
  return (
    <div className="step-content">
      <div className="complete-message">
        <div className="success-icon">
          <Check size={64} />
        </div>
        <h2>Hoàn tất xác minh danh tính</h2>
        <p>
          Cảm ơn bạn đã cung cấp thông tin. Chúng tôi đang xử lý xác minh danh tính của bạn. 
          Bạn sẽ nhận được thông báo trong vòng 24 giờ.
        </p>
      </div>

      <div className="step-actions">
        {onPrev && (
          <button className="secondary-button" onClick={onPrev}>
            Quay lại
          </button>
        )}

        <button className="primary-button" onClick={onContinue}>
          Tiếp tục
        </button>
      </div>
    </div>
  )
}

interface ServiceMultiSelectProps {
  selected: string[]
  onChange: (services: string[]) => void
}

const ServiceMultiSelect: React.FC<ServiceMultiSelectProps> = ({ selected, onChange }) => {
  const [allServices, setAllServices] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    const fetchServices = async () => {
      try {
        setLoading(true)
        const items = await getCategories('active')
        if (!cancelled) setAllServices(items)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Lỗi tải dịch vụ')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchServices()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = allServices.filter(
    svc =>
      svc.title.toLowerCase().includes(search.toLowerCase()) &&
      !selected.includes(svc.title)
  )

  const toggleService = (title: string) => {
    if (selected.includes(title)) {
      onChange(selected.filter(s => s !== title))
    } else {
      onChange([...selected, title])
    }
    setSearch('')
  }

  const removeService = (title: string) => {
    onChange(selected.filter(s => s !== title))
  }

  return (
    <div className="service-multi-select" ref={containerRef}>
      <div className="service-tags">
        {selected.map(s => (
          <span key={s} className="service-tag">
            {s}
            <button type="button" className="tag-remove" onClick={() => removeService(s)}>
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          className="service-search-input"
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={selected.length === 0 ? 'Gõ tên dịch vụ để chọn...' : ''}
        />
      </div>

      {open && (
        <div className="service-dropdown">
          {loading && <div className="service-dropdown-empty">Đang tải...</div>}
          {error && <div className="service-dropdown-empty" style={{ color: '#e74c3c' }}>{error}</div>}
          {!loading && !error && search && filtered.length === 0 && (
            <div className="service-dropdown-empty">Không tìm thấy dịch vụ "{search}"</div>
          )}
          {!loading && !error && filtered.length > 0 && (
            <ul className="service-dropdown-list">
              {filtered.map(svc => (
                <li
                  key={svc.id}
                  className="service-dropdown-item"
                  onClick={() => toggleService(svc.title)}
                >
                  <span className={`service-checkbox ${selected.includes(svc.title) ? 'checked' : ''}`}>
                    {selected.includes(svc.title) && <Check size={12} />}
                  </span>
                  <span>{svc.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

interface DescriptionStepProps {
  data: VerificationData
  onChange: (fields: Partial<VerificationData>) => void
  onNext: () => void
  onPrev?: () => void
}

const DescriptionStep: React.FC<DescriptionStepProps> = ({ data, onChange, onNext, onPrev }) => {
  const [certPreview, setCertPreview] = useState<string>('')

  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    onChange({ certificate: file || null })
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setCertPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setCertPreview('')
    }
  }

  return (
    <div className="step-content description-step">
      <div className="description-header">
        <div className="icon-circle">
          <Image size={20} />
        </div>
        <div>
          <h3>Thông tin mô tả bản thân</h3>
          <p className="muted">Vui lòng cung cấp thông tin chi tiết để chúng tôi hiểu bạn hơn</p>
        </div>
      </div>

      <div className="form-row">
        <label>Số điện thoại <span className="required">*</span></label>
        <div className="input-with-icon">
          <Phone size={16} className="input-icon" />
          <input value={data.phone || ''} onChange={e => onChange({ phone: e.target.value })} placeholder="Nhập số điện thoại của bạn" />
        </div>
      </div>

      <div className="form-row">
        <label>Email <span className="required">*</span></label>
        <div className="input-with-icon">
          <Mail size={16} className="input-icon" />
          <input value={data.email || ''} onChange={e => onChange({ email: e.target.value })} placeholder="Nhập email của bạn" />
        </div>
      </div>

      <div className="form-row split">
        <div>
          <label>Khu vực hoạt động <span className="required">*</span></label>
          <div className="input-with-icon">
            <MapPin size={16} className="input-icon" />
            <select
              className="district-select"
              value={data.area || ''}
              onChange={e => onChange({ area: e.target.value })}
            >
              <option value="" disabled>Chọn quận/huyện</option>
              {HCMC_DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label>Dịch vụ <span className="required">*</span></label>
          <div className="input-with-icon">
            <Grid size={16} className="input-icon" />
            <ServiceMultiSelect
              selected={data.services}
              onChange={services => onChange({ services })}
            />
          </div>
        </div>
      </div>

      <div className="form-row">
        <label>Chứng chỉ hành nghề (nếu có)</label>
        <div className="cert-upload">
          {certPreview ? (
            <div className="cert-preview">
              <img src={certPreview} alt="chứng chỉ" />
              <button className="change-button" onClick={() => {
                const input = document.getElementById('cert-input') as HTMLInputElement
                input?.click()
              }}>Thay đổi</button>
            </div>
          ) : (
            <label className="upload-card">
              <input id="cert-input" type="file" accept="image/*" onChange={handleCertUpload} style={{ display: 'none' }} />
              <div className="upload-inner">
                <Image size={28} />
                <div>
                  <p className="upload-title">Tải ảnh chứng chỉ hành nghề</p>
                  <p className="upload-sub">(Tùy chọn)</p>
                </div>
              </div>
            </label>
          )}
        </div>
      </div>

      <div className="form-row">
        <label>Kinh nghiệm</label>
        <div className="textarea-wrap">
          <textarea value={data.experience || ''} onChange={e => onChange({ experience: e.target.value })} maxLength={500} placeholder="Mô tả kinh nghiệm của bạn" />
          <div className="char-counter">{(data.experience || '').length}/500</div>
        </div>
      </div>

      <div className="step-actions">
        {onPrev && (
          <button className="secondary-button" onClick={onPrev}>
            Quay lại
          </button>
        )}

        <button className="primary-button" onClick={onNext}>
          Tiếp tục
        </button>
      </div>
    </div>
  )
}

export default TechnicianVerificationPage