# GlowUp – ThuongMaiDienTu

Nền tảng **marketplace dịch vụ sửa chữa tại nhà**: khách hàng đặt dịch vụ, chat và nhận báo giá từ kỹ thuật viên, thanh toán online; kỹ thuật viên nhận việc, quản lý lịch và ví; quản trị viên kiểm duyệt, đối soát và xử lý khiếu nại.

## Tính năng chính

- **Khách hàng:** tìm kỹ thuật viên theo danh mục / khu vực, đặt lịch, chat realtime, nhận báo giá, thanh toán (VNPay, VietQR, chuyển khoản, tiền mặt), dùng voucher, đánh giá, yêu cầu bảo hành, khiếu nại.
- **Kỹ thuật viên:** gửi hồ sơ xác minh, nhận / từ chối đơn, tạo báo giá và điều chỉnh giá, quản lý lịch làm việc, ví (nạp / rút, hoa hồng), thống kê doanh thu.
- **Quản trị viên:** dashboard, quản lý người dùng, duyệt xác minh, danh mục dịch vụ, đơn hàng, tài chính, hoàn tiền, khiếu nại, cấu hình hệ thống.

## Công nghệ

| Phần | Công nghệ |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router, Axios, STOMP (WebSocket), Leaflet / Google Maps |
| Backend | Java 17, Spring Boot 3.2.5, Spring Security + JWT, Spring Data JPA, WebSocket, Spring Mail |
| Database | PostgreSQL 14+ |
| Thanh toán | VNPay (sandbox), VietQR |

## Cấu trúc

```text
ThuongMaiDienTu/
├── src/                  # Frontend
│   ├── api/              # Axios client (gắn JWT, tự refresh token)
│   ├── components/       # UI theo nhóm: admin, chat, orderManagement, modal...
│   ├── pages/            # Các trang (Home, Search, Chat, Admin*, Technician*...)
│   ├── router/           # Định nghĩa route
│   ├── services/         # Gọi API theo module
│   ├── hooks/  contexts/  stores/  types/  utils/
├── public/               # Tài nguyên tĩnh
└── be-e-commerce/        # Backend (Spring Boot)
    ├── src/main/java/com/example/becommerce/
    │   └── controller, service, repository, entity, dto, security, config
    ├── src/main/resources/   # application.yml, data.sql, db/migration
    └── docs/                 # Tài liệu API, ví, thanh toán, schema SQL
```

## Yêu cầu môi trường

- Node.js 20+, npm 10+
- Java 17+, Maven 3.9+
- PostgreSQL 14+ (hoặc Docker)

## Chạy nhanh

**1. Database** – dùng PostgreSQL có sẵn hoặc Docker:

```bash
cd be-e-commerce
docker compose up -d db
```

**2. Backend** – tạo `be-e-commerce/.env` (xem [biến môi trường](#biến-môi-trường)), rồi:

```bash
cd be-e-commerce
mvn clean package -DskipTests
mvn spring-boot:run
```

→ `http://localhost:8080`. Lần đầu chạy, Hibernate tự tạo bảng và `data.sql` nạp dữ liệu demo.

**3. Frontend** – tạo `.env` ở thư mục gốc, rồi:

```bash
npm install
npm run dev
```

→ `http://localhost:5173`. Các request `/uploads` được proxy sang backend (`vite.config.ts`).

Các lệnh khác: `npm run build`, `npm run lint`, `npm run preview`.

## Biến môi trường

**Backend** (`be-e-commerce/.env`)

| Biến | Bắt buộc | Ghi chú |
|---|:-:|---|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | ✅ | Kết nối PostgreSQL |
| `MAIL_USERNAME`, `MAIL_PASSWORD` | ✅ | Gmail + App Password (gửi email xác thực) |
| `VNPAY_TMN_CODE`, `VNPAY_SECRET_KEY` | ✅ | Thông tin VNPay sandbox |
| `VNPAY_PAY_URL`, `VNPAY_RETURN_URL`, `VNPAY_PAYMENT_RETURN_URL`, `VNPAY_IP_ADDRESS` |  | Có giá trị mặc định cho local |
| `APP_FRONTEND_URL`, `APP_ALLOWED_ORIGINS` |  | URL frontend và CORS |
| `GOOGLE_CLIENT_ID` |  | Đăng nhập Google |
| `UPLOAD_BASE_DIR`, `UPLOAD_PUBLIC_URL` |  | Nơi lưu và URL file upload |

**Frontend** (`.env`)

| Biến | Ghi chú |
|---|---|
| `VITE_API_URL` | URL backend, mặc định `http://localhost:8080` |
| `VITE_GOOGLE_CLIENT_ID` | Client ID đăng nhập Google |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps (tùy chọn) |
| `VITE_WS_URL` | URL WebSocket chat (nếu khác mặc định) |

Cấu hình mặc định khác: `be-e-commerce/src/main/resources/application.yml`.

## Route frontend chính

- Public: `/`, `/services`, `/search`, `/provider`, `/find-provider`, `/rewards`
- Auth: `/auth/login`, `/auth/register`, `/verify-email`
- Customer: `/customer/*`
- Technician: `/technician/*`
- Admin: `/admin/*`

Chi tiết: `src/router/index.tsx`

## Tài liệu backend

Trong `be-e-commerce/docs/`:

- `HUONG_DAN_TONG_HOP.md` – hướng dẫn vận hành tổng hợp
- `API_REFERENCE.md` – danh sách endpoint, vai trò, phân quyền
- `WALLET_API.md`, `PAYMENT_INTEGRATION.md`, `COMMISSION_API.md`, `EMAIL_CONFIRMATION.md`
- `SECURITY_REVIEW.md`, `TEST_CASES_MANUAL.md`
- `postman_collection.json` – Postman collection
- `database/unified_schema.sql` – schema tổng hợp

## Lưu ý

- Không commit `.env`, khóa VNPay, mật khẩu Gmail, API key.
- Trước khi triển khai thật: chuyển JWT secret trong `application.yml` sang biến môi trường, đổi mật khẩu DB và xóa tài khoản demo. Xem thêm `SECURITY_REVIEW.md`.