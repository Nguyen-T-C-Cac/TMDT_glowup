package com.example.becommerce.dto.request;

import lombok.Getter;
import lombok.Setter;

/**
 * Request DTO for PATCH /api/users/{id}/unlock-wallet (admin only).
 * Mở khóa nghiệp vụ ví (is_locked) thủ công, độc lập với status.
 */
@Getter
@Setter
public class UnlockWalletRequest {

    /** Lý do admin mở khóa ví (tùy chọn, dùng để ghi log audit). */
    private String reason;
}
