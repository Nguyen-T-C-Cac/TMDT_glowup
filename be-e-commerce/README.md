# BE E-Commerce - Spring Boot REST API

Backend cho dự án ThuongMaiDienTu/GlowUp.

## Công nghệ sử dụng

- Java 17, Spring Boot 3.2.5
- Spring Security + JWT (`jjwt`)
- Spring Data JPA (Hibernate), PostgreSQL
- WebSocket (chat realtime), Maven

## Module chính

- Auth, User/Technician, Verification
- Order, Wallet, Payment (VNPay)
- Notification, Chat, Admin

## Yêu cầu môi trường

- Java 17+, Maven 3.9+, PostgreSQL 14+

## Biến môi trường

Bắt buộc:

- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
- `MAIL_USERNAME`, `MAIL_PASSWORD`
- `VNPAY_TMN_CODE`, `VNPAY_SECRET_KEY`

Tùy chọn:

- `VNPAY_PAY_URL`, `VNPAY_RETURN_URL`, `VNPAY_IP_ADDRESS`
- `UPLOAD_BASE_DIR`, `UPLOAD_PUBLIC_URL`

Cấu hình mặc định: `src/main/resources/application.yml`

## Chạy local

```bash
mvn clean package -DskipTests
mvn spring-boot:run
```

Server: `http://localhost:8080`

## Tài liệu

- `docs/HUONG_DAN_TONG_HOP.md`
- `docs/API_REFERENCE.md`
- `docs/WALLET_API.md`
- `docs/PAYMENT_INTEGRATION.md`
- `docs/EMAIL_CONFIRMATION.md`
- `docs/COMMISSION_API.md`
