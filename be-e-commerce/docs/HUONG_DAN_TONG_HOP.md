# Hướng dẫn tổng hợp backend

Tài liệu này gộp các nội dung vận hành thường dùng: cài đặt xác nhận email, tóm tắt implementation, Notification API và kết quả test API.

## 1) Cài đặt xác nhận email

1. Tạo Gmail App Password (16 ký tự): [myaccount.google.com/security](https://myaccount.google.com/security)
2. Tạo file `.env`:

```bash
DB_URL=jdbc:postgresql://localhost:5432/be_ecommerce
DB_USERNAME=postgres
DB_PASSWORD=password

MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-char-app-password

FRONTEND_URL=http://localhost:3000
VNPAY_TMN_CODE=your_tmn_code
VNPAY_SECRET_KEY=your_secret_key
```

Tạo bảng token:

```sql
CREATE TABLE email_confirmation_tokens (
  id BIGSERIAL PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  user_id BIGINT NOT NULL REFERENCES users(id),
  expired_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_token ON email_confirmation_tokens(token);
CREATE INDEX idx_email_user ON email_confirmation_tokens(user_id);
```

Chạy backend:

```bash
mvn clean package -DskipTests
mvn spring-boot:run
```

Test nhanh:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"your-email@gmail.com","phone":"0912345678","password":"Password@123","role":"CUSTOMER"}'
```

```bash
curl -X POST http://localhost:8080/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"<token-tu-email>"}'
```

Kỳ vọng: `{"success":true}` và user chuyển `PENDING -> ACTIVE`.

Lưu ý:

- Frontend cần có route `/verify-email`
- Trang verify gọi `POST /api/auth/verify-email` với query param `token`

## 2) Tóm tắt implementation email confirmation

Đã hoàn thành:

1. Đăng ký tạo user với trạng thái `PENDING`
2. Gửi email chứa link/token xác nhận
3. Verify thành công -> user chuyển `ACTIVE`

Phạm vi thay đổi:

- File mới: `EmailConfirmationToken.java`, `EmailConfirmationTokenRepository.java`, `EmailService.java`, `EmailServiceImpl.java`, `VerifyEmailRequest.java`, `docs/EMAIL_CONFIRMATION.md`
- File cập nhật: `AuthService.java`, `AuthServiceImpl.java`, `AuthController.java`, `ApiConstant.java`, `ErrorCode.java`, `User.java`, `application.yml`

Hướng mở rộng:

- `POST /api/auth/resend-verification-email`
- `GET /api/auth/email-status`
- SMS verification / social login

## 3) Notification API

- Base URL: `http://localhost:8080/api/notifications`
- Auth: `Authorization: Bearer <access_token>`
- Sắp xếp: mới nhất trước (`createdAt DESC`)

NotificationType:

`order_accepted`, `price_adjustment`, `order_completed`, `payment_success`, `payment_failed`, `withdraw_success`, `withdraw_failed`, `system`, `promotion`, `chat_message`

Endpoints:

1. `GET /api/notifications?page=1&limit=20`
2. `PATCH /api/notifications/{id}/read`
3. `PATCH /api/notifications/read-all`

Response mẫu:

```json
{
  "success": true,
  "data": {
    "unreadCount": 3,
    "items": [
      {
        "id": "NOTIF-20260507-0001",
        "type": "order_accepted",
        "title": "Đơn hàng được nhận",
        "body": "Thợ Nguyễn Văn Minh đã nhận đơn GU-99210",
        "isRead": false,
        "createdAt": "2026-05-07T10:00:00"
      }
    ]
  }
}
```

## 4) Kết quả test API (controller contract)

Thông tin nhanh:

| Mục | Giá trị |
|---|---|
| Ngày test | 2026-06-02 |
| Phạm vi | 73/75 HTTP endpoint |
| Tài liệu manual | `docs/TEST_CASES_MANUAL.md` (137 test case) |
| Test tự động | `GrowupApiControllerTest`, `SystemApiControllerTest` |

Kết quả:

- PASS `25/25` test method
- Build success, không có failure/error
- 2 endpoint còn lại là WebSocket STOMP

Lệnh chạy:

```bash
docker run --rm -v "$PWD":/workspace -v "$HOME/.m2":/root/.m2 \
  -w /workspace maven:3.9.9-eclipse-temurin-21 \
  mvn -q test -Dtest=GrowupApiControllerTest,SystemApiControllerTest
```

Findings:

1. `F-01` (Medium): VNPay IPN cần đúng key `RspCode`/`Message`; cần thêm `@JsonProperty`.
2. `F-02` (Info): `isRead` có thể serialize thành `read`; FE cần thống nhất key.
3. `F-03` (Info): validation đang trả `422`; cần ghi rõ trong docs.

Việc cần bổ sung:

- RBAC runtime test (`401/403`)
- Integration test với DB thật (`@SpringBootTest` + Testcontainers)
- Order state machine, wallet edge case, IPN idempotency
- Upload file thật, multipart verification, WebSocket auth, performance/security scan
