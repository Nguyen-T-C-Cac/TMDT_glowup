# ThuongMaiDienTu (GlowUp)

Nền tảng marketplace dịch vụ gồm:
- Frontend web cho Customer / Technician / Admin
- Backend REST API cho auth, order, ví, thanh toán, chat, notification

## Cấu trúc dự án

- `./` - Frontend (`React + TypeScript + Vite`)
- `./be-e-commerce` - Backend (`Spring Boot + PostgreSQL + JWT`)

## Kiến trúc tổng quan

- Frontend gọi API tại backend qua các route `/api/*`
- Backend cung cấp xác thực JWT và phân quyền theo vai trò
- Các module chính: Auth, User, Technician Verification, Order, Wallet, Payment (VNPay), Chat, Admin

## Yêu cầu môi trường

- Node.js 20+
- npm 10+
- Java 17+
- Maven 3.9+
- PostgreSQL 14+

## Chạy Frontend

```bash
npm install
npm run dev
```

- Mặc định chạy tại: `http://localhost:5173`
- API base đang dùng trong code:
  - `src/api/config.ts` -> `http://localhost:8080/`
  - `src/services/auth.ts` -> `http://localhost:8080/api`

## Chạy Backend

```bash
cd be-e-commerce
mvn clean package -DskipTests
mvn spring-boot:run
```

- Mặc định chạy tại: `http://localhost:8080`
- Tài liệu backend chi tiết: `be-e-commerce/README.md`

## Các nhóm route chính trên frontend

- Public: `/`, `/services`, `/provider`, `/find-provider`
- Auth: `/auth/login`, `/auth/register`, `/verify-email`
- Customer: `/customer/*`
- Technician: `/technician/*`
- Admin: `/admin/*`

Chi tiết route: `src/router/index.tsx`

## Tài liệu liên quan

- Backend API reference: `be-e-commerce/docs/API_REFERENCE.md`
- Wallet API: `be-e-commerce/docs/WALLET_API.md`
- Payment integration: `be-e-commerce/docs/PAYMENT_INTEGRATION.md`
- Commission API: `be-e-commerce/docs/COMMISSION_API.md`

## Ghi chú

- Nếu FE bị lỗi gọi API, kiểm tra CORS và URL backend trong `src/api/config.ts`.
- Một số module đang trong quá trình hoàn thiện; ưu tiên kiểm tra luồng thực tế bằng backend hiện tại trước khi triển khai production.
