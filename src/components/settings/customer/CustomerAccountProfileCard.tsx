import { BadgeCheck, Camera, MapPin, Save } from 'lucide-react';
import { SettingsActionBar } from '../actions/SettingsActionBar';
import { SettingsCard } from '../cards/SettingsCard';
import { SettingsTextField } from '../fields/SettingsTextField';
import type { CustomerAccountFormData } from './types';
import { useRef, useState, useEffect } from 'react';
import { resolveMediaUrl } from '../../../utils/mediaUrl';
import { useToast } from '../../common/Toast';
import GoogleAddressInput from '../../common/GoogleAddressInput';

const DEFAULT_AVATAR = 'https://segayanime.com/wp-content/uploads/2026/01/avatar-fb-mac-dinh-1.jpg';

interface CustomerAccountProfileCardProps {
  form: CustomerAccountFormData;
  onFieldChange: (field: keyof CustomerAccountFormData, value: string) => void;
  onSave?: () => void;
  onUploadAvatar?: (file: File) => Promise<void>;
  avatarUrl?: string | null;
  isSaving?: boolean;
}

export function CustomerAccountProfileCard({
  form,
  onFieldChange,
  onSave,
  onUploadAvatar,
  avatarUrl,
  isSaving = false,
}: CustomerAccountProfileCardProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [prevAvatarUrl, setPrevAvatarUrl] = useState(avatarUrl);

  const resolvedAvatarUrl = resolveMediaUrl(avatarUrl);
  const displayAvatar = previewUrl || resolvedAvatarUrl || DEFAULT_AVATAR;

  if (avatarUrl !== prevAvatarUrl) {
    setPrevAvatarUrl(avatarUrl);
    setPreviewUrl(null);
  }

  useEffect(() => {
    if (previewUrl) {
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng
    if (!file.type.startsWith('image/')) {
      showToast('Vui lòng chọn file ảnh hợp lệ.', 'warning');
      return;
    }
    // Kiểm tra kích thước (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast('Ảnh không được vượt quá 10MB.', 'warning');
      return;
    }

    // Hiện preview ngay lập tức
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload lên server
    if (onUploadAvatar) {
      setIsUploading(true);
      try {
        await onUploadAvatar(file);
      } catch {
        setPreviewUrl(null); // Hoàn tác preview nếu upload lỗi
        showToast('Tải ảnh lên thất bại. Vui lòng thử lại.', 'error');
      } finally {
        setIsUploading(false);
        // Reset input để có thể chọn lại cùng file
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  return (
    <SettingsCard
      title="Cài đặt tài khoản"
      subtitle="Quản lý bảo mật và dữ liệu cá nhân để trải nghiệm dịch vụ luôn nhất quán, rõ ràng và an tâm hơn."
      eyebrow={
        <>
          <BadgeCheck size={18} />
          Hồ sơ khách hàng
        </>
      }
    >
      {/* Avatar upload section */}
      <div className="profile-avatar-section">
        <div className="profile-avatar-wrapper" onClick={handleAvatarClick} title="Nhấp để đổi ảnh đại diện">
          <img
            src={displayAvatar}
            alt="Avatar"
            className="profile-avatar-img"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR; }}
          />
          <div className="profile-avatar-overlay">
            {isUploading ? (
              <div className="profile-avatar-spinner" />
            ) : (
              <>
                <Camera size={22} />
                <span>Đổi ảnh</span>
              </>
            )}
          </div>
        </div>
        <div className="profile-avatar-hint">
          <p className="profile-avatar-hint__title">Ảnh đại diện</p>
          <p className="profile-avatar-hint__desc">JPG, PNG hoặc GIF · Tối đa 10MB</p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div className="settings-grid settings-grid--two">
        <SettingsTextField
          label="Họ tên"
          value={form.fullName}
          onChange={(value) => onFieldChange('fullName', value)}
        />
        <SettingsTextField
          label="Số điện thoại"
          value={form.phone}
          onChange={(value) => onFieldChange('phone', value)}
        />
        <SettingsTextField
          label="Email"
          value={form.email}
          onChange={(value) => onFieldChange('email', value)}
          fullWidth
        />
        <label className="settings-field settings-field--full" style={{ gridColumn: '1 / -1' }}>
          <span className="settings-field__label">
            <MapPin size={14} style={{ marginRight: 4 }} />
            Địa chỉ mặc định
          </span>
          <GoogleAddressInput
            value={form.address}
            onChange={(value) => onFieldChange('address', value)}
            placeholder="Nhập địa chỉ của bạn"
            className="settings-field__input"
          />
        </label>
      </div>

      <SettingsActionBar>
        <button
          type="button"
          className="settings-primary-button"
          onClick={onSave}
          disabled={isSaving}
          style={{ opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}
        >
          <Save size={18} />
          {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </SettingsActionBar>
    </SettingsCard>
  );
}
