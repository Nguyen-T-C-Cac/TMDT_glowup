# BE E-Commerce - Spring Boot REST API

Backend cho dự án ThuongMaiDienTu/GlowUp, xây dựng bằng Spring Boot, PostgreSQL, Spring Security và JWT.

## Tech Stack

- Java 17
- Spring Boot 3.2.5
- Spring Security + JWT (`jjwt`)
- Spring Data JPA (Hibernate)
- PostgreSQL
- WebSocket (chat realtime)
- Maven

## Chức năng chính

- Auth: register, login, refresh token, forgot/change password, verify email
- User/Technician: hồ sơ, xác minh danh tính kỹ thuật viên
- Order: tạo và quản lý vòng đời đơn hàng
- Wallet: số dư, lịch sử giao dịch, nạp/rút tiền
- Payment: tích hợp VNPay + webhook IPN
- Notification và Chat realtime
- Admin: quản lý người dùng, đơn hàng, cài đặt hệ thống, commission

## Yêu cầu môi trường

- Java 17+
- Maven 3.9+
- PostgreSQL 14+

## Cấu hình môi trường

Khai báo các biến môi trường sau trước khi chạy:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `VNPAY_TMN_CODE`
- `VNPAY_SECRET_KEY`
- `VNPAY_PAY_URL` (optional)
- `VNPAY_RETURN_URL` (optional)
- `VNPAY_IP_ADDRESS` (optional)
- `UPLOAD_BASE_DIR` (optional)
- `UPLOAD_PUBLIC_URL` (optional)

Cấu hình mặc định nằm ở: `src/main/resources/application.yml`

## Chạy dự án local

```bash
mvn clean package -DskipTests
mvn spring-boot:run
```

Server mặc định: `http://localhost:8080`

## Tài liệu API

- Tổng quan API: `docs/API_REFERENCE.md`
- Wallet API: `docs/WALLET_API.md`
- Payment (VNPay): `docs/PAYMENT_INTEGRATION.md`
- Notification API: `docs/NOTIFICATION_API.md`
- Email confirmation: `docs/EMAIL_CONFIRMATION.md`
- Commission API: `docs/COMMISSION_API.md`

## Lưu ý

- Public payment flow hiện tại tập trung vào VNPay.
- Một số tài liệu chi tiết trong `docs/` được tách theo từng module để dễ bảo trì.
- Dự án có test ở `src/test`, có thể chạy bằng `mvn test`.
